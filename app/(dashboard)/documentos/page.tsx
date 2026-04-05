'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, Trash2, Upload, X, AlertCircle } from 'lucide-react'

interface Documento {
    id: string
    nombre: string
    descripcion: string
    url: string
    categoria: string
    created_at: string
}

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const supabase = createClient()

    useEffect(() => {
        checkUser()
        loadDocumentos()
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

    async function loadDocumentos() {
        try {
            const { data, error } = await supabase
                .from('documentos')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDocumentos(data || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleFileUpload(file: File) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = fileName

        console.log('Subiendo archivo a bucket documentos:', filePath)

        const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Error de subida:', uploadError)
            throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
            .from('documentos')
            .getPublicUrl(filePath)

        return publicUrl
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!selectedFile) {
            setError('Por favor selecciona un archivo')
            return
        }

        setUploading(true)
        try {
            const url = await handleFileUpload(selectedFile)

            const { error } = await supabase
                .from('documentos')
                .insert([{
                    nombre: formData.nombre || selectedFile.name,
                    descripcion: formData.descripcion,
                    url: url,
                    categoria: 'general',
                    subido_por: user?.id
                }])

            if (error) throw error

            await loadDocumentos()
            closeModal()
            alert('Documento subido correctamente')
        } catch (error: any) {
            console.error('Error:', error)
            setError(error.message || 'Error al subir el documento')
        } finally {
            setUploading(false)
        }
    }

    async function deleteDocumento(id: string, url: string) {
        if (!isAdmin) {
            alert('No tienes permisos para eliminar documentos')
            return
        }

        if (!confirm('¿Eliminar este documento?')) return

        try {
            // Extraer el path de la URL
            const path = url.split('/').pop()
            if (path) {
                await supabase.storage.from('documentos').remove([path])
            }

            const { error } = await supabase
                .from('documentos')
                .delete()
                .eq('id', id)

            if (error) throw error
            await loadDocumentos()
            alert('Documento eliminado correctamente')
        } catch (error) {
            console.error('Error:', error)
            alert('Error al eliminar')
        }
    }

    function closeModal() {
        setShowModal(false)
        setFormData({ nombre: '', descripcion: '' })
        setSelectedFile(null)
        setError(null)
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
                    <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
                    <p className="text-gray-600">Gestiona y comparte documentos importantes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Upload className="w-5 h-5" />
                    Subir documento
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG. Máximo 10MB</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentos.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                        <div className="bg-gray-50 p-6 flex items-center justify-center">
                            <FileText className="w-16 h-16 text-blue-500" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{doc.nombre}</h3>
                            {doc.descripcion && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.descripcion}</p>
                            )}
                            <p className="text-xs text-gray-400 mb-3">
                                {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                                >
                                    Ver
                                </a>
                                <a
                                    href={doc.url}
                                    download
                                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                {isAdmin && (
                                    <button
                                        onClick={() => deleteDocumento(doc.id, doc.url)}
                                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {documentos.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay documentos</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                        Subir el primer documento
                    </button>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Subir documento</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del documento
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Nombre del documento"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Descripción del documento"
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Archivo *
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {uploading ? 'Subiendo...' : 'Subir documento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
