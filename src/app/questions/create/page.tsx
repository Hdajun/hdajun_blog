import { Metadata } from 'next'
import CreateQuestionClient from './CreateQuestionClient'

export const metadata: Metadata = {
  title: '添加题目 | 个人题库',
  description: '添加新的题目到个人知识库',
}

export default function CreateQuestionPage() {
  return <CreateQuestionClient />
}