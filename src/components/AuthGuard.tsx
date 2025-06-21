'use client'

import { useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode // 可选的替代内容
}

export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return fallback
  }

  return children
}