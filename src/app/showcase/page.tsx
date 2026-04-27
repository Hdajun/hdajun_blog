'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightOutlined, CloseOutlined } from '@ant-design/icons'

// ─── Types ────────────────────────────────────────────────────────────────────

type ShowcaseType = 'video' | 'image' | 'pdf'

interface ShowcaseItem {
  id: string
  title: string
  subtitle: string
  description: string
  type: ShowcaseType
  tags: string[]
  url: string
  cover?: string
  date: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SHOWCASE_LIST: ShowcaseItem[] = [
  {
    id: 'poc-platform-demo',
    title: 'POC 演示设计平台',
    subtitle: '自研 PPT 式画布编辑器，AI 多模型驱动',
    description:
      '自研 PPT 式画布编辑器引擎，支持上传图片、拖拽模板、AI 自然语言生成三种方式快速搭建交互式产品演示 Demo。支持 PC/Mobile/iPad 三端适配，集成 Claude/Gemini/Qwen 多模型 AI 页面生成能力。',
    type: 'video',
    tags: ['React', 'Canvas', 'AIGC', 'Low-Code'],
    url: 'https://gw.alipayobjects.com/v/morserta_material/afts/video/GPoJSr-AiMwAAAAAg0AAAAgAoCLEAQFr',
    cover: '/showcase/cover-poc.png',
    date: '2025',
  },
  {
    id: 'system-architect-cert',
    title: '系统架构设计师',
    subtitle: '软考高级职称，国家级认证',
    description:
      '国家人力资源和社会保障部、工业和信息化部联合颁发的软考高级证书。',
    type: 'image',
    tags: ['软考', '高级职称', '系统架构'],
    url: '/showcase/certificate.png',
    cover: '/showcase/cover-resume.png',
    date: '2025',
  },
  {
    id: 'resume-2025',
    title: '个人简历',
    subtitle: '高级前端工程师 · 5 年行业经验',
    description:
      '专注低代码平台与 AIGC 产品研发，深耕可视化编辑器与智能生成方向。',
    type: 'pdf',
    tags: ['前端', '低代码', 'AIGC'],
    url: '/HZQ.pdf',
    cover: '/showcase/cover-cert.png',
    date: '2025',
  },
]

// ─── Theme color (#9bafff) ────────────────────────────────────────────────────

const themeColor = {
  badge: 'text-[#6b85e0] bg-white/90 dark:text-[#9bafff] dark:bg-gray-900/70',
  tag: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  action: 'text-[#6b85e0] dark:text-[#9bafff]',
}

const TYPE_LABEL: Record<ShowcaseType, string> = {
  video: 'Project Demo',
  image: 'Certificate',
  pdf: 'Resume',
}

const ACTION_TEXT: Record<ShowcaseType, string> = {
  video: '播放演示',
  image: '查看证书',
  pdf: '查看简历',
}

// ─── Content modal ────────────────────────────────────────────────────────────

function ContentModal({
  item,
  onClose,
}: {
  item: ShowcaseItem
  onClose: () => void
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
        aria-label="关闭"
      >
        <CloseOutlined />
      </button>

      <motion.div
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 16, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-5xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl shadow-2xl bg-black">
          {item.type === 'video' && (
            <video
              src={item.url}
              className="w-full aspect-video object-contain"
              controls
              autoPlay
              playsInline
            />
          )}
          {item.type === 'image' && (
            <img
              src={item.url}
              alt={item.title}
              className="w-full max-h-[75vh] object-contain"
            />
          )}
          {item.type === 'pdf' && (
            <div className="w-full h-[70vh] bg-white">
              <iframe
                src={`${item.url}#toolbar=1`}
                className="w-full h-full border-0"
                title={item.title}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">{item.title}</p>
            <p className="mt-0.5 text-xs text-white/40 leading-relaxed max-w-xl">
              {item.description}
            </p>
          </div>
          {item.type === 'pdf' && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs text-white/40 hover:text-white/65 transition-colors whitespace-nowrap"
            >
              在新窗口打开 →
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Showcase card ────────────────────────────────────────────────────────────

function ShowcaseCard({ item, delay }: { item: ShowcaseItem; delay: number }) {
  const [open, setOpen] = useState(false)
  const c = themeColor

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2, delay }}
        onClick={() => setOpen(true)}
        className="group relative cursor-pointer rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(155,175,255,0.2)] dark:bg-gray-800 dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_24px_rgba(155,175,255,0.12)] transition-all duration-300 overflow-hidden"
      >
        {/* 封面图 */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
              <svg
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {/* 类型徽章 */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.badge} backdrop-blur-sm`}
          >
            {TYPE_LABEL[item.type]}
          </span>
          <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[11px] text-gray-500 bg-white/80 dark:bg-gray-900/60 dark:text-gray-400 backdrop-blur-sm">
            {item.date}
          </span>
        </div>

        {/* 卡片内容 */}
        <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
              {item.title}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {item.subtitle}
            </p>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(tag => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-xs ${c.tag}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 底部操作行 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span
              className={`text-sm font-medium ${c.action} transition-colors duration-200`}
            >
              {ACTION_TEXT[item.type]}
            </span>
            <ArrowRightOutlined
              className={`text-sm ${c.action} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200`}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && <ContentModal item={item} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  return (
    <div>
      {/* 吸顶页头 */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md py-6 mb-8 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gray-300/70 after:to-transparent dark:after:via-white/[0.08]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">成果展示</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          项目演示 · 证书认证 · 文档资料
        </p>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOWCASE_LIST.map((item, i) => (
          <ShowcaseCard key={item.id} item={item} delay={i * 0.08} />
        ))}
      </div>

      {/* 更新提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex justify-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-400 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-300 dark:bg-gray-600 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          </span>
          持续更新中
        </div>
      </motion.div>
    </div>
  )
}