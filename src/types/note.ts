import { ObjectId } from 'mongodb'

export type NoteVisibility = 'private' | 'public'

export interface Note {
  _id?: ObjectId | string
  title: string
  content: string
  visibility: NoteVisibility
  isTop?: boolean
  createdAt: string
  updatedAt: string
}