'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur shadow-sm dark:bg-gray-900/90' : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-medium text-gray-900 dark:text-white">
            H_dajun Blog
          </Link>
          <nav className="hidden md:flex md:items-center md:space-x-6">
            <Link 
              href="/blog" 
              className="text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              博客
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              关于
            </Link>
            <ThemeToggle />
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

        {/* 移动端导航 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <Link 
                href="/blog"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                博客
              </Link>
              <Link 
                href="/about"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                关于
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
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