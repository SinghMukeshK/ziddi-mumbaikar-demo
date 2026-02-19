import type { Metadata } from 'next'
import { Poppins, Montserrat } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Ziddi Mumbaikar - For a Cleaner, Safer, Stronger Mumbai',
  description: 'Join the citizen movement for a better Mumbai. Community-driven initiatives for cleanliness, safety, and social impact.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} font-sans`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
