'use client'

import { useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

interface AdminActionProps {
  children: ReactNode
  showLoginHint?: boolean // 是否显示登录提示
}

export function AdminAction({ children, showLoginHint = false }: AdminActionProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    if (!showLoginHint) return null
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        需要管理员权限
      </span>
    )
  }

  return children
}