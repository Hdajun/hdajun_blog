'use client'

import { allPosts } from 'contentlayer/generated'
import { compareDesc } from 'date-fns'
import Link from 'next/link'
import { useState, useMemo } from 'react'

function PostCard({ post }: { post: any }) {
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-xl">
        <Link
          href={post.url}
          className="text-gray-900 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300"
        >
          {post.title}
        </Link>
      </h2>
      <time dateTime={post.date} className="mb-2 block text-xs text-gray-500 dark:text-gray-400">
        {new Date(post.date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
      {post.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{post.description}</p>
      )}
      {post.tags && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 
              transition-all duration-300 ease-in-out hover:scale-105 hover:from-gray-100 hover:to-gray-200 hover:shadow-sm hover:text-gray-800
              dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 dark:hover:text-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const posts = allPosts.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
  
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    
    const searchTerms = searchQuery.toLowerCase().split(' ')
    return posts.filter(post => {
      const searchContent = `${post.title} ${post.description} ${post.tags?.join(' ')}`.toLowerCase()
      return searchTerms.every(term => searchContent.includes(term))
    })
  }, [posts, searchQuery])

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-12 space-y-6">
        <div className="text-center">
          <h1 className="mb-2 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-4xl font-bold text-transparent dark:from-gray-200 dark:to-gray-400">
            博客文章
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            探索技术、分享见解
          </p>
        </div>
        <div className="relative mx-auto max-w-lg">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm 
            transition-all duration-500 ease-out placeholder:text-gray-400
            hover:border-gray-300 hover:bg-gray-100/50 hover:shadow hover:shadow-gray-200/60
            focus:border-gray-400 focus:bg-white focus:shadow-lg focus:shadow-gray-200/50 focus:outline-none focus:ring-1 focus:ring-gray-200/50
            focus:transition-shadow focus:duration-700
            dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500
            dark:hover:border-gray-600 dark:hover:bg-gray-700/50 dark:hover:shadow-gray-800/40
            dark:focus:border-gray-500 dark:focus:bg-gray-800 dark:focus:ring-gray-700/50 dark:focus:shadow-gray-800/30"
          />
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">没有找到匹配的文章</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            清除搜索
          </button>
        </div>
      ) : (
        filteredPosts.map((post, idx) => <PostCard key={idx} post={post} />)
      )}
    </div>
  )
}