'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { STORAGE_KEYS } from '@/constants/storage'
import { message } from 'antd'
import { api } from '@/lib/api-client'

interface UserInfo {
  username?: string
  role?: string
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  userInfo?: UserInfo
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
  userInfo: {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  // 验证 token 的函数
  const verifyToken = async (token: string) => {
    try {
      const { success, data } = await api.post(
        '/auth/verify',
        { token },
        { requireAuth: false }
      )
      if (success) {
        setUserInfo((data || {}) as UserInfo)
      }
      return success
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  useEffect(() => {
    // 从localStorage恢复token并验证
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (storedToken) {
      verifyToken(storedToken).then(isValid => {
        if (isValid) {
          setToken(storedToken)
          setIsAuthenticated(true)
        } else {
          // token无效，清除状态
          logout()
        }
      })
    }
  }, [])

  const login = async (newToken: string) => {
    const isValid = await verifyToken(newToken)
    if (isValid) {
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
      setToken(newToken)
    } else {
      message.error('登录失败：无效的凭证')
      logout()
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    setToken(null)
    message.success(`拜拜啦，${userInfo.username}`)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}