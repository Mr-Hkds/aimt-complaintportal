"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signup, signupAsAdmin } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, GraduationCap, BookOpen, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Suspense } from "react"

const STUDENT_PATTERN = /^[a-z]{2,10}\d{4}_[a-z0-9._]+@aimt\.ac\.in$/i
const DOMAIN = '@aimt.ac.in'

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")

    const isAdminMode = searchParams.get('role') === 'superadmin' && searchParams.get('key') === 'AIMT_ADMIN_2024'

    const isStudent = useMemo(() => STUDENT_PATTERN.test(email), [email])
    const isValidDomain = email.toLowerCase().endsWith(DOMAIN)
    const showDomainError = email.length > 3 && !isValidDomain && email.includes('@')
    const showRoleBadge = !isAdminMode && isValidDomain && email.length > 12

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            setLoading(false)
            return
        }

        let result
        if (isAdminMode) {
            formData.append('secretKey', 'AIMT_ADMIN_2024')
            result = await signupAsAdmin(formData)
        } else {
            result = await signup(formData)
        }
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success(isAdminMode ? "Admin account created!" : "Account created!")
            router.push('/dashboard')
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#0c1b3a] tracking-tight">
                    {isAdminMode ? 'Admin Registration' : 'Create Account'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {isAdminMode
                        ? 'Set up the superadmin account for this portal'
                        : 'Use your official AIMT email to get started'}
                </p>
                {isAdminMode && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mt-3 text-red-600 bg-red-50 border-red-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Superadmin Registration
                    </div>
                )}
            </div>

            <form action={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                        Full Name
                    </Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Your full name"
                        required
                        className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Institute Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="yourname@aimt.ac.in"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg ${showDomainError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                    />
                    {showDomainError && (
                        <p className="text-xs text-red-500 mt-1">Only @aimt.ac.in emails are allowed</p>
                    )}
                    {showRoleBadge && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mt-2 ${isStudent ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-violet-600 bg-violet-50 border-violet-200'}`}>
                            {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                            Registering as: {isStudent ? 'Student' : 'Faculty'}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                            Confirm
                        </Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
                    disabled={loading || showDomainError}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {isAdminMode ? 'Create Admin Account' : 'Create Account'}
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="text-[#0c1b3a] font-medium hover:text-[#c8a951] transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-48"></div>
                <div className="h-4 bg-slate-200 rounded w-72"></div>
                <div className="space-y-3 mt-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-11 bg-slate-100 rounded-lg"></div>)}
                </div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    )
}
