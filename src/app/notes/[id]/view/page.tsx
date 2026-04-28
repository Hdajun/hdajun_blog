'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Note } from '@/types/note'
import { format } from 'date-fns'
import { api } from '@/lib/api-client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { Highlight, themes } from 'prism-react-renderer'
import { TableOfContents } from '@/components/Editor/TableOfContents'
import { useDomHeadings } from '@/hooks/useTocHeadings'
import { useScrollSpy } from '@/hooks/useScrollSpy'

// 添加代码块渲染器
const CodeBlock = ({
  children,
  className,
}: {
  children: string
  className?: string
}) => {
  // 从className中提取语言
  const language = className ? className.replace('language-', '') : ''

  return (
    <Highlight
      theme={themes.nightOwl}
      code={children.trim()}
      language={language || 'typescript'}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} rounded-lg p-4 overflow-auto`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

export default function NoteViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  const headings = useDomHeadings(contentRef)
  const headingIds = headings.map(h => h.id).filter(Boolean)
  const observerActiveId = useScrollSpy(headingIds)
  const [manualActiveId, setManualActiveId] = useState<string | null>(null)
  const manualTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const activeId = manualActiveId ?? observerActiveId

  const handleHeadingClick = useCallback((id: string) => {
    setManualActiveId(id)
    clearTimeout(manualTimerRef.current)
    manualTimerRef.current = setTimeout(() => setManualActiveId(null), 800)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

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
    if (!!params.id) {
      fetchNote()
    }
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {note.title}
              </h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                最后更新于 {format(new Date(note.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
              </div>
            </div>
            <div ref={contentRef} className="prose dark:prose-invert max-w-none [&_[id]]:scroll-mt-[100px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  code({
                    inline,
                    className,
                    children,
                    ...props
                  }: any) {
                    if (inline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100"
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    }

                    return (
                      <div className="relative group">
                        <CodeBlock className={className}>
                          {String(children)}
                        </CodeBlock>
                      </div>
                    )
                  },
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          </div>
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-6">
              <TableOfContents
                headings={headings}
                activeId={activeId}
                onHeadingClick={handleHeadingClick}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}