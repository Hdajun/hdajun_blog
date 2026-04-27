'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { navigationItems } from '@/components/Navbar'
import { ArrowRightOutlined } from '@ant-design/icons'

const TECH_TAGS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Vue.js',
  'TailwindCSS',
  'AIGC',
  '低代码',
]

const PROFILE_STATS = [
  { value: '5年+', label: '前端经验' },
  { value: '系统架构师', label: '软考高级认证' },
  { value: '杭州', label: '工作城市' },
]

const ease = [0.22, 1, 0.36, 1] as const

export default function Home() {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-6">
        {/* ── Hero ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="col-span-1 md:col-span-3 relative rounded-3xl overflow-hidden
            bg-white dark:bg-gray-800
            shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
            p-8 min-h-[260px]"
        >
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, ease }}
                className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400"
              >
                Frontend Engineer · AIGC · Low-Code
              </motion.p>

              <h1 className="mb-4 text-3xl md:text-5xl font-bold leading-[1.15] text-gray-900 dark:text-white">
                嘿，叫我{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  大俊
                </span>{' '}
                就好 👋
              </h1>

              <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                一个白天写代码、晚上刷 AI 资讯、睡前还在想架构的家伙。
                热衷于把「这个能做到吗」变成「你看，做出来了」。
                偶尔输出一些有用的东西，偶尔也只是想记录一下。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TECH_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.38 + i * 0.04, duration: 0.2 }}
                  className="rounded-full border border-gray-200/60 bg-white/80 px-3 py-1 text-[11px] font-medium text-gray-600 backdrop-blur-sm dark:border-gray-600/40 dark:bg-gray-700/60 dark:text-gray-300"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Profile card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease }}
          className="col-span-1 md:col-span-1 flex flex-col items-center justify-between rounded-3xl bg-white dark:bg-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[260px] px-5 py-6"
        >
          {/* 顶部：头像 + 名字 */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-[3px] shadow-[0_4px_12px_rgba(99,102,241,0.35)]">
                <div className="h-full w-full rounded-[11px] bg-white dark:bg-gray-800 p-1.5 flex items-center justify-center">
                  <img
                    src="/newLogo.svg"
                    alt="logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                H_dajun
              </p>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                高级前端工程师
              </p>
            </div>
          </div>

          {/* 中部：统计 pills */}
          <div className="w-full space-y-2">
            {PROFILE_STATS.map(s => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-700/50 px-3 py-2"
              >
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {s.label}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Nav cards — 2×2 grid ─────────────────────────── */}
        <div className="col-span-1 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navigationItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 + i * 0.07, ease }}
            >
              <Link
                href={item.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-110
                    ${
                      item.themeColor === 'amber'
                        ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400'
                        : item.themeColor === 'purple'
                        ? 'bg-violet-50 text-violet-500 dark:bg-violet-900/20 dark:text-violet-400'
                        : item.themeColor === 'green'
                        ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* 底部：标签 + 操作 */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {item.tags?.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 text-[10px] text-gray-400 dark:text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium opacity-60 group-hover:opacity-100 transition-all duration-200
                    ${
                      item.themeColor === 'amber'
                        ? 'text-amber-500 dark:text-amber-400'
                        : item.themeColor === 'purple'
                        ? 'text-violet-500 dark:text-violet-400'
                        : item.themeColor === 'green'
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-blue-500 dark:text-blue-400'
                    }`}
                  >
                    {item.actionText}
                    <ArrowRightOutlined className="text-[10px] -translate-x-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}