import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intranet',
  description: 'Portal corporativo de empleados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}