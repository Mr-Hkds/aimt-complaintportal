<?php
/**
 * Auth Helper Library
 * Handles authentication, registration, rate limiting, and session security.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

/**
 * Check if an action is rate limited for the current IP
 * 
 * @param string $action The action to check (e.g., 'login', 'register')
 * @param int $limit Maximum number of attempts allowed
 * @param int $window Time window in minutes
 * @return bool True if rate limited, false otherwise
 */
function is_rate_limited($action, $limit = 5, $window = 15)
{
    global $mysqli;
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    // Cleanup old records first (maintenance)
    $mysqli->query("DELETE FROM rate_limits WHERE attempted_at < DATE_SUB(NOW(), INTERVAL $window MINUTE)");

    // Count attempts for this IP and action in the window
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM rate_limits WHERE action = ? AND ip_address = ? AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)");
    $stmt->bind_param('ssi', $action, $ip, $window);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_row();
    $attempts = $result[0];
    $stmt->close();

    return $attempts >= $limit;
}

/**
 * Record a new attempt for rate limiting
 * 
 * @param string $action The action being performed
 */
function record_attempt($action)
{
    global $mysqli;
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    $stmt = $mysqli->prepare("INSERT INTO rate_limits (action, ip_address) VALUES (?, ?)");
    $stmt->bind_param('ss', $action, $ip);
    $stmt->execute();
    $stmt->close();
}

/**
 * Authenticate a user
 * 
 * @param string $username
 * @param string $password
 * @param string $role
 * @return array|string Returns user data array on success, error message string on failure
 */
function login_user($username, $password, $role)
{
    global $mysqli;

    if (is_rate_limited('login_attempt')) {
        log_security_action('login_rate_limit_triggered', $username, 'Too many attempts from IP: ' . $_SERVER['REMOTE_ADDR']);
        return "Too many failed login attempts. Please try again in 15 minutes.";
    }

    $stmt = $mysqli->prepare("SELECT id, username, password_hash, role, status, full_name FROM users WHERE username = ? AND role = ?");
    $stmt->bind_param('ss', $username, $role);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user) {
        if ($user['status'] === 'pending') {
            return "Your account is still pending approval. Please wait for an administrator to approve it.";
        }
        if ($user['status'] === 'suspended') {
            return "Your account has been suspended. Please contact support.";
        }

        if (password_verify($password, $user['password_hash'])) {
            // Successful login
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];

            log_security_action('login_success', $username);

            // Clear rate limits for this action/IP on success
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $mysqli->query("DELETE FROM rate_limits WHERE action = 'login_attempt' AND ip_address = '$ip'");

            return $user;
        }
    }

    // Failed login
    record_attempt('login_attempt');
    log_security_action('login_failed', $username, "Invalid credentials for role: $role");
    return "Invalid username or password for the selected role.";
}

/**
 * Register a new user
 * 
 * @param array $data Registration data
 * @return bool|string True on success, error message on failure
 */
function register_user($data)
{
    global $mysqli;

    if (is_rate_limited('registration', 3, 60)) {
        return "Too many registration attempts. Please try again later.";
    }

    // Validate special code
    $stmt = $mysqli->prepare("SELECT code, role, specialization FROM special_codes WHERE code = ? AND role = ? AND (expiry_date IS NULL OR expiry_date > NOW())");
    $stmt->bind_param('ss', $data['special_code'], $data['role']);
    $stmt->execute();
    $code_data = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$code_data) {
        record_attempt('registration');
        return "Invalid or expired registration code for the selected user type.";
    }

    // Check if username already exists
    $stmt = $mysqli->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param('s', $data['username']);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        return "Username already taken. Please choose another.";
    }
    $stmt->close();

    // Check if email already exists (if email is provided)
    if (!empty($data['email'])) {
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param('s', $data['email']);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $stmt->close();
            return "An account with this email already exists.";
        }
        $stmt->close();
    }

    // Prepare data for insertion
    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
    $status = ($data['role'] === 'superadmin') ? 'approved' : 'pending';

    // Determine specialization (either from code or from POST data for outsiders/technicians)
    $specialization = $code_data['specialization'] ?: ($data['specialization'] ?? null);

    $stmt = $mysqli->prepare("INSERT INTO users (full_name, email, phone, role, special_code, specialization, username, password_hash, status, hostel_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param(
        'ssssssssss',
        $data['full_name'],
        $data['email'],
        $data['phone'],
        $data['role'],
        $data['special_code'],
        $specialization,
        $data['username'],
        $password_hash,
        $status,
        $data['hostel_type']
    );

    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $stmt->close();

        log_security_action('registration_success', $data['username'], "User ID: $user_id, Role: {$data['role']}");

        // Optional: Auto-delete the special code if it was single-use (logic can be expanded)
        // For now, we leave it since special_codes table doesn't have a 'is_used' column or 'single_use' flag yet.

        return true;
    }

    $error = $mysqli->error;
    $stmt->close();
    log_security_action('registration_failed', $data['username'], $error);
    return "Registration failed: " . $error;
}
?>