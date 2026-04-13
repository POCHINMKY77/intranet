'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users,
    FileText,
    Megaphone,
    TrendingUp,
    Clock,
    Calendar,
    ArrowUpRight,
    User,
    Shield,
    BadgeCheck,
    MessageSquare,
    Phone,
    Mail,
    Activity,
    BarChart3
} from 'lucide-react'

interface Actividad {
    id: string
    usuario_nombre: string
    accion: string
    entidad: string
    detalles: any
    created_at: string
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        empleados: 0,
        documentos: 0,
        anuncios: 0,
        solicitudes: 0,
        mensajesNoLeidos: 0
    })
    const [actividades, setActividades] = useState<Actividad[]>([])
    const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)

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

            const [empleadosRes, documentosRes, anunciosRes, solicitudesRes, mensajesRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('documentos').select('*', { count: 'exact', head: true }),
                supabase.from('anuncios').select('*', { count: 'exact', head: true }),
                supabase.from('solicitudes').select('*', { count: 'exact', head: true }),
                supabase.from('mensajes').select('*', { count: 'exact', head: true }).eq('destinatario_id', user?.id).eq('leido', false)
            ])

            setStats({
                empleados: empleadosRes.count || 0,
                documentos: documentosRes.count || 0,
                anuncios: anunciosRes.count || 0,
                solicitudes: solicitudesRes.count || 0,
                mensajesNoLeidos: mensajesRes.count || 0
            })

            // Cargar actividades - FILTRANDO INICIOS DE SESIÓN PARA EMPLEADOS
            let query = supabase
                .from('actividades')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            // Si NO es admin, excluir actividades de "inició sesión"
            if (!isAdmin) {
                query = query.neq('accion', 'inició sesión')
            }

            const { data: actividadesData, error } = await query

            if (error) {
                console.error('Error cargando actividades:', error)
            } else if (actividadesData && actividadesData.length > 0) {
                setActividades(actividadesData)
            } else {
                await crearActividadesDePrueba()
                const { data: nuevasActividades } = await supabase
                    .from('actividades')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10)
                setActividades(nuevasActividades || [])
            }

        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    async function crearActividadesDePrueba() {
        try {
            const { data: anuncios } = await supabase
                .from('anuncios')
                .select('*, autor:profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5)

            for (const anuncio of anuncios || []) {
                await supabase
                    .from('actividades')
                    .insert({
                        usuario_nombre: anuncio.autor?.full_name || 'Administrador',
                        accion: 'creó',
                        entidad: 'anuncio',
                        detalles: { titulo: anuncio.titulo, contenido: anuncio.contenido },
                        created_at: anuncio.created_at
                    })
            }

            const { data: documentos } = await supabase
                .from('documentos')
                .select('*, subido_por_user:profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5)

            for (const doc of documentos || []) {
                await supabase
                    .from('actividades')
                    .insert({
                        usuario_nombre: doc.subido_por_user?.full_name || 'Usuario',
                        accion: 'subió',
                        entidad: 'documento',
                        detalles: { nombre: doc.nombre },
                        created_at: doc.created_at
                    })
            }

        } catch (error) {
            console.error('Error creando actividades:', error)
        }
    }

    function getActividadMensaje(actividad: Actividad): string {
        const { usuario_nombre, accion, entidad, detalles } = actividad

        if (entidad === 'anuncio') {
            const titulo = detalles?.titulo ? `"${detalles.titulo}"` : ''
            return `${usuario_nombre} ${accion} el anuncio ${titulo}`
        }

        if (entidad === 'documento') {
            const nombre = detalles?.nombre ? `"${detalles.nombre}"` : ''
            return `${usuario_nombre} ${accion} el documento ${nombre}`
        }

        if (entidad === 'solicitud') {
            if (accion === 'creó') {
                return `${usuario_nombre} ${accion} una solicitud de ${detalles?.tipo || ''}`
            }
            if (accion === 'aprobó') {
                return `${usuario_nombre} ${accion} una solicitud de ${detalles?.solicitud_tipo || ''}`
            }
            if (accion === 'rechazó') {
                return `${usuario_nombre} ${accion} una solicitud`
            }
        }

        if (entidad === 'mensaje') {
            return `${usuario_nombre} ${accion} un mensaje`
        }

        if (entidad === 'perfil') {
            return `${usuario_nombre} actualizó su perfil`
        }

        if (entidad === 'sistema') {
            return `${usuario_nombre} ${accion}`
        }

        return `${usuario_nombre} ${accion} ${entidad}`
    }

    function getActividadDetalle(actividad: Actividad): string {
        const { entidad, detalles } = actividad

        if (entidad === 'anuncio') {
            return detalles?.contenido || detalles?.titulo || 'Sin contenido'
        }

        if (entidad === 'documento') {
            return `Documento: ${detalles?.nombre || 'Sin nombre'}`
        }

        if (entidad === 'solicitud') {
            if (detalles?.tipo) {
                return `Tipo: ${detalles.tipo}\nDescripción: ${detalles.descripcion || 'Sin descripción'}`
            }
            return `Estado: ${detalles?.estado_anterior} → ${detalles?.estado_nuevo}`
        }

        if (entidad === 'mensaje') {
            return `Mensaje enviado a: ${detalles?.destinatario || 'Usuario'}`
        }

        if (entidad === 'perfil') {
            return `Campos actualizados: ${detalles?.campos_actualizados || 'Información personal'}`
        }

        return 'Sin detalles adicionales'
    }

    function getTiempoRelativo(fecha: string): string {
        const ahora = new Date()
        const fechaDate = new Date(fecha)
        const diffMs = ahora.getTime() - fechaDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Hace unos segundos'
        if (diffMins < 60) return `Hace ${diffMins} minutos`
        if (diffHours < 24) return `Hace ${diffHours} horas`
        if (diffDays === 1) return 'Ayer'
        return `Hace ${diffDays} días`
    }

    const statsCards = [
        { label: 'Empleados', value: stats.empleados, icon: Users, color: 'from-blue-500 to-blue-600', ariaLabel: 'Total de empleados' },
        { label: 'Documentos', value: stats.documentos, icon: FileText, color: 'from-green-500 to-green-600', ariaLabel: 'Documentos disponibles' },
        { label: 'Anuncios', value: stats.anuncios, icon: Megaphone, color: 'from-purple-500 to-purple-600', ariaLabel: 'Anuncios publicados' },
        { label: 'Solicitudes', value: stats.solicitudes, icon: TrendingUp, color: 'from-orange-500 to-orange-600', ariaLabel: 'Solicitudes realizadas' },
    ]

    const adminStats = [
        { label: 'Mensajes no leídos', value: stats.mensajesNoLeidos, icon: MessageSquare, color: 'from-indigo-500 to-indigo-600', ariaLabel: 'Mensajes sin leer' }
    ]

    const displayName = profile?.apodo || profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'
    const userRole = profile?.rol === 'admin' ? 'Administrador' : 'Empleado'
    const roleColor = profile?.rol === 'admin' ? 'bg-purple-500' : 'bg-blue-500'

    if (loading) {
        return (
            <main role="main" aria-label="Cargando dashboard" className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Cargando"></div>
            </main>
        )
    }

    return (
        <main role="main" aria-label="Dashboard principal de LogiTrack" className="space-y-8">
            {/* Header con bienvenida y rol */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold">
                                ¡Bienvenido, {displayName}!
                            </h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${roleColor} bg-white/20`} aria-label={`Rol: ${userRole}`}>
                                {profile?.rol === 'admin' ? <Shield className="w-3 h-3" /> : <BadgeCheck className="w-3 h-3" />}
                                {userRole}
                            </span>
                        </div>
                        <p className="text-blue-100 text-lg">Portal corporativo de LogiTrack</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2" aria-label="Fecha actual">
                        <p className="text-sm">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            aria-label={stat.ariaLabel}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Stats adicionales para admin */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {adminStats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                aria-label={stat.ariaLabel}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-gray-500 text-sm">{stat.label}</p>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Actividad reciente */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-600" aria-hidden="true" />
                            <h2 className="text-xl font-semibold text-gray-900">Actividad reciente</h2>
                        </div>
                        <button
                            onClick={loadData}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            aria-label="Actualizar actividades"
                        >
                            Actualizar <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {actividades.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-gray-500">No hay actividades recientes</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Crea anuncios, sube documentos o haz solicitudes para ver actividad
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {actividades.map((actividad) => (
                            <div
                                key={actividad.id}
                                className="p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                onClick={() => setActividadSeleccionada(actividad)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setActividadSeleccionada(actividad)
                                    }
                                }}
                                aria-label={`Ver detalles de actividad: ${getActividadMensaje(actividad)}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {getActividadMensaje(actividad)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {getTiempoRelativo(actividad.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-gray-400" aria-hidden="true">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Banner de información con accesibilidad */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl" role="complementary" aria-label="Ayuda y soporte">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">¿Necesitas ayuda?</h3>
                        <p className="text-indigo-100">Contacta al equipo de soporte</p>
                    </div>
                    <button
                        className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Abrir soporte"
                    >
                        Soporte
                    </button>
                </div>
            </div>

            {/* Modal de detalle de actividad con accesibilidad */}
            {actividadSeleccionada && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setActividadSeleccionada(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Detalle de actividad"
                >
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {actividadSeleccionada.entidad === 'anuncio' ? 'Contenido del anuncio' : 'Detalle de actividad'}
                            </h3>
                            <button
                                onClick={() => setActividadSeleccionada(null)}
                                className="text-gray-400 hover:text-gray-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                                aria-label="Cerrar"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Usuario</p>
                                <p className="font-medium text-gray-900">{actividadSeleccionada.usuario_nombre}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Acción</p>
                                <p className="font-medium text-gray-900">
                                    {actividadSeleccionada.accion} {actividadSeleccionada.entidad}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Fecha y hora</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(actividadSeleccionada.created_at).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    {actividadSeleccionada.entidad === 'anuncio' ? 'Contenido' : 'Detalles'}
                                </p>
                                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {getActividadDetalle(actividadSeleccionada)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setActividadSeleccionada(null)}
                            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Cerrar detalle"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
