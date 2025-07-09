'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import { UploadImage } from '@/components/Editor/extensions/uploadImage'
import './editor.css'
import { Toolbar } from '@/components/Editor/Toolbar'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Link } from '@tiptap/extension-link'
import { FontSize } from '@/components/Editor/extensions/fontSize'
import { BackgroundColor } from '@/components/Editor/extensions/backgroundColor'
import { api } from '@/lib/api-client'
import { Note } from '@/types/note'
import { TemplateNoteId } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { message } from 'antd'

const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('javascript', js)
lowlight.register('typescript', ts)
lowlight.register('ts', ts)

// 保存状态
type SaveStatus = 'default' | 'saved' | 'saving' | 'error' | 'waitingSaved'

export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState<Note>({
    _id: '',
    title: '',
    content: '',
    visibility: 'private',
    createdAt: '',
    updatedAt: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('default')
  const contentRef = useRef<string>('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { isAuthenticated } = useAuth()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // 禁用默认的 codeBlock，使用 CodeBlockLowlight 代替
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'relative group not-prose bg-gray-900 rounded-md my-4',
        },
      }),
      Placeholder.configure({
        placeholder: '开始写作...',
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      UploadImage.configure({
        onUploadStart: () => {},
        onUploadSuccess: url => {
          if (editor) {
            const content = editor.getHTML()
            contentRef.current = content
          }
        },
        onUploadError: error => {},
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        transformPastedText: true,
        transformCopiedText: false,
        breaks: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class:
            'cursor-pointer text-blue-500 hover:text-blue-600 hover:underline',
        },
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      BackgroundColor.configure({
        types: ['textStyle'],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert focus:outline-none max-w-none [&_pre]:!bg-gray-900 [&_pre]:!p-4 [&_pre]:!rounded-md [&_pre]:!m-0',
      },
      handleKeyDown: (view, event) => {
        // 代码块删除逻辑保持不变
        if (
          (event.key === 'Delete' || event.key === 'Backspace') &&
          editor?.isActive('codeBlock')
        ) {
          const { empty, $head } = view.state.selection
          if (!empty) return false

          const isAtEnd = $head.parentOffset === $head.parent.nodeSize - 2
          const isAtStart = $head.parentOffset === 0

          if (
            (event.key === 'Backspace' && isAtStart) ||
            (event.key === 'Delete' && isAtEnd)
          ) {
            event.preventDefault()
            editor
              .chain()
              .focus()
              .command(({ tr, dispatch }) => {
                if (dispatch) {
                  const nodePos = $head.before()
                  tr.delete(nodePos, nodePos + $head.parent.nodeSize)
                  dispatch(tr)
                }
                return true
              })
              .run()
            return true
          }
        }
        return false
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // 获取 Markdown 格式的内容而不是 HTML
      const content = editor.storage.markdown.getMarkdown()
      contentRef.current = content
      setSaveStatus('waitingSaved')
    },
  })

  // 保存到服务器
  const saveToServer = async () => {
    if (!note) return

    try {
      setSaveStatus('saving')
      const response = await api.patch<Note>(`/notes/${params.id}`, {
        content: contentRef.current,
        title: note.title,
      })
      setNote((response.data || {}) as Note)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save note:', error)
      setSaveStatus('error')
    }
  }

  const fetchNote = async () => {
    try {
      const response = await api.get<Note>(`/notes/${params.id}`, {
        requireAuth: params.id !== TemplateNoteId,
      })
      const data = response.data
      if (data) {
        setNote(data)
        contentRef.current = data.content
      }
    } catch (error) {
      console.error('Failed to fetch note:', error)
      router.push('/notes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setNote({ ...note, title: newTitle })
    setSaveStatus('waitingSaved')
  }

  const handleDelete = async () => {
    // 调用删除 API
    const response = await api.delete(`/notes/${params.id}`)
    if (response.success) {
      message.success('删除成功，正在跳转至列表页...')
      router.push('/notes') // 跳转到列表页
    }
    return response
  }

  useEffect(() => {
    if (!!params.id) {
      fetchNote()
    }
  }, [params.id])

  // 添加编辑器内容初始化逻辑
  useEffect(() => {
    if (note?.content && editor && !editor.isDestroyed) {
      editor.commands.setContent(note.content)
      contentRef.current = note.content
    }
  }, [note, editor])

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 rounded-lg">
      <div className="max-w-4xl mx-auto p-8 mt-14">
        <div className="mb-10">
          <input
            ref={titleInputRef}
            type="text"
            value={note?.title || ''}
            onChange={handleTitleChange}
            placeholder="请输入标题"
            className="title-input w-full text-[2.5rem] font-bold bg-transparent border-none outline-none 
              placeholder-gray-400/60 dark:placeholder-gray-500/60 
              text-gray-900 dark:text-white
              transition-all duration-200 ease-out
              focus:ring-0 focus:outline-none
              leading-[1.2]"
          />
        </div>
        <div className="relative">
          <Toolbar
            editor={editor}
            onSave={
              note._id === TemplateNoteId && !isAuthenticated
                ? undefined
                : saveToServer
            }
            saveStatus={saveStatus}
            isPublic={note.visibility === 'public'}
            isTop={!!note.isTop}
            onNoteChange={async (isPublic, isTop) => {
              // 调用保存接口更新对应权限字段
              const response = await api.patch<Note>(`/notes/${params.id}`, {
                title: note.title,
                content: note.content,
                visibility: isPublic !== undefined
                  ? isPublic
                    ? 'public'
                    : 'private'
                  : undefined,
                isTop: isTop !== undefined ? isTop : undefined,
              })
              if (response.success) {
                setNote((response.data || {}) as Note)
              }
            }}
            onDelete={handleDelete}
            noteId={params.id}
          />
          <EditorContent editor={editor} className="min-h-[500px]" />
        </div>
      </div>
    </div>
  )
}