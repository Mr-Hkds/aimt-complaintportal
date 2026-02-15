interface StatusBadgeProps {
    status: string
    size?: 'sm' | 'md'
}

const statusConfig: Record<string, { bg: string, text: string, label: string }> = {
    open: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Open' },
    in_progress: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'In Progress' },
    resolved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Resolved' },
    rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Rejected' },
    closed: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Closed' },
    reported: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Reported' },
    acknowledged: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Acknowledged' },
    active: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Active' },
    approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Approved' },
    implemented: { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700', label: 'Implemented' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const config = statusConfig[status] || { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: status }
    const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'

    return (
        <span className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.text} ${sizeClass}`}>
            {config.label}
        </span>
    )
}
