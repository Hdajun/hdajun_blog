import { Metadata } from 'next'
import QuestionsClient from './QuestionsClient'

export const metadata: Metadata = {
  title: '题库 | 个人知识库',
  description: '记录和复习技术知识点的个人题库',
}

export default function QuestionsPage() {
  return <QuestionsClient />
}