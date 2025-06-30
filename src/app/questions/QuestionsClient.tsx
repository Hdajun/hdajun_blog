'use client'

import { BookOpenIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { FeatureCard } from '@/components/FeatureCard'

export default function QuestionsClient() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl text-gray-900 dark:text-white">
                前端题库
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                收录前端开发中的重点知识和常见问题，帮助你巩固基础、拓展视野，构建完整的技术体系。
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 lg:gap-16 max-w-[1200px] mx-auto px-4 pt-8">
        <FeatureCard
          href="/questions/practice"
          icon={<BookOpenIcon className="h-7 w-7" />}
          title="开始学习"
          description="通过随机抽题或按分类练习，巩固已学知识点，提升技术能力。"
          actionText="开始练习"
          themeColor="blue"
          className="w-full sm:w-[460px]"
        />

        <FeatureCard
          href="/questions/create"
          icon={<PencilSquareIcon className="h-7 w-7" />}
          title="添加知识点"
          description="记录新的知识点和学习心得，建立个人知识库，方便后续复习和查阅。"
          actionText="开始记录"
          themeColor="green"
          delay={0.1}
          className="w-full sm:w-[460px]"
        />
      </div>
    </div>
  )
}