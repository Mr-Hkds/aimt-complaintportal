<?php
/**
 * Auth Logic Test Script
 * Verifies rate limiting, login, and registration logic.
 */

require_once __DIR__ . '/includes/auth_helper.php';

echo "--- Auth Logic Verification ---\n";

// 1. Test Rate Limiting
echo "Testing Rate Limiting...\n";
$action = 'test_action_' . uniqid();
$limit = 3;
$window = 1;

for ($i = 0; $i < $limit; $i++) {
    if (is_rate_limited($action, $limit, $window)) {
        echo "FAILED: Rate limited prematurely at attempt $i\n";
    }
    record_attempt($action);
    echo "Attempt $i recorded.\n";
}

if (is_rate_limited($action, $limit, $window)) {
    echo "SUCCESS: Rate limiting triggered after $limit attempts.\n";
} else {
    echo "FAILED: Rate limiting NOT triggered after $limit attempts.\n";
}

// 2. Test Registration & Password Complexity
echo "\nTesting Registration Validation...\n";
$test_user = [
    'full_name' => 'Test User',
    'email' => 'test@example.com',
    'phone' => '1234567890',
    'role' => 'student',
    'special_code' => 'INVALID', // Should fail
    'username' => 'testuser_' . uniqid(),
    'password' => 'short',
    'confirm_password' => 'short',
    'hostel_type' => 'boys'
];

$result = register_user($test_user);
if ($result === "Invalid or expired registration code for the selected user type.") {
    echo "SUCCESS: Invalid special code correctly identified.\n";
} else {
    echo "FAILED: Registration with invalid code should have failed. Result: $result\n";
}

// 3. Test Login
echo "\nTesting Login Logic (simulated)...\n";
// Note: We can't easily test real login without a real user in the DB.
// But we can check if the function handles missing users correctly.
$result = login_user('nonexistent_user', 'password', 'student');
if ($result === "Invalid username or password for the selected role.") {
    echo "SUCCESS: Invalid user correctly identified.\n";
} else {
    echo "FAILED: Login with nonexistent user should have failed. Result: $result\n";
}

echo "\n--- Verification Finished ---\n";
?>