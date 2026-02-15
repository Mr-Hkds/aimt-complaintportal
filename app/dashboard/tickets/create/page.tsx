"use client"

import { useState } from "react"
import { createTicket } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

export default function CreateTicketPage() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createTicket(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Ticket created successfully")
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0c1b3a]">
                    Submit New Complaint
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Describe the issue you are facing. Provide as much detail as possible.
                </p>
            </div>

            <Card className="college-card">
                <CardContent className="p-6">
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                                Subject
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., WiFi not working in Room 204"
                                required
                                className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                                    Category
                                </Label>
                                <Select name="category" required>
                                    <SelectTrigger className="h-11 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WiFi">WiFi / Internet</SelectItem>
                                        <SelectItem value="Electricity">Electricity</SelectItem>
                                        <SelectItem value="Plumbing">Plumbing / Water</SelectItem>
                                        <SelectItem value="Mess">Mess Food</SelectItem>
                                        <SelectItem value="Cleaning">Housekeeping</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
                                    Priority
                                </Label>
                                <Select name="priority" required defaultValue="medium">
                                    <SelectTrigger className="h-11 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20">
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the issue in detail..."
                                required
                                className="min-h-[150px] bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                            />
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
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Complaint
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
