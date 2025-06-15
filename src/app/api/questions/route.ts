import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Question } from '@/types/question'

// GET /api/questions - 获取题目列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    const client = await clientPromise
    const db = client.db('blog')
    
    // 构建查询条件
    const query: Record<string, any> = {}

    if (category && category !== 'all') {
      query.category = category
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty
    }

    if (search) {
      // 使用正则表达式进行标题的模糊查询，不区分大小写
      query.title = {
        $regex: search,
        $options: 'i'
      }
    }

    const questions = await db.collection('questions')
      .find(query)
      .sort({ updatedAt: -1 }) // 按更新时间倒序
      .toArray()
    
    return NextResponse.json({
      success: true,
      msg: 'success',
      data: questions
    })
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    return NextResponse.json({
      success: false,
      msg: 'Failed to fetch questions',
      data: null
    }, { status: 500 })
  }
}

// POST /api/questions - 创建新题目
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('blog')
    
    const body = await request.json()
    const question: Omit<Question, '_id' | 'createdAt' | 'updatedAt'> = {
      title: body.title,
      content: body.content,
      answer: body.answer,
      category: body.category,
      difficulty: body.difficulty,
    }

    // 添加时间戳
    const now = new Date()
    const questionWithTimestamps = {
      ...question,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('questions').insertOne(questionWithTimestamps)
    
    return NextResponse.json({
      success: true,
      msg: 'success',
      data: {
        _id: result.insertedId,
        ...questionWithTimestamps,
      }
    })
  } catch (error) {
    console.error('Failed to create question:', error)
    return NextResponse.json({
      success: false,
      msg: 'Failed to create question',
      data: null
    }, { status: 500 })
  }
}

// PUT /api/questions/:id - 更新题目
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('blog')
    
    const body = await request.json()
    const { _id, ...updateData } = body

    if (!_id) {
      return NextResponse.json({
        success: false,
        msg: 'Question ID is required',
        data: null
      }, { status: 400 })
    }

    const result = await db.collection('questions').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        msg: 'Question not found',
        data: null
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      msg: 'success',
      data: null
    })
  } catch (error) {
    console.error('Failed to update question:', error)
    return NextResponse.json({
      success: false,
      msg: 'Failed to update question',
      data: null
    }, { status: 500 })
  }
}

// DELETE /api/questions/:id - 删除题目
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('blog')
    
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        msg: 'Question ID is required',
        data: null
      }, { status: 400 })
    }

    const result = await db.collection('questions').deleteOne({
      _id: new ObjectId(id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        msg: 'Question not found',
        data: null
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      msg: 'success',
      data: null
    })
  } catch (error) {
    console.error('Failed to delete question:', error)
    return NextResponse.json({
      success: false,
      msg: 'Failed to delete question',
      data: null
    }, { status: 500 })
  }
}