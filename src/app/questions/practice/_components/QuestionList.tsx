'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question } from '@/types/question'
import { questionCategories, difficulties } from '@/config/questions'
import {
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Highlight, themes } from 'prism-react-renderer'
import { Dropdown } from '@/app/questions/create/CreateQuestionClient'
import { ConfigProvider, Modal } from 'antd'
import Link from 'next/link'

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100',
  hard: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100',
}

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100',
  backend: 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100',
  algorithm: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100',
  database: 'bg-teal-50 text-teal-700 border-teal-200 shadow-teal-100',
  system: 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100',
  other: 'bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100',
}

interface FetchQuestionsResponse {
  success: boolean
  msg: string
  data: Question[]
}

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

// 添加代码检测和格式化函数
const formatCodeContent = (content: string) => {
  // 如果内容已经包含 Markdown 语法（标题、列表、代码块等），直接返回
  const markdownIndicators = [
    /^#+ /m, // 标题
    /^\* /m, // 无序列表
    /^\d+\. /m, // 有序列表
    /^```/m, // 代码块
    /^\- /m, // 列表项
    /^> /m, // 引用
  ]

  const hasMarkdownSyntax = markdownIndicators.some(indicator =>
    indicator.test(content)
  )

  // 如果已经包含 Markdown 语法，直接返回原内容
  if (hasMarkdownSyntax) {
    return content
  }

  // 检测是否可能是纯代码（包含特定关键字、符号等）
  const codeIndicators = [
    'function',
    '=>',
    'const',
    'let',
    'var',
    'return',
    'import',
    'export',
    'class',
    'if',
    'for',
    'while',
    'try',
    'catch',
    'async',
    'await',
  ]

  const hasCodeIndicators = codeIndicators.some(indicator =>
    content.includes(indicator)
  )
  const hasJSSymbols = /[{}\[\]()=>;]/.test(content)

  // 只有当内容看起来像纯代码且不包含 Markdown 语法时才包装
  if (hasCodeIndicators && hasJSSymbols && !content.trim().startsWith('```')) {
    // 检测内容是否已经被```包裹
    if (!/^```[\s\S]*```$/.test(content.trim())) {
      // 自动判断语言（这里默认为javascript）
      return '```javascript\n' + content + '\n```'
    }
  }
  return content
}

const QuestionList = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    (typeof difficulties)[0] | null
  >(null)
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof questionCategories)[0] | null
  >(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [actualSearchTerm, setActualSearchTerm] = useState('')
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 使用useCallback包装handleCopy函数
  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, []) // 空依赖数组，因为这个函数不依赖任何props或state

  // 删除题目函数
  const handleDelete = useCallback(
    async (questionId: string, questionTitle: string) => {
      Modal.confirm({
        title: '您确定要删除这道题目吗？',
        content: (
          <div>
            <p className="mt-2">
              题目：<span className="font-medium">{questionTitle}</span>
            </p>
            <p className="mt-3">此操作不可撤销，请谨慎操作</p>
          </div>
        ),
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: async () => {
          try {
            setDeletingId(questionId)
            const response = await fetch(`/api/questions?id=${questionId}`, {
              method: 'DELETE',
            })

            const data = await response.json()

            if (data.success) {
              // 从本地状态中移除已删除的题目
              setQuestions(prev =>
                prev.filter(q => q._id?.toString() !== questionId)
              )
              // 如果题目处于展开状态，也要从展开状态中移除
              setExpandedQuestions(prev => {
                const newSet = new Set(prev)
                newSet.delete(questionId)
                return newSet
              })
              Modal.success({
                title: '删除成功',
                content: '题目已成功删除',
              })
            } else {
              throw new Error(data.msg || '删除失败')
            }
          } catch (error) {
            console.error('删除题目失败:', error)
            Modal.error({
              title: '删除失败',
              content:
                error instanceof Error
                  ? error.message
                  : '删除题目时发生错误，请稍后重试',
            })
          } finally {
            setDeletingId(null)
          }
        },
      })
    },
    []
  )

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (selectedDifficulty) {
        queryParams.append('difficulty', selectedDifficulty.value)
      }
      if (selectedCategory) {
        queryParams.append('category', selectedCategory.value)
      }
      if (actualSearchTerm) {
        queryParams.append('search', actualSearchTerm)
      }

      const response = await fetch(`/api/questions?${queryParams.toString()}`)
      const data: FetchQuestionsResponse = await response.json()

      if (data.success) {
        setQuestions(data.data)
      } else {
        console.error('Failed to fetch questions:', data.msg)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDifficulty, selectedCategory, actualSearchTerm])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const toggleQuestion = useCallback((questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }, [])

  const inputStyles = `w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm
    transition-all duration-300 ease-out placeholder:text-gray-400
    hover:border-[#818cf8] hover:bg-gray-100/50
    focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
    focus:shadow-[0_0_0_1px_#818cf8,0_0_0_2px_#a78bfa] focus:-translate-y-[1px]
    dark:border-gray-700 dark:bg-transparent dark:text-white dark:placeholder:text-gray-400
    dark:hover:border-[#818cf8] dark:hover:bg-gray-700/50
    dark:focus:bg-gray-800`

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* 筛选器区域 - 固定在顶部 */}
      <div className="sticky top-0 z-50 pb-4">
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex-1 flex gap-4">
              {/* 分类选择 */}
              <div className="w-48">
                <Dropdown
                  value={selectedCategory?.value || ''}
                  options={questionCategories}
                  onChange={value => {
                    const category = value
                      ? questionCategories.find(cat => cat.value === value) ||
                        null
                      : null
                    setSelectedCategory(category)
                  }}
                  getLabel={option => option.label}
                  getValue={option => option.value}
                  placeholder="选择分类"
                  renderOption={(option, isSelected) => (
                    <>
                      <span
                        className={`block truncate ${
                          isSelected
                            ? 'font-medium text-[#818cf8]'
                            : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                />
              </div>

              {/* 难度选择 */}
              <div className="w-36">
                <Dropdown
                  value={selectedDifficulty?.value || ''}
                  options={difficulties}
                  onChange={value => {
                    const difficulty = value
                      ? difficulties.find(diff => diff.value === value) || null
                      : null
                    setSelectedDifficulty(difficulty)
                  }}
                  getLabel={option => option.label}
                  getValue={option => option.value}
                  placeholder="选择难度"
                  renderOption={(option, isSelected) => (
                    <span
                      className={`flex items-center ${
                        isSelected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </span>
                  )}
                />
              </div>
            </div>

            {/* 搜索框 */}
            <div className="w-64 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setActualSearchTerm(searchQuery)
                  }
                }}
                placeholder="输入题目名称回车触发搜索"
                className={inputStyles}
              />
              <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 题目列表 - 添加上边距以避免被固定筛选器遮挡 */}
      <div className="max-w-[1200px] mx-auto mt-4">
        <div className="space-y-6">
          {questions.map(question => {
            const isExpanded = expandedQuestions.has(
              question._id?.toString() || ''
            )
            return (
              <div
                key={question._id?.toString()}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <div
                  className="px-6 py-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  onClick={() => toggleQuestion(question._id?.toString() || '')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-[#818cf8] transition-colors">
                          {question.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${
                            categoryColors[question.category] || categoryColors.other
                          }`}>
                            {questionCategories.find(
                              cat => cat.value === question.category
                            )?.label || question.category}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${
                              difficultyColors[question.difficulty.toLowerCase()]
                            }`}
                          >
                            {difficulties.find(
                              diff => diff.value === question.difficulty
                            )?.label || question.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {question.content || '暂无描述'}
                      </div>
                    </div>
                    <button
                      className="text-gray-400 dark:text-gray-500 group-hover:text-[#818cf8] transition-colors duration-150 ml-4 flex-shrink-0"
                      aria-expanded={isExpanded}
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 展开的答案区域 */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                  }`}
                >
                  {isExpanded && (
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600">
                      <div className="prose max-w-none">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 flex items-center m-0">
                            答案
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleDelete(
                                  question._id?.toString() || '',
                                  question.title
                                )
                              }
                              disabled={deletingId === question._id?.toString()}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="删除题目"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>
                                {deletingId === question._id?.toString()
                                  ? '删除中...'
                                  : '删除'}
                              </span>
                            </button>
                            <Link
                              href={`/questions/edit/${question._id?.toString()}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              title="编辑题目"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              <span>编辑</span>
                            </Link>
                            <button
                              onClick={() =>
                                handleCopy(
                                  question.answer,
                                  question._id?.toString() || ''
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                              {copiedId === question._id?.toString() ? (
                                <>
                                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                  <span>已复制</span>
                                </>
                              ) : (
                                <>
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                  <span>复制答案</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="prose-pre:mt-0 prose-pre:mb-0 prose-p:mt-0 prose-p:mb-4 prose-p:last:mb-0 p-5">
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
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
                                        <button
                                          onClick={() =>
                                            handleCopy(
                                              String(children),
                                              `${question._id}-code`
                                            )
                                          }
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 text-xs font-medium text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-md flex items-center gap-1"
                                        >
                                          {copiedId === `${question._id}-code` ? (
                                            <>
                                              <ClipboardDocumentCheckIcon className="w-3 h-3" />
                                              已复制
                                            </>
                                          ) : (
                                            <>
                                              <ClipboardDocumentIcon className="w-3 h-3" />
                                              复制代码
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )
                                  },
                                }}
                              >
                                {formatCodeContent(question.answer)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {questions.length === 0 && (
            <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                还没有添加任何题目，现在就去创建一个吧！
              </p>
              <div className="mt-6">
                <Link
                  href="/questions/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#818cf8] hover:bg-[#635bff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#818cf8] transition-all duration-200 ease-out transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  创建新题目
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionList
