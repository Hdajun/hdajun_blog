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
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              系统登录
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    账号
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm
                      transition-all duration-300 ease-out placeholder:text-gray-400
                      hover:border-[#818cf8] hover:bg-gray-100/50
                      focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
                      focus:shadow-[0_0_0_1px_#818cf8,0_0_0_2px_#a78bfa] focus:-translate-y-[1px]
                      dark:border-gray-700 dark:bg-transparent dark:text-white
                      dark:hover:border-[#818cf8] dark:hover:bg-gray-700/50
                      dark:focus:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    密码
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm
                      transition-all duration-300 ease-out placeholder:text-gray-400
                      hover:border-[#818cf8] hover:bg-gray-100/50
                      focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
                      focus:shadow-[0_0_0_1px_#818cf8,0_0_0_2px_#a78bfa] focus:-translate-y-[1px]
                      dark:border-gray-700 dark:bg-transparent dark:text-white
                      dark:hover:border-[#818cf8] dark:hover:bg-gray-700/50
                      dark:focus:bg-gray-800"
                    required
                  />
                </div>
               
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full rounded-xl bg-[#818cf8] py-3 px-6 text-white
                    transition-all duration-300 ease-out
                    hover:bg-[#635bff]
                    focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transform hover:-translate-y-[2px] hover:shadow-lg
                    disabled:hover:transform-none disabled:hover:shadow-none"
                >
                  {isLoading ? '验证中...' : '登 录'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}