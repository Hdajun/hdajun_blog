import { Metadata } from 'next'
import EditQuestionClient from './EditQuestionClient'

export const metadata: Metadata = {
  title: '编辑题目 | 个人知识库',
  description: '编辑题目信息',
}

interface EditQuestionPageProps {
  params: {
    id: string
  }
}

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  return <EditQuestionClient questionId={params.id} />
}