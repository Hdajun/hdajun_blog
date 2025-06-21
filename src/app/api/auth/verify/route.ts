import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token is required' 
      }, { status: 400 })
    }

    // 在服务端进行完整的 token 验证
    const payload = await verifyJWT(token)
    
    return NextResponse.json({ 
      success: true,
      data: payload 
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid token' 
    }, { status: 401 })
  }
}