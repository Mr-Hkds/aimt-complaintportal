"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, ListChecks, Settings, LogOut, Ticket } from "lucide-react"
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
        <div className="pb-12 w-64 border-r border-white/10 bg-black/40 min-h-screen hidden md:block backdrop-blur-md">
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                            <img src="/logo.png" alt="AIMT" className="w-full h-full object-cover" />
                        </div>
                        AIMT Portal
                    </h2>
                </div>
                <div className="space-y-1">
                    <nav className="grid items-start gap-1 px-2">
                        {sidebarItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                >
                                    <span
                                        className={cn(
                                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 hover:text-white transition-all",
                                            pathname === item.href ? "bg-white/10 text-white" : "text-gray-400"
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
