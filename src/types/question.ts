import { ObjectId } from 'mongodb'

export interface Question {
  _id?: ObjectId
  title: string
  content: string
  answer: string
  category: string
  difficulty: string
  createdAt: Date
  updatedAt: Date
}

export interface QuestionCategory {
  value: string
  label: string
  description?: string
}

export interface Difficulty {
  value: string
  label: string
  color: string
}