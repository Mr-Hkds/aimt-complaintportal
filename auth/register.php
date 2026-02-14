<?php
/**
 * AIMT Complaint Portal - Premium Multi-Step Registration
 */

require_once __DIR__ . '/../includes/auth_helper.php';

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        $errors[] = "Invalid security token. Please refresh and try again.";
    } else {
        // Collect all data from POST
        $data = [
            'full_name' => trim($_POST['full_name'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'phone' => trim($_POST['phone'] ?? ''),
            'role' => $_POST['role'] ?? '',
            'special_code' => trim($_POST['special_code'] ?? ''),
            'username' => trim($_POST['username'] ?? ''),
            'password' => $_POST['password'] ?? '',
            'confirm_password' => $_POST['confirm_password'] ?? '',
            'hostel_type' => $_POST['hostel_type'] ?? null,
            'specialization' => $_POST['specialization'] ?? $_POST['vendor_type'] ?? null
        ];

        // Basic validation before calling helper
        if ($data['password'] !== $data['confirm_password']) {
            $errors[] = "Passwords do not match.";
        } elseif (strlen($data['password']) < 8) {
            $errors[] = "Password must be at least 8 characters long.";
        } else {
            $result = register_user($data);
            if ($result === true) {
                redirect('login.php?registered=1');
            } else {
                $errors[] = $result;
            }
        }
    }
}

$csrf_token = generate_csrf_token();
$roles = ['student', 'faculty', 'nonteaching', 'technician', 'outsourced_vendor'];
$categories = ['mess', 'carpenter', 'wifi', 'housekeeping', 'plumber', 'electrician', 'laundry', 'ac'];
$vendor_types = ['mess', 'cafeteria', 'arboriculture', 'security', 'housekeeping'];
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account | AIMT Complaint Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background: radial-gradient(circle at top left, #1a202c, #0d1117);
            overflow-x: hidden;
        }

        .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .step-node.active {
            background: #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            border-color: #3b82f6;
        }

        .step-node.completed {
            background: #10b981;
            border-color: #10b981;
        }

        .step-line.active {
            background: #3b82f6;
        }

        .role-card.active {
            background: rgba(59, 130, 246, 0.1);
            border-color: #3b82f6;
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

        .step-panel {
            display: none;
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-panel.active {
            display: block;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    </style>
</head>

<body class="flex items-center justify-center min-h-screen p-4">
    <!-- Animated Background Blobs -->
    <div
        class="fixed top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob">
    </div>
    <div
        class="fixed top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-2000">
    </div>
    <div
        class="fixed -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-4000">
    </div>

    <div class="max-w-2xl w-full glass rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 my-8">
        <!-- Header -->
        <div class="text-center mb-10">
            <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p class="text-gray-400">Join the AIMT Complaint Portal</p>
        </div>

        <!-- Progress Steps -->
        <div
            class="flex items-center justify-between mb-12 relative px-4 text-xs font-semibold uppercase tracking-wider">
            <div class="flex flex-col items-center gap-2 relative z-10">
                <div id="step-node-1"
                    class="step-node active w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-white bg-[#0d1117] transition-all duration-500">
                    <span>1</span>
                </div>
                <span class="text-gray-400" id="step-label-1">Account</span>
            </div>
            <div class="flex-1 h-0.5 bg-white/10 mx-2 -mt-6 relative">
                <div id="step-line-1" class="step-line absolute h-full bg-blue-600 w-0 transition-all duration-500">
                </div>
            </div>
            <div class="flex flex-col items-center gap-2 relative z-10">
                <div id="step-node-2"
                    class="step-node w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-white bg-[#0d1117] transition-all duration-500">
                    <span>2</span>
                </div>
                <span class="text-gray-400" id="step-label-2">Profile</span>
            </div>
            <div class="flex-1 h-0.5 bg-white/10 mx-2 -mt-6 relative">
                <div id="step-line-2" class="step-line absolute h-full bg-blue-600 w-0 transition-all duration-500">
                </div>
            </div>
            <div class="flex flex-col items-center gap-2 relative z-10">
                <div id="step-node-3"
                    class="step-node w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-white bg-[#0d1117] transition-all duration-500">
                    <span>3</span>
                </div>
                <span class="text-gray-400" id="step-label-3">Security</span>
            </div>
        </div>

        <?php if ($errors): ?>
            <div class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-8 space-y-1">
                <?php foreach ($errors as $err): ?>
                    <div class="flex items-center gap-2 text-sm">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span><?= htmlspecialchars($err) ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form id="regForm" method="POST" action="" class="space-y-8">
            <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">

            <!-- Step 1: Role & Special Code -->
            <div id="panel-1" class="step-panel active">
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-4">I am registering as</label>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <?php foreach ($roles as $role): ?>
                                <button type="button" onclick="setRole('<?= $role ?>')" data-role="<?= $role ?>"
                                    class="role-card flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm gap-2">
                                    <i data-lucide="<?= $role === 'student' ? 'graduation-cap' : ($role === 'technician' ? 'wrench' : ($role === 'superadmin' ? 'shield-check' : ($role === 'faculty' ? 'book-open' : 'briefcase'))) ?>"
                                        class="w-6 h-6"></i>
                                    <span><?= $role === 'outsourced_vendor' ? 'Vendor' : ucfirst($role) ?></span>
                                </button>
                            <?php endforeach; ?>
                        </div>
                        <input type="hidden" name="role" id="roleInput" required>
                    </div>

                    <div id="group-special-code">
                        <label for="special_code" class="block text-sm font-medium text-gray-300 mb-2">Registration
                            Code</label>
                        <div class="relative">
                            <input type="text" id="special_code" name="special_code" required
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                placeholder="Enter your 4-digit code">
                            <i data-lucide="key"
                                class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Required for all account types to verify affiliation.</p>
                    </div>
                </div>
            </div>

            <!-- Step 2: Personal Details -->
            <div id="panel-2" class="step-panel">
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label for="full_name" class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <div class="relative">
                            <input type="text" id="full_name" name="full_name" required
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                placeholder="John Doe">
                            <i data-lucide="user"
                                class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Campus Email</label>
                        <div class="relative">
                            <input type="email" id="email" name="email" required
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                placeholder="username@aimt.edu.in">
                            <i data-lucide="mail"
                                class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                        </div>
                    </div>

                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <div class="relative">
                            <input type="tel" id="phone" name="phone" required maxlength="10"
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                placeholder="10-digit number">
                            <i data-lucide="phone"
                                class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                        </div>
                    </div>

                    <!-- Role Specific: Student -> Hostel -->
                    <div id="group-hostel" class="hidden md:col-span-2">
                        <label class="block text-sm font-medium text-gray-300 mb-4">Hostel Type</label>
                        <div class="grid grid-cols-2 gap-4 text-sm font-medium">
                            <button type="button" onclick="setHostel('boys')" data-hostel="boys"
                                class="hostel-card py-4 rounded-2xl border border-white/10 text-gray-400 text-center hover:bg-white/5 transition-all">Boys
                                Hostel</button>
                            <button type="button" onclick="setHostel('girls')" data-hostel="girls"
                                class="hostel-card py-4 rounded-2xl border border-white/10 text-gray-400 text-center hover:bg-white/5 transition-all">Girls
                                Hostel</button>
                        </div>
                        <input type="hidden" name="hostel_type" id="hostelInput">
                    </div>

                    <!-- Role Specific: Technician -> Specialization -->
                    <div id="group-tech" class="hidden md:col-span-2">
                        <label for="specialization"
                            class="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                        <select name="specialization" id="specialization"
                            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none appearance-none cursor-pointer">
                            <option value="">Select Specialization</option>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?= $cat ?>" class="bg-[#0d1117]"><?= ucfirst($cat) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- Role Specific: Vendor -> Vendor Type -->
                    <div id="group-vendor" class="hidden md:col-span-2">
                        <label for="vendor_type" class="block text-sm font-medium text-gray-300 mb-2">Vendor
                            Type</label>
                        <select name="vendor_type" id="vendor_type"
                            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none appearance-none cursor-pointer">
                            <option value="">Select Vendor Category</option>
                            <?php foreach ($vendor_types as $vt): ?>
                                <option value="<?= $vt ?>" class="bg-[#0d1117]"><?= ucfirst($vt) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Step 3: Username & Security -->
            <div id="panel-3" class="step-panel">
                <div class="space-y-6">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <div class="relative">
                            <input type="text" id="username" name="username" required
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                placeholder="Choose a unique username">
                            <i data-lucide="at-sign"
                                class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                        </div>
                        <p id="username-msg" class="text-xs mt-2"></p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div class="relative">
                                <input type="password" id="password" name="password" required
                                    class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                    placeholder="Min. 8 chars">
                                <i data-lucide="lock"
                                    class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                            </div>
                        </div>
                        <div>
                            <label for="confirm_password"
                                class="block text-sm font-medium text-gray-300 mb-2">Confirm</label>
                            <div class="relative">
                                <input type="password" id="confirm_password" name="confirm_password" required
                                    class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all pl-12"
                                    placeholder="Repeat password">
                                <i data-lucide="check-circle-2"
                                    class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-between pt-8 border-t border-white/10">
                <button type="button" id="prevBtn" onclick="nextPrev(-1)"
                    class="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                    Back
                </button>
                <div class="flex gap-4">
                    <button type="button" id="nextBtn" onclick="nextPrev(1)"
                        class="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2">
                        <span id="nextBtnText">Next Step</span>
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                    </button>
                    <button type="submit" id="submitBtn"
                        class="hidden bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2">
                        Complete Account
                        <i data-lucide="user-plus" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </form>

        <p class="mt-10 text-center text-gray-400 text-sm">
            Already have an account?
            <a href="login.php" class="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign In</a>
        </p>
    </div>

    <script>
        lucide.createIcons();

        let currentStep = 1;
        const totalSteps = 3;

        function setRole(role) {
            document.getElementById('roleInput').value = role;
            document.querySelectorAll('.role-card').forEach(card => {
                if (card.dataset.role === role) {
                    card.classList.add('active', 'border-blue-600', 'bg-blue-600/20', 'text-white');
                } else {
                    card.classList.remove('active', 'border-blue-600', 'bg-blue-600/20', 'text-white');
                }
            });

            // Toggle role-specific fields
            document.getElementById('group-hostel').classList.toggle('hidden', role !== 'student');
            document.getElementById('group-tech').classList.toggle('hidden', role !== 'technician');
            document.getElementById('group-vendor').classList.toggle('hidden', role !== 'outsourced_vendor');
        }

        function setHostel(type) {
            document.getElementById('hostelInput').value = type;
            document.querySelectorAll('.hostel-card').forEach(card => {
                if (card.dataset.hostel === type) {
                    card.classList.add('border-blue-600', 'bg-blue-600/20', 'text-white');
                } else {
                    card.classList.remove('border-blue-600', 'bg-blue-600/20', 'text-white');
                }
            });
        }

        function validateStep(step) {
            if (step === 1) {
                const role = document.getElementById('roleInput').value;
                const code = document.getElementById('special_code').value;
                return role !== '' && code.length >= 4;
            }
            if (step === 2) {
                const name = document.getElementById('full_name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                if (!name || !email || !phone) return false;

                const role = document.getElementById('roleInput').value;
                if (role === 'student' && !document.getElementById('hostelInput').value) return false;
                if (role === 'technician' && !document.getElementById('specialization').value) return false;
                if (role === 'outsourced_vendor' && !document.getElementById('vendor_type').value) return false;

                return true;
            }
            return true;
        }

        function nextPrev(n) {
            if (n === 1 && !validateStep(currentStep)) {
                alert("Please fill in all required fields properly.");
                return;
            }

            document.getElementById('panel-' + currentStep).classList.remove('active');
            currentStep += n;

            if (currentStep > totalSteps) {
                // Should not happen if buttons hidden correctly, but for safety:
                currentStep = totalSteps;
            }

            showStep(currentStep);
        }

        function showStep(s) {
            document.getElementById('panel-' + s).classList.add('active');

            // Update Nodes & Lines
            for (let i = 1; i <= totalSteps; i++) {
                const node = document.getElementById('step-node-' + i);
                const label = document.getElementById('step-label-' + i);
                if (i < s) {
                    node.classList.add('completed');
                    node.classList.remove('active');
                    node.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
                } else if (i === s) {
                    node.classList.add('active');
                    node.classList.remove('completed');
                    node.innerHTML = `<span>${i}</span>`;
                } else {
                    node.classList.remove('active', 'completed');
                    node.innerHTML = `<span>${i}</span>`;
                }
            }
            lucide.createIcons();

            // Progress lines
            document.getElementById('step-line-1').style.width = s > 1 ? '100%' : '0%';
            document.getElementById('step-line-2').style.width = s > 2 ? '100%' : '0%';

            // Buttons
            document.getElementById('prevBtn').classList.toggle('invisible', s === 1);
            document.getElementById('nextBtn').classList.toggle('hidden', s === totalSteps);
            document.getElementById('submitBtn').classList.toggle('hidden', s !== totalSteps);
        }

        // Username Availability Check
        const unInput = document.getElementById('username');
        const unMsg = document.getElementById('username-msg');
        let unTimer;

        unInput.addEventListener('input', function () {
            clearTimeout(unTimer);
            unMsg.textContent = 'Checking...';
            unMsg.className = 'text-xs mt-2 text-gray-400';

            unTimer = setTimeout(() => {
                const val = unInput.value.trim();
                if (val.length < 3) {
                    unMsg.textContent = 'Username must be at least 3 characters.';
                    unMsg.className = 'text-xs mt-2 text-red-400';
                    return;
                }

                fetch('validate_unique.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'field=username&value=' + encodeURIComponent(val)
                })
                    .then(r => r.json())
                    .then(data => {
                        if (data.unique) {
                            unMsg.textContent = 'Username is available!';
                            unMsg.className = 'text-xs mt-2 text-emerald-400';
                        } else {
                            unMsg.textContent = 'Username is already taken.';
                            unMsg.className = 'text-xs mt-2 text-red-400';
                        }
                    });
            }, 500);
        });

        // Initialize Step 1
        showStep(1);
    </script>
</body>

</html>