"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard, PlusCircle, ListChecks, Settings, LogOut,
    Users, QrCode, Building, Lightbulb, Wrench, Menu, X
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["student", "faculty", "technician", "admin", "superadmin"],
    },
    {
        title: "New Complaint",
        href: "/dashboard/tickets/create",
        icon: PlusCircle,
        roles: ["student", "faculty"],
    },
    {
        title: "My Tickets",
        href: "/dashboard/tickets",
        icon: ListChecks,
        roles: ["student", "faculty"],
    },
    {
        title: "QR Scanner",
        href: "/dashboard/scanner",
        icon: QrCode,
        roles: ["technician"],
    },
    {
        title: "Assigned Jobs",
        href: "/dashboard/tickets",
        icon: ListChecks,
        roles: ["technician"],
    },
    {
        title: "All Complaints",
        href: "/dashboard/tickets",
        icon: ListChecks,
        roles: ["admin", "superadmin"],
    },
    {
        title: "Staff Management",
        href: "/dashboard/staff",
        icon: Wrench,
        roles: ["admin", "superadmin"],
    },
    {
        title: "Hostel Issues",
        href: "/dashboard/hostel-issues",
        icon: Building,
        roles: ["student", "faculty", "admin", "superadmin"],
    },
    {
        title: "Suggestions",
        href: "/dashboard/suggestions",
        icon: Lightbulb,
        roles: ["student", "faculty", "admin", "superadmin"],
    },
    {
        title: "Manage Users",
        href: "/dashboard/manage-users",
        icon: Users,
        roles: ["superadmin"],
    },
    {
        title: "QR Lookup",
        href: "/dashboard/scanner",
        icon: QrCode,
        roles: ["admin", "superadmin"],
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ["student", "faculty", "technician", "admin", "superadmin"],
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [userRole, setUserRole] = useState<string | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const fetchUserRole = async () => {
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
        }
        fetchUserRole()
    }, [supabase])

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Signed out successfully")
            router.push('/')
            router.refresh()
        }
    }

    const filteredItems = sidebarItems.filter(item =>
        !userRole || item.roles.includes(userRole)
    )

    const navContent = (
        <>
            {/* Logo */}
            <div className="px-5 py-5 border-b border-[#1a2d5a]">
                <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
                    <div className="bg-white rounded-full p-1 shadow-sm border border-slate-200">
                        <Image src="/logo.png" alt="AIMT Crest" width={36} height={36} className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm leading-tight">
                            AIMT Portal
                        </p>
                        <p className="text-[10px] text-slate-500">
                            Complaint Management
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 overflow-y-auto">
                <nav className="grid items-start gap-1 px-3">
                    {filteredItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span
                                    className={cn(
                                        "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-[#1a2d5a] text-[#c8a951] border-l-2 border-[#c8a951]"
                                            : "text-slate-400 hover:bg-[#1a2d5a]/50 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn(
                                        "mr-3 h-4 w-4",
                                        isActive ? "text-[#c8a951]" : ""
                                    )} />
                                    <span>{item.title}</span>
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Role Badge + Sign Out */}
            <div className="px-3 pb-4 space-y-2">
                {userRole && (
                    <div className="px-3 py-2">
                        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${userRole === 'superadmin' ? 'bg-red-900/30 text-red-300' :
                                userRole === 'admin' ? 'bg-emerald-900/30 text-emerald-300' :
                                    userRole === 'technician' ? 'bg-amber-900/30 text-amber-300' :
                                        'bg-slate-700/50 text-slate-400'
                            }`}>
                            {userRole}
                        </span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg text-sm"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0c1b3a] border-b border-[#1a2d5a] px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-white rounded-full p-0.5">
                        <Image src="/logo.png" alt="AIMT" width={28} height={28} className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-white text-sm font-semibold">AIMT Portal</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-white p-1.5"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar drawer */}
            <div className={cn(
                "md:hidden fixed top-0 left-0 z-50 w-64 h-full nav-sidebar flex flex-col border-r border-[#1a2d5a] transition-transform duration-200",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {navContent}
            </div>

            {/* Desktop sidebar */}
            <div className="pb-12 w-64 nav-sidebar min-h-screen hidden md:flex md:flex-col border-r border-[#1a2d5a]">
                {navContent}
            </div>
        </>
    )
}
