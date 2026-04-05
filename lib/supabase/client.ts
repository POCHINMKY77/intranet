// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Profile, Anuncio, Documento, Solicitud } from '@/lib/types'

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

// Funciones helper para perfiles
export async function getProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data as Profile
}

export async function getAllProfiles() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

    if (error) throw error
    return data as Profile[]
}
