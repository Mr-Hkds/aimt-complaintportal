<?php
// Simple Migration Script for Railway
// usage: visit /migrate.php

require_once 'includes/config.php';

$output = [];

function log_msg($msg) {
    global $output;
    $output[] = $msg;
    echo $msg . "<br>\n";
}

try {
    log_msg("Starting migration...");

    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    log_msg("Database connection successful.");

    // 1. Run Schema
    $schema = file_get_contents('schema.sql');
    if (!$schema) throw new Exception("schema.sql not found");

    // Clean schema
    $schema = preg_replace('/^\xEF\xBB\xBF/', '', $schema);
    $schema = preg_replace('/--[^\n]*/', '', $schema);
    $schema = preg_replace('/\s+/', ' ', $schema);
    
    $statements = array_filter(explode(';', $schema), fn($s) => trim($s) !== '');

    log_msg("Found " . count($statements) . " statements in schema.sql");

    foreach ($statements as $sql) {
        $sql = trim($sql);
        if ($sql) {
            try {
                if (!$mysqli->query($sql)) {
                    // Ignore "table exists" errors or similar if you want idempotent, 
                    // but for now let's just log error but continue if it's "exists"
                    log_msg("Error running statement: " . $mysqli->error);
                }
            } catch (Exception $e) {
                log_msg("Exception: " . $e->getMessage());
            }
        }
    }
    log_msg("Schema import finished.");

    // 2. Run Triggers
    if (file_exists('trigger.sql')) {
        $trigger_sql = file_get_contents('trigger.sql');
        if ($trigger_sql) {
            log_msg("Running trigger.sql...");
            if (!$mysqli->multi_query($trigger_sql)) {
                 log_msg("Error running trigger: " . $mysqli->error);
            } else {
                 // consume results
                 do { if ($res = $mysqli->store_result()) $res->free(); } while ($mysqli->more_results() && $mysqli->next_result());
                 log_msg("Triggers imported.");
            }
        }
    }

    // 3. Create Super Admin if not exists
    $admin_user = 'admin';
    // You might want to let user set this, but for a quick setup:
    $default_pass = 'Admin@123'; 
    $check = $mysqli->query("SELECT id FROM users WHERE username = '$admin_user'");
    if ($check->num_rows == 0) {
        $pass_hash = password_hash($default_pass, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (full_name, phone, role, special_code, username, password_hash) 
                VALUES ('System Administrator', '0000000000', 'superadmin', 'ADMIN001', '$admin_user', '$pass_hash')";
        if ($mysqli->query($sql)) {
             log_msg("Superadmin created. Username: admin, Password: $default_pass");
        } else {
             log_msg("Error creating admin: " . $mysqli->error);
        }
    } else {
        log_msg("Superadmin 'admin' already exists.");
    }

    log_msg("<strong>Migration Completed Successfully!</strong>");
    log_msg("Please delete migrate.php from your server provided you have verified the site works.");

} catch (Exception $e) {
    log_msg("CRITICAL ERROR: " . $e->getMessage());
}
?>
