'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, User, CheckCheck, Users, Search, Loader2 } from 'lucide-react'

interface Mensaje {
    id: string
    remitente_id: string
    destinatario_id: string
    contenido: string
    leido: boolean
    created_at: string
}

interface Usuario {
    id: string
    full_name: string
    apodo: string
    rol: string
    email: string
}

export default function MensajesPage() {
    const [mensajes, setMensajes] = useState<Mensaje[]>([])
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
    const [nuevoMensaje, setNuevoMensaje] = useState('')
    const [loading, setLoading] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [userId, setUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [mensajes])

    // Cargar usuario actual
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
        }
        getUser()
    }, [])

    // Cargar lista de usuarios (excluyéndose a sí mismo)
    useEffect(() => {
        if (!userId) return

        const loadUsuarios = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, apodo, rol, email')
                .neq('id', userId)
                .order('full_name')

            if (data) setUsuarios(data)
            setLoading(false)
        }

        loadUsuarios()
    }, [userId])

    // Cargar mensajes SOLO de la conversación entre usuario actual y seleccionado
    useEffect(() => {
        if (!selectedUser || !userId) {
            setMensajes([])
            return
        }

        const loadMensajes = async () => {
            // 🔑 FILTRO CLAVE: Solo mensajes entre estos DOS usuarios
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .or(`and(remitente_id.eq.${userId},destinatario_id.eq.${selectedUser.id}),and(remitente_id.eq.${selectedUser.id},destinatario_id.eq.${userId})`)
                .order('created_at', { ascending: true })

            console.log('Mensajes entre', userId, 'y', selectedUser.id, ':', data?.length || 0)

            if (data) {
                setMensajes(data)
                // Marcar como leídos los mensajes recibidos del usuario seleccionado
                await supabase
                    .from('mensajes')
                    .update({ leido: true })
                    .eq('destinatario_id', userId)
                    .eq('remitente_id', selectedUser.id)
                    .eq('leido', false)
            }
        }

        loadMensajes()
    }, [selectedUser, userId])

    // Suscripción en tiempo real (solo para la conversación actual)
    useEffect(() => {
        if (!selectedUser || !userId) return

        const channel = supabase
            .channel(`chat_${userId}_${selectedUser.id}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes',
                    filter: `remitente_id=in.(${userId},${selectedUser.id})`
                },
                (payload) => {
                    const nuevo = payload.new as Mensaje
                    // Verificar que el mensaje pertenece a esta conversación
                    if ((nuevo.remitente_id === userId && nuevo.destinatario_id === selectedUser.id) ||
                        (nuevo.remitente_id === selectedUser.id && nuevo.destinatario_id === userId)) {
                        setMensajes(prev => [...prev, nuevo])
                        // Marcar como leído si es recibido
                        if (nuevo.destinatario_id === userId && !nuevo.leido) {
                            supabase.from('mensajes').update({ leido: true }).eq('id', nuevo.id).then()
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedUser, userId])

    const enviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nuevoMensaje.trim() || !selectedUser || !userId) return

        setEnviando(true)
        const { error } = await supabase.from('mensajes').insert({
            remitente_id: userId,
            destinatario_id: selectedUser.id,
            contenido: nuevoMensaje.trim(),
            leido: false
        })

        if (!error) {
            setNuevoMensaje('')
        }
        setEnviando(false)
    }

    const getNombre = (usuario: Usuario) => {
        return usuario?.apodo || usuario?.full_name?.split(' ')[0] || usuario?.email?.split('@')[0] || 'Usuario'
    }

    // Contar mensajes no leídos de cada usuario
    const getNoLeidosPorUsuario = (usuarioId: string) => {
        if (!userId) return 0
        return mensajes.filter(m =>
            m.remitente_id === usuarioId &&
            m.destinatario_id === userId &&
            !m.leido
        ).length
    }

    const usuariosFiltrados = usuarios.filter(u =>
        getNombre(u).toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6">
            {/* Lista de usuarios */}
            <div className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-white" />
                        <h2 className="text-white font-semibold">Conversaciones</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white/20 text-white placeholder:text-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {usuariosFiltrados.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No hay otros usuarios</p>
                        </div>
                    ) : (
                        usuariosFiltrados.map((usuario) => {
                            const noLeidos = getNoLeidosPorUsuario(usuario.id)
                            return (
                                <button
                                    key={usuario.id}
                                    onClick={() => setSelectedUser(usuario)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-all text-left ${selectedUser?.id === usuario.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {getNombre(usuario).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 truncate">
                                                {getNombre(usuario)}
                                            </p>
                                            {noLeidos > 0 && (
                                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                                    {noLeidos}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {usuario.rol === 'admin' ? 'Administrador' : 'Empleado'}
                                        </p>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Área de chat */}
            {selectedUser ? (
                <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {getNombre(selectedUser).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {getNombre(selectedUser)}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedUser.rol === 'admin' ? 'Administrador' : 'Empleado'} • {selectedUser.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {mensajes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No hay mensajes aún</p>
                                <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
                            </div>
                        ) : (
                            <>
                                {mensajes.map((msg) => {
                                    const esMio = msg.remitente_id === userId
                                    return (
                                        <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl ${esMio
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                                }`}>
                                                <p className="text-sm break-words">{msg.contenido}</p>
                                                <div className={`flex items-center gap-1 mt-1 text-xs ${esMio ? 'text-blue-200' : 'text-gray-400'
                                                    }`}>
                                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {esMio && msg.leido && <CheckCheck className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={enviarMensaje} className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder={`Escribe un mensaje para ${getNombre(selectedUser)}...`}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={enviando || !nuevoMensaje.trim()}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition disabled:opacity-50"
                            >
                                {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                    <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">Selecciona una conversación</h3>
                        <p className="text-gray-500 mt-1">Elige un usuario para empezar a chatear</p>
                    </div>
                </div>
            )}
        </div>
    )
}
