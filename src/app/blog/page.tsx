'use client'

import { motion } from 'framer-motion'
import { allPosts } from 'contentlayer/generated'
import { compareDesc } from 'date-fns'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline'

function PostCard({ post, index }: { post: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-md backdrop-blur-sm 
      transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
      hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl dark:bg-gray-800/80"
    >
      {/* 背景渐变效果 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 opacity-0 
        transition-all duration-500 ease-out group-hover:opacity-100 
        dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-900/50"
      />

      <div className="relative p-6">
        {/* 文章标题 */}
        <h2 className="mb-3 text-xl line-clamp-2">
          <span
            className="text-gray-900 transition-colors duration-300 group-hover:text-gray-800
            dark:text-gray-100 dark:group-hover:text-gray-300"
          >
            {post.title}
          </span>
        </h2>

        {/* 文章元信息 */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
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
          <p
            className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2 
          dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
          >
            {post.description}
          </p>
        )}

        {/* 标签区域 */}
        {post.tags && (
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-gray-800 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1 text-xs font-medium 
                  text-gray-600 transition-all duration-300 ease-in-out hover:scale-105 
                  hover:from-gray-800/10 hover:to-gray-700/20 hover:text-gray-800
                  dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 
                  dark:hover:from-gray-800/20 dark:hover:to-gray-700/30 dark:hover:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部虚化背景区域 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t 
        from-white/90 via-white/60 via-white/30 to-transparent backdrop-blur-sm opacity-0
        transition-all duration-500 ease-out group-hover:opacity-100 z-10
        dark:from-gray-800/90 dark:via-gray-800/60 dark:via-gray-800/30"
      />

      {/* 底部居中的阅读更多按钮 */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 transform
        translate-y-2 opacity-0 scale-95
        transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 z-20"
      >
        <Link
          href={post.url}
          className="group/btn flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200 font-medium
          hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
        >
          阅读更多
          <ArrowRightOutlined className="text-xs transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  )
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  )

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts

    const searchTerms = searchQuery.toLowerCase().split(' ')
    return posts.filter(post => {
      const searchContent = `${post.title} ${
        post.description
      } ${post.tags?.join(' ')}`.toLowerCase()
      return searchTerms.every(term => searchContent.includes(term))
    })
  }, [posts, searchQuery])

  return (
    <div className="relative min-h-screen">
      <div className="sticky top-0 z-50 bg-white/80 px-4 py-6 backdrop-blur-lg dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl">
          <div className="relative mx-auto max-w-lg group flex justify-center">
            <div className="absolute left-[2.5%] top-1/2 -translate-y-1/2 flex items-center pl-3 z-10">
              <svg
                className="h-5 w-5 text-gray-400 transition-colors duration-300
                group-focus-within:text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索文章标题、描述或标签..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-[95%] h-[48px] rounded-xl border border-gray-200 bg-transparent pl-10 pr-4 text-sm relative
              transition-all duration-300 ease-out placeholder:text-gray-400
              hover:border-gray-800 hover:bg-gray-100/50
              focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
              focus:shadow-[0_0_0_1px_rgb(31,41,55),0_0_0_2px_rgb(55,65,81)] focus:-translate-y-[1px]
              dark:border-gray-700 dark:bg-transparent dark:text-white dark:placeholder:text-gray-400
              dark:hover:border-gray-800 dark:hover:bg-gray-700/50
              dark:focus:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {filteredPosts.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              没有找到匹配的文章
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              清除搜索
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, idx) => (
              <PostCard key={post._id} post={post} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}