'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Only allow AIMT emails
const AIMT_DOMAIN = '@aimt.ac.in'
// Student pattern: course+year_name@aimt.ac.in (e.g. bba2023_rahul@aimt.ac.in)
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

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Domain lock
    if (!email.toLowerCase().endsWith(AIMT_DOMAIN)) {
        return { error: 'Only @aimt.ac.in email addresses are allowed.' }
    }

    // Auto-detect role
    const role = detectRole(email)

    // Create user (email confirmation must be disabled in Supabase dashboard)
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

    // Auto-login after signup (since email confirmation is disabled)
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
