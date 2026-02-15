'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function createTicket(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const priority = formData.get('priority') as string

    // Image handling would go here (upload to storage, get URL)
    // For now we skip actual file upload logic in this snippet

    const { error } = await supabase.from('tickets').insert({
        user_id: user.id,
        title,
        description,
        category,
        priority,
        status: 'open'
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/tickets')
    redirect('/dashboard/tickets')
}

export async function getTickets() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tickets:', error)
        return []
    }

    return tickets
}

export async function updateProfile(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

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

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: 'Profile updated successfully' }
}
