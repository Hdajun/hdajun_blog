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
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Highlight, themes } from 'prism-react-renderer'
import { Dropdown } from '@/app/questions/create/CreateQuestionClient'
import { Modal } from 'antd'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { message } from 'antd'
import { useInView } from 'react-intersection-observer'

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/10',
  medium: 'bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/10',
  hard: 'bg-rose-50/50 text-rose-600 border-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/10',
}

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/10',
  backend: 'bg-purple-50/50 text-purple-600 border-purple-100 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-400/10',
  algorithm: 'bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/10',
  database: 'bg-teal-50/50 text-teal-600 border-teal-100 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/10',
  system: 'bg-orange-50/50 text-orange-600 border-orange-100 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-400/10',
  other: 'bg-gray-50/50 text-gray-600 border-gray-100 dark:bg-gray-400/10 dark:text-gray-300 dark:border-gray-400/10',
}

interface ApiResponse {
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
  // 处理单个反引号包裹的内容：内容加粗，但不处理代码块的三个反引号
  let processedContent = content.replace(/(?<!`)`([^`]+)`(?!`)/g, ' **$1** ')

  // 如果内容已经包含 Markdown 语法，直接返回
  const markdownIndicators = [
    /^#+ /m, // 标题
    /^\* /m, // 无序列表
    /^\d+\. /m, // 有序列表
    /^```/m, // 代码块
    /^\- /m, // 列表项
    /^> /m, // 引用
    /^\|.*\|/m, // 表格
  ]

  const hasMarkdownSyntax = markdownIndicators.some(indicator =>
    indicator.test(processedContent)
  )

  if (hasMarkdownSyntax) {
    return processedContent
  }

  // 更严格的代码检测规则
  const codePatterns = [
    // 函数声明或箭头函数
    /function\s+\w+\s*\([^)]*\)\s*{/,
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>/,
    // 类声明
    /class\s+\w+(\s+extends\s+\w+)?\s*{/,
    // import/export 语句
    /^import\s+.*from\s+['"][^'"]+['"];?$/m,
    /^export\s+/m,
    // 变量声明（带有典型的编程结构）
    /(const|let|var)\s+\w+\s*=\s*(\{|\[|new\s+|function)/,
    // 典型的编程语言控制结构
    /(if|for|while|switch)\s*\([^)]*\)\s*{/,
    // JSX/TSX 语法
    /<\w+(\s+\w+="[^"]*")*\s*>/,
    // 多行的缩进代码结构
    /^(\s{2,}|\t+)\w+.*\n(\s{2,}|\t+)/m
  ]

  // 检查是否包含明确的代码模式
  const containsCodePattern = codePatterns.some(pattern => pattern.test(processedContent))
  
  // 检查是否包含多行代码结构（通过缩进或大括号判断）
  const hasCodeStructure = /\{[^\}]*\n[^\}]*\}/.test(processedContent) || 
                          /^(\s{2,}|\t+)\w+.*\n(\s{2,}|\t+)/m.test(processedContent)

  // 只有当内容明确符合代码模式时才包装为代码块
  if (containsCodePattern || hasCodeStructure) {
    // 尝试检测语言
    let language = 'javascript'
    if (processedContent.includes('interface ') || processedContent.includes(': ')) {
      language = 'typescript'
    } else if (processedContent.includes('<template>') || processedContent.includes('</template>')) {
      language = 'vue'
    } else if (processedContent.includes('<?php')) {
      language = 'php'
    }
    return '```' + language + '\n' + processedContent + '\n```'
  }

  return processedContent
}

export default function QuestionList() {
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
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  // 无限滚动相关状态
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const PAGE_SIZE = 10

  // 创建一个观察器，用于检测加载更多的触发元素是否可见
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    // 提前 300px 触发加载
    rootMargin: '300px 0px',
  })

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return

    try {
      setLoadingMore(true)
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
      queryParams.append('page', page.toString())
      queryParams.append('pageSize', PAGE_SIZE.toString())

      const { success, data } = await api.get<ApiResponse>(`/questions?${queryParams.toString()}`, {
        requireAuth: false,
      })

      if (success && Array.isArray(data)) {
        setQuestions(prev => [...prev, ...data])
        setHasMore(data.length === PAGE_SIZE)
        setPage(prev => prev + 1)
      }
    } catch (error) {
      message.error('加载更多题目失败')
    } finally {
      setLoadingMore(false)
    }
  }, [selectedDifficulty, selectedCategory, actualSearchTerm, page, hasMore, loadingMore])

  // 初始加载
  const fetchInitialQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setPage(1)
      setHasMore(true)
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
      queryParams.append('page', '1')
      queryParams.append('pageSize', PAGE_SIZE.toString())

      const { success, data } = await api.get<ApiResponse>(`/questions?${queryParams.toString()}`, {
        requireAuth: false,
      })

      if (success && Array.isArray(data)) {
        setQuestions(data)
        setHasMore(data.length === PAGE_SIZE)
        setPage(2)
      } else {
        setQuestions([])
        setHasMore(false)
      }
    } catch (error) {
      message.error('获取题目列表失败')
      setQuestions([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [selectedDifficulty, selectedCategory, actualSearchTerm])

  // 监听筛选条件变化，重新加载数据
  useEffect(() => {
    fetchInitialQuestions()
  }, [fetchInitialQuestions])

  // 监听滚动触发加载更多
  useEffect(() => {
    if (inView) {
      loadMore()
    }
  }, [inView, loadMore])

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
            const { success, message: responseMessage } = await api.delete(`/questions?id=${questionId}`)

            if (success) {
              // 从本地状态中移除已删除的题目
              setQuestions(prev =>
                prev.filter(q => q._id?.toString() !== questionId)
              )
              // 如果题目处于展开状态，也要从展开状态中移除
              setExpandedQuestionId(null)
              message.success({
                content: '题目已成功删除',
                className: 'custom-message',
                style: {
                  marginTop: '4vh',
                }
              })
            } else {
              throw new Error(responseMessage || '删除失败')
            }
          } catch (error) {
            console.error('删除题目失败:', error)
          } finally {
            setDeletingId(null)
          }
        },
      })
    },
    []
  )

  const toggleQuestion = useCallback((questionId: string) => {
    setExpandedQuestionId(prevId => prevId === questionId ? null : questionId)
  }, [])

  const inputStyles = `w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm
    transition-all duration-300 ease-out placeholder:text-gray-400
    hover:border-[rgb(31,41,55)] hover:bg-gray-100/50
    focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
    focus:shadow-[0_0_0_1px_rgb(55,65,81),0_0_0_2px_rgb(31,41,55)] focus:-translate-y-[1px]
    dark:border-gray-700 dark:bg-transparent dark:text-white dark:placeholder:text-gray-400
    dark:hover:border-[rgb(31,41,55)] dark:hover:bg-gray-700/50
    dark:focus:bg-gray-800`

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(31,41,55)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* 筛选器区域 - 固定在顶部 */}
      <div className="sticky top-0 z-50 pb-4 pt-2">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 
          shadow-[0_8px_30px_rgb(0,0,0,0.04),0_4px_12px_rgb(0,0,0,0.02),inset_0_0_0_1px_rgb(255,255,255,0.04)] 
          dark:shadow-[0_8px_30px_rgb(0,0,0,0.1),0_4px_12px_rgb(0,0,0,0.04),inset_0_0_0_1px_rgb(255,255,255,0.04)] 
          ring-1 ring-black/[0.03] dark:ring-white/[0.03] 
          border border-gray-200/30 dark:border-gray-700/30 
          max-w-[1200px] mx-auto 
          hover:shadow-[0_8px_35px_rgb(0,0,0,0.06),0_4px_15px_rgb(0,0,0,0.03),inset_0_0_0_1px_rgb(255,255,255,0.06)] 
          dark:hover:shadow-[0_8px_35px_rgb(0,0,0,0.12),0_4px_15px_rgb(0,0,0,0.06),inset_0_0_0_1px_rgb(255,255,255,0.06)]
          transition-all duration-300">
          {/* 移动端折叠按钮 */}
          <button
            className="w-full flex items-center justify-between sm:hidden mb-4 text-sm text-gray-600 dark:text-gray-300"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <span>筛选条件</span>
            <ChevronDownIcon 
              className={`w-5 h-5 transition-transform duration-200 ${isFilterExpanded ? 'transform rotate-180' : ''}`}
            />
          </button>

          <div className={`${isFilterExpanded ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row flex-1 gap-4">
                {/* 分类选择 */}
                <div className="w-full sm:w-48">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                    分类
                  </label>
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
                              ? 'font-medium text-[rgb(31,41,55)]'
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
                <div className="w-full sm:w-36">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                    难度
                  </label>
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
              <div className="w-full sm:w-72">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  搜索
                </label>
                <div className="relative group">
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
                    className="w-full rounded-xl border border-gray-200 bg-white/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm
                      transition-all duration-300 ease-out placeholder:text-gray-400
                      hover:border-[rgb(31,41,55)] hover:bg-white dark:hover:bg-gray-900
                      focus:border-transparent focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-0
                      focus:shadow-[0_0_0_1px_rgb(55,65,81),0_0_0_2px_rgb(31,41,55)] focus:-translate-y-[1px]
                      dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500
                      dark:hover:border-[rgb(31,41,55)]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setActualSearchTerm('')
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setActualSearchTerm(searchQuery)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 题目列表 - 添加上边距以避免被固定筛选器遮挡 */}
      <div className="max-w-[1200px] mx-auto mt-4">
        <div className="space-y-6">
          {Array.isArray(questions) && questions.map(question => (
            <div
              key={question._id?.toString()}
              className="group bg-white/90 dark:bg-gray-800/90 rounded-2xl 
                shadow-[0_2px_8px_rgb(0,0,0,0.02),0_1px_4px_rgb(0,0,0,0.01)] 
                dark:shadow-[0_2px_8px_rgb(0,0,0,0.04),0_1px_4px_rgb(0,0,0,0.02)] 
                hover:shadow-[0_4px_12px_rgb(0,0,0,0.03),0_2px_6px_rgb(0,0,0,0.02)] 
                dark:hover:shadow-[0_4px_12px_rgb(0,0,0,0.06),0_2px_6px_rgb(0,0,0,0.04)]
                transition-all duration-300 ease-out 
                overflow-hidden border border-gray-200/50 dark:border-gray-700/50 
                hover:border-gray-300/50 dark:hover:border-gray-600/50
                hover:translate-y-[-1px]"
            >
              <div
                className="px-6 py-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                onClick={() => toggleQuestion(question._id?.toString() || '')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors mb-2 sm:mb-0">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${
                          categoryColors[question.category] || categoryColors.other
                        }`}>
                          {questionCategories.find(
                            cat => cat.value === question.category
                          )?.label || question.category}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${
                            difficultyColors[question.difficulty.toLowerCase()]
                          }`}
                        >
                          {difficulties.find(
                            diff => diff.value === question.difficulty
                          )?.label || question.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {question.content || '暂无描述'}
                    </div>
                  </div>
                  <button
                    className="text-gray-400 dark:text-gray-500 group-hover:text-[rgb(31,41,55)] transition-colors duration-150 ml-4 flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    aria-expanded={expandedQuestionId === question._id?.toString()}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 ${
                        expandedQuestionId === question._id?.toString() ? 'rotate-180' : ''
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
                  expandedQuestionId === question._id?.toString() ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                }`}
              >
                {expandedQuestionId === question._id?.toString() && (
                  <div className="px-6 py-5 bg-gray-50/50 dark:bg-gray-700/20 border-t border-gray-100/70 dark:border-gray-600/30 backdrop-blur-sm">
                    <div className="prose max-w-none">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 flex items-center m-0">
                          答案
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              handleDelete(question._id?.toString() || '', question.title)
                            }
                            disabled={deletingId === question._id?.toString()}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-700/50"
                            title="删除题目"
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {deletingId === question._id?.toString()
                                ? '删除中...'
                                : '删除'}
                            </span>
                          </button>
                          <Link
                            href={`/questions/edit/${question._id?.toString()}`}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-700/50"
                            title="编辑题目"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">编辑</span>
                          </Link>
                          <button
                            onClick={() =>
                              handleCopy(
                                question.answer,
                                question._id?.toString() || ''
                              )
                            }
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-700/50"
                          >
                            {copiedId === question._id?.toString() ? (
                              <>
                                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">已复制</span>
                              </>
                            ) : (
                              <>
                                <ClipboardDocumentIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">复制答案</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/30 rounded-xl border border-gray-200/30 dark:border-gray-600/30 backdrop-blur-sm">
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
          ))}

          {/* 加载更多触发器 */}
          {!loading && Array.isArray(questions) && questions.length > 0 && (
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {loadingMore ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(31,41,55)]"></div>
              ) : hasMore ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">向下滚动加载更多</div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">已经到底啦 ~</div>
              )}
            </div>
          )}

          {/* 空状态 */}
          {!loading && (!Array.isArray(questions) || questions.length === 0) && (
            <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <svg
                className="mx-auto h-12 w-12 text-gray-400/80 dark:text-gray-500/80"
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
              <p className="mt-4 text-gray-500/90 dark:text-gray-400/90">
                还没有添加任何题目，现在就去创建一个吧！
              </p>
              <div className="mt-6">
                <Link
                  href="/questions/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(31,41,55)] transition-all duration-200 ease-out transform hover:-translate-y-0.5"
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