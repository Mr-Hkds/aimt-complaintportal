"use client"

import { useState } from "react"
import { createTicket } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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
            <Card className="glass-card border-none bg-black/40 text-white">
                <CardHeader>
                    <CardTitle>Submit New Complaint</CardTitle>
                    <CardDescription className="text-gray-400">
                        Describe the issue you are facing. Please provide as much detail as possible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Subject</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., WiFi not working in Room 204"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category" required>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                                <Label htmlFor="priority">Priority</Label>
                                <Select name="priority" required defaultValue="medium">
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the issue in detail..."
                                required
                                className="min-h-[150px] bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Ticket"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
