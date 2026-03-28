import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Aerospace Mission Control | DO-178C DAL A',
  description: 'Production-grade spacecraft cockpit interface with real-time telemetry and systems monitoring',
  keywords: ['aerospace', 'mission control', 'spacecraft', 'DO-178C', 'DAL A', 'avionics'],
  authors: [{ name: 'Aerospace Systems Inc.' }],
  openGraph: {
    title: 'Aerospace Mission Control',
    description: 'Advanced spacecraft cockpit interface',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
