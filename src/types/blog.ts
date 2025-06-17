import { ObjectId } from 'mongodb'

export interface BlogPost {
  _id?: ObjectId
  slug: string // 文章的唯一标识符
  title: string
  description?: string
  tags?: string[]
  date: Date
  views: number // 阅读量
  readingTime: number // 阅读时间（分钟）
  createdAt: Date
  updatedAt: Date
}

export interface BlogStats {
  slug: string
  views: number
  readingTime: number
  lastViewed: Date
}