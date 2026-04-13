'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, User, Phone, Building, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react'

interface Contacto {
    id: string
    nombre: string
    email: string
    telefono: string
    empresa: string
    mensaje: string
    leido: boolean
    created_at: string
}

export default function ContactosExternosPage() {
    const [contactos, setContactos] = useState<Contacto[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null)
    const supabase = createClient()

    useEffect(() => {
        verificarAdmin()
        cargarContactos()
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

    async function cargarContactos() {
        const { data, error } = await supabase
            .from('contactos_externos')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setContactos(data)
        }
        setLoading(false)
    }

    async function marcarLeido(id: string, leido: boolean) {
        const { error } = await supabase
            .from('contactos_externos')
            .update({ leido: !leido })
            .eq('id', id)

        if (!error) {
            cargarContactos()
        }
    }

    async function eliminarContacto(id: string) {
        if (confirm('¿Eliminar este mensaje?')) {
            const { error } = await supabase
                .from('contactos_externos')
                .delete()
                .eq('id', id)

            if (!error) {
                cargarContactos()
                setSelectedContacto(null)
            }
        }
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Mail className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
                    <h1 className="text-2xl font-bold text-gray-900">Contactos Externos</h1>
                    <p className="text-gray-600 mt-1">Mensajes recibidos del formulario de contacto</p>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <span className="text-blue-600 font-semibold">
                        {contactos.filter(c => !c.leido).length} no leídos
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de contactos */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
                        <h2 className="text-white font-semibold">Mensajes recibidos</h2>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {contactos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No hay mensajes</p>
                            </div>
                        ) : (
                            contactos.map((contacto) => (
                                <button
                                    key={contacto.id}
                                    onClick={() => setSelectedContacto(contacto)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-all ${selectedContacto?.id === contacto.id ? 'bg-blue-50' : ''
                                        } ${!contacto.leido ? 'border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{contacto.nombre}</p>
                                            <p className="text-sm text-gray-500 truncate">{contacto.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(contacto.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!contacto.leido && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detalle del mensaje */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                    {selectedContacto ? (
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Detalle del mensaje</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => marcarLeido(selectedContacto.id, selectedContacto.leido)}
                                        className={`p-2 rounded-lg transition ${selectedContacto.leido
                                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                            }`}
                                    >
                                        {selectedContacto.leido ? <Eye className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => eliminarContacto(selectedContacto.id)}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">Nombre:</span>
                                    <span>{selectedContacto.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="font-medium">Email:</span>
                                    <a href={`mailto:${selectedContacto.email}`} className="text-blue-600 hover:underline">
                                        {selectedContacto.email}
                                    </a>
                                </div>
                                {selectedContacto.telefono && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-medium">Teléfono:</span>
                                        <span>{selectedContacto.telefono}</span>
                                    </div>
                                )}
                                {selectedContacto.empresa && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Building className="w-4 h-4" />
                                        <span className="font-medium">Empresa:</span>
                                        <span>{selectedContacto.empresa}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="font-medium text-gray-700 mb-2">Mensaje:</p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedContacto.mensaje}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 pt-2">
                                    Recibido: {new Date(selectedContacto.created_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => window.location.href = `mailto:${selectedContacto.email}`}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition"
                                >
                                    Responder por correo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center">
                                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Selecciona un mensaje para ver su contenido</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
