"use client"

import { useState } from "react"
import { updateProfile } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await updateProfile(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Profile updated successfully")
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#0c1b3a]">
                    Profile Settings
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Update your personal information and hostel details.
                </p>
            </div>

            <Card className="college-card">
                <CardContent className="p-6">
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                                Full Name
                            </Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Your full name"
                                className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hostel" className="text-sm font-medium text-slate-700">
                                    Hostel Name
                                </Label>
                                <Input
                                    id="hostel"
                                    name="hostel"
                                    placeholder="Boys Hostel 1"
                                    className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomNo" className="text-sm font-medium text-slate-700">
                                    Room Number
                                </Label>
                                <Input
                                    id="roomNo"
                                    name="roomNo"
                                    placeholder="101"
                                    className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
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
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
