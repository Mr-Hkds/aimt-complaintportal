import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="px-4 md:px-8 pt-20 md:pt-8 pb-6 md:py-8 mx-auto max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
