<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Check if the user is logged in and is a superadmin
if (!is_logged_in() || $_SESSION['role'] !== 'superadmin') {
    redirect('../login.php?error=unauthorized');
}

$message = '';
$message_type = '';

// Handle status updates
if (isset($_GET['action']) && isset($_GET['id'])) {
    $user_id = intval($_GET['id']);
    $action = $_GET['action'];
    $new_status = '';

    if ($action === 'approve')
        $new_status = 'active';
    else if ($action === 'suspend')
        $new_status = 'suspended';
    else if ($action === 'activate')
        $new_status = 'active';

    if ($new_status) {
        $stmt = $mysqli->prepare("UPDATE users SET status = ? WHERE id = ? AND role != 'superadmin'");
        $stmt->bind_param('si', $new_status, $user_id);
        if ($stmt->execute()) {
            $message = "User status updated successfully.";
            $message_type = 'success';
            log_security_action("user_status_change", "user_id:$user_id", "New status: $new_status");
        } else {
            $message = "Error updating user status.";
            $message_type = 'error';
        }
        $stmt->close();
    }
}

// Fetch users
$query = "SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE role != 'superadmin' ORDER BY CASE WHEN status = 'pending' THEN 1 ELSE 2 END, created_at DESC";
$result = $mysqli->query($query);
$users = $result->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Users - AIMT Superadmin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        .nav-green-theme {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-bottom: 2px solid #bbf7d0;
        }
    </style>
</head>

<body class="bg-slate-50 min-h-screen">
    <nav class="nav-green-theme shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <img src="../assets/images/aimt-logo.png" alt="AIMT Logo" class="w-8 h-8 mr-3">
                    <h1 class="text-lg font-bold text-emerald-900">User Management</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="dashboard.php" class="text-emerald-700 hover:text-emerald-900 font-medium">Dashboard</a>
                    <a href="../auth/logout.php"
                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">Logout</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <?php if ($message): ?>
            <div
                class="mb-4 p-4 rounded-lg <?= $message_type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' ?>">
                <?= htmlspecialchars($message) ?>
            </div>
        <?php endif; ?>

        <div class="bg-white shadow-md rounded-xl overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">System Users</h2>
                <span class="text-sm text-gray-500">Total Users:
                    <?= count($users) ?>
                </span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 text-gray-600 text-sm font-medium">
                        <tr>
                            <th class="px-6 py-4">User Details</th>
                            <th class="px-6 py-4">Role</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <?php foreach ($users as $user): ?>
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="font-medium text-gray-900">
                                        <?= htmlspecialchars($user['full_name']) ?>
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        <?= htmlspecialchars($user['email']) ?> |
                                        <?= htmlspecialchars($user['phone']) ?>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        <?= ucfirst(str_replace('_', ' ', $user['role'])) ?>
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <?php
                                    $statusColor = 'bg-gray-100 text-gray-700';
                                    if ($user['status'] === 'active')
                                        $statusColor = 'bg-green-100 text-green-700';
                                    else if ($user['status'] === 'pending')
                                        $statusColor = 'bg-yellow-100 text-yellow-700';
                                    else if ($user['status'] === 'suspended')
                                        $statusColor = 'bg-red-100 text-red-700';
                                    ?>
                                    <span class="px-2 py-1 rounded-full text-xs font-bold <?= $statusColor ?>">
                                        <?= strtoupper($user['status'] ?: 'ACTIVE') ?>
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    <?php if ($user['status'] === 'pending' || !$user['status']): ?>
                                        <a href="?action=approve&id=<?= $user['id'] ?>"
                                            class="text-green-600 hover:text-green-800 font-medium text-sm">Approve</a>
                                    <?php endif; ?>

                                    <?php if ($user['status'] === 'active' || !$user['status']): ?>
                                        <a href="?action=suspend&id=<?= $user['id'] ?>"
                                            class="text-red-600 hover:text-red-800 font-medium text-sm">Suspend</a>
                                    <?php elseif ($user['status'] === 'suspended'): ?>
                                        <a href="?action=activate&id=<?= $user['id'] ?>"
                                            class="text-emerald-600 hover:text-emerald-800 font-medium text-sm">Activate</a>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (empty($users)): ?>
                            <tr>
                                <td colspan="4" class="px-6 py-8 text-center text-gray-500">No users found.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</body>

</html>