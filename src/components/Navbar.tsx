'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline'
import { LoginModal } from './LoginModal'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

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
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="group relative text-xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-400 group-hover:to-indigo-400">
                H_dajun
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Blog</span>
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <nav className="hidden md:flex md:items-center md:space-x-6">
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
              <ThemeToggle />
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-sm font-medium text-[#818cf8] transition-all duration-300 hover:text-[#635bff]"
                >
                  退出登录
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm font-medium text-[#818cf8] transition-all duration-300 hover:text-[#635bff]"
                >
                  系统登录
                </button>
              )}
            </nav>
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
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
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
                      className="text-left text-sm font-medium text-[#818cf8] transition-all duration-300 hover:text-[#635bff]"
                    >
                      退出登录
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true)
                        setIsMenuOpen(false)
                      }}
                      className="text-left text-sm font-medium text-[#818cf8] transition-all duration-300 hover:text-[#635bff]"
                    >
                      系统登录
                    </button>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
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