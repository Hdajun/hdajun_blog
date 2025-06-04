'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 等待客户端渲染完成后再显示
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="切换主题"
      >
        <div className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="切换主题"
    >
      <div className="relative h-5 w-5">
        <SunIcon className="absolute inset-0 rotate-0 transform transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute inset-0 rotate-90 transform scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
    </button>
  )
}