<?php
/**
 * Database Upgrade Script for Auth System Rewrite
 * Adds necessary columns to users table and creates rate_limits table.
 */

require_once __DIR__ . '/includes/config.php';

// Only allow execution via CLI or by a superadmin
if (php_sapi_name() !== 'cli' && (!isset($_SESSION['role']) || $_SESSION['role'] !== 'superadmin')) {
    die("Unauthorized access. This script must be run from the command line or by an authenticated Superadmin.");
}

echo "Starting database upgrade...\n";


// 1. Add status column to users table if it doesn't exist
$result = $mysqli->query("SHOW COLUMNS FROM users LIKE 'status'");
if ($result->num_rows === 0) {
    echo "Adding 'status' column to 'users' table...\n";
    $query = "ALTER TABLE users ADD COLUMN status ENUM('pending', 'approved', 'suspended') NOT NULL DEFAULT 'approved' AFTER role";
    if ($mysqli->query($query)) {
        echo "Successfully added 'status' column.\n";
    } else {
        echo "Error adding 'status' column: " . $mysqli->error . "\n";
    }
} else {
    echo "'status' column already exists in 'users' table.\n";
}

// 2. Add email column to users table if it doesn't exist
$result = $mysqli->query("SHOW COLUMNS FROM users LIKE 'email'");
if ($result->num_rows === 0) {
    echo "Adding 'email' column to 'users' table...\n";
    $query = "ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT NULL AFTER full_name";
    if ($mysqli->query($query)) {
        echo "Successfully added 'email' column.\n";
        $mysqli->query("CREATE INDEX idx_email ON users(email)");
    } else {
        echo "Error adding 'email' column: " . $mysqli->error . "\n";
    }
} else {
    echo "'email' column already exists in 'users' table.\n";
}

// 3. Create rate_limits table
echo "Creating 'rate_limits' table...\n";
$query = "CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(50) NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `attempted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_action_ip` (`action`, `ip_address`),
    KEY `idx_attempted_at` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($mysqli->query($query)) {
    echo "Successfully created 'rate_limits' table.\n";
} else {
    echo "Error creating 'rate_limits' table: " . $mysqli->error . "\n";
}

echo "Database upgrade completed.\n";
?>