"use client"

import { useState } from "react"
import { login } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")

    const showDomainError = email.length > 3 && !email.toLowerCase().endsWith('@aimt.ac.in') && email.includes('@')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await login(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#0c1b3a] tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Sign in with your AIMT email
                </p>
            </div>

            <form action={handleSubmit} className="space-y-5">
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
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                            Password
                        </Label>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg"
                    />
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
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/auth/register"
                        className="text-[#0c1b3a] font-medium hover:text-[#c8a951] transition-colors"
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    )
}
