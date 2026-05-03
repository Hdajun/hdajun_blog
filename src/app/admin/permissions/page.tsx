'use client'

import { useState, useEffect } from 'react'
import { Switch, message } from 'antd'
import { useAuth } from '@/contexts/AuthContext'
import { usePermission } from '@/contexts/PermissionContext'
import { useRouter } from 'next/navigation'
import {
  PageKey,
  PAGE_KEY_LABEL,
  PAGE_KEY_TO_HREF,
  DEFAULT_PAGES,
} from '@/types/permission'
import { SHOWCASE_LIST } from '@/constants/showcase'
import { STORAGE_KEYS } from '@/constants/storage'

const PAGE_KEYS: PageKey[] = ['showcase', 'notes', 'chat', 'questions', 'pet']

export default function PermissionsPage() {
  const { isAuthenticated } = useAuth()
  const { config, loading, refreshConfig } = usePermission()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // 未登录重定向
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  // 登录后刷新配置
  useEffect(() => {
    if (isAuthenticated && loading) {
      refreshConfig()
    }
  }, [isAuthenticated, loading, refreshConfig])

  const updatePageVisibility = async (page: PageKey, visible: boolean) => {
    setSaving(true)
    try {
      const newPages = { ...config.pages, [page]: visible }
      const res = await fetch('/api/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
        body: JSON.stringify({ pages: newPages }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          // 更新全局 context
          await refreshConfig()
          message.success(`${PAGE_KEY_LABEL[page]}已${visible ? '开启' : '关闭'}`)
        }
      } else {
        message.error('更新失败')
      }
    } catch {
      message.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  const updateShowcaseItemVisibility = async (
    id: string,
    visible: boolean
  ) => {
    setSaving(true)
    try {
      const newShowcaseItems = { ...config.showcaseItems, [id]: visible }
      const res = await fetch('/api/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
        body: JSON.stringify({ showcaseItems: newShowcaseItems }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          await refreshConfig()
          const item = SHOWCASE_LIST.find(i => i.id === id)
          message.success(`${item?.title || id}已${visible ? '显示' : '隐藏'}`)
        }
      } else {
        message.error('更新失败')
      }
    } catch {
      message.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 dark:text-gray-500 text-sm">加载中…</div>
      </div>
    )
  }

  return (
    <div>
      {/* 吸顶页头 */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md py-6 mb-8 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gray-300/70 after:to-transparent dark:after:via-white/[0.08]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          权限
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          控制未登录用户的可见页面和成果项展示
        </p>
      </div>

      {/* 两栏并排布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 页面可见性 */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] p-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
            页面可见
          </h2>
          <div className="space-y-3">
            {PAGE_KEYS.map(page => (
              <div
                key={page}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {PAGE_KEY_LABEL[page]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {PAGE_KEY_TO_HREF[page]}
                  </span>
                </div>
                <Switch
                  checked={config.pages[page] ?? DEFAULT_PAGES[page]}
                  onChange={(checked) => updatePageVisibility(page, checked)}
                  loading={saving}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 成果展示权限 */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] p-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
            成果
          </h2>
          <div className="space-y-3">
            {SHOWCASE_LIST.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {item.title}
                  </span>
                </div>
                <Switch
                  checked={config.showcaseItems[item.id] ?? true}
                  onChange={(checked) =>
                    updateShowcaseItemVisibility(item.id, checked)
                  }
                  loading={saving}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 提示 */}
      <div className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
        已登录管理员始终拥有全部权限，以上配置仅对未登录用户生效
      </div>
    </div>
  )
}