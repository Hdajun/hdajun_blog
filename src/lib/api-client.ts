import { STORAGE_KEYS } from '@/constants/storage'
import { message } from 'antd'

interface RequestOptions extends RequestInit {
  requireAuth?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 验证 token 的函数
async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
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
      message.error('此功能需要登录后才能使用')
      throw new Error('请先登录')
    }

    // 每次请求前验证 token
    const isValid = await verifyToken(token)
    if (!isValid) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      message.error('登录已过期，请重新登录')
      throw new Error('登录已过期')
    }

    headers.set('Authorization', `Bearer ${token}`)
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
        // 清除无效的token
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
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
  
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      requireAuth: true,
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { requireAuth: true, ...options, method: 'DELETE' }),
}