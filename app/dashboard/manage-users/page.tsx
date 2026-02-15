"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Shield, ChevronDown } from "lucide-react"

type Profile = {
    id: string
    email: string
    full_name: string | null
    role: string
    created_at: string
}

const ROLES = ['student', 'faculty', 'technician', 'admin', 'superadmin']

export default function ManageUsersPage() {
    const supabase = createClient()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [isSuperadmin, setIsSuperadmin] = useState(false)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            // Check if current user is superadmin
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'superadmin') {
                setIsSuperadmin(false)
                setLoading(false)
                return
            }

            setIsSuperadmin(true)

            // Fetch all users
            const { data: allUsers, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                toast.error('Failed to load users')
                console.error(error)
            } else {
                setUsers(allUsers || [])
            }
            setLoading(false)
        }
        load()
    }, [supabase])

    async function changeRole(userId: string, newRole: string) {
        setUpdating(userId)
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            toast.error('Failed to update role: ' + error.message)
        } else {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
            toast.success('Role updated successfully')
        }
        setUpdating(null)
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-48"></div>
                    <div className="h-4 bg-slate-200 rounded w-72"></div>
                    <div className="space-y-3 mt-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!isSuperadmin) {
        return (
            <div className="p-8 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
                <p className="text-sm text-slate-500 mt-2">Only superadmins can manage user roles.</p>
            </div>
        )
    }

    const roleColor: Record<string, string> = {
        student: 'bg-blue-50 text-blue-700 border-blue-200',
        faculty: 'bg-violet-50 text-violet-700 border-violet-200',
        technician: 'bg-amber-50 text-amber-700 border-amber-200',
        admin: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        superadmin: 'bg-red-50 text-red-700 border-red-200',
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {users.length} registered user{users.length !== 1 ? 's' : ''}. Change roles using the dropdown.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">User</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-2">Joined</div>
                </div>

                {/* User rows */}
                {users.map(user => (
                    <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors">
                        <div className="col-span-4">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user.full_name || 'No name'}
                            </p>
                        </div>
                        <div className="col-span-4">
                            <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="col-span-2">
                            <div className="relative">
                                <select
                                    value={user.role}
                                    onChange={(e) => changeRole(user.id, e.target.value)}
                                    disabled={updating === user.id}
                                    className={`appearance-none w-full text-xs font-medium px-3 py-1.5 pr-7 rounded-full border cursor-pointer transition-colors ${roleColor[user.role] || 'bg-slate-50 text-slate-700 border-slate-200'} ${updating === user.id ? 'opacity-50' : ''}`}
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-slate-400">
                                {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-400 text-sm">
                        No users registered yet.
                    </div>
                )}
            </div>
        </div>
    )
}
