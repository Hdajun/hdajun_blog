import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { ArrowRightOutlined } from '@ant-design/icons'

export interface FeatureCardProps {
  href: string
  icon: ReactNode
  title: string
  description?: string
  actionText: string
  tags?: string[]
  themeColor: string
  delay?: number
  className?: string
  ribbon?: {
    text: string
    color: string
  }
}

const getThemeColors = (color: string) => {
  return {
    icon: `text-${color}-600 dark:text-${color}-400`,
    hover: `group-hover:text-${color}-600 dark:group-hover:text-${color}-400`,
  }
}

const getRibbonColors = (color: string) => {
  return {
    bg: `bg-${color}-500/90 dark:bg-${color}-400/90`,
    text: `text-${color}-50 dark:text-${color}-950`,
    shadow: `shadow-${color}-500/20 dark:shadow-${color}-400/20`,
  }
}

export function FeatureCard({
  href,
  icon,
  title,
  description,
  actionText,
  tags,
  themeColor = 'blue',
  delay = 0,
  className = '',
  ribbon,
}: FeatureCardProps) {
  const colors = getThemeColors(themeColor)
  const ribbonStyle = ribbon ? getRibbonColors(ribbon.color) : null

  console.log(ribbonStyle);
  

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, delay }}
      className={`group relative w-[340px] rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:bg-gray-800 overflow-hidden ${className}`}
    >
      {ribbon && (
        <div className="absolute -right-[30px] top-[20px] z-10 rotate-45 transform">
          <div
            className={`py-1 w-[120px] text-center text-xs font-medium ${ribbonStyle?.bg} ${ribbonStyle?.text} shadow-lg ${ribbonStyle?.shadow} backdrop-blur-sm`}
          >
            {ribbon.text}
          </div>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 ${colors.icon} transition-transform duration-200 ease-out group-hover:scale-110 dark:bg-gray-700`}
        >
          {icon}
        </div>
        <div className="flex-1 text-left">
          {/* 就一行溢出隐藏 */}
          <h2 className="mb-2 text-lg text-gray-500 transition-colors duration-200 ease-out dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
            {title}
          </h2>
          {description && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-gray-500 dark:text-gray-400">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
          {actionText}
        </span>
        <ArrowRightOutlined className="text-sm opacity-0 transition-all text-gray-700 dark:text-gray-300 duration-200 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
      </div>
    </motion.a>
  )
}