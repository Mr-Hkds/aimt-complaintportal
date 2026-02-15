"use client"

import { useState, useMemo } from "react"
import { signup } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, ShieldCheck, GraduationCap, BookOpen, ChevronDown } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const STUDENT_PATTERN = /^[a-z]{2,5}\d{4}_[a-z0-9._]+@aimt\.ac\.in$/i
const FACULTY_PATTERN = /^[a-z][a-z.]+@aimt\.ac\.in$/i
const DOMAIN = '@aimt.ac.in'

function detectRole(email: string): { role: string; label: string; icon: typeof GraduationCap; color: string } | null {
    if (!email || !email.toLowerCase().endsWith(DOMAIN)) return null
    if (STUDENT_PATTERN.test(email)) return { role: 'student', label: 'Student', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' }
    if (FACULTY_PATTERN.test(email)) return { role: 'faculty', label: 'Faculty', icon: BookOpen, color: 'text-violet-600 bg-violet-50 border-violet-200' }
    return null
}

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [showInviteCode, setShowInviteCode] = useState(false)

    const detected = useMemo(() => detectRole(email), [email])
    const isValidDomain = email.toLowerCase().endsWith(DOMAIN)
    const showDomainError = email.length > 3 && !email.toLowerCase().endsWith(DOMAIN) && email.includes('@')

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

        const result = await signup(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success(result.success)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#0c1b3a] tracking-tight">
                    Create Account
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Use your official AIMT email to register
                </p>
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

                    {/* Auto-detected role badge */}
                    {detected && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mt-2 ${detected.color}`}>
                            <detected.icon className="w-3.5 h-3.5" />
                            Registering as: {detected.label}
                        </div>
                    )}
                    {isValidDomain && !detected && email.length > 12 && (
                        <p className="text-xs text-amber-600 mt-1">
                            Email format not recognized. Use an invite code if you are staff.
                        </p>
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

                {/* Invite Code (collapsible) */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowInviteCode(!showInviteCode)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#c8a951]" />
                            Have an invite code? (Staff only)
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showInviteCode ? 'rotate-180' : ''}`} />
                    </button>
                    {showInviteCode && (
                        <div className="px-4 pb-4">
                            <Input
                                id="inviteCode"
                                name="inviteCode"
                                placeholder="e.g. TECH-A7X9"
                                className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg uppercase tracking-wider font-mono"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Technicians and administrators receive this from a superadmin.
                            </p>
                        </div>
                    )}
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
                            Create Account
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
