"use client"

import { useState } from "react"
import { updateProfile } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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
            <Card className="glass-card border-none bg-black/40 text-white">
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                        Update your personal information and hostel details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="John Doe"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hostel">Hostel Name</Label>
                                <Input
                                    id="hostel"
                                    name="hostel"
                                    placeholder="Boys Hostel 1"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomNo">Room Number</Label>
                                <Input
                                    id="roomNo"
                                    name="roomNo"
                                    placeholder="101"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
