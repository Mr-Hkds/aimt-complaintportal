<?php
/**
 * AIMT Complaint Portal - Database Upgrade Script
 * Version: 2.1 (Security & Registration Update)
 * 
 * This script adds 'email' and 'status' columns to the 'users' table
 * and ensures all superadmin accounts are active.
 */

require_once __DIR__ . '/includes/config.php';

// Only allow execution via CLI or by a superadmin
if (php_sapi_name() !== 'cli' && (!isset($_SESSION['role']) || $_SESSION['role'] !== 'superadmin')) {
    die("Unauthorized access. This script must be run from the command line or by an authenticated Superadmin.");
}

echo "Starting database upgrade...<br>";

// 1. Add email column if not exists
$check_email = $mysqli->query("SHOW COLUMNS FROM users LIKE 'email'");
if ($check_email->num_rows === 0) {
    echo "Adding 'email' column to 'users' table...<br>";
    if ($mysqli->query("ALTER TABLE users ADD COLUMN email VARCHAR(100) NOT NULL AFTER phone")) {
        echo "Success: 'email' column added.<br>";
    } else {
        echo "Error adding 'email' column: " . $mysqli->error . "<br>";
    }
} else {
    echo "Info: 'email' column already exists.<br>";
}

// 2. Add status column if not exists
$check_status = $mysqli->query("SHOW COLUMNS FROM users LIKE 'status'");
if ($check_status->num_rows === 0) {
    echo "Adding 'status' column to 'users' table...<br>";
    if ($mysqli->query("ALTER TABLE users ADD COLUMN status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'pending' AFTER password_hash")) {
        echo "Success: 'status' column added.<br>";
    } else {
        echo "Error adding 'status' column: " . $mysqli->error . "<br>";
    }
} else {
    echo "Info: 'status' column already exists.<br>";
}

// 3. Ensure superadmins are active
echo "Activating all superadmin accounts...<br>";
if ($mysqli->query("UPDATE users SET status = 'active' WHERE role = 'superadmin'")) {
    echo "Success: Superadmin accounts activated.<br>";
} else {
    echo "Error updating superadmins: " . $mysqli->error . "<br>";
}

// 4. Update existing non-superadmin users to 'active' if they were already there (optional safety)
echo "Ensuring existing users are set to active...<br>";
if ($mysqli->query("UPDATE users SET status = 'active' WHERE status = 'pending' AND created_at < NOW() - INTERVAL 1 HOUR")) {
    echo "Success: Pre-existing users activated.<br>";
}

echo "<b>Upgrade complete.</b>";
?>