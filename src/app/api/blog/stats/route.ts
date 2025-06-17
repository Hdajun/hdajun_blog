import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { BlogPost, BlogStats } from '@/types/blog'
import { calculateReadingTime } from '@/lib/reading-time'
import { allPosts } from 'contentlayer/generated'

// GET /api/blog/stats - 获取所有文章统计信息
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('blog')
    
    const stats = await db.collection('blog_stats').find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Failed to fetch blog stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blog stats'
    }, { status: 500 })
  }
}

// POST /api/blog/stats - 初始化或更新文章统计信息
export async function POST(request: NextRequest) {
  try {
    const { action, slug } = await request.json()
    
    const client = await clientPromise
    const db = client.db('blog')
    const collection = db.collection('blog_stats')
    
    if (action === 'init') {
      // 初始化所有文章的统计信息
      const initResults = []
      
      for (const post of allPosts) {
        const postSlug = post._raw.flattenedPath.split('/').pop() || post._id
        
        // 计算阅读时间
        const readingTime = calculateReadingTime(post.body.raw)
        
        // 检查是否已存在
        const existing = await collection.findOne({ slug: postSlug })
        
        if (!existing) {
          const blogStat: Omit<BlogStats, '_id'> = {
            slug: postSlug,
            views: Math.floor(Math.random() * 1000) + 100, // 初始随机阅读量
            readingTime,
            lastViewed: new Date()
          }
          
          const result = await collection.insertOne(blogStat)
          initResults.push({
            slug: postSlug,
            title: post.title,
            readingTime,
            views: blogStat.views,
            inserted: true,
            id: result.insertedId
          })
        } else {
          // 更新阅读时间（内容可能已更改）
          await collection.updateOne(
            { slug: postSlug },
            { 
              $set: { 
                readingTime,
                updatedAt: new Date()
              }
            }
          )
          
          initResults.push({
            slug: postSlug,
            title: post.title,
            readingTime,
            views: existing.views,
            inserted: false,
            updated: true
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Blog stats initialized',
        data: initResults
      })
      
    } else if (action === 'view' && slug) {
      // 增加文章阅读量
      const result = await collection.updateOne(
        { slug },
        { 
          $inc: { views: 1 },
          $set: { lastViewed: new Date() }
        },
        { upsert: true }
      )
      
      // 获取更新后的统计信息
      const updatedStats = await collection.findOne({ slug })
      
      return NextResponse.json({
        success: true,
        message: 'View count updated',
        data: updatedStats
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action or missing slug'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Failed to update blog stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update blog stats'
    }, { status: 500 })
  }
}