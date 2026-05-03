'use client'

import { usePermission } from '@/contexts/PermissionContext'
import { useAuth } from '@/contexts/AuthContext'
import { PageKey } from '@/types/permission'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PageGuardProps {
  /** 当前页面对应的权限 key */
  pageKey: PageKey
  children: React.ReactNode
}

/**
 * 页面级路由守卫。
 * 未登录用户访问被关闭的页面时，重定向到首页。
 * 已登录用户始终可访问。
 */
export function PageGuard({ pageKey, children }: PageGuardProps) {
  const { isAuthenticated } = useAuth()
  const { isPageVisible, loading } = usePermission()
  const router = useRouter()

  useEffect(() => {
    // 权限加载中或已登录时不做拦截
    if (loading || isAuthenticated) return
    // 页面不可见时重定向到首页
    if (!isPageVisible(pageKey)) {
      router.replace('/')
    }
  }, [loading, isAuthenticated, isPageVisible, pageKey, router])

  // 权限加载中，不渲染任何内容（避免闪烁）
  if (loading) return null

  // 已登录始终可访问
  if (isAuthenticated) return <>{children}</>

  // 页面不可见，不渲染内容（正在重定向）
  if (!isPageVisible(pageKey)) return null

  return <>{children}</>
}