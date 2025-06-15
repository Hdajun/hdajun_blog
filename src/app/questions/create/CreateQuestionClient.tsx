'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { questionCategories, difficulties } from '@/config/questions'

// 自定义下拉菜单组件
interface DropdownProps<T> {
  value: string
  options: T[]
  onChange: (value: string | null) => void
  getLabel: (option: T) => string
  getValue: (option: T) => string
  renderOption?: (option: T, isSelected: boolean) => React.ReactNode
  placeholder?: string
  className?: string
  allowClear?: boolean
}

export function Dropdown<T>({
  value,
  options,
  onChange,
  getLabel,
  getValue,
  renderOption,
  placeholder,
  className = '',
  allowClear = true,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(option => getValue(option) === value)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-full rounded-xl border border-gray-200 bg-transparent pl-4 pr-10 py-3 text-left text-sm
            transition-all duration-300 ease-out
            hover:border-[#818cf8] hover:bg-gray-100/50
            focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
            focus:shadow-[0_0_0_1px_#818cf8,0_0_0_2px_#a78bfa] focus:-translate-y-[1px]
            dark:border-gray-700 dark:bg-transparent dark:text-white
            dark:hover:border-[#818cf8] dark:hover:bg-gray-700/50
            dark:focus:bg-gray-800 ${className}`}
        >
          <span className="block truncate">
            {selectedOption ? getLabel(selectedOption) : placeholder}
          </span>
        </button>
        {allowClear && selectedOption ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-1 w-full max-h-[280px] overflow-y-auto rounded-xl bg-white px-2 py-2 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {options.map(option => {
              const optionValue = getValue(option)
              const isSelected = value === optionValue

              return (
                <button
                  key={optionValue}
                  type="button"
                  className={`relative w-full cursor-pointer select-none py-2.5 pl-10 pr-4 text-left rounded-lg transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#a78bfa]/10 text-[#a78bfa]'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-[#a78bfa]/5 hover:text-[#a78bfa]'
                  }`}
                  onClick={() => {
                    onChange(optionValue)
                    setIsOpen(false)
                  }}
                >
                  {renderOption ? (
                    renderOption(option, isSelected)
                  ) : (
                    <>
                      <span
                        className={`block truncate ${
                          isSelected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {getLabel(option)}
                      </span>
                      {isSelected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#a78bfa]">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CreateQuestionClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    answer: '',
    category: questionCategories[2].value,
    difficulty: difficulties[0].value,
  })

  const [touched, setTouched] = useState({
    title: false,
    content: false,
    answer: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 提交前标记所有字段为已触碰
    setTouched({
      title: true,
      content: true,
      answer: true,
    })

    // 验证所有必填字段
    if (!formData.title || !formData.answer) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          answer: formData.answer,
          category: formData.category,
          difficulty: formData.difficulty,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 重置表单
        setFormData({
          title: '',
          content: '',
          answer: '',
          category: questionCategories[0].value,
          difficulty: difficulties[0].value,
        })

        // 重置触碰状态
        setTouched({
          title: false,
          content: false,
          answer: false,
        })

        // 显示成功提示
        setShowSuccess(true)

        // 3秒后跳转到题库列表
        setTimeout(() => {
          router.push('/questions/practice')
        }, 3000)
      } else {
        throw new Error(result.msg || '创建失败')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert(error instanceof Error ? error.message : '创建题目失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }))
  }

  const getFieldError = (field: keyof typeof touched) => {
    if (touched[field] && !formData[field]) {
      return '此字段不能为空'
    }
    return ''
  }

  const inputStyles = `w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm
    transition-all duration-300 ease-out placeholder:text-gray-400
    hover:border-[#818cf8] hover:bg-gray-100/50
    focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
    focus:shadow-[0_0_0_1px_#818cf8,0_0_0_2px_#a78bfa] focus:-translate-y-[1px]
    dark:border-gray-700 dark:bg-transparent dark:text-white dark:placeholder:text-gray-400
    dark:hover:border-[#818cf8] dark:hover:bg-gray-700/50
    dark:focus:bg-gray-800`

  const labelStyles =
    'flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2'
  const requiredStyles = 'ml-1 text-[#a78bfa] text-sm font-normal'
  const errorStyles = 'mt-1.5 text-sm text-red-500 dark:text-red-400'

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-8">
            <Link
              href="/questions"
              className="mr-4 p-1 text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              添加新题目
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 标题 */}
            <div>
              <label htmlFor="title" className={labelStyles}>
                标题
                <span className={requiredStyles}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                className={`${inputStyles} ${
                  touched.title && !formData.title
                    ? 'border-red-500 dark:border-red-500 hover:border-red-500 dark:hover:border-red-500'
                    : ''
                }`}
                placeholder="请输入题目标题..."
              />
              {getFieldError('title') && (
                <p className={errorStyles}>{getFieldError('title')}</p>
              )}
            </div>

            {/* 题目内容 */}
            <div>
              <label htmlFor="content" className={labelStyles}>
                题目内容
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                onBlur={() => handleBlur('content')}
                rows={6}
                className={inputStyles}
                placeholder="请输入题目内容（选填）..."
              />
            </div>

            {/* 答案 */}
            <div>
              <label htmlFor="answer" className={labelStyles}>
                答案
                <span className={requiredStyles}>*</span>
              </label>
              <textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                onBlur={() => handleBlur('answer')}
                rows={6}
                className={`${inputStyles} ${
                  touched.answer && !formData.answer
                    ? 'border-red-500 dark:border-red-500 hover:border-red-500 dark:hover:border-red-500'
                    : ''
                }`}
                placeholder="请输入答案..."
              />
              {getFieldError('answer') && (
                <p className={errorStyles}>{getFieldError('answer')}</p>
              )}
            </div>

            {/* 分类和难度 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelStyles}>
                  分类
                  <span className={requiredStyles}>*</span>
                </label>
                <Dropdown
                  value={formData.category}
                  options={questionCategories}
                  onChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      category: value || questionCategories[0].value,
                    }))
                  }
                  getLabel={option => option.label}
                  getValue={option => option.value}
                  allowClear={false}
                  renderOption={(option, isSelected) => (
                    <>
                      <span
                        className={`block truncate ${
                          isSelected
                            ? 'font-medium text-[#a78bfa]'
                            : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {option.description && (
                        <span
                          className={`block truncate text-xs mt-0.5 ${
                            isSelected
                              ? 'text-[#a78bfa]/70'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>

              <div>
                <label className={labelStyles}>
                  难度
                  <span className={requiredStyles}>*</span>
                </label>
                <Dropdown
                  value={formData.difficulty}
                  options={difficulties}
                  onChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      difficulty: value || difficulties[0].value,
                    }))
                  }
                  getLabel={option => option.label}
                  getValue={option => option.value}
                  allowClear={false}
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

            {/* 提交按钮 */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-3 px-6 bg-[#818cf8] text-white rounded-xl 
                  transition-all duration-300 ease-out
                  hover:bg-[#635bff]
                  focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:ring-offset-2 
                  text-base font-medium
                  group
                  transform hover:-translate-y-[2px] hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      保存中...
                    </>
                  ) : (
                    <>
                      保存题目
                      <svg
                        className="w-5 h-5 ml-2 -mr-1 transition-transform duration-300 ease-out group-hover:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* 成功提示 */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#818cf8] to-[#a78bfa] text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 z-50"
            >
              <CheckIcon className="w-5 h-5" />
              <span className="font-medium">
                题目创建成功！即将跳转题目列表...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}