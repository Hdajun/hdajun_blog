'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { LoginCredentials, AuthResponse } from '@/types/auth'
import { message } from 'antd'
import { api } from '@/lib/api-client'

interface LoginResponse {
  token: string
}

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (token: string) => void
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const initialCredentials: LoginCredentials = {
    username: '',
    password: ''
  }
  
  const [credentials, setCredentials] = useState<LoginCredentials>(initialCredentials)
  const [isLoading, setIsLoading] = useState(false)

  // 重置表单状态
  const resetForm = () => {
    setCredentials(initialCredentials)
  }

  // 处理模态框关闭
  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { success, data, message: responseMessage } = await api.post<AuthResponse>('/auth/login', credentials, { requireAuth: false })
      console.log(success,data, responseMessage);
      
      if (success && data?.token) {
        onLoginSuccess(data.token)
        resetForm()
        handleClose()
        // 显示欢迎消息
        message.success({
          content: responseMessage || '登录成功',
          className: 'custom-message',
          duration: 3,
          style: {
            marginTop: '4vh',
          },
        })
      } 
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-white/80 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md dark:bg-gray-800/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              className="absolute right-6 top-6 z-10 rounded-xl p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="relative">
              <h2 className="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-200">
                欢迎回来
              </h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                请登录您的账号以继续操作
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      账号
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm
                        transition-all duration-300 ease-out placeholder:text-gray-400
                        hover:border-gray-800 hover:bg-white
                        focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
                        focus:shadow-[0_0_0_1px_rgb(31,41,55),0_0_0_2px_rgb(55,65,81)] focus:-translate-y-[1px]
                        dark:border-gray-700 dark:bg-gray-800/50 dark:text-white
                        dark:hover:border-gray-800 dark:hover:bg-gray-800
                        dark:focus:bg-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      密码
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm
                        transition-all duration-300 ease-out placeholder:text-gray-400
                        hover:border-gray-800 hover:bg-white
                        focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
                        focus:shadow-[0_0_0_1px_rgb(31,41,55),0_0_0_2px_rgb(55,65,81)] focus:-translate-y-[1px]
                        dark:border-gray-700 dark:bg-gray-800/50 dark:text-white
                        dark:hover:border-gray-800 dark:hover:bg-gray-800
                        dark:focus:bg-gray-800"
                      required
                    />
                  </div>
               
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative mt-2 w-full rounded-xl bg-gray-800 py-3 px-6 text-white
                      transition-all duration-300 ease-out
                      hover:bg-gray-700 hover:shadow-[0_8px_16px_rgba(31,41,55,0.15)]
                      focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transform hover:-translate-y-[2px]
                      disabled:hover:transform-none disabled:hover:shadow-none
                      dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:hover:shadow-[0_8px_16px_rgba(255,255,255,0.15)]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        验证中...
                      </span>
                    ) : '登 录'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}