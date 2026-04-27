'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Pagination } from 'antd'
import { Note } from '@/types/note'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api-client'
import { FeatureCard } from '@/components/FeatureCard'
import { colorStyles, ICONS, TemplateIcon } from './icons'
import { TemplateNoteId } from '@/constants'
import { debounce } from 'lodash'

// 颜色列表
const COLORS = Object.keys(colorStyles) as (keyof typeof colorStyles)[]

// 基于字符串生成稳定的索引
const getStableIndex = (str: string, max: number) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) % max
}

// 基于笔记 ID 获取稳定的颜色
const getStableColor = (id: string): keyof typeof colorStyles => {
  return COLORS[getStableIndex(id, COLORS.length)]
}

// 基于笔记 ID 获取稳定的图标
const getStableIcon = (id: string) => {
  return ICONS[getStableIndex(id, ICONS.length)].icon
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('') // 实际用于搜索的关键字
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get<Note[]>(`/notes`)
        setNotes(response.data || [])
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotes()
  }, [isAuthenticated])

  const handleCreateNote = debounce(async () => {
    try {
      const response = await api.post<Note>('/notes', {
        title: '',
        content: '',
        visibility: 'private',
      })

      if (response.data?._id) {
        router.push(`/notes/${response.data._id}`)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }, 300)

  // 获取所有可用的标签（用于搜索提示）
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [notes])

  // 过滤后的笔记列表
  const filteredNotes = useMemo(() => {
    const filtered = isAuthenticated
      ? notes
      : notes.filter(item => item.visibility === 'public')
    if (!searchKeyword.trim()) return filtered

    const query = searchKeyword.toLowerCase().trim()
    return filtered.filter(note => {
      // 标题匹配
      const titleMatch = note.title.toLowerCase().includes(query)
      // 标签匹配
      const tagMatch = note.tags?.some(tag => tag.toLowerCase().includes(query))
      return titleMatch || tagMatch
    })
  }, [notes, isAuthenticated, searchKeyword])

  // 回车触发搜索
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchKeyword(searchQuery)
      setCurrentPage(1) // 搜索时重置页码
    }
  }

  // 清除搜索
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchKeyword('')
    setCurrentPage(1) // 清除搜索时重置页码
  }

  // 当前页的数据
  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredNotes.slice(start, end)
  }, [filteredNotes, currentPage, pageSize])

  // 页码改变时滚动到顶部
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1) // 改变每页条数时重置到第一页
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div>
        <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md py-6 mb-8 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gray-300/70 after:to-transparent dark:after:via-white/[0.08]">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 mb-1.5"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-6"
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 吸顶页头 */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md py-6 mb-8 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gray-300/70 after:to-transparent dark:after:via-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              我的小记
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              记录，创作，分享我的想法
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* 搜索框 */}
            <div className="relative group">
              <input
                type="text"
                placeholder="搜索标题或标签..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-9 w-full sm:w-56 md:w-64 pl-4 pr-9 text-sm
                    text-gray-700 dark:text-gray-200
                    border border-gray-200 dark:border-gray-700 rounded-lg 
                    bg-transparent
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    hover:border-gray-300 dark:hover:border-gray-600
                    hover:-translate-y-[1px]
                    focus:outline-none 
                    focus:border-gray-400 dark:focus:border-gray-500
                    focus:-translate-y-[1px]
                    focus:shadow-sm
                    transition-all duration-300 ease-out"
              />
              {searchKeyword ? (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                      transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
            {/* 新建按钮 */}
            {isAuthenticated && (
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center h-9 px-4 
                    text-sm text-gray-700 dark:text-gray-200
                    border border-gray-200 dark:border-gray-700 rounded-lg 
                    hover:border-gray-300 dark:hover:border-gray-600
                    hover:-translate-y-[1px]
                    active:translate-y-0
                    transition-all duration-200 
                    focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                新建小记
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 搜索结果提示 */}
      {searchKeyword.trim() && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          搜索 "
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {searchKeyword}
          </span>
          " 找到{' '}
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {filteredNotes.length}
          </span>{' '}
          条结果
        </p>
      )}

      <div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-5">
          {paginatedNotes?.map(note => {
            const noteId = note._id?.toString() || ''
            const themeColor =
              note._id === TemplateNoteId ? 'rose' : getStableColor(noteId)
            return (
              <FeatureCard
                key={noteId}
                href={
                  isAuthenticated || note._id === TemplateNoteId
                    ? `/notes/${note._id}`
                    : `/notes/${note._id}/view`
                }
                ribbon={
                  note.isTop
                    ? {
                        text: '置顶',
                        color: themeColor,
                      }
                    : undefined
                }
                title={note.title || '无标题小记'}
                icon={
                  note._id === TemplateNoteId
                    ? TemplateIcon[0].icon
                    : getStableIcon(noteId)
                }
                actionText="点击查看"
                themeColor={themeColor}
                tags={[
                  note.visibility === 'public' ? '公开' : '私密',
                  note._id === TemplateNoteId ? '可编写' : '',
                  ...(note.tags || []),
                  format(new Date(note.updatedAt), 'yyyy-MM-dd'),
                ]}
                // 因为小记标题可能有一行可能有多行，如果一排有多行的有单行的，就会导出actionText的不统一在一条直线，所以定制一下内部的布局方式使用flex 上下 然后between
                className="flex flex-col justify-between"
              />
            )
          })}

          {paginatedNotes?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-100/50 dark:border-gray-700/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                暂无小记
              </div>
            </div>
          )}
        </div>

        {/* 分页器 */}
        {filteredNotes.length > 0 && (
          <div className="flex justify-end mt-6 pr-0 md:pr-16">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredNotes.length}
              onChange={handlePageChange}
              pageSizeOptions={['9', '18', '36', '100']}
              showSizeChanger
              showQuickJumper={false}
              size="small"
              simple
              className="pagination-custom"
            />
          </div>
        )}
      </div>
    </div>
  )
}