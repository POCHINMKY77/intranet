'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Megaphone,
    FileText,
    ClipboardList,
    User,
    LogOut,
    Sparkles,
    Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(profile)
                setIsAdmin(profile?.rol === 'admin')
            }
        }
        getUser()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const menuItems = [
        { href: '/', label: 'Inicio', icon: LayoutDashboard, color: 'text-blue-500' },
        { href: '/directorio', label: 'Directorio', icon: Users, color: 'text-green-500' },
        { href: '/anuncios', label: 'Anuncios', icon: Megaphone, color: 'text-purple-500' },
        { href: '/documentos', label: 'Documentos', icon: FileText, color: 'text-orange-500' },
        { href: '/formularios', label: 'Solicitudes', icon: ClipboardList, color: 'text-pink-500' },
        { href: '/perfil', label: 'Mi Perfil', icon: User, color: 'text-cyan-500' },
    ]

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || 'U'

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario'

    return (
        <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl h-screen sticky top-0">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Intranet
                        </h1>
                        <p className="text-xs text-gray-400">Portal corporativo</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? 'bg-white/10 text-white shadow-lg border-l-4 border-blue-500'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400 group-hover:text-white'} transition-colors`} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            )}
                        </Link>
                    )
                })}

                {isAdmin && (
                    <>
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">
                                Administración
                            </p>
                            <Link
                                href="/admin/usuarios"
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                    ${pathname === '/admin/usuarios'
                                        ? 'bg-white/10 text-white shadow-lg border-l-4 border-purple-500'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                <Shield className="w-5 h-5 text-purple-400" />
                                <span>Administrar Usuarios</span>
                            </Link>
                        </div>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">
                            {displayName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 opacity-70 hover:opacity-100"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
