'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, User, FileText, Megaphone, ClipboardList, MessageSquare, Mail, Calendar, Search, Filter } from 'lucide-react'

interface Actividad {
    id: string
    usuario_nombre: string
    accion: string
    entidad: string
    detalles: any
    created_at: string
}

export default function BitacoraPage() {
    const [actividades, setActividades] = useState<Actividad[]>([])
    const [loading, setLoading] = useState(true)
    const [filtro, setFiltro] = useState('todos')
    const [busqueda, setBusqueda] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        verificarAdmin()
        cargarActividades()
    }, [])

    async function verificarAdmin() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single()
            setIsAdmin(profile?.rol === 'admin')
        }
    }

    async function cargarActividades() {
        try {
            let query = supabase
                .from('actividades')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (filtro !== 'todos') {
                query = query.eq('entidad', filtro)
            }

            const { data, error } = await query

            if (error) throw error

            let resultados = data || []

            if (busqueda) {
                resultados = resultados.filter(a =>
                    a.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                    a.accion?.toLowerCase().includes(busqueda.toLowerCase()) ||
                    a.entidad?.toLowerCase().includes(busqueda.toLowerCase())
                )
            }

            setActividades(resultados)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarActividades()
    }, [filtro])

    function getEntidadIcon(entidad: string) {
        switch (entidad) {
            case 'anuncio': return <Megaphone className="w-4 h-4 text-purple-500" />
            case 'documento': return <FileText className="w-4 h-4 text-green-500" />
            case 'solicitud': return <ClipboardList className="w-4 h-4 text-orange-500" />
            case 'mensaje': return <MessageSquare className="w-4 h-4 text-indigo-500" />
            case 'sistema': return <Activity className="w-4 h-4 text-gray-500" />
            default: return <User className="w-4 h-4 text-blue-500" />
        }
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
                    <p className="text-gray-600 mt-2">No tienes permisos para ver esta página</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bitácora del Sistema</h1>
                    <p className="text-gray-600 mt-1">Registro completo de todas las actividades</p>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <span className="text-blue-600 font-semibold">{actividades.length} actividades</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario, acción o entidad..."
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value)
                                cargarActividades()
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos los eventos</option>
                        <option value="anuncio">Anuncios</option>
                        <option value="documento">Documentos</option>
                        <option value="solicitud">Solicitudes</option>
                        <option value="mensaje">Mensajes</option>
                        <option value="sistema">Sistema</option>
                    </select>
                </div>
            </div>

            {/* Lista de actividades */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {actividades.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay actividades registradas</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {actividades.map((actividad) => (
                            <div key={actividad.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        {getEntidadIcon(actividad.entidad)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">{actividad.usuario_nombre}</span>
                                            {' '}
                                            <span className="text-gray-600">{actividad.accion}</span>
                                            {' '}
                                            <span className="text-gray-500">{actividad.entidad}</span>
                                        </p>
                                        {actividad.detalles && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {Object.entries(actividad.detalles).map(([key, val]) => `${key}: ${val}`).join(' • ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(actividad.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
