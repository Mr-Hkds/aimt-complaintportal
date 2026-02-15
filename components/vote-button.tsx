"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface VoteButtonProps {
    upvotes: number
    downvotes: number
    userVote: 'up' | 'down' | null
    onVote: (type: 'up' | 'down') => Promise<void>
    mode?: 'updown' | 'uponly'
}

export function VoteButton({ upvotes, downvotes, userVote, onVote, mode = 'updown' }: VoteButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handleVote(type: 'up' | 'down') {
        setLoading(true)
        await onVote(type)
        setLoading(false)
    }

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => handleVote('up')}
                disabled={loading}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${userVote === 'up'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                    } ${loading ? 'opacity-50' : ''}`}
            >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{upvotes}</span>
            </button>
            {mode === 'updown' && (
                <button
                    onClick={() => handleVote('down')}
                    disabled={loading}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${userVote === 'down'
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        } ${loading ? 'opacity-50' : ''}`}
                >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{downvotes}</span>
                </button>
            )}
        </div>
    )
}
