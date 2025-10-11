import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import NotificationProvider from '@/components/NotificationProvider'
import Footer from '@/components/Footer'
import OAuthHandler from '@/components/OAuthHandler'
import AdminRedirect from '@/components/AdminRedirect'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CyberTeam.Zone - Plataforma de Cibersegurança',
  description: 'Plataforma completa de aprendizado em cibersegurança com cursos, CTFs, certificados e comunidade.',
  keywords: 'cibersegurança, cybersecurity, cursos, CTF, certificados, LMS',
  authors: [{ name: 'CyberTeam' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <OAuthHandler />
          {/* <AdminRedirect /> */}
          {children}
          <Footer />
          <NotificationProvider />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #3b82f6',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
