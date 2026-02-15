import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react"

interface HistoryEntry {
    id: string
    status: string
    note: string | null
    created_at: string
    profiles: { full_name: string | null } | null
}

const statusIcon: Record<string, React.ReactNode> = {
    open: <Clock className="w-4 h-4 text-amber-500" />,
    in_progress: <ArrowRight className="w-4 h-4 text-blue-500" />,
    resolved: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    rejected: <AlertCircle className="w-4 h-4 text-red-500" />,
    closed: <CheckCircle className="w-4 h-4 text-slate-400" />,
}

export function ComplaintTimeline({ history }: { history: HistoryEntry[] }) {
    if (history.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-slate-400">
                No history entries yet.
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />

            <div className="space-y-6">
                {history.map((entry, index) => (
                    <div key={entry.id} className="relative flex gap-4">
                        <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm shrink-0">
                            {statusIcon[entry.status] || <Clock className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-[#0c1b3a] capitalize">
                                    {entry.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(entry.created_at).toLocaleString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            {entry.note && (
                                <p className="text-sm text-slate-500 mt-1">{entry.note}</p>
                            )}
                            {entry.profiles?.full_name && (
                                <p className="text-xs text-slate-400 mt-1">by {entry.profiles.full_name}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
