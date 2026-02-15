"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wifi, Utensils, Droplets, Zap, ClipboardCheck, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0c1b3a]">
                        Dashboard
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Overview of your complaints and campus issues
                    </p>
                </div>
                <Link href="/dashboard/tickets/create">
                    <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white active:scale-95 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> New Complaint
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="college-card border-l-4 border-l-[#0c1b3a]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Tickets
                        </CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-[#0c1b3a]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0c1b3a]">0</div>
                        <p className="text-xs text-slate-400 mt-1">+0 from last month</p>
                    </CardContent>
                </Card>

                <Card className="college-card border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Pending
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0c1b3a]">0</div>
                        <p className="text-xs text-slate-400 mt-1">Awaiting action</p>
                    </CardContent>
                </Card>

                <Card className="college-card border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Resolved
                        </CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0c1b3a]">0</div>
                        <p className="text-xs text-slate-400 mt-1">Issues fixed</p>
                    </CardContent>
                </Card>

                <Card className="college-card border-l-4 border-l-[#c8a951]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Hostel
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-[#c8a951]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-slate-400">Not Set</div>
                        <Link href="/dashboard/settings">
                            <p className="text-xs text-[#c8a951] hover:underline mt-1 cursor-pointer">
                                Update Profile →
                            </p>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-base font-semibold text-[#0c1b3a] mb-4">
                    Quick Report
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "WiFi Issue", icon: Wifi, color: "text-blue-600", bg: "bg-blue-50", hoverBg: "hover:bg-blue-100" },
                        { label: "Mess Food", icon: Utensils, color: "text-orange-600", bg: "bg-orange-50", hoverBg: "hover:bg-orange-100" },
                        { label: "Water/Plumbing", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", hoverBg: "hover:bg-cyan-100" },
                        { label: "Electricity", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", hoverBg: "hover:bg-amber-100" },
                    ].map((action, i) => (
                        <Link href="/dashboard/tickets/create" key={i}>
                            <button
                                className={`w-full p-6 rounded-xl border border-slate-200 ${action.hoverBg} transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex flex-col items-center justify-center gap-3 bg-white group`}
                            >
                                <div className={`p-3 rounded-xl ${action.bg} ${action.color} transition-all`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <span className="font-medium text-sm text-slate-700">
                                    {action.label}
                                </span>
                            </button>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
