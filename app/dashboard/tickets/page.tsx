import { getTickets } from "../actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, AlertCircle, Inbox } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
                    You haven&apos;t submitted any complaints yet. Get started by reporting a campus issue.
                </p>
                <Link href="/dashboard/tickets/create">
                    <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white mt-2">
                        Create Your First Ticket
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0c1b3a]">My Tickets</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Track and manage your submitted complaints
                    </p>
                </div>
                <Link href="/dashboard/tickets/create">
                    <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white" size="sm">
                        + New Ticket
                    </Button>
                </Link>
            </div>

            <div className="grid gap-3">
                {tickets.map((ticket: any) => (
                    <Card key={ticket.id} className="college-card hover:border-slate-300 transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-[#0c1b3a]">
                                            {ticket.title}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${ticket.status === 'open'
                                                    ? 'text-blue-600 border-blue-300 bg-blue-50'
                                                    : ticket.status === 'resolved'
                                                        ? 'text-emerald-600 border-emerald-300 bg-emerald-50'
                                                        : 'text-slate-600 border-slate-300'
                                                }`}
                                        >
                                            {ticket.status}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs bg-slate-100 text-slate-600"
                                        >
                                            {ticket.category}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2">
                                        {ticket.description}
                                    </p>
                                </div>
                                <div className="text-right text-xs text-slate-400 flex flex-col items-end gap-1.5 shrink-0 ml-4">
                                    <span className="flex items-center gap-1">
                                        <CalendarClock className="w-3 h-3" />
                                        {new Date(ticket.created_at).toLocaleDateString()}
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
                ))}
            </div>
        </div>
    )
}
