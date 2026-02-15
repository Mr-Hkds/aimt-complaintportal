"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wifi, Utensils, Droplets, Zap } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    // TODO: Fetch user profile and stats here
    const userName = "Student" // Placeholder

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Link href="/dashboard/tickets/create">
                    <Button className="bg-blue-600 hover:bg-blue-500">
                        <Plus className="mr-2 h-4 w-4" /> New Complaint
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Quick Stats */}
                <Card className="glass-card border-none bg-black/40 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-400">+0 from last month</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none bg-black/40 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-red-500/20 p-0.5">
                            <div className="w-full h-full rounded-full bg-red-500 animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-400">Needs attention</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none bg-black/40 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <div className="h-4 w-4 text-emerald-400">✓</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-400">Fixed issues</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none bg-black/40 text-white">
                    {/* Placeholder for now */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hostel</CardTitle>
                        <div className="text-xs text-gray-400">Not Set</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-300">Update Profile</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-medium mb-4 text-gray-200">Quick Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "WiFi Issue", icon: Wifi, color: "text-blue-400", bg: "bg-blue-500/10" },
                        { label: "Mess Food", icon: Utensils, color: "text-orange-400", bg: "bg-orange-500/10" },
                        { label: "Water/Plumbing", icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                        { label: "Electricity", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                    ].map((action, i) => (
                        <button key={i} className={`p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all hover:scale-105 flex flex-col items-center justify-center gap-3 bg-black/20 backdrop-blur-sm group`}>
                            <div className={`p-3 rounded-full ${action.bg} ${action.color} group-hover:ring-2 ring-white/10 transition-all`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-gray-300">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
