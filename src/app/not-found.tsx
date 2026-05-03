'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import PetCanvas from '@/components/PetCanvas'

const NOT_FOUND_THOUGHTS = [
  '好像没有这个页面呢…',
  '要不找找大俊？',
  '页面走丢了…',
  '迷路了，怎么办呀',
  '这里什么都没有…',
  '要不回首页看看？',
  '404…是啥意思？',
  '好像走错地方了~',
  '大俊快来救我！',
  '这条路好像不通…',
]

const ease = [0.22, 1, 0.36, 1] as const

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-3rem)] md:min-h-screen py-8">
      {/* 404 数字 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="text-center mb-6"
      >
        <h1 className="text-8xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          404
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          页面走丢了，让小家伙帮你找找
        </p>
      </motion.div>

      {/* 宠物画布 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
      >
        <PetCanvas height={180} thoughts={NOT_FOUND_THOUGHTS} />
      </motion.div>

      {/* 返回首页 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease }}
        className="mt-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
            bg-indigo-500 hover:bg-indigo-600 text-white
            transition-colors duration-200
            shadow-[0_4px_16px_rgba(99,102,241,0.30)]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          回到首页
        </Link>
      </motion.div>
    </div>
  )
}