import { getTicketByToken, getTicketHistory } from "../../actions"
import { Card, CardContent } from "@/components/ui/card"
import { QRCodeDisplay } from "@/components/qr-code"
import { StatusBadge } from "@/components/status-badge"
import { ComplaintTimeline } from "@/components/complaint-timeline"
import { ArrowLeft, MapPin, Building, User, Wrench, CalendarClock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface TicketDetailPageProps {
    params: Promise<{ token: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
    const { token } = await params
    const ticket = await getTicketByToken(token)

    if (!ticket) return notFound()

    const history = await getTicketHistory(ticket.id)

    const priorityColor: Record<string, string> = {
        low: 'text-slate-600 bg-slate-50',
        medium: 'text-amber-600 bg-amber-50',
        high: 'text-red-600 bg-red-50',
        urgent: 'text-red-700 bg-red-100',
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back */}
            <Link href="/dashboard/tickets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0c1b3a] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Complaints
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-[#0c1b3a] mb-2">{ticket.title}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={ticket.status} size="md" />
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityColor[ticket.priority] || ''}`}>
                            {ticket.priority} priority
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                            {ticket.category}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="college-card">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                {ticket.hostel_type && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Building className="w-4 h-4 text-slate-400" />
                                        <span>{ticket.hostel_type.replace(/_/g, ' ')}</span>
                                    </div>
                                )}
                                {ticket.room_no && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        Room {ticket.room_no}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {ticket.profiles?.full_name || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CalendarClock className="w-4 h-4 text-slate-400" />
                                    {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </div>
                            </div>

                            {ticket.assignee?.full_name && (
                                <div className="flex items-center gap-2 text-sm pt-2 border-t border-slate-100">
                                    <Wrench className="w-4 h-4 text-[#c8a951]" />
                                    <span className="text-slate-600">
                                        Assigned to <span className="font-medium text-[#0c1b3a]">{ticket.assignee.full_name}</span>
                                        {ticket.assignee.specialization && (
                                            <span className="text-slate-400"> ({ticket.assignee.specialization})</span>
                                        )}
                                    </span>
                                </div>
                            )}

                            {ticket.tech_note && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-emerald-800 mb-1">Technician Note</h4>
                                    <p className="text-sm text-emerald-700">{ticket.tech_note}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="college-card">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-slate-700 mb-4">Activity Timeline</h3>
                            <ComplaintTimeline history={history} />
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code Sidebar */}
                <div>
                    <Card className="college-card sticky top-24">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-slate-700 mb-4 text-center">QR Code</h3>
                            <QRCodeDisplay token={ticket.token} size={160} />
                            <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
                                Share this QR code with a technician to begin resolution
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
