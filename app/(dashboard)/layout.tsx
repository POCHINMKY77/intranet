import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import AccessibilityWidget from '@/components/AccessibilityWidget'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-8">
                    {children}
                </div>
            </main>

            {/* Widget de Accesibilidad - botón flotante inferior derecho */}
            <AccessibilityWidget />
        </div>
    )
}
