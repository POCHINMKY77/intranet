'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, User, Mail, Phone, Building, Briefcase, Users } from 'lucide-react'

interface Profile {
    id: string
    full_name: string
    email: string
    telefono: string
    departamento: string
    cargo: string
    rol: string
    avatar_url: string
}

export default function DirectorioPage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartamento, setSelectedDepartamento] = useState('todos')
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        checkUser()
        loadProfiles()
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

    useEffect(() => {
        filterProfiles()
    }, [searchTerm, selectedDepartamento, profiles])

    async function loadProfiles() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true })

            if (error) throw error
            setProfiles(data || [])
            setFilteredProfiles(data || [])
        } catch (error) {
            console.error('Error loading profiles:', error)
        } finally {
            setLoading(false)
        }
    }

    function filterProfiles() {
        let filtered = [...profiles]

        if (searchTerm) {
            filtered = filtered.filter(profile =>
                profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedDepartamento !== 'todos') {
            filtered = filtered.filter(profile =>
                profile.departamento === selectedDepartamento
            )
        }

        setFilteredProfiles(filtered)
    }

    const departamentos = ['todos', ...new Set(profiles.map(p => p.departamento).filter(Boolean))]

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
                    <h1 className="text-2xl font-bold text-gray-900">Directorio de Empleados</h1>
                    <p className="text-gray-600 mt-1">Encuentra información de contacto de tus compañeros</p>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600 font-semibold">{filteredProfiles.length} empleados</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o cargo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={selectedDepartamento}
                        onChange={(e) => setSelectedDepartamento(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {departamentos.map(depto => (
                            <option key={depto} value={depto}>
                                {depto === 'todos' ? 'Todos los departamentos' : depto}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg overflow-hidden">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-blue-600" />
                                )}
                            </div>
                        </div>
                        <div className="p-4 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">{profile.full_name || 'Sin nombre'}</h3>
                            <p className="text-sm text-blue-600 font-medium mt-1">{profile.cargo || 'Sin cargo'}</p>
                            <div className="mt-4 space-y-2 text-left">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{profile.email}</span>
                                </div>
                                {profile.telefono && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{profile.telefono}</span>
                                    </div>
                                )}
                                {profile.departamento && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Building className="w-4 h-4" />
                                        <span className="text-sm">{profile.departamento}</span>
                                    </div>
                                )}
                            </div>
                            {/* Mostrar badge de admin SOLO si el usuario actual es admin */}
                            {isAdmin && profile.rol === 'admin' && (
                                <span className="inline-block mt-3 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                    Administrador
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron empleados</p>
                </div>
            )}
        </div>
    )
}
