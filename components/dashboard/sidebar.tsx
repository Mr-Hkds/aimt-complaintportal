"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, ListChecks, Settings, LogOut, Users } from "lucide-react"
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
        title: "Staff Management",
        href: "/dashboard/staff",
        icon: PlusCircle,
        roles: ["admin", "superadmin"],
    },
    {
        title: "My Tickets",
        href: "/dashboard/tickets",
        icon: ListChecks,
        roles: ["student", "faculty"],
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
        title: "New Complaint",
        href: "/dashboard/tickets/create",
        icon: PlusCircle,
        roles: ["student", "faculty"],
    },
    {
        title: "Manage Users",
        href: "/dashboard/manage-users",
        icon: Users,
        roles: ["superadmin"],
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

    return (
        <div className="pb-12 w-64 nav-sidebar min-h-screen hidden md:flex md:flex-col border-r border-[#1a2d5a]">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-[#1a2d5a]">
                <Link href="/dashboard" className="flex items-center gap-3 group">
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
            <div className="flex-1 py-4">
                <nav className="grid items-start gap-1 px-3">
                    {filteredItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
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

            {/* Sign Out */}
            <div className="px-3 pb-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg text-sm"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
