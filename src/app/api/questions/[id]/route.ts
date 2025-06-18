import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/questions/[id] - 获取单个题目详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        msg: 'Question ID is required',
        data: null
      }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('blog')
    
    const question = await db.collection('questions').findOne({
      _id: new ObjectId(id)
    })

    if (!question) {
      return NextResponse.json({
        success: false,
        msg: 'Question not found',
        data: null
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      msg: 'success',
      data: question
    })
  } catch (error) {
    console.error('Failed to fetch question:', error)
    return NextResponse.json({
      success: false,
      msg: 'Failed to fetch question',
      data: null
    }, { status: 500 })
  }
}