'use client'
import { useEffect, useState } from 'react'
import { Video, Phone, PhoneOff, Users, Copy, Check, Loader2 } from 'lucide-react'

export default function VideollamadaPage() {
    const [roomName, setRoomName] = useState('')
    const [salaActual, setSalaActual] = useState('')
    const [copiado, setCopiado] = useState(false)
    const [userName, setUserName] = useState('Usuario')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch('/api/user')
                // Simulación - puedes obtener el usuario de donde corresponda
                setUserName('Usuario')
                const sala = `logitrack-${Math.random().toString(36).substring(2, 8)}`
                setRoomName(sala)
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [])

    const iniciarLlamada = () => {
        if (roomName.trim()) {
            setSalaActual(roomName)
        }
    }

    const copiarEnlace = () => {
        const enlace = `https://meet.jit.si/${roomName}`
        navigator.clipboard.writeText(enlace)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
    }

    const salirLlamada = () => {
        setSalaActual('')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (salaActual) {
        return (
            <div className="h-[calc(100vh-100px)] flex flex-col">
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Sala: {salaActual}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copiarEnlace}
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                        >
                            {copiado ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            {copiado ? '¡Copiado!' : 'Copiar enlace'}
                        </button>
                        <button
                            onClick={salirLlamada}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            <PhoneOff className="w-4 h-4" />
                            Salir
                        </button>
                    </div>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden shadow-lg bg-gray-900">
                    <iframe
                        src={`https://meet.jit.si/${salaActual}#config.startWithAudioMuted=true&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(userName)}`}
                        allow="camera; microphone; fullscreen; display-capture"
                        className="w-full h-full border-0"
                        title="Video Llamada"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Video className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Video Llamada</h1>
                    <p className="text-gray-600 mt-1">Conéctate con tus compañeros en tiempo real</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-blue-800 mb-2">Tu nombre aparecerá como:</p>
                        <p className="font-semibold text-blue-900">{userName}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la sala
                        </label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Nombre de la sala (opcional)"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Puedes compartir este nombre con otros usuarios para que se unan a la misma sala
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={copiarEnlace}
                            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                        >
                            {copiado ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copiado ? '¡Copiado!' : 'Copiar enlace'}
                        </button>
                        <button
                            onClick={iniciarLlamada}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                        >
                            <Phone className="w-4 h-4" />
                            Iniciar llamada
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                            <Users className="w-4 h-4" />
                            <span>Powered by Jitsi Meet - Video llamadas gratuitas y seguras</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
