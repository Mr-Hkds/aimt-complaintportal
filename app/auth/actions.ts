'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const AIMT_DOMAIN = '@aimt.ac.in'
const STUDENT_PATTERN = /^[a-z]{2,10}\d{4}_[a-z0-9._]+@aimt\.ac\.in$/i

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
}
