import { getTickets } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function TicketsPage() {
    const tickets = await getTickets()

    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">No Tickets Found</h3>
                <p className="text-gray-400">You haven't submitted any complaints yet.</p>
                <Link href="/dashboard/tickets/create" className="text-blue-400 hover:underline">
                    Create your first ticket
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Tickets</h2>
            <div className="grid gap-4">
                {tickets.map((ticket: any) => (
                    <Card key={ticket.id} className="glass-card border-none bg-black/40 text-white hover:bg-white/5 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                                        <Badge variant="outline" className={`
                        ${ticket.status === 'open' ? 'text-blue-400 border-blue-400' : ''}
                        ${ticket.status === 'resolved' ? 'text-emerald-400 border-emerald-400' : ''}
                    `}>
                                            {ticket.status}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {ticket.category}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2">{ticket.description}</p>
                                </div>
                                <div className="text-right text-xs text-gray-500 flex flex-col items-end gap-1">
                                    <span className="flex items-center gap-1">
                                        <CalendarClock className="w-3 h-3" />
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider
                        ${ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400'}
                    `}>
                                        {ticket.priority} Priority
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
