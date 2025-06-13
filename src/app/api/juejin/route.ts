import { NextResponse } from 'next/server'
import axios from 'axios'

interface JuejinArticle {
  title: string
  url: string
}

export async function GET() {
  try {
    const response = await axios.post(
      'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed',
      {
        cursor: "0",
        id_type: 2,
        limit: 20,
        sort_type: 200,
        category_id: "6809637767543259144" // 前端分类
      },
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid API response format')
    }

    const articles: JuejinArticle[] = response.data.data
      .filter((item: any) => item.item_type === 2 && item.item_info && item.item_info.article_info)
      .slice(0, 20)
      .map((item: any) => ({
        title: item.item_info.article_info.title,
        url: `https://juejin.cn/post/${item.item_info.article_info.article_id}`,
      }))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching Juejin articles:', error)
    // 返回一些示例文章作为备选
    const fallbackArticles: JuejinArticle[] = [
      {
        title: "React 最佳实践和设计模式",
        url: "https://juejin.cn/frontend"
      },
      {
        title: "深入理解 TypeScript",
        url: "https://juejin.cn/frontend"
      },
      {
        title: "Next.js 13 新特性解析",
        url: "https://juejin.cn/frontend"
      },
      {
        title: "现代前端工程化实践",
        url: "https://juejin.cn/frontend"
      },
      {
        title: "Web 性能优化指南",
        url: "https://juejin.cn/frontend"
      }
    ]
    return NextResponse.json({ articles: fallbackArticles })
  }
}