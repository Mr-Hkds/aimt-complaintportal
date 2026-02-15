import { Sidebar } from "@/components/dashboard/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden aurora-bg text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 relative">
                <div className="absolute top-4 right-4 z-50">
                    {/* We can add UserNav or similar here later */}
                </div>
                <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
