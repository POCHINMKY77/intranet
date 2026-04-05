// lib/types.ts
export type Profile = {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    telefono?: string
    departamento?: string
    cargo?: string
    rol: 'admin' | 'empleado'
    created_at: string
    updated_at?: string
}

export type Anuncio = {
    id: string
    titulo: string
    contenido: string
    autor_id: string
    autor?: Profile
    publicado: boolean
    created_at: string
}

export type Documento = {
    id: string
    nombre: string
    descripcion?: string
    url: string
    categoria?: string
    subido_por: string
    subido_por_user?: Profile
    created_at: string
}

export type Solicitud = {
    id: string
    tipo: string
    descripcion: string
    estado: 'pendiente' | 'aprobado' | 'rechazado'
    empleado_id: string
    empleado?: Profile
    created_at: string
}
