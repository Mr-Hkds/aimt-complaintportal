<?php
/**
 * AIMT Complaint Portal - Secure Logout
 */

require_once __DIR__ . '/../includes/auth_helper.php';

$username = $_SESSION['username'] ?? 'unknown';
log_security_action('logout', $username);

// Clear all session variables
$_SESSION = [];

// Destroy the session cookie if it exists
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Destroy the session
session_destroy();

// Redirect to login
redirect('login.php?logout=1');
?>