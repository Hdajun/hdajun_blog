export interface UserProfile {
  username: string
  role: 'admin'
  avatar?: string
  lastLoginAt?: string
  createdAt: string
  permissions?: string[]
}

export interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}