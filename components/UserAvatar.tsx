// components/UserAvatar.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, Mail } from 'lucide-react'

export default function UserAvatar() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    if (!user) return null

    const initials = user.user_metadata?.full_name
        ? user.user_metadata.full_name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : user.email?.[0].toUpperCase()

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-300 truncate">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{user.email}</span>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 group-hover:opacity-100 opacity-70"
                title="Cerrar sesión"
            >
                <LogOut className="w-4 h-4 text-red-400" />
            </button>
        </div>
    )
}
