'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Regex patterns for AIMT email detection
const AIMT_DOMAIN = '@aimt.ac.in'
const STUDENT_PATTERN = /^[a-z]{2,5}\d{4}_[a-z0-9._]+@aimt\.ac\.in$/i
// Faculty = name.name@aimt.ac.in (no digits before @, no underscore-year pattern)
const FACULTY_PATTERN = /^[a-z][a-z.]+@aimt\.ac\.in$/i

function detectRoleFromEmail(email: string): 'student' | 'faculty' | null {
    const lower = email.toLowerCase()
    if (STUDENT_PATTERN.test(lower)) return 'student'
    if (FACULTY_PATTERN.test(lower)) return 'faculty'
    return null
}

export async function login(formData: FormData) {
    let isSuccess = false
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Strict domain check
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

        isSuccess = true
        revalidatePath('/', 'layout')
    } catch (err: any) {
        // If it's a redirect error, let it bubble up
        if (err?.digest?.includes('NEXT_REDIRECT')) throw err
        console.error('Login error:', err)
        return { error: err.message || 'An unexpected error occurred during login.' }
    }

    if (isSuccess) {
        redirect('/dashboard')
    }
}

export async function signup(formData: FormData) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const inviteCode = (formData.get('inviteCode') as string)?.trim() || ''

        // 1. Strict domain check
        if (!email.toLowerCase().endsWith(AIMT_DOMAIN)) {
            return { error: 'Only @aimt.ac.in email addresses are allowed.' }
        }

        // 2. Detect role from email pattern
        let role: string | null = detectRoleFromEmail(email)

        // 3. If invite code provided, validate and override role
        if (inviteCode) {
            const { data: codeData, error: codeError } = await supabase
                .from('invite_codes')
                .select('id, role, used')
                .eq('code', inviteCode.toUpperCase())
                .single()

            if (codeError || !codeData) {
                return { error: 'Invalid invite code.' }
            }

            if (codeData.used) {
                return { error: 'This invite code has already been used.' }
            }

            // Override role with invite code role
            role = codeData.role
        }

        // 4. If still no role detected, reject
        if (!role) {
            return { error: 'Unable to verify your email format. Please use your official AIMT email.' }
        }

        // 5. Create the user
        const { data: authData, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        })

        if (signupError) {
            return { error: signupError.message }
        }

        // 6. If invite code was used, mark it as consumed
        if (inviteCode && authData.user) {
            const { error: updateError } = await supabase
                .from('invite_codes')
                .update({ used: true, used_by: authData.user.id })
                .eq('code', inviteCode.toUpperCase())

            if (updateError) {
                console.error('Invite code update error:', updateError)
            }
        }

        return { success: 'Account created! Please check your email to verify.' }
    } catch (err: any) {
        console.error('Signup error:', err)
        return { error: err.message || 'An unexpected error occurred during registration.' }
    }
}
