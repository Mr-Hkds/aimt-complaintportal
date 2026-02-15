"use client"

import { useState } from "react"
import { signup } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
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
                    Join the portal to report and track campus issues
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
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="student@aimt.edu.in"
                        required
                        className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg"
                    />
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
                            className="h-11 px-4 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20 rounded-lg"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
                    disabled={loading}
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
