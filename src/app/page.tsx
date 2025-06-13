'use client'

import { motion } from 'framer-motion'
import {
  ArrowRightOutlined,
  BookOutlined,
  MessageOutlined,
} from '@ant-design/icons'

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-16rem)] overflow-hidden">
      <div className="relative flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 text-center">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h1 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Hi, 我是大俊
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-[42rem] text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg"
          >
            欢迎来到我的个人空间，这里记录着我的技术探索和思考。如果你对Web开发感兴趣，或者有任何想法，欢迎和我交流。
          </motion.p>
        </motion.div>

        {/* 功能卡片 */}
        <div className="mb-0 grid gap-6 sm:grid-cols-2">
          <motion.a
            href="/chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl bg-white/80 p-8 shadow-md backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800/80"
          >
            <div className="absolute inset-0 bg-gray-50/50 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 dark:bg-gray-700/50" />
            <div className="relative flex items-start gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition-transform duration-300 group-hover:scale-110 dark:bg-gray-700 dark:text-gray-300">
                <MessageOutlined className="text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  和我聊聊
                </h2>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  有任何技术问题都可以和我交流，让我们一起探讨编程的乐趣。
                </p>
                <div className="flex items-center text-gray-900 dark:text-white">
                  <span className="text-sm font-medium">开始对话</span>
                  <ArrowRightOutlined className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.a>

          <motion.a
            href="/blog"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl bg-white/80 p-8 shadow-md backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800/80"
          >
            <div className="absolute inset-0 bg-gray-50/50 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 dark:bg-gray-700/50" />
            <div className="relative flex items-start gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition-transform duration-300 group-hover:scale-110 dark:bg-gray-700 dark:text-gray-300">
                <BookOutlined className="text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  阅读博客
                </h2>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  浏览最新的技术文章，分享我的开发经验和学习心得。
                </p>
                <div className="flex items-center text-gray-900 dark:text-white">
                  <span className="text-sm font-medium">查看文章</span>
                  <ArrowRightOutlined className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.a>
        </div>

        {/* 技术标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 w-full"
        >
          <div className="relative mx-auto h-[200px] w-full">
            {[
              // 前端框架
              { text: 'React', size: 'text-lg', x: '10%', y: '20%' },
              { text: 'Vue', size: 'text-base', x: '75%', y: '15%' },
              { text: 'Next.js', size: 'text-lg', x: '35%', y: '35%' },
              // 语言和工具
              { text: 'TypeScript', size: 'text-xl', x: '60%', y: '30%' },
              { text: 'es6', size: 'text-base', x: '25%', y: '65%' },
              // 样式和构建
              { text: 'TailwindCSS', size: 'text-lg', x: '70%', y: '60%' },
              { text: 'Less', size: 'text-base', x: '15%', y: '50%' },
              { text: 'Webpack', size: 'text-lg', x: '45%', y: '75%' },
              // 状态管理
              { text: 'Redux', size: 'text-base', x: '80%', y: '45%' },
              // 后端和AI
              { text: 'Node.js', size: 'text-lg', x: '50%', y: '15%' },
              { text: 'AI', size: 'text-xl', x: '30%', y: '30%' },
              { text: 'LowCode', size: 'text-base', x: '65%', y: '75%' },
            ].map((tech, index) => (
              <motion.div
                key={tech.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                className={`absolute ${tech.size} font-medium hover:z-50`}
                style={{ 
                  left: tech.x,
                  top: tech.y,
                }}
              >
                <motion.span
                  className="inline-block cursor-pointer rounded-full bg-gray-100 px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  whileHover={{ y: -2 }}
                >
                  {tech.text}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}