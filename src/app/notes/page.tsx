'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Note } from '@/types/note'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api-client'
import { FeatureCard } from '@/components/FeatureCard'

// 定义一组图标数组用于随机展示
const ICONS = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
]

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

  const handleCreateNote = async () => {
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
  }

  const getCurrentNotes = () => {
    const filtered = isAuthenticated
      ? notes
      : notes.filter(item => item.visibility === 'public')
    if (!searchQuery) return filtered
    return filtered.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleNoteClick = (noteId: string) => {
    if (isAuthenticated) {
      router.push(`/notes/${noteId}`)
    } else {
      router.push(`/notes/${noteId}/view`)
    }
  }

  // 获取随机图标
  const getRandomIcon = () => {
    const randomIndex = Math.floor(Math.random() * ICONS.length)
    return ICONS[randomIndex].icon
  }

  const getRandomThemeColor = () => {
    const colors: Array<'blue' | 'green' | 'purple'> = [
      'blue',
      'green',
      'purple',
    ]
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="sticky top-0 z-50 bg-white/80 px-4 py-6 backdrop-blur-lg dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 mb-6"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-6"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl text-gray-900 dark:text-white">
                我的小记
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                记录，创作，分享你的想法
              </p>
            </div>
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

      <div className="mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentNotes()?.map(note => (
            <FeatureCard
              key={note._id?.toString()}
              href={
                isAuthenticated
                  ? `/notes/${note._id}`
                  : `/notes/${note._id}/view`
              }
              title={note.title || '无标题小记'}
              icon={getRandomIcon()}
              actionText="点击查看"
              themeColor={getRandomThemeColor()}
              tags={[
                note.visibility === 'public' ? '公开' : '私密',
                format(new Date(note.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
              ]}
              // 因为小记标题可能有一行可能有多行，如果一排有多行的有单行的，就会导出actionText的不统一在一条直线，所以定制一下内部的布局方式使用flex 上下 然后between
              className="flex flex-col justify-between"
            />
          ))}

          {getCurrentNotes()?.length === 0 && (
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
      </div>
    </div>
  )
}