'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { navigationItems } from '@/components/Navbar'
import { usePermission } from '@/contexts/PermissionContext'
import { ArrowRightOutlined } from '@ant-design/icons'
import PetCanvas from '@/components/PetCanvas'

// ─── Icon bounce keyframes ─────────────────────────────────────────────────────
const ICON_BOUNCE_STYLE = `
@keyframes iconBounce {
  0%   { transform: scale(1) translateY(0); }
  30%  { transform: scale(1.15) translateY(-3px); }
  50%  { transform: scale(0.95) translateY(0); }
  70%  { transform: scale(1.05) translateY(-1px); }
  100% { transform: scale(1.1) translateY(0); }
}
.nav-card-icon:hover,
.group:hover .nav-card-icon {
  animation: iconBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes heartFloat {
  0%   { opacity: 0; transform: translateY(0) translateX(0) scale(0.4); }
  12%  { opacity: 1; transform: translateY(-6px) translateX(3px) scale(1); }
  50%  { opacity: 0.7; transform: translateY(-24px) translateX(-4px) scale(0.85); }
  80%  { opacity: 0.3; transform: translateY(-40px) translateX(2px) scale(0.7); }
  100% { opacity: 0; transform: translateY(-50px) translateX(-1px) scale(0.4); }
}
.avatar-hearts:hover .heart-particle {
  animation: heartFloat 1.8s ease-in-out infinite;
}
`
const FALLBACK_QUOTES = [
  '代码写得好，bug 自然少 🐛',
  'Ctrl+C 和 Ctrl+V 是人类文明最伟大的发明',
  '任何能用 JavaScript 写的，终将用 JavaScript 写',
  '前端不是一个岗位，是一种信仰 ✨',
  '重构一时爽，一直重构一直爽',
  '最好的代码，是没有代码',
  '代码能跑就行，别问为什么 �',
]

function useHitokoto() {
  const [data, setData] = useState<{ text: string; from: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function fetchQuote() {
      try {
        const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k', {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        if (!cancelled && json.hitokoto) {
          setData({ text: json.hitokoto, from: json.from || '' })
        }
      } catch {
        if (!cancelled) {
          const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
          setData({ text: fallback, from: '' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchQuote()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return { data, loading }
}

const LOADING_HINTS = [
  '正在召唤一条名言……',
  '翻箱倒柜中……',
  '让子弹飞一会儿……',
  '哲学思考加载中 🤔',
  '灵感正在赶来的路上 ✨',
]

function LoadingHint() {
  const [hint, setHint] = useState(LOADING_HINTS[0])
  useEffect(() => {
    setHint(LOADING_HINTS[Math.floor(Math.random() * LOADING_HINTS.length)])
  }, [])
  return (
    <span className="inline-flex items-center gap-2 animate-pulse text-violet-400 dark:text-violet-500">
      {hint}
      <span className="inline-flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-violet-400 dark:bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 rounded-full bg-violet-400 dark:bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 rounded-full bg-violet-400 dark:bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
    </span>
  )
}

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
  const { data: quote, loading } = useHitokoto()
  const { isPageVisible } = usePermission()
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ICON_BOUNCE_STYLE }} />
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

              <div className="mb-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-500 dark:text-violet-400">
                  ✦ 今日一言
                </p>
                <h1 className="text-2xl md:text-4xl font-bold leading-[1.15] text-gray-900 dark:text-white truncate">
                  {loading ? <LoadingHint /> : quote?.text}
                </h1>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                下面那群小家伙是我的线上宠物，点击画布它们就会跑过来找你。
                再往下那些卡片是我的作品，点击就能穿越过去。
                两者都有一个共同点——看起来安安静静的，背地里都在偷偷跑。
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
            <div className="relative avatar-hearts cursor-pointer">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-[3px] shadow-[0_4px_12px_rgba(99,102,241,0.35)]">
                <div className="h-full w-full rounded-[11px] bg-white dark:bg-gray-800 p-1.5 flex items-center justify-center">
                  <img
                    src="/newLogo.svg"
                    alt="logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              {/* Hover hearts */}
              <span className="heart-particle absolute -top-1 -right-2 opacity-0 pointer-events-none" style={{ animationDelay: '0s' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-pink-400"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
              <span className="heart-particle absolute -top-2 right-2 opacity-0 pointer-events-none" style={{ animationDelay: '0.36s' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
              <span className="heart-particle absolute -top-1 -left-2 opacity-0 pointer-events-none" style={{ animationDelay: '0.72s' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-pink-300"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
              <span className="heart-particle absolute -top-3 left-1 opacity-0 pointer-events-none" style={{ animationDelay: '1.08s' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-rose-400"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
              <span className="heart-particle absolute -top-1 -right-4 opacity-0 pointer-events-none" style={{ animationDelay: '1.44s' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-pink-400"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                H_dajun
              </p>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                前端练习生
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

        {/* ── Pet Canvas ──────────────────────────────────────── */}
        <motion.div
          className="col-span-1 md:col-span-4 overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease }}
        >
          <PetCanvas />
        </motion.div>

        {/* ── Nav cards — 2×2 grid ─────────────────────────── */}
        <div className="col-span-1 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navigationItems
            .filter(item => isPageVisible(item.pageKey))
            .map((item, i) => (
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
                    className={`nav-card-icon flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200
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
    </>
  )
}