import { getTickets } from "../actions"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, Inbox, Copy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"

export default async function TicketsPage() {
    const tickets = await getTickets()

    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                <div className="p-4 rounded-full bg-slate-100">
                    <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#0c1b3a]">
                    No Tickets Found
                </h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    You haven&apos;t submitted any complaints yet.
                </p>
                <Link href="/dashboard/tickets/create">
                    <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white mt-2">
                        Submit Your First Complaint
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0c1b3a]">Complaints</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {tickets.length} total complaint{tickets.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link href="/dashboard/tickets/create">
                    <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white" size="sm">
                        + New Complaint
                    </Button>
                </Link>
            </div>

            <div className="grid gap-3">
                {tickets.map((ticket: any) => (
                    <Link key={ticket.id} href={`/dashboard/tickets/${ticket.token}`}>
                        <Card className="college-card hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-[#0c1b3a] truncate">
                                                {ticket.title}
                                            </h3>
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                                {ticket.category}
                                            </span>
                                            <span className="font-mono text-xs text-[#c8a951] font-medium flex items-center gap-1">
                                                <Copy className="w-3 h-3" />
                                                {ticket.token}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-400 flex flex-col items-end gap-1.5 shrink-0 ml-4">
                                        <span className="flex items-center gap-1">
                                            <CalendarClock className="w-3 h-3" />
                                            {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${ticket.priority === 'high' || ticket.priority === 'urgent'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
