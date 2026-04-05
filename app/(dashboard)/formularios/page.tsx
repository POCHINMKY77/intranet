'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, Calendar, X } from 'lucide-react'

interface Solicitud {
    id: string
    tipo: string
    descripcion: string
    estado: string
    empleado_id: string
    created_at: string
    empleado?: {
        full_name: string
    }
}

export default function FormulariosPage() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [formData, setFormData] = useState({ tipo: '', descripcion: '' })
    const supabase = createClient()

    const tiposSolicitud = [
        { id: 'vacaciones', nombre: 'Solicitud de vacaciones' },
        { id: 'permiso', nombre: 'Permiso personal' },
        { id: 'equipo', nombre: 'Solicitud de equipo' },
        { id: 'capacitacion', nombre: 'Capacitación' }
    ]

    useEffect(() => {
        checkUser()
        loadSolicitudes()
    }, [])

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single()
            setIsAdmin(profile?.rol === 'admin')
        }
    }

    async function loadSolicitudes() {
        try {
            let query = supabase
                .from('solicitudes')
                .select(`
          *,
          empleado:profiles(full_name)
        `)
                .order('created_at', { ascending: false })

            if (!isAdmin && user) {
                query = query.eq('empleado_id', user.id)
            }

            const { data, error } = await query

            if (error) throw error
            setSolicitudes(data || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.tipo || !formData.descripcion.trim()) {
            alert('Completa todos los campos')
            return
        }

        try {
            const { error } = await supabase
                .from('solicitudes')
                .insert([{
                    tipo: formData.tipo,
                    descripcion: formData.descripcion,
                    empleado_id: user?.id,
                    estado: 'pendiente'
                }])

            if (error) throw error

            await loadSolicitudes()
            closeModal()
        } catch (error) {
            console.error('Error:', error)
            alert('Error al crear la solicitud')
        }
    }

    async function updateEstado(id: string, estado: string) {
        if (!isAdmin) {
            alert('No tienes permisos para aprobar/rechazar solicitudes')
            return
        }

        try {
            const { error } = await supabase
                .from('solicitudes')
                .update({ estado })
                .eq('id', id)

            if (error) throw error
            await loadSolicitudes()
        } catch (error) {
            console.error('Error:', error)
            alert('Error al actualizar')
        }
    }

    function getEstadoIcon(estado: string) {
        switch (estado) {
            case 'aprobado': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'rechazado': return <XCircle className="w-5 h-5 text-red-500" />
            default: return <Clock className="w-5 h-5 text-yellow-500" />
        }
    }

    function getEstadoColor(estado: string) {
        switch (estado) {
            case 'aprobado': return 'bg-green-100 text-green-800'
            case 'rechazado': return 'bg-red-100 text-red-800'
            default: return 'bg-yellow-100 text-yellow-800'
        }
    }

    function getTipoNombre(tipo: string) {
        return tiposSolicitud.find(t => t.id === tipo)?.nombre || tipo
    }

    function closeModal() {
        setShowModal(false)
        setFormData({ tipo: '', descripcion: '' })
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
                    <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
                    <p className="text-gray-600">Gestiona tus solicitudes administrativas</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Nueva solicitud
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {solicitudes.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay solicitudes</p>
                        </div>
                    ) : (
                        solicitudes.map((solicitud) => (
                            <div key={solicitud.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getEstadoIcon(solicitud.estado)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                                                {solicitud.estado.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {getTipoNombre(solicitud.tipo)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{solicitud.descripcion}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            {isAdmin && solicitud.empleado && (
                                                <div className="flex items-center gap-1">
                                                    <span>Solicitado por: {solicitud.empleado.full_name}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(solicitud.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && solicitud.estado === 'pendiente' && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => updateEstado(solicitud.id, 'aprobado')}
                                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => updateEstado(solicitud.id, 'rechazado')}
                                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Nueva solicitud</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                className="w-full border rounded-lg p-2"
                                required
                            >
                                <option value="">Selecciona un tipo</option>
                                {tiposSolicitud.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                ))}
                            </select>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Describe los detalles de tu solicitud..."
                                rows={5}
                                className="w-full border rounded-lg p-2"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    Enviar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
