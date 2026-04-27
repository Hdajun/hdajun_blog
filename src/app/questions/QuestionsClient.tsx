'use client'

import { BookOpenIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { FeatureCard } from '@/components/FeatureCard'

export default function QuestionsClient() {
  return (
    <div>
      {/* 吸顶页头 */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md py-6 mb-8 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gray-300/70 after:to-transparent dark:after:via-white/[0.08]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">前端题库</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          收录前端开发中的重点知识和常见问题，帮助你巩固基础、拓展视野
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <FeatureCard
          href="/questions/practice"
          icon={<BookOpenIcon className="h-7 w-7" />}
          title="开始学习"
          description="通过随机抽题或按分类练习，巩固已学知识点，提升技术能力。"
          actionText="开始练习"
          themeColor="blue"
          className="flex-1 min-w-[min(280px,100%)] max-w-full sm:max-w-[460px]"
        />
        <FeatureCard
          href="/questions/create"
          icon={<PencilSquareIcon className="h-7 w-7" />}
          title="添加知识点"
          description="记录新的知识点和学习心得，建立个人知识库，方便后续复习和查阅。"
          actionText="开始记录"
          themeColor="green"
          delay={0.1}
          className="flex-1 min-w-[min(280px,100%)] max-w-full sm:max-w-[460px]"
        />
      </div>
    </div>
  )
}