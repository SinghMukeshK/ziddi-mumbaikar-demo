'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        // Store the intended destination
        const redirect = redirectTo || pathname
        // Redirect to home with a parameter to open sign in modal
        router.push(`/?signin=true&redirect=${encodeURIComponent(redirect)}`)
      } else {
        setShouldRender(true)
      }
    }
  }, [isLoggedIn, isLoading, router, pathname, redirectTo])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render protected content until authenticated
  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}
