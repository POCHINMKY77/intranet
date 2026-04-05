'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function check() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            const { data } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
            setIsAdmin(data?.rol === 'admin')
            setLoading(false)
        }
        check()
    }, [])

    if (loading) return null
    if (!isAdmin) return (
        <div className="text-center py-12 text-gray-400">
            <p>No tienes permiso para ver esta sección.</p>
        </div>
    )
    return <>{children}</>
}