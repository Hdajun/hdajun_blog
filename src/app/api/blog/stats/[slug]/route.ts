import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET /api/blog/stats/[slug] - 获取特定文章的统计信息
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const client = await clientPromise
    const db = client.db('blog')
    
    const stats = await db.collection('blog_stats').findOne({ slug })
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Stats not found for this article'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Failed to fetch article stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch article stats'
    }, { status: 500 })
  }
}

// POST /api/blog/stats/[slug] - 增加文章阅读量
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const client = await clientPromise
    const db = client.db('blog')
    const collection = db.collection('blog_stats')
    
    // 增加阅读量
    const result = await collection.updateOne(
      { slug },
      { 
        $inc: { views: 1 },
        $set: { lastViewed: new Date() }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Article not found'
      }, { status: 404 })
    }
    
    // 获取更新后的统计信息
    const updatedStats = await collection.findOne({ slug })
    
    return NextResponse.json({
      success: true,
      message: 'View count incremented',
      data: updatedStats
    })
  } catch (error) {
    console.error('Failed to increment view count:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to increment view count'
    }, { status: 500 })
  }
}