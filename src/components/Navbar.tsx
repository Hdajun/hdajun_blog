'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline'
import { LoginModal } from './LoginModal'
import { useAuth } from '@/contexts/AuthContext'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { isAuthenticated, login, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLoginSuccess = (token: string) => {
    login(token)
  }

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-[60] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur shadow-sm dark:bg-gray-900/90'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="group relative text-xl font-bold tracking-tight"
              >
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-400 group-hover:to-indigo-400">
                  H_dajun
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">Blog</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* 主导航 - 桌面端 */}
              <nav className="ml-12 hidden space-x-8 md:flex">
                <Link
                  href="/chat"
                  className="text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  CHAT
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  博客
                </Link>
                <Link
                  href="/questions"
                  className="text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  题库
                </Link>
              </nav>
            </div>

            {/* 右侧操作区 - 桌面端 */}
            <div className="hidden items-center space-x-4 md:flex">
              <ThemeToggle />
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="group relative overflow-hidden rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-300 hover:shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="group relative overflow-hidden rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-300 hover:shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="切换菜单"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 移动端菜单 */}
          <div
            className={`md:hidden ${
              isMenuOpen ? 'block' : 'hidden'
            } border-t border-gray-200 dark:border-gray-700`}
          >
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                href="/chat"
                className="text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                CHAT
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                博客
              </Link>
              <Link
                href="/questions"
                className="text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                题库
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="text-left text-sm font-medium text-gray-800 transition-all duration-300 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="text-left text-sm font-medium text-gray-800 transition-all duration-300 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export function NavbarWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <Navbar />
}