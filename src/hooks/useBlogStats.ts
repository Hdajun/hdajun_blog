import { useState, useEffect, useCallback } from 'react'
import { BlogStats } from '@/types/blog'

interface UseBlogStatsResult {
  stats: BlogStats[]
  loading: boolean
  error: string | null
  getStatsForPost: (slug: string) => BlogStats | undefined
  incrementViews: (slug: string) => Promise<void>
  initializeStats: () => Promise<void>
}

export function useBlogStats(): UseBlogStatsResult {
  const [stats, setStats] = useState<BlogStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取所有文章统计信息
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
        setError(null)
      } else {
        setError(data.error || '获取统计信息失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('Failed to fetch blog stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取特定文章的统计信息
  const getStatsForPost = useCallback((slug: string): BlogStats | undefined => {
    return stats.find(stat => stat.slug === slug)
  }, [stats])

  // 增加文章阅读量
  const incrementViews = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/blog/stats/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 更新本地状态
        setStats(prevStats => 
          prevStats.map(stat => 
            stat.slug === slug 
              ? { ...stat, views: data.data.views, lastViewed: new Date(data.data.lastViewed) }
              : stat
          )
        )
      } else {
        console.error('Failed to increment views:', data.error)
      }
    } catch (err) {
      console.error('Failed to increment views:', err)
    }
  }, [])

  // 初始化所有文章统计信息
  const initializeStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'init' }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取最新的统计信息
        await fetchStats()
      } else {
        setError(data.error || '初始化统计信息失败')
      }
    } catch (err) {
      setError('初始化失败')
      console.error('Failed to initialize blog stats:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  // 组件挂载时获取统计信息
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    getStatsForPost,
    incrementViews,
    initializeStats,
  }
}