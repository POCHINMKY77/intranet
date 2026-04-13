// proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Rutas públicas (sin autenticación)
    const publicPaths = ['/login', '/register', '/contacto']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

    // Rutas protegidas (requieren autenticación)
    const protectedPaths = [
        '/',
        '/directorio',
        '/anuncios',
        '/documentos',
        '/formularios',
        '/perfil',
        '/mensajes',
        '/videollamada'
    ]
    const isProtectedPath = protectedPaths.some(path => pathname === path) || pathname.startsWith('/admin')

    // Redirigir a login si no está autenticado y trata de acceder a ruta protegida
    if (!user && !isPublicPath) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirigir a dashboard si está autenticado y trata de acceder a ruta pública (login, register, contacto)
    if (user && isPublicPath) {
        const redirectUrl = new URL('/', request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // Verificar roles para rutas de admin (solo administradores)
    if (user && pathname.startsWith('/admin')) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (error || profile?.rol !== 'admin') {
            // Redirigir a dashboard si no es admin
            const redirectUrl = new URL('/', request.url)
            return NextResponse.redirect(redirectUrl)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
