'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Megaphone, Plus, Edit, Trash2, Calendar, User, X } from 'lucide-react'

interface Anuncio {
    id: string
    titulo: string
    contenido: string
    autor_id: string
    created_at: string
    autor?: {
        full_name: string
    }
}

export default function AnunciosPage() {
    const [anuncios, setAnuncios] = useState<Anuncio[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAnuncio, setEditingAnuncio] = useState<Anuncio | null>(null)
    const [formData, setFormData] = useState({ titulo: '', contenido: '' })
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        checkUser()
        loadAnuncios()
    }, [])

    async function checkUser() {
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

    async function loadAnuncios() {
        try {
            const { data, error } = await supabase
                .from('anuncios')
                .select(`
          *,
          autor:profiles(full_name)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setAnuncios(data || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.titulo.trim() || !formData.contenido.trim()) {
            alert('Completa todos los campos')
            return
        }

        try {
            if (editingAnuncio) {
                const { error } = await supabase
                    .from('anuncios')
                    .update({
                        titulo: formData.titulo,
                        contenido: formData.contenido
                    })
                    .eq('id', editingAnuncio.id)

                if (error) throw error
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                const { error } = await supabase
                    .from('anuncios')
                    .insert([{
                        titulo: formData.titulo,
                        contenido: formData.contenido,
                        autor_id: user?.id
                    }])

                if (error) throw error
            }

            await loadAnuncios()
            closeModal()
        } catch (error) {
            console.error('Error:', error)
            alert('Error al guardar')
        }
    }

    async function deleteAnuncio(id: string) {
        if (!confirm('¿Eliminar este anuncio?')) return

        try {
            const { error } = await supabase
                .from('anuncios')
                .delete()
                .eq('id', id)

            if (error) throw error
            await loadAnuncios()
        } catch (error) {
            console.error('Error:', error)
            alert('Error al eliminar')
        }
    }

    function openModal(anuncio: Anuncio | null = null) {
        if (anuncio) {
            setEditingAnuncio(anuncio)
            setFormData({ titulo: anuncio.titulo, contenido: anuncio.contenido })
        } else {
            setEditingAnuncio(null)
            setFormData({ titulo: '', contenido: '' })
        }
        setShowModal(true)
    }

    function closeModal() {
        setShowModal(false)
        setEditingAnuncio(null)
        setFormData({ titulo: '', contenido: '' })
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
                    <h1 className="text-2xl font-bold text-gray-900">Anuncios</h1>
                    <p className="text-gray-600">Comunicados importantes de la empresa</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo anuncio
                    </button>
                )}
            </div>

            {anuncios.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay anuncios</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {anuncios.map((anuncio) => (
                        <div key={anuncio.id} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Megaphone className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{anuncio.titulo}</h3>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{anuncio.contenido}</p>
                                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <User className="w-4 h-4" />
                                            <span>{anuncio.autor?.full_name || 'Administrador'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(anuncio.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => openModal(anuncio)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteAnuncio(anuncio.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingAnuncio ? 'Editar' : 'Nuevo'} anuncio
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Título"
                                className="w-full border rounded-lg p-2"
                                required
                            />
                            <textarea
                                value={formData.contenido}
                                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                placeholder="Contenido"
                                rows={5}
                                className="w-full border rounded-lg p-2"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
