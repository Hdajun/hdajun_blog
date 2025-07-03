'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  ArrowRightOutlined,
  BookOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { FeatureCard } from '@/components/FeatureCard'

// 打字机效果组件
const TypewriterText = ({ text, className = '' }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100) // 每个字符的打字间隔时间

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block"
      >
        |
      </motion.span>
    </span>
  )
}

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-16rem)] overflow-hidden pt-10">
      <div className="relative flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center text-center pb-12">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-7 text-center"
        >
          <h1 className="text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-4xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-6">
            <TypewriterText text="Hi, 我是大俊 / DaJun / 前端开发者 👋" />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-[42rem] text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base"
          >
            很高兴遇见你！这里是我的技术乐园，专注于探索 Web 前沿技术和分享实战经验。
            从前端工程化到性能优化，从框架实践到 AI 应用，记录着我在技术之路上的点点滴滴。
            如果你也热爱技术创新，欢迎一起交流，让我们在这里碰撞思维的火花
          </motion.p>
        </motion.div>

        {/* 技术标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12 w-full max-w-4xl mx-auto px-4"
        >
          <div className="flex flex-wrap justify-center gap-2 whitespace-nowrap">
            {[
              { text: 'React', url: 'https://react.dev' },
              { text: 'TypeScript', url: 'https://www.typescriptlang.org' },
              { text: 'Next.js', url: 'https://nextjs.org' },
              { text: 'Node.js', url: 'https://nodejs.org' },
              { text: 'Vue', url: 'https://vuejs.org' },
              { text: 'TailwindCSS', url: 'https://tailwindcss.com' },
              { text: 'AI 应用', url: 'https://deepseek.com' },
              { text: '低代码开发', url: 'https://github.com/topics/lowcode' },
            ].map((tech, index) => (
              <motion.a
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                key={tech.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: 'easeOut'
                }}
                className="
                  inline-flex items-center rounded-full px-3 py-1 text-sm
                  bg-gray-100 text-gray-700 hover:bg-gray-200 
                  dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50
                  transition-colors duration-200 backdrop-blur-sm
                  cursor-pointer
                "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tech.text}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* 功能卡片 */}
        <div className="mx-auto mt-8 grid w-full max-w-6xl gap-8 px-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
          <FeatureCard
            href="/questions"
            icon={<BookOutlined className="text-xl" />}
            title="前端题库"
            description="精心整理的前端面试题库，助你轻松应对技术面试，提升专业能力。"
            actionText="开始刷题"
            tags={['面试题', 'React', 'Vue']}
            themeColor="blue"
          />

          <FeatureCard
            href="/chat"
            icon={<MessageOutlined className="text-xl" />}
            title="和我聊聊"
            description="任何技术问题都可以和我交流，让我们一起探讨编程的乐趣。"
            actionText="开始对话"
            tags={['DeepSeek', 'AI', '实时对话']}
            themeColor="green"
            delay={0.1}
          />

          <FeatureCard
            href="/notes"
            icon={<BookOutlined className="text-xl" />}
            title="阅读小记"
            description="浏览我的技术小记，分享我的开发经验和学习心得。"
            actionText="查看小记"
            tags={['随缘更新', '技术博文', '实战案例']}
            themeColor="purple"
            delay={0.2}
          />
        </div>
      </div>
    </div>
  )
}