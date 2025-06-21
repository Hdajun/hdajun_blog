'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { STORAGE_KEYS } from '@/constants/storage'
import { verifyJWT } from '@/lib/jwt'
import { message } from 'antd'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 从localStorage恢复token并验证
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (storedToken) {
      verifyJWT(storedToken)
        .then(() => {
          setToken(storedToken)
          setIsAuthenticated(true)
        })
        .catch(() => {
          // token无效，清除状态
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          setToken(null)
          setIsAuthenticated(false)
        })
    }
  }, [])

  const login = (newToken: string) => {
    setIsAuthenticated(true)
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
    setToken(newToken)
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    setToken(null)
    message.success({
      content: '登出成功',
      className: 'custom-message',
      duration: 2,
      style: {
        marginTop: '4vh',
      },
    })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
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