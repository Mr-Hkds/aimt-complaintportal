"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, ListChecks, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "My Tickets",
        href: "/dashboard/tickets",
        icon: ListChecks,
    },
    {
        title: "New Complaint",
        href: "/dashboard/tickets/create",
        icon: PlusCircle,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

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

    return (
        <div className="pb-12 w-64 nav-sidebar min-h-screen hidden md:flex md:flex-col border-r border-[#1a2d5a]">
            {/* Logo */}


            {/* Navigation */}
            <div className="flex-1 py-4">
                <nav className="grid items-start gap-1 px-3">
                    {sidebarItems.map((item, index) => {
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
        </div >
    )
}
