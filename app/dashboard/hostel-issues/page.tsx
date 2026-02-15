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
import { Building, ThumbsUp, Plus, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const HOSTEL_TYPES = [
    { value: 'boys_hostel_1', label: 'Boys Hostel 1' },
    { value: 'boys_hostel_2', label: 'Boys Hostel 2' },
    { value: 'girls_hostel', label: 'Girls Hostel' },
    { value: 'faculty_quarters', label: 'Faculty Quarters' },
]

const ISSUE_TYPES = [
    { value: 'water_supply', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'wifi', label: 'WiFi / Internet' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
]

export default function HostelIssuesPage() {
    const supabase = createClient()
    const [issues, setIssues] = useState<any[]>([])
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    const fetchIssues = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        const [issuesRes, votesRes] = await Promise.all([
            supabase.from('hostel_issues').select('*, profiles(full_name)').order('vote_count', { ascending: false }),
            supabase.from('hostel_issue_votes').select('issue_id').eq('user_id', user.id),
        ])

        setIssues(issuesRes.data || [])
        setUserVotes(new Set((votesRes.data || []).map((v: any) => v.issue_id)))
        setLoading(false)
    }, [supabase])

    useEffect(() => { fetchIssues() }, [fetchIssues])

    async function handleSubmit(formData: FormData) {
        if (!userId) return
        setSubmitting(true)

        const { error } = await supabase.from('hostel_issues').insert({
            user_id: userId,
            hostel_type: formData.get('hostelType'),
            issue_type: formData.get('issueType'),
            description: formData.get('description'),
        })

        setSubmitting(false)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Issue reported!')
            setShowForm(false)
            fetchIssues()
        }
    }

    async function handleVote(issueId: string) {
        if (!userId) return

        const hasVoted = userVotes.has(issueId)

        if (hasVoted) {
            await supabase.from('hostel_issue_votes').delete().eq('issue_id', issueId).eq('user_id', userId)
            await supabase.from('hostel_issues').update({ vote_count: (issues.find(i => i.id === issueId)?.vote_count || 1) - 1 }).eq('id', issueId)
        } else {
            await supabase.from('hostel_issue_votes').insert({ issue_id: issueId, user_id: userId })
            await supabase.from('hostel_issues').update({ vote_count: (issues.find(i => i.id === issueId)?.vote_count || 0) + 1 }).eq('id', issueId)
        }

        fetchIssues()
    }

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
                    <h2 className="text-2xl font-bold text-[#0c1b3a]">Hostel Issues</h2>
                    <p className="text-sm text-slate-500 mt-1">Report and vote on hostel-wide problems</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white"
                    size="sm"
                >
                    <Plus className="mr-1.5 w-4 h-4" />
                    Report Issue
                </Button>
            </div>

            {showForm && (
                <Card className="college-card border-l-4 border-l-[#c8a951]">
                    <CardContent className="p-6">
                        <form action={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Hostel</Label>
                                    <Select name="hostelType" required>
                                        <SelectTrigger className="h-11 bg-white border-slate-200">
                                            <SelectValue placeholder="Select Hostel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {HOSTEL_TYPES.map(h => (
                                                <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Issue Type</Label>
                                    <Select name="issueType" required>
                                        <SelectTrigger className="h-11 bg-white border-slate-200">
                                            <SelectValue placeholder="Select Issue" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ISSUE_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">Description</Label>
                                <Textarea
                                    name="description"
                                    placeholder="Describe the issue affecting the hostel..."
                                    required
                                    className="min-h-[80px] bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={submitting} className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white">
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Submit Report
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-200">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {issues.length === 0 ? (
                <div className="text-center py-12">
                    <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hostel issues reported yet.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {issues.map((issue: any) => (
                        <Card key={issue.id} className="college-card">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => handleVote(issue.id)}
                                        className={`flex flex-col items-center gap-0.5 shrink-0 px-3 py-2 rounded-lg transition-all active:scale-95 ${userVotes.has(issue.id)
                                                ? 'bg-[#c8a951]/10 text-[#c8a951] border border-[#c8a951]/30'
                                                : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="text-xs font-bold">{issue.vote_count}</span>
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xs font-medium text-[#0c1b3a] bg-slate-100 px-2 py-0.5 rounded capitalize">
                                                {issue.issue_type.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs text-slate-400 capitalize">
                                                {issue.hostel_type.replace(/_/g, ' ')}
                                            </span>
                                            <StatusBadge status={issue.status} />
                                        </div>
                                        <p className="text-sm text-slate-600">{issue.description}</p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            by {issue.profiles?.full_name || 'Anonymous'} · {new Date(issue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
