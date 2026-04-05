'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, User, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Usuario {
    id: string
    email: string
    full_name: string
    rol: string
    created_at: string
}

export default function AdminUsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [cambiando, setCambiando] = useState<string | null>(null)
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
    const supabase = createClient()

    useEffect(() => {
        verificarAdmin()
        cargarUsuarios()
    }, [])

    async function verificarAdmin() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setCurrentUserEmail(user.email || '')
            const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single()
            setIsAdmin(profile?.rol === 'admin')
        }
    }

    async function cargarUsuarios() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsuarios(data || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function cambiarRol(usuarioId: string, email: string, rolActual: string) {
        const nuevoRol = rolActual === 'admin' ? 'empleado' : 'admin'
        const accion = rolActual === 'admin' ? 'quitar permisos de administrador' : 'dar permisos de administrador'

        if (!confirm(`¿Estás seguro de ${accion} a ${email}?`)) return

        setCambiando(usuarioId)
        setMensaje(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ rol: nuevoRol })
                .eq('id', usuarioId)

            if (error) throw error

            setMensaje({
                tipo: 'success',
                texto: `${email} ahora es ${nuevoRol === 'admin' ? 'Administrador' : 'Empleado'}`
            })
            cargarUsuarios()
        } catch (error: any) {
            setMensaje({ tipo: 'error', texto: error.message || 'Error al cambiar rol' })
        } finally {
            setCambiando(null)
        }
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
                    <h1 className="text-2xl font-bold text-gray-900">Administrar Usuarios</h1>
                    <p className="text-gray-600 mt-1">Gestiona los roles de los empleados</p>
                </div>
                <button
                    onClick={cargarUsuarios}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                </button>
            </div>

            {mensaje && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${mensaje.tipo === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {mensaje.tipo === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    {mensaje.texto}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${usuario.rol === 'admin'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                            }`}>
                                            {usuario.rol === 'admin' ? (
                                                <Shield className="w-5 h-5 text-white" />
                                            ) : (
                                                <User className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {usuario.full_name || 'Sin nombre'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{usuario.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.rol === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {usuario.rol === 'admin' ? 'Administrador' : 'Empleado'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => cambiarRol(usuario.id, usuario.email, usuario.rol)}
                                        disabled={cambiando === usuario.id || usuario.email === currentUserEmail}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${usuario.rol === 'admin'
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {cambiando === usuario.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mx-auto"></div>
                                        ) : (
                                            usuario.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'
                                        )}
                                    </button>
                                    {usuario.email === currentUserEmail && (
                                        <p className="text-xs text-gray-400 mt-1">Eres tú</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-yellow-800">Nota de seguridad</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            Solo los administradores pueden cambiar roles. No puedes cambiar tu propio rol para evitar accidentes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
