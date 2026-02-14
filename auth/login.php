<?php
/**
 * AIMT Complaint Portal - Premium Login Page
 */

require_once __DIR__ . '/../includes/auth_helper.php';

$error = '';
$success = '';

if (isset($_GET['error'])) {
    if ($_GET['error'] === 'unauthorized')
        $error = "You must be logged in to access that page.";
    elseif ($_GET['error'] === 'session_expired')
        $error = "Your session has expired. Please log in again.";
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        $error = "Invalid security token. Please refresh and try again.";
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $role = $_POST['role'] ?? '';

        if (empty($username) || empty($password) || empty($role)) {
            $error = "Please fill in all fields.";
        } else {
            $result = login_user($username, $password, $role);

            if (is_array($result)) {
                // Login successful
                switch ($result['role']) {
                    case 'student':
                        redirect('../user/dashboard.php');
                        break;
                    case 'technician':
                        redirect('../technician/dashboard.php');
                        break;
                    case 'superadmin':
                        redirect('../superadmin/dashboard.php');
                        break;
                    case 'faculty':
                    case 'nonteaching':
                        redirect('../user/dashboard.php');
                        break;
                    case 'outsourced_vendor':
                        redirect('../technician/dashboard.php');
                        break;
                    default:
                        redirect('../index.php');
                        break;
                }
            } else {
                // Login failed with error message
                $error = $result;
            }
        }
    }
}

$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | AIMT Complaint Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background: radial-gradient(circle at top left, #1a202c, #0d1117);
            overflow: hidden;
        }

        .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .animate-blob {
            animation: blob 7s infinite;
        }

        @keyframes blob {
            0% {
                transform: translate(0px, 0px) scale(1);
            }

            33% {
                transform: translate(30px, -50px) scale(1.1);
            }

            66% {
                transform: translate(-20px, 20px) scale(0.9);
            }

            100% {
                transform: translate(0px, 0px) scale(1);
            }
        }

        .animation-delay-2000 {
            animation-delay: 2s;
        }

        .animation-delay-4000 {
            animation-delay: 4s;
        }

        input:focus {
            box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
        }

        .role-option {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .role-option:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.08);
        }

        .role-option.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
    </style>
</head>

<body class="flex items-center justify-center min-h-screen p-4">
    <!-- Animated Background Blobs -->
    <div
        class="fixed top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob">
    </div>
    <div
        class="fixed top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-2000">
    </div>
    <div
        class="fixed -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-4000">
    </div>

    <div class="max-w-md w-full glass rounded-3xl p-8 shadow-2xl relative z-10">
        <!-- Logo & Header -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-2xl mb-4">
                <img src="../assets/images/aimt-logo.png" alt="AIMT Logo" class="w-12 h-12 object-contain"
                    onerror="this.src='https://via.placeholder.com/48?text=AIMT'">
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p class="text-gray-400">Log in to manage your complaints</p>
        </div>

        <?php if ($error): ?>
            <div
                class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-pulse">
                <i data-lucide="alert-circle" class="w-5 h-5"></i>
                <span class="text-sm"><?= htmlspecialchars($error) ?></span>
            </div>
        <?php endif; ?>

        <form method="POST" action="" class="space-y-6">
            <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

            <!-- Role Selection -->
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-3">Login as</label>
                <div class="grid grid-cols-2 gap-3 mb-6" id="roleGrid">
                    <button type="button" onclick="setRole('student')" data-role="student"
                        class="role-option flex items-center gap-2 p-3 rounded-xl border border-white/10 text-gray-400 text-sm">
                        <i data-lucide="graduation-cap" class="w-4 h-4"></i> Student
                    </button>
                    <button type="button" onclick="setRole('faculty')" data-role="faculty"
                        class="role-option flex items-center gap-2 p-3 rounded-xl border border-white/10 text-gray-400 text-sm">
                        <i data-lucide="book-open" class="w-4 h-4"></i> Faculty
                    </button>
                    <button type="button" onclick="setRole('technician')" data-role="technician"
                        class="role-option flex items-center gap-2 p-3 rounded-xl border border-white/10 text-gray-400 text-sm">
                        <i data-lucide="wrench" class="w-4 h-4"></i> Technician
                    </button>
                    <button type="button" onclick="setRole('superadmin')" data-role="superadmin"
                        class="role-option flex items-center gap-2 p-3 rounded-xl border border-white/10 text-gray-400 text-sm">
                        <i data-lucide="shield-check" class="w-4 h-4"></i> Admin
                    </button>
                </div>
                <input type="hidden" name="role" id="roleInput" required>
            </div>

            <!-- Username -->
            <div>
                <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div class="relative">
                    <input type="text" id="username" name="username" required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all pl-11"
                        placeholder="Enter your username">
                    <i data-lucide="user" class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                </div>
            </div>

            <!-- Password -->
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
                    <a href="../forgot_password.php"
                        class="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot?</a>
                </div>
                <div class="relative">
                    <input type="password" id="password" name="password" required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all pl-11 pr-11"
                        placeholder="••••••••">
                    <i data-lucide="lock" class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                    <button type="button" onclick="togglePassword()"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        <i data-lucide="eye" id="eyeIcon" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Submit Button -->
            <button type="submit"
                class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                <span>Sign In</span>
                <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
        </form>

        <p class="mt-8 text-center text-gray-400 text-sm">
            Don't have an account?
            <a href="register.php" class="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Create
                Account</a>
        </p>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        function setRole(role) {
            document.getElementById('roleInput').value = role;
            document.querySelectorAll('.role-option').forEach(opt => {
                if (opt.dataset.role === role) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        }

        function togglePassword() {
            const pwd = document.getElementById('password');
            const icon = document.getElementById('eyeIcon');
            if (pwd.type === 'password') {
                pwd.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                pwd.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        }

        // Auto-fetch role based on username (optional refinement)
        const usernameInput = document.getElementById('username');
        let debounceTimer;

        usernameInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const username = this.value;
                if (username.length >= 3) {
                    fetch('get_role.php?username=' + encodeURIComponent(username))
                        .then(res => res.json())
                        .then(data => {
                            if (data.role) setRole(data.role);
                        });
                }
            }, 500);
        });
    </script>
</body>

</html>