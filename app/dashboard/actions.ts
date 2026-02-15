'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

function generateToken(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let token = ''
    for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
}

export async function createTicket(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const priority = formData.get('priority') as string
    const roomNo = formData.get('roomNo') as string
    const hostelType = formData.get('hostelType') as string

    const token = generateToken()

    const { data, error } = await supabase.from('tickets').insert({
        user_id: user.id,
        token,
        title,
        description,
        category,
        priority,
        room_no: roomNo || null,
        hostel_type: hostelType || null,
        status: 'open'
    }).select('id, token').single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/tickets')
    return { success: true, token: data.token, ticketId: data.id }
}

export async function getTickets() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    let query = supabase.from('tickets').select('*, profiles!tickets_assigned_to_fkey(full_name, specialization)')

    if (profile?.role === 'technician') {
        query = query.eq('assigned_to', user.id)
    } else if (['admin', 'superadmin'].includes(profile?.role || '')) {
        // Admin sees all
    } else {
        query = query.eq('user_id', user.id)
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tickets:', error)
        return []
    }

    return tickets || []
}

export async function getTicketByToken(token: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('tickets')
        .select('*, profiles!tickets_user_id_fkey(full_name, email, role), assignee:profiles!tickets_assigned_to_fkey(full_name, specialization)')
        .eq('token', token)
        .single()

    if (error) return null
    return data
}

export async function getTicketHistory(ticketId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('complaint_history')
        .select('*, profiles(full_name)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

    if (error) return []
    return data || []
}

export async function resolveTicket(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const ticketId = formData.get('ticketId') as string
    const techNote = formData.get('techNote') as string
    const newStatus = formData.get('status') as string || 'resolved'

    const { error } = await supabase
        .from('tickets')
        .update({
            status: newStatus,
            tech_note: techNote,
            updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

    if (error) return { error: error.message }

    // Add history entry
    await supabase.from('complaint_history').insert({
        ticket_id: ticketId,
        status: newStatus,
        note: techNote || `Status changed to ${newStatus}`,
        changed_by: user.id
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/tickets')
    return { success: true }
}

export async function getDashboardStats() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    const role = profile.role

    if (['admin', 'superadmin'].includes(role)) {
        const [total, pending, resolved, technicians] = await Promise.all([
            supabase.from('tickets').select('id', { count: 'exact', head: true }),
            supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
            supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'technician').eq('is_online', true),
        ])
        return {
            role,
            total: total.count || 0,
            pending: pending.count || 0,
            resolved: resolved.count || 0,
            onlineTechnicians: technicians.count || 0,
        }
    }

    if (role === 'technician') {
        const [assigned, pending, resolved] = await Promise.all([
            supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('assigned_to', user.id),
            supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'open'),
            supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'resolved'),
        ])
        return {
            role,
            total: assigned.count || 0,
            pending: pending.count || 0,
            resolved: resolved.count || 0,
        }
    }

    // Student/Faculty
    const [total, pending, resolved] = await Promise.all([
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'open'),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'resolved'),
    ])
    return {
        role,
        total: total.count || 0,
        pending: pending.count || 0,
        resolved: resolved.count || 0,
    }
}

export async function updateProfile(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const fullName = formData.get('fullName') as string
    const hostel = formData.get('hostel') as string
    const roomNo = formData.get('roomNo') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            hostel,
            room_no: roomNo,
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: 'Profile updated successfully' }
}

export async function toggleOnlineStatus() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_online')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Profile not found' }

    const { error } = await supabase
        .from('profiles')
        .update({ is_online: !profile.is_online })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true, isOnline: !profile.is_online }
}
