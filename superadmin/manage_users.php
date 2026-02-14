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
            $message = "User status updated to " . ucfirst($new_status) . " successfully.";
            $message_type = 'success';
            log_security_action("user_status_change", "user_id:$user_id", "New status: $new_status");
        } else {
            $message = "Error updating user status.";
            $message_type = 'error';
        }
        $stmt->close();
    }
}

// Get filter parameters
$search = trim($_GET['search'] ?? '');
$role_filter = $_GET['role'] ?? '';
$status_filter = $_GET['status'] ?? '';

// Build query
$query = "SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE role != 'superadmin'";
$params = [];
$types = "";

if ($search) {
    $query .= " AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
    $search_param = "%$search%";
    $params[] = &$search_param;
    $params[] = &$search_param;
    $params[] = &$search_param;
    $types .= "sss";
}

if ($role_filter) {
    $query .= " AND role = ?";
    $params[] = &$role_filter;
    $types .= "s";
}

if ($status_filter) {
    $query .= " AND status = ?";
    $params[] = &$status_filter;
    $types .= "s";
}

$query .= " ORDER BY CASE WHEN status = 'pending' THEN 1 ELSE 2 END, created_at DESC";

if ($params) {
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $users = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
} else {
    $users = $mysqli->query($query)->fetch_all(MYSQLI_ASSOC);
}

// Fetch stats
$stats = [
    'total' => $mysqli->query("SELECT COUNT(*) FROM users WHERE role != 'superadmin'")->fetch_row()[0],
    'pending' => $mysqli->query("SELECT COUNT(*) FROM users WHERE status = 'pending' AND role != 'superadmin'")->fetch_row()[0],
    'active' => $mysqli->query("SELECT COUNT(*) FROM users WHERE status = 'active' AND role != 'superadmin'")->fetch_row()[0],
    'suspended' => $mysqli->query("SELECT COUNT(*) FROM users WHERE status = 'suspended' AND role != 'superadmin'")->fetch_row()[0]
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Users - AIMT Superadmin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background-color: #f8fafc; }
        .nav-green-theme {
            background: linear-gradient(135deg, #065f46 0%, #064e3b 100%);
        }
        .stats-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stats-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .status-pill {
            padding: 2px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
    </style>
</head>
<body class="min-h-screen">
    <!-- Navbar -->
    <nav class="nav-green-theme text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <img src="../assets/images/aimt-logo.png" alt="AIMT Logo" class="w-10 h-10 brightness-0 invert">
                    <div>
                        <h1 class="text-xl font-bold leading-none">AIMT</h1>
                        <p class="text-[10px] uppercase tracking-widest opacity-70">Superadmin Control</p>
                    </div>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="dashboard.php" class="flex items-center space-x-1 hover:text-emerald-200 transition-colors">
                        <span class="material-icons text-lg">dashboard</span>
                        <span>Dashboard</span>
                    </a>
                    <a href="complaints.php" class="flex items-center space-x-1 hover:text-emerald-200 transition-colors">
                        <span class="material-icons text-lg">report_problem</span>
                        <span>Complaints</span>
                    </a>
                    <a href="../auth/logout.php" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md">
                        Logout
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Header -->
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-slate-800">User Management</h2>
            <p class="text-slate-500">Approve new registrations and manage portal access</p>
        </div>

        <?php if ($message): ?>
                <div class="mb-6 p-4 rounded-xl flex items-center shadow-sm <?= $message_type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200' ?>">
                    <span class="material-icons mr-2"><?= $message_type === 'success' ? 'check_circle' : 'error' ?></span>
                    <?= htmlspecialchars($message) ?>
                </div>
        <?php endif; ?>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div class="stats-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <span class="material-icons text-2xl">people</span>
                </div>
                <div>
                    <p class="text-slate-500 text-sm">Total Personnel</p>
                    <p class="text-2xl font-bold text-slate-800"><?= $stats['total'] ?></p>
                </div>
            </div>
            <div class="stats-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <span class="material-icons text-2xl">pending_actions</span>
                </div>
                <div>
                    <p class="text-slate-500 text-sm">Pending Approval</p>
                    <p class="text-2xl font-bold text-slate-800"><?= $stats['pending'] ?></p>
                </div>
            </div>
            <div class="stats-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <span class="material-icons text-2xl">verified_user</span>
                </div>
                <div>
                    <p class="text-slate-500 text-sm">Active Users</p>
                    <p class="text-2xl font-bold text-slate-800"><?= $stats['active'] ?></p>
                </div>
            </div>
            <div class="stats-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div class="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <span class="material-icons text-2xl">person_off</span>
                </div>
                <div>
                    <p class="text-slate-500 text-sm">Suspended</p>
                    <p class="text-2xl font-bold text-slate-800"><?= $stats['suspended'] ?></p>
                </div>
            </div>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <form method="GET" class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Search name, email, or phone..." 
                           class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all">
                </div>
                <div class="w-full md:w-48">
                    <select name="role" onchange="this.form.submit()" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all">
                        <option value="">All Roles</option>
                        <option value="student" <?= $role_filter === 'student' ? 'selected' : '' ?>>Student</option>
                        <option value="faculty" <?= $role_filter === 'faculty' ? 'selected' : '' ?>>Faculty</option>
                        <option value="nonteaching" <?= $role_filter === 'nonteaching' ? 'selected' : '' ?>>Non-Teaching</option>
                        <option value="technician" <?= $role_filter === 'technician' ? 'selected' : '' ?>>Technician</option>
                        <option value="outsourced_vendor" <?= $role_filter === 'outsourced_vendor' ? 'selected' : '' ?>>Vendor</option>
                    </select>
                </div>
                <div class="w-full md:w-48">
                    <select name="status" onchange="this.form.submit()" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all">
                        <option value="">All Statuses</option>
                        <option value="pending" <?= $status_filter === 'pending' ? 'selected' : '' ?>>Pending Approval</option>
                        <option value="active" <?= $status_filter === 'active' ? 'selected' : '' ?>>Active</option>
                        <option value="suspended" <?= $status_filter === 'suspended' ? 'selected' : '' ?>>Suspended</option>
                    </select>
                </div>
                <?php if ($search || $role_filter || $status_filter): ?>
                        <a href="manage_users.php" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center">
                            <span class="material-icons text-lg">close</span>
                        </a>
                <?php endif; ?>
            </form>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Info</th>
                            <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Specialization</th>
                            <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Join Date</th>
                            <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php foreach ($users as $user): ?>
                                <tr class="hover:bg-slate-50 transition-colors group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase">
                                                <?= substr($user['full_name'], 0, 2) ?>
                                            </div>
                                            <div>
                                                <p class="font-semibold text-slate-800"><?= htmlspecialchars($user['full_name']) ?></p>
                                                <p class="text-xs text-slate-500"><?= htmlspecialchars($user['email']) ?></p>
                                                <p class="text-[10px] text-slate-400 font-medium"><?= htmlspecialchars($user['phone']) ?></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <p class="text-sm font-medium text-slate-700"><?= ucfirst(str_replace('_', ' ', $user['role'])) ?></p>
                                        <p class="text-xs text-slate-500 italic"><?= $user['role'] === 'student' ? 'Resident' : ($user['specialization'] ?: 'General') ?></p>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-600">
                                        <?= date('d M, Y', strtotime($user['created_at'])) ?>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <?php
                                        $pillClass = "bg-slate-100 text-slate-600";
                                        if ($user['status'] === 'active')
                                            $pillClass = "bg-emerald-100 text-emerald-700";
                                        else if ($user['status'] === 'pending')
                                            $pillClass = "bg-amber-100 text-amber-700 ring-2 ring-amber-400 ring-offset-2";
                                        else if ($user['status'] === 'suspended')
                                            $pillClass = "bg-rose-100 text-rose-700";
                                        ?>
                                        <span class="status-pill <?= $pillClass ?>">
                                            <?= $user['status'] ?: 'ACTIVE' ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end space-x-2">
                                            <?php if ($user['status'] === 'pending'): ?>
                                                    <a href="?action=approve&id=<?= $user['id'] ?>" class="group/btn relative px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center">
                                                        <span class="material-icons text-sm mr-1">check</span> Approve
                                                    </a>
                                            <?php endif; ?>
                                        
                                            <div class="relative inline-block text-left group/drop">
                                                <button class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-all">
                                                    <span class="material-icons text-sm">more_vert</span>
                                                </button>
                                                <div class="group-hover/drop:block hidden absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-10 py-2">
                                                    <?php if ($user['status'] !== 'suspended'): ?>
                                                            <a href="?action=suspend&id=<?= $user['id'] ?>" class="flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                                                                <span class="material-icons text-sm mr-2">block</span> Suspend Account
                                                            </a>
                                                    <?php endif; ?>
                                                    <?php if ($user['status'] === 'suspended'): ?>
                                                            <a href="?action=activate&id=<?= $user['id'] ?>" class="flex items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                                                <span class="material-icons text-sm mr-2">restore</span> Reactivate
                                                            </a>
                                                    <?php endif; ?>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                        <?php endforeach; ?>
                        <?php if (empty($users)): ?>
                                <tr>
                                    <td colspan="5" class="px-6 py-20 text-center">
                                        <span class="material-icons text-6xl text-slate-200 mb-4 block">person_search</span>
                                        <p class="text-slate-500 font-medium">No personnel matching your criteria.</p>
                                        <a href="manage_users.php" class="text-emerald-600 hover:underline mt-2 inline-block text-sm">Clear all filters</a>
                                    </td>
                                </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200">
                <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">AIMT Portal Data Maintenance &bull; Generated at <?= date('H:i:s') ?></p>
            </div>
        </div>
    </main>

    <script>
        // Simple auto-dismiss for messages
        setTimeout(() => {
            const msg = document.querySelector('.mb-6.p-4.rounded-xl');
            if (msg) {
                msg.style.opacity = '0';
                msg.style.transition = 'opacity 0.5s ease';
                setTimeout(() => msg.remove(), 500);
            }
        }, 5000);
    </script>
</body>
</html>