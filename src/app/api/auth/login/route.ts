import { NextResponse } from 'next/server'
import { signJWT } from '@/lib/jwt'
import type { LoginCredentials, AuthResponse } from '@/types/auth'

export async function POST(request: Request) {
  try {
    const body: LoginCredentials = await request.json()
    
    // 验证环境变量是否存在
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      throw new Error('系统未配置登录凭据，请联系大俊')
    }

    // 验证用户名和密码
    if (
      body.username === process.env.ADMIN_USERNAME &&
      body.password === process.env.ADMIN_PASSWORD
    ) {
      // 生成JWT
      const token = await signJWT({
        username: body.username,
        role: 'admin'
      })

      const response: AuthResponse = {
        success: true,
        message: `Hi ${body.username}, 欢迎回来`,
        token
      }

      return NextResponse.json(response)
    }

    return NextResponse.json({
      success: false,
      message: '账号或密码不正确'
    } as AuthResponse, { status: 400 })
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试'
    return NextResponse.json({
      success: false,
      message: errorMessage
    } as AuthResponse, { status: 500 })
  }
}