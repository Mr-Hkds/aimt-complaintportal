"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { createTechnicianAccount } from "@/app/auth/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserPlus, Loader2, Wrench, Phone, Mail, Circle } from "lucide-react"
import { toast } from "sonner"

const SPECIALIZATIONS = [
    { value: 'electrician', label: 'Electrician' },
    { value: 'plumber', label: 'Plumber' },
    { value: 'carpenter', label: 'Carpenter' },
    { value: 'wifi_technician', label: 'WiFi / Network' },
    { value: 'ac_technician', label: 'AC / HVAC' },
    { value: 'general', label: 'General Maintenance' },
]

type Technician = {
    id: string
    email: string
    full_name: string | null
    specialization: string | null
    phone: string | null
    is_online: boolean
    created_at: string
}

export default function StaffPage() {
    const supabase = createClient()
    const [technicians, setTechnicians] = useState<Technician[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [creating, setCreating] = useState(false)

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
            setIsAdmin(false)
            setLoading(false)
            return
        }
        setIsAdmin(true)

        const { data: techs } = await supabase
            .from('profiles')
            .select('id, email, full_name, specialization, phone, is_online, created_at')
            .eq('role', 'technician')
            .order('created_at', { ascending: false })

        setTechnicians(techs || [])
        setLoading(false)
    }, [supabase])

    useEffect(() => { fetchData() }, [fetchData])

    async function handleCreate(formData: FormData) {
        setCreating(true)
        const result = await createTechnicianAccount(formData)
        setCreating(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(result?.message || 'Technician account created!')
            setShowForm(false)
            // Wait a moment for the trigger to create the profile
            setTimeout(() => fetchData(), 1500)
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-48"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>)}
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="text-center py-16">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
                <p className="text-sm text-slate-500 mt-2">Only admins can manage staff accounts.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0c1b3a]">Staff Management</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {technicians.length} technician{technicians.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white"
                    size="sm"
                >
                    <UserPlus className="mr-1.5 w-4 h-4" />
                    Add Technician
                </Button>
            </div>

            {showForm && (
                <Card className="college-card border-l-4 border-l-[#c8a951]">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-[#0c1b3a] mb-4">Create Technician Account</h3>
                        <form action={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                                    <Input
                                        name="fullName"
                                        placeholder="Technician's name"
                                        required
                                        className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Email</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="tech@aimt.ac.in"
                                        required
                                        className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Password</Label>
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Min 6 chars"
                                        required
                                        minLength={6}
                                        className="h-11 bg-white border-slate-200 text-[#0c1b3a] focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Specialization</Label>
                                    <Select name="specialization" required>
                                        <SelectTrigger className="h-11 bg-white border-slate-200">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SPECIALIZATIONS.map(s => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Phone</Label>
                                    <Input
                                        name="phone"
                                        placeholder="Optional"
                                        className="h-11 bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={creating} className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white">
                                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    Create Account
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-200">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Technician List */}
            {technicians.length === 0 ? (
                <div className="text-center py-12">
                    <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No technicians yet. Add your first one above.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Specialization</div>
                        <div className="col-span-2">Phone</div>
                        <div className="col-span-2">Status</div>
                    </div>

                    {technicians.map(tech => (
                        <div key={tech.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors">
                            <div className="col-span-3">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {tech.full_name || 'No name'}
                                </p>
                            </div>
                            <div className="col-span-3 flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <p className="text-sm text-slate-500 truncate">{tech.email}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full capitalize">
                                    {tech.specialization?.replace(/_/g, ' ') || '—'}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5">
                                {tech.phone ? (
                                    <>
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        <span className="text-sm text-slate-500">{tech.phone}</span>
                                    </>
                                ) : <span className="text-sm text-slate-300">—</span>}
                            </div>
                            <div className="col-span-2">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tech.is_online ? 'text-emerald-600' : 'text-slate-400'
                                    }`}>
                                    <Circle className={`w-2 h-2 ${tech.is_online ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-300 text-slate-300'}`} />
                                    {tech.is_online ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
