"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wifi, Utensils, Droplets, Zap, ClipboardCheck, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
    const supabase = createClient()
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setUserRole(profile.role)
                }
            }
            setLoading(false)
        }
        fetchUserData()
    }, [supabase])

    if (loading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
            </div>
        </div>
    }

    const isTechnician = userRole === 'technician'
    const isAdmin = userRole === 'admin' || userRole === 'superadmin'

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0c1b3a]">
                        {isAdmin ? 'Admin Dashboard' : isTechnician ? 'Technician Portal' : 'Dashboard'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isAdmin
                            ? "System-wide overview of complaints and users"
                            : isTechnician
                                ? "Manage your assigned maintenance tasks"
                                : "Overview of your complaints and campus issues"}
                    </p>
                </div>
                {!isTechnician && !isAdmin && (
                    <Link href="/dashboard/tickets/create">
                        <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white active:scale-95 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> New Complaint
                        </Button>
                    </Link>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="college-card border-l-4 border-l-[#0c1b3a]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            {isAdmin ? 'Total Complaints' : isTechnician ? 'Assigned Jobs' : 'My Tickets'}
                        </CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-[#0c1b3a]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0c1b3a]">0</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {isAdmin ? "Across all categories" : "Active cases"}
                        </p>
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

                {isAdmin ? (
                    <Card className="college-card border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Active Staff
                            </CardTitle>
                            <Zap className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#0c1b3a]">0</div>
                            <p className="text-xs text-slate-400 mt-1">Technicians online</p>
                        </CardContent>
                    </Card>
                ) : (
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
                )}

                <Card className="college-card border-l-4 border-l-[#c8a951]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            {isAdmin ? 'System Status' : 'Hostel'}
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-[#c8a951]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-slate-400">
                            {isAdmin ? 'Operational' : 'Not Set'}
                        </div>
                        <Link href="/dashboard/settings">
                            <p className="text-xs text-[#c8a951] hover:underline mt-1 cursor-pointer">
                                {isAdmin ? 'View Logs →' : 'Update Profile →'}
                            </p>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions - Only for Students/Faculty */}
            {!isTechnician && !isAdmin && (
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
            )}

            {/* Admin/Technician Specific View */}
            {(isAdmin || isTechnician) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClipboardCheck className="w-8 h-8 text-[#0c1b3a]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0c1b3a] mb-2">
                            {isAdmin ? 'Complaints Management' : 'Job Queue'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {isAdmin
                                ? 'View and manage all tickets submitted across the campus. Assign technicians and monitor progress.'
                                : 'You have no active jobs assigned to you at the moment.'}
                        </p>
                        <Link href="/dashboard/tickets">
                            <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white">
                                View All Tickets
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
