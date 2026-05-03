'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PermissionConfig, PageKey, DEFAULT_PERMISSION } from '@/types/permission'

/** 未登录用户的轮询间隔（ms） */
const POLL_INTERVAL = 30_000

interface PermissionContextType {
  /** 权限配置 */
  config: PermissionConfig
  /** 加载中 */
  loading: boolean
  /** 刷新权限配置 */
  refreshConfig: () => Promise<void>
  /** 判断某页面是否可见（已登录用户始终可见） */
  isPageVisible: (page: PageKey) => boolean
  /** 判断成果项是否可见（已登录用户始终可见） */
  isShowcaseItemVisible: (id: string) => boolean
}

const PermissionContext = createContext<PermissionContextType>({
  config: { ...DEFAULT_PERMISSION },
  loading: true,
  refreshConfig: async () => {},
  isPageVisible: () => true,
  isShowcaseItemVisible: () => true,
})

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PermissionConfig>({ ...DEFAULT_PERMISSION })
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  const refreshConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/permissions')
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setConfig(json.data as PermissionConfig)
        }
      }
    } catch (error) {
      console.error('Failed to fetch permission config:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    refreshConfig()
  }, [refreshConfig])

  // 管理员登录时刷新权限
  useEffect(() => {
    if (isAuthenticated) {
      refreshConfig()
    }
  }, [isAuthenticated, refreshConfig])

  // 未登录用户：定时轮询 + 页面可见性切换时刷新
  // 确保管理员在另一窗口修改权限后，已打开的无痕窗口能及时感知
  useEffect(() => {
    if (isAuthenticated) return

    const interval = setInterval(refreshConfig, POLL_INTERVAL)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshConfig()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isAuthenticated, refreshConfig])

  // 判断页面是否可见
  const isPageVisible = useCallback(
    (page: PageKey): boolean => {
      // 已登录用户始终可见
      if (isAuthenticated) return true
      // 未登录用户根据配置
      return config.pages[page] ?? true
    },
    [isAuthenticated, config.pages]
  )

  // 判断成果项是否可见
  const isShowcaseItemVisible = useCallback(
    (id: string): boolean => {
      // 已登录用户始终可见
      if (isAuthenticated) return true
      // 未配置的成果项默认可见
      return config.showcaseItems[id] ?? true
    },
    [isAuthenticated, config.showcaseItems]
  )

  return (
    <PermissionContext.Provider
      value={{
        config,
        loading,
        refreshConfig,
        isPageVisible,
        isShowcaseItemVisible,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}