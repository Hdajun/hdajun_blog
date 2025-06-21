export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
}

export interface JWTPayload {
  username: string
  role: 'admin'
  exp: number
  iat: number
}