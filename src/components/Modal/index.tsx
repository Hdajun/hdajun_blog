import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string | React.ReactNode
  cancelText?: string
  confirmText?: string
  onConfirm: () => Promise<any>
  type?: 'default' | 'danger'
  width?: string
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  cancelText = '取消',
  confirmText = '确定',
  onConfirm,
  type = 'default',
  width = 'max-w-md',
}) => {
  const [loading, setLoading] = useState(false)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative mx-4 w-full ${width} overflow-hidden rounded-2xl bg-white/80 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md dark:bg-gray-800/80`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              {description && (
                <div className="mb-6 text-center text-gray-500 dark:text-gray-400">
                  {description}
                </div>
              )}
              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const res = await onConfirm()
                      if (res.success) {
                        onClose()
                      }
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all duration-200 transform hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                    type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      {confirmText}
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}