import { getDashboardStats } from "./actions"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import {
    TicketCheck, Clock, CheckCircle, Users,
    PlusCircle, ListChecks, QrCode, Building, Lightbulb, Wrench, AlertTriangle
} from "lucide-react"

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    const stats = await getDashboardStats()
    const role = profile?.role || 'student'
    const name = profile?.full_name?.split(' ')[0] || 'User'

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-[#0c1b3a] tracking-tight">
                    Welcome back, {name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {role === 'technician' && 'Manage your assigned complaints and scan QR codes'}
                    {['admin', 'superadmin'].includes(role) && 'Monitor complaints and manage staff'}
                    {['student', 'faculty'].includes(role) && 'Track your complaints and stay updated'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Total"
                    value={stats?.total || 0}
                    icon={<TicketCheck className="w-5 h-5 text-[#c8a951]" />}
                />
                <StatsCard
                    label="Pending"
                    value={stats?.pending || 0}
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                    highlight={stats?.pending ? stats.pending > 0 : false}
                />
                <StatsCard
                    label="Resolved"
                    value={stats?.resolved || 0}
                    icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
                />
                {['admin', 'superadmin'].includes(role) && (
                    <StatsCard
                        label="Online Staff"
                        value={(stats as any)?.onlineTechnicians || 0}
                        icon={<Users className="w-5 h-5 text-blue-500" />}
                    />
                )}
                {['student', 'faculty'].includes(role) && (
                    <StatsCard
                        label="Resolution Rate"
                        value={stats?.total ? Math.round(((stats.resolved || 0) / stats.total) * 100) : 0}
                        suffix="%"
                        icon={<CheckCircle className="w-5 h-5 text-blue-500" />}
                    />
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['student', 'faculty'].includes(role) && (
                        <>
                            <QuickAction href="/dashboard/tickets/create" icon={<PlusCircle className="w-5 h-5" />} label="New Complaint" description="Report an issue" />
                            <QuickAction href="/dashboard/tickets" icon={<ListChecks className="w-5 h-5" />} label="My Tickets" description="Track status" />
                            <QuickAction href="/dashboard/hostel-issues" icon={<Building className="w-5 h-5" />} label="Hostel Issues" description="Community problems" />
                            <QuickAction href="/dashboard/suggestions" icon={<Lightbulb className="w-5 h-5" />} label="Suggestions" description="Share ideas" />
                        </>
                    )}

                    {role === 'technician' && (
                        <>
                            <QuickAction href="/dashboard/scanner" icon={<QrCode className="w-5 h-5" />} label="Scan QR Code" description="Scan complaint QR" accent />
                            <QuickAction href="/dashboard/tickets" icon={<ListChecks className="w-5 h-5" />} label="Assigned Jobs" description="View your work" />
                        </>
                    )}

                    {['admin', 'superadmin'].includes(role) && (
                        <>
                            <QuickAction href="/dashboard/tickets" icon={<ListChecks className="w-5 h-5" />} label="All Complaints" description="View & manage" />
                            <QuickAction href="/dashboard/staff" icon={<Wrench className="w-5 h-5" />} label="Staff Management" description="Add technicians" />
                            <QuickAction href="/dashboard/manage-users" icon={<Users className="w-5 h-5" />} label="Manage Users" description="Change roles" />
                            <QuickAction href="/dashboard/hostel-issues" icon={<Building className="w-5 h-5" />} label="Hostel Issues" description="Community reports" />
                            <QuickAction href="/dashboard/suggestions" icon={<Lightbulb className="w-5 h-5" />} label="Suggestions" description="Student ideas" />
                            <QuickAction href="/dashboard/scanner" icon={<QrCode className="w-5 h-5" />} label="QR Scanner" description="Lookup complaint" />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatsCard({ label, value, icon, suffix = '', highlight = false }: {
    label: string, value: number, icon: React.ReactNode, suffix?: string, highlight?: boolean
}) {
    return (
        <Card className={`college-card ${highlight ? 'border-amber-200 bg-amber-50/30' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    {icon}
                    {highlight && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-2xl font-bold text-[#0c1b3a]">{value}{suffix}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </CardContent>
        </Card>
    )
}

function QuickAction({ href, icon, label, description, accent = false }: {
    href: string, icon: React.ReactNode, label: string, description: string, accent?: boolean
}) {
    return (
        <Link href={href}>
            <Card className={`college-card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group ${accent ? 'border-[#c8a951]/50 bg-[#c8a951]/5' : ''}`}>
                <CardContent className="p-4">
                    <div className={`mb-2 ${accent ? 'text-[#c8a951]' : 'text-slate-400 group-hover:text-[#0c1b3a]'} transition-colors`}>
                        {icon}
                    </div>
                    <p className="text-sm font-semibold text-[#0c1b3a]">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                </CardContent>
            </Card>
        </Link>
    )
}
