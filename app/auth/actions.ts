'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const AIMT_DOMAIN = '@aimt.ac.in'
const STUDENT_PATTERN = /^[a-z]{2,10}\d{4}_[a-z0-9._]+@aimt\.ac\.in$/i
const ADMIN_SECRET_KEY = 'AIMT_ADMIN_2024'

function detectRole(email: string): 'student' | 'faculty' {
    if (STUDENT_PATTERN.test(email.toLowerCase())) return 'student'
    return 'faculty'
}

export async function login(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email.toLowerCase().endsWith(AIMT_DOMAIN)) {
        return { error: 'Only @aimt.ac.in email addresses are allowed.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signup(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email.toLowerCase().endsWith(AIMT_DOMAIN)) {
        return { error: 'Only @aimt.ac.in email addresses are allowed.' }
    }

    const role = detectRole(email)

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
    }
}

export async function signupAsAdmin(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const secretKey = formData.get('secretKey') as string

    if (secretKey !== ADMIN_SECRET_KEY) {
        return { error: 'Invalid admin secret key.' }
    }

    if (!email.toLowerCase().endsWith(AIMT_DOMAIN)) {
        return { error: 'Only @aimt.ac.in email addresses are allowed.' }
    }

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'superadmin',
                }
            }
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
    }
}

export async function createTechnicianAccount(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify current user is admin/superadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        return { error: 'Only admins can create technician accounts.' }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const specialization = formData.get('specialization') as string
    const phone = formData.get('phone') as string

    try {
        // Create the auth user via Supabase's admin API
        // Note: This uses the regular signup which will trigger the profile creation
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'technician',
                    specialization: specialization,
                }
            }
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true, message: `Technician account created for ${fullName}` }
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'An unexpected error occurred' }
    }
}
