import { ObjectId } from 'mongodb'

export type NoteVisibility = 'private' | 'public'

export interface Note {
  _id?: ObjectId | string
  title: string
  content: string
  visibility: NoteVisibility
  createdAt: string
  updatedAt: string
}