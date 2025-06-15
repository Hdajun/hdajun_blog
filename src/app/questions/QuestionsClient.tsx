'use client'

import { motion } from 'framer-motion'
import { BookOpenIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { ArrowRightOutlined } from '@ant-design/icons'

export default function QuestionsClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            个人题库
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            记录学习过程中的重要知识点，通过刷题巩固记忆，持续积累技术经验。
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl bg-white/80 p-8 shadow-md backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800/80"
          >
            <a href="/questions/practice" className="block">
              <div className="absolute inset-0 bg-gray-50/50 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 dark:bg-gray-700/50" />
              <div className="relative flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition-transform duration-300 group-hover:scale-110 dark:bg-gray-700 dark:text-gray-300">
                  <BookOpenIcon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    开始刷题
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    通过随机抽题或按分类练习，巩固已学知识点，提升解题能力。
                  </p>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <span className="text-sm font-medium">开始练习</span>
                    <ArrowRightOutlined className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl bg-white/80 p-8 shadow-md backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800/80"
          >
            <a href="/questions/create" className="block">
              <div className="absolute inset-0 bg-gray-50/50 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 dark:bg-gray-700/50" />
              <div className="relative flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition-transform duration-300 group-hover:scale-110 dark:bg-gray-700 dark:text-gray-300">
                  <PencilSquareIcon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    添加题目
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    记录新的知识点和题目，建立个人知识库，方便后续复习和查阅。
                  </p>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <span className="text-sm font-medium">开始记录</span>
                    <ArrowRightOutlined className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}