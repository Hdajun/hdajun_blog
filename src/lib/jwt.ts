import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types/auth'

// 服务端 JWT 函数
export async function signJWT(payload: Omit<JWTPayload, 'exp' | 'iat'>) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  
  try {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 60 * 60 * 24 * 7 // 7 days

    return new SignJWT({ ...payload, iat, exp })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))
  } catch (error) {
    console.error('Error signing JWT:', error)
    throw error
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  try {
    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(process.env.JWT_SECRET)
    )
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('Error verifying JWT:', error)
    throw error
  }
}

export function getJWTFromHeader(authHeader?: string): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined
  }
  return authHeader.split(' ')[1]
}