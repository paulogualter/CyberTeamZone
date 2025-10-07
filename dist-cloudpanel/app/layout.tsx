import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import NotificationProvider from '@/components/NotificationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CyberTeam.Zone - Plataforma de Cibersegurança',
  description: 'Plataforma completa de aprendizado em cibersegurança com cursos, CTFs, certificados e comunidade.',
  keywords: 'cibersegurança, cybersecurity, cursos, CTF, certificados, LMS',
  authors: [{ name: 'CyberTeam' }],
  viewport: 'width=device-width, initial-scale=1',
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
          {children}
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
