import { STORAGE_KEYS } from '@/constants/storage'
import { message } from 'antd'
import { verifyJWT } from '@/lib/jwt'

interface RequestOptions extends RequestInit {
  requireAuth?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, ...fetchOptions } = options

  // 设置默认headers
  const headers = new Headers(fetchOptions.headers)
  headers.set('Content-Type', 'application/json')

  // 如果需要认证，添加token并验证
  if (requireAuth) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      message.warning('此功能需要登录后才能使用')
      throw new Error('请先登录')
    }

    try {
      // 验证token是否有效
      await verifyJWT(token)
      headers.set('Authorization', `Bearer ${token}`)
    } catch (error) {
      // token无效，清除并提示重新登录
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      message.error('登录已过期，请重新登录')
      // window.location.reload()
      throw new Error('登录已过期')
    }
  }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...fetchOptions,
      headers,
    })

    const responseData = await response.json()

    if (!response.ok) {
      // 处理401未授权的情况
      if (response.status === 401) {
        message.error(responseData.message || '请先登录')
        // 可以在这里触发登出逻辑
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        // window.location.reload() // 刷新页面以更新认证状态
      } else {
        message.error(responseData.message || '请求失败，请稍后重试')
      }
      throw new Error(responseData.message || '请求失败')
    }

    return {
      success: responseData.success,
      message: responseData.message,
      data: responseData.token
        ? { token: responseData.token }
        : responseData.data,
    }
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 导出常用的请求方法
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { requireAuth: false, ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      requireAuth: true,
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      requireAuth: true,
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { requireAuth: true, ...options, method: 'DELETE' }),
}