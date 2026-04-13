'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, User, Phone, Building, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContactoExternoPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        mensaje: ''
    })
    const [enviando, setEnviando] = useState(false)
    const [exito, setExito] = useState(false)
    const [error, setError] = useState('')
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setEnviando(true)
        setError('')

        try {
            const { error } = await supabase
                .from('contactos_externos')
                .insert([formData])

            if (error) throw error

            setExito(true)
            setFormData({
                nombre: '',
                email: '',
                telefono: '',
                empresa: '',
                mensaje: ''
            })
            setTimeout(() => setExito(false), 5000)
        } catch (err) {
            setError('Error al enviar el mensaje. Intenta nuevamente.')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Contáctanos</h1>
                        <p className="text-blue-200">¿Tienes alguna consulta? Escríbenos</p>
                    </div>

                    {exito && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-200 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            ¡Mensaje enviado! Te contactaremos pronto.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Nombre completo *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Correo electrónico *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    Empresa
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                    <input
                                        type="text"
                                        value={formData.empresa}
                                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Mensaje *
                            </label>
                            <textarea
                                value={formData.mensaje}
                                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                rows={5}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu mensaje aquí..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-3 font-medium hover:shadow-lg hover:scale-[1.02] transform transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {enviando ? 'Enviando...' : 'Enviar mensaje'}
                            <Send className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-blue-200 hover:text-white transition-colors text-sm">
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
