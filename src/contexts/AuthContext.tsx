'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiV1 } from '@/lib/api-v1'
import { fundraiserService } from '@/services/fundraiser.service'

// User type definition
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  tenantId: string
  joinedDate: string
}

// Auth context type
interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (first_name: string, last_name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const DEFAULT_TENANT_ID = '050a9c4a-ebf6-4897-b5fe-5fe8a2ce1317';

        // Ensure tenant_id is set even for guest users
        if (typeof window !== 'undefined' && !localStorage.getItem('tenant_id')) {
          localStorage.setItem('tenant_id', DEFAULT_TENANT_ID);
        }

        // Check localStorage for user data
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          // Ensure tenant_id is also set for existing sessions
          if (userData.tenant_id) {
            localStorage.setItem('tenant_id', userData.tenant_id)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await apiV1.post<any>('/auth/admin/login', { email, password });

      const { access_token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenant_id', userData.tenant_id);
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  // Signup function
  const signup = async (first_name: string, last_name: string, email: string, password: string, phone: string = '') => {
    try {
      // Omit role_id to let the backend safely assign the default 'user' role
      const payload: any = {
        tenant_id: '050a9c4a-ebf6-4897-b5fe-5fe8a2ce1317',
        first_name,
        last_name,
        email,
        password,
        password_confirm: password, // Backend likely requires confirmation
      }

      if (phone) {
        payload.phone = phone
      }

      const response = await apiV1.post<any>('/auth/register', payload);

      const { access_token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenant_id', userData.tenant_id || '050a9c4a-ebf6-4897-b5fe-5fe8a2ce1317');
      setUser(userData);
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('tenant_id')
    fundraiserService.clearCategoriesCache()
    setUser(null)
    router.push('/')
  }

  // Update user profile
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
