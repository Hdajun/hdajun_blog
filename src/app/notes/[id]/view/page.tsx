'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Note } from '@/types/note'
import { format } from 'date-fns'
import { api } from '@/lib/api-client'

export default function NoteViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchNote = async () => {
    try {
      const response = await api.get<Note>(`/notes/${params.id}`)
      setNote(response.data || null)
    } catch (error) {
      console.error('Failed to fetch note:', error)
      router.push('/notes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNote()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {note.title}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            最后更新于 {format(new Date(note.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
          </div>
        </div>
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </div>
    </div>
  )
}