'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VideoCameraOutlined,
  SafetyCertificateOutlined,
  FilePdfOutlined,
  ProjectOutlined,
  LinkOutlined,
  PlayCircleFilled,
  CalendarOutlined,
  ExpandOutlined,
  CloseOutlined,
} from '@ant-design/icons'

type ShowcaseType = 'video' | 'certificate' | 'pdf' | 'project' | 'link' | 'image'

interface ShowcaseItem {
  id: string
  title: string
  description: string
  type: ShowcaseType
  tags: string[]
  url: string
  cover?: string
  date: string
}

const TYPE_CONFIG: Record<
  ShowcaseType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  video: {
    icon: <VideoCameraOutlined />,
    label: '项目演示',
    color: 'amber',
  },
  certificate: {
    icon: <SafetyCertificateOutlined />,
    label: '证书认证',
    color: 'emerald',
  },
  pdf: {
    icon: <FilePdfOutlined />,
    label: '文档资料',
    color: 'blue',
  },
  project: {
    icon: <ProjectOutlined />,
    label: '项目作品',
    color: 'purple',
  },
  link: {
    icon: <LinkOutlined />,
    label: '外部链接',
    color: 'rose',
  },
  image: {
    icon: <SafetyCertificateOutlined />,
    label: '证书认证',
    color: 'emerald',
  },
}

const TAG_COLORS = [
  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
]

const SHOWCASE_LIST: ShowcaseItem[] = [
  {
    id: 'system-architect-cert',
    title: '系统架构设计师',
    description:
      '软考高级证书，国家人力资源和社会保障部、工业和信息化部联合颁发。',
    type: 'image',
    tags: ['软考', '高级职称', '系统架构'],
    url: '/showcase/certificate.png',
    date: '2025',
  },
  {
    id: 'resume-2025',
    title: '个人简历',
    description:
      '高级前端工程师，专注低代码平台与 AIGC 产品研发。',
    type: 'pdf',
    tags: ['前端', '低代码', 'AIGC'],
    url: '/HZQ.pdf',
    date: '2025',
  },
  {
    id: 'poc-platform-demo',
    title: 'POC 演示设计平台',
    description:
      '自研 PPT 式画布编辑器引擎，支持上传图片、拖拽模板、AI 自然语言生成三种方式快速搭建交互式产品演示 Demo。支持 PC/Mobile/iPad 三端适配，集成 Claude/Gemini/Qwen 多模型 AI 页面生成能力。',
    type: 'video',
    tags: ['React', 'Canvas Engine', 'AIGC', 'Low-Code'],
    url: 'https://gw.alipayobjects.com/v/morserta_material/afts/video/GPoJSr-AiMwAAAAAg0AAAAgAoCLEAQFr',
    date: '2025',
  },
]

const TYPE_COLOR_MAP: Record<string, string> = {
  amber:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  emerald:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  purple:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
}

function VideoPlayer({
  url,
  title,
  onExpand,
}: {
  url: string
  title: string
  onExpand: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="group/video relative overflow-hidden rounded-xl bg-gray-950 h-full">
      <video
        ref={videoRef}
        src={url}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircleFilled className="text-5xl text-white/90 drop-shadow-lg" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={e => {
          e.stopPropagation()
          onExpand()
        }}
        className="absolute top-3 right-3 rounded-lg bg-black/50 p-2 text-white/80 opacity-0 transition-opacity group-hover/video:opacity-100 hover:bg-black/70 hover:text-white"
        title={`全屏查看 ${title}`}
      >
        <ExpandOutlined className="text-sm" />
      </motion.button>
    </div>
  )
}

function PdfPreview({
  url,
  title,
}: {
  url: string
  title: string
}) {
  return (
    <div className="group/pdf relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 h-full">
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitV`}
        className="h-full w-full border-0"
        style={{ backgroundColor: 'white' }}
        title={title}
      />
      <motion.a
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 rounded-lg bg-white/90 dark:bg-gray-700/90 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-white dark:hover:bg-gray-700"
      >
        在新窗口打开
      </motion.a>
    </div>
  )
}

function ImagePreview({
  url,
  title,
  onExpand,
}: {
  url: string
  title: string
  onExpand: () => void
}) {
  return (
    <div
      className="group/image relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer h-full flex items-center justify-center"
      onClick={onExpand}
    >
      <img
        src={url}
        alt={title}
        className="h-full w-full object-contain transition-transform duration-300 group-hover/image:scale-[1.02]"
      />
    </div>
  )
}

function FullscreenModal({
  item,
  onClose,
}: {
  item: ShowcaseItem
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] rounded-full bg-black/50 w-10 h-10 flex items-center justify-center text-white/80 transition-colors hover:bg-black/70 hover:text-white"
      >
        <CloseOutlined className="text-xl" />
      </button>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl"
        onClick={e => e.stopPropagation()}
      >
        <div className={`overflow-hidden rounded-2xl shadow-2xl ${item.type === 'video' ? 'bg-gray-950' : ''}`}>
          {item.type === 'video' && (
            <video
              src={item.url}
              className="w-full aspect-video object-contain"
              controls
              autoPlay
              playsInline
            />
          )}
          {(item.type === 'image' || item.type === 'certificate') && (
            <div
              className="w-full h-[70vh] bg-no-repeat bg-contain bg-center"
              style={{ backgroundImage: `url(${item.url})` }}
            />
          )}
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-sm text-white/60">{item.description}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ShowcaseCard({
  item,
  index,
}: {
  item: ShowcaseItem
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const typeConfig = TYPE_CONFIG[item.type]
  const colorClass = TYPE_COLOR_MAP[typeConfig.color] || TYPE_COLOR_MAP.amber

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.12,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        whileHover={{ y: -4 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:bg-gray-900/60 dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="p-5 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colorClass}`}
            >
              {typeConfig.icon}
              {typeConfig.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <CalendarOutlined />
              {item.date}
            </span>
          </div>

          {item.type === 'video' && (
            <div className="mb-4 h-64">
              <VideoPlayer
                url={item.url}
                title={item.title}
                onExpand={() => setExpanded(true)}
              />
            </div>
          )}

          {item.type === 'pdf' && (
            <div className="mb-4 h-64">
              <PdfPreview url={item.url} title={item.title} />
            </div>
          )}

          {item.type === 'image' && (
            <div className="mb-4 h-64">
              <ImagePreview url={item.url} title={item.title} onExpand={() => setExpanded(true)} />
            </div>
          )}

          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {item.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag, i) => (
              <span
                key={tag}
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

              </motion.div>

      <AnimatePresence>
        {expanded && (
          <FullscreenModal item={item} onClose={() => setExpanded(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

export default function ShowcasePage() {
  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              成果展示
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              项目成果、证书认证与技术实践
            </p>
          </div>
        </div>

        <div className="mt-6 h-px bg-gray-200 dark:bg-gray-700" />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>div]:min-h-[480px]">
        {SHOWCASE_LIST.map((item, index) => (
          <ShowcaseCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {SHOWCASE_LIST.length < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-500" />
            </span>
            持续更新中
          </div>
        </motion.div>
      )}
    </div>
  )
}