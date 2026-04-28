'use client'

import { motion } from 'framer-motion'
import type { TocHeading } from '@/hooks/useTocHeadings'

interface TableOfContentsProps {
  headings: TocHeading[]
  activeId: string | null
  onHeadingClick: (id: string) => void
}

const indentMap: Record<number, string> = {
  1: 'pl-0',
  2: 'pl-3',
  3: 'pl-6',
  4: 'pl-9',
  5: 'pl-9',
  6: 'pl-9',
}

const ease = [0.22, 1, 0.36, 1] as const

export function TableOfContents({ headings, activeId, onHeadingClick }: TableOfContentsProps) {
  if (headings.length === 0) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md
        border border-gray-200/50 dark:border-gray-700/50
        shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]
        p-4 max-h-[calc(100vh-180px)] overflow-y-auto"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
        目录
      </h3>
      <ul className="space-y-0.5">
        {headings.map((heading) => {
          const isActive = heading.id === activeId
          return (
            <li key={heading.id}>
              <button
                onClick={() => onHeadingClick(heading.id)}
                className={`block w-full text-left text-sm truncate py-1 transition-colors duration-200
                  ${indentMap[heading.level] || 'pl-9'}
                  ${isActive
                    ? 'text-indigo-500 dark:text-indigo-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                title={heading.text}
              >
                {heading.text || '(空标题)'}
              </button>
            </li>
          )
        })}
      </ul>
    </motion.nav>
  )
}