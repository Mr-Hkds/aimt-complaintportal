"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { Lightbulb, ThumbsUp, ThumbsDown, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = [
    { value: 'academics', label: 'Academics' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'hostel', label: 'Hostel Life' },
    { value: 'mess', label: 'Mess / Food' },
    { value: 'sports', label: 'Sports' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' },
]

const TABS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'approved', label: 'Approved' },
    { value: 'mine', label: 'My Ideas' },
]

export default function SuggestionsPage() {
    const supabase = createClient()
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({})
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('all')

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        const [suggestionsRes, votesRes] = await Promise.all([
            supabase.from('suggestions').select('*, profiles(full_name)').order('created_at', { ascending: false }),
            supabase.from('suggestion_votes').select('suggestion_id, vote_type').eq('user_id', user.id),
        ])

        setSuggestions(suggestionsRes.data || [])
        const votesMap: Record<string, 'up' | 'down'> = {}
            ; (votesRes.data || []).forEach((v: any) => { votesMap[v.suggestion_id] = v.vote_type })
        setUserVotes(votesMap)
        setLoading(false)
    }, [supabase])

    useEffect(() => { fetchData() }, [fetchData])

    async function handleSubmit(formData: FormData) {
        if (!userId) return
        setSubmitting(true)

        const { error } = await supabase.from('suggestions').insert({
            user_id: userId,
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
        })

        setSubmitting(false)
        if (error) toast.error(error.message)
        else {
            toast.success('Suggestion submitted!')
            setShowForm(false)
            fetchData()
        }
    }

    async function handleVote(suggestionId: string, type: 'up' | 'down') {
        if (!userId) return

        const existing = userVotes[suggestionId]
        const suggestion = suggestions.find(s => s.id === suggestionId)
        if (!suggestion) return

        if (existing === type) {
            // Remove vote
            await supabase.from('suggestion_votes').delete().eq('suggestion_id', suggestionId).eq('user_id', userId)
            const update: any = {}
            if (type === 'up') update.upvotes = Math.max(0, suggestion.upvotes - 1)
            else update.downvotes = Math.max(0, suggestion.downvotes - 1)
            await supabase.from('suggestions').update(update).eq('id', suggestionId)
        } else if (existing) {
            // Change vote
            await supabase.from('suggestion_votes').update({ vote_type: type }).eq('suggestion_id', suggestionId).eq('user_id', userId)
            const update: any = {}
            if (type === 'up') { update.upvotes = suggestion.upvotes + 1; update.downvotes = Math.max(0, suggestion.downvotes - 1) }
            else { update.downvotes = suggestion.downvotes + 1; update.upvotes = Math.max(0, suggestion.upvotes - 1) }
            await supabase.from('suggestions').update(update).eq('id', suggestionId)
        } else {
            // New vote
            await supabase.from('suggestion_votes').insert({ suggestion_id: suggestionId, user_id: userId, vote_type: type })
            const update: any = {}
            if (type === 'up') update.upvotes = suggestion.upvotes + 1
            else update.downvotes = suggestion.downvotes + 1
            await supabase.from('suggestions').update(update).eq('id', suggestionId)
        }

        fetchData()
    }

    const filtered = suggestions.filter(s => {
        if (activeTab === 'mine') return s.user_id === userId
        if (activeTab === 'all') return true
        return s.status === activeTab
    })

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-48"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>)}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0c1b3a]">Suggestions</h2>
                    <p className="text-sm text-slate-500 mt-1">Share ideas to improve campus life</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white"
                    size="sm"
                >
                    <Plus className="mr-1.5 w-4 h-4" />
                    New Idea
                </Button>
            </div>

            {showForm && (
                <Card className="college-card border-l-4 border-l-[#c8a951]">
                    <CardContent className="p-6">
                        <form action={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Title</Label>
                                    <Input
                                        name="title"
                                        placeholder="Your suggestion in a few words..."
                                        required
                                        className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Category</Label>
                                    <Select name="category" required>
                                        <SelectTrigger className="h-11 bg-white border-slate-200">
                                            <SelectValue placeholder="Pick one" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">Details</Label>
                                <Textarea
                                    name="description"
                                    placeholder="Explain your idea — what problem does it solve, how would it work?"
                                    required
                                    className="min-h-[80px] bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={submitting} className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white">
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Submit Idea
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-200">Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.value
                                ? 'bg-white text-[#0c1b3a] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12">
                    <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No suggestions here yet. Be the first!</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map(s => {
                        const myVote = userVotes[s.id] || null
                        return (
                            <Card key={s.id} className="college-card">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleVote(s.id, 'up')}
                                                className={`p-1.5 rounded-md transition-all active:scale-95 ${myVote === 'up'
                                                        ? 'text-emerald-600 bg-emerald-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs font-bold text-[#0c1b3a]">{s.upvotes - s.downvotes}</span>
                                            <button
                                                onClick={() => handleVote(s.id, 'down')}
                                                className={`p-1.5 rounded-md transition-all active:scale-95 ${myVote === 'down'
                                                        ? 'text-red-600 bg-red-50'
                                                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-semibold text-[#0c1b3a]">{s.title}</h3>
                                                <StatusBadge status={s.status} />
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2">{s.description}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded capitalize">{s.category}</span>
                                                <span className="text-xs text-slate-400">
                                                    by {s.profiles?.full_name || 'Anonymous'} · {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            {s.admin_remark && (
                                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-2.5">
                                                    <p className="text-xs font-medium text-blue-800">Admin Response</p>
                                                    <p className="text-xs text-blue-700 mt-0.5">{s.admin_remark}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
