'use client'

import { CalendarIcon } from '@heroicons/react/24/outline'

interface BlogPostClientProps {
  post: any
  slug: string
}

export default function BlogPostClient({ post, slug }: BlogPostClientProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        {post.title}
      </h1>

      {/* 文章元信息 */}
      <div className="mb-4 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-800" />
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>

      {/* 文章描述 */}
      {post.description && (
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
          {post.description}
        </p>
      )}

      {/* 标签 */}
      {post.tags && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 
              dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-800/10 
              hover:text-gray-800 transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}