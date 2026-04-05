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
    User
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
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        empleados: 0,
        documentos: 0,
        anuncios: 0,
        solicitudes: 0
    })
    const [actividades, setActividades] = useState<Actividad[]>([])
    const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)

            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const [empleadosRes, documentosRes, anunciosRes, solicitudesRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('documentos').select('*', { count: 'exact', head: true }),
                supabase.from('anuncios').select('*', { count: 'exact', head: true }),
                supabase.from('solicitudes').select('*', { count: 'exact', head: true })
            ])

            setStats({
                empleados: empleadosRes.count || 0,
                documentos: documentosRes.count || 0,
                anuncios: anunciosRes.count || 0,
                solicitudes: solicitudesRes.count || 0
            })

            const { data: actividadesData, error } = await supabase
                .from('actividades')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

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

        if (entidad === 'perfil') {
            return `${usuario_nombre} actualizó su perfil`
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
            return `Descripción: ${detalles?.descripcion || 'Sin descripción'}`
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
        { label: 'Empleados', value: stats.empleados, icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Documentos', value: stats.documentos, icon: FileText, color: 'from-green-500 to-green-600' },
        { label: 'Anuncios', value: stats.anuncios, icon: Megaphone, color: 'from-purple-500 to-purple-600' },
        { label: 'Solicitudes', value: stats.solicitudes, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            ¡Bienvenido, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
                        </h1>
                        <p className="text-blue-100 text-lg">Portal corporativo de empleados</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Actividad reciente</h2>
                        </div>
                        <button
                            onClick={loadData}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                            Actualizar <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {actividades.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                                    <div className="text-gray-400">
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

            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">¿Necesitas ayuda?</h3>
                        <p className="text-indigo-100">Contacta al equipo de soporte</p>
                    </div>
                    <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                        Soporte
                    </button>
                </div>
            </div>

            {/* Modal de detalle de actividad */}
            {actividadSeleccionada && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActividadSeleccionada(null)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {actividadSeleccionada.entidad === 'anuncio' ? 'Contenido del anuncio' : 'Detalle de actividad'}
                            </h3>
                            <button
                                onClick={() => setActividadSeleccionada(null)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Publicado por</p>
                                <p className="font-medium text-gray-900">{actividadSeleccionada.usuario_nombre}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Fecha</p>
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
                            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
