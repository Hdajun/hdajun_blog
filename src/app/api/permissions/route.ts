import { NextResponse } from 'next/server'
import { getPermissionConfig, updatePermissionConfig } from '@/lib/mongodb-permissions'
import { verifyJWT, getJWTFromHeader } from '@/lib/jwt'
import { PermissionConfig, DEFAULT_PAGES } from '@/types/permission'

// GET /api/permissions — 获取权限配置（公开接口，未登录也可访问）
export async function GET() {
  try {
    const config = await getPermissionConfig()

    // 返回时去掉 _id，避免暴露 MongoDB 内部 ID
    const { _id, ...rest } = config
    return NextResponse.json({
      success: true,
      data: rest,
    })
  } catch (error) {
    console.error('Failed to get permission config:', error)
    return NextResponse.json(
      { success: false, message: '获取权限配置失败' },
      { status: 500 }
    )
  }
}

// PUT /api/permissions — 更新权限配置（仅管理员）
export async function PUT(request: Request) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('Authorization')
    const token = getJWTFromHeader(authHeader || undefined)

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    try {
      await verifyJWT(token)
    } catch {
      return NextResponse.json(
        { success: false, message: '登录已过期' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pages, showcaseItems } = body as Partial<Pick<PermissionConfig, 'pages' | 'showcaseItems'>>

    // 验证 pages 结构
    if (pages) {
      for (const key of Object.keys(DEFAULT_PAGES)) {
        if (key in pages && typeof (pages as any)[key] !== 'boolean') {
          return NextResponse.json(
            { success: false, message: `pages.${key} 必须是布尔值` },
            { status: 400 }
          )
        }
      }
    }

    // 验证 showcaseItems 结构
    if (showcaseItems) {
      for (const [key, value] of Object.entries(showcaseItems)) {
        if (typeof value !== 'boolean') {
          return NextResponse.json(
            { success: false, message: `showcaseItems.${key} 必须是布尔值` },
            { status: 400 }
          )
        }
      }
    }

    const updated = await updatePermissionConfig({ pages, showcaseItems })
    const { _id, ...rest } = updated

    return NextResponse.json({
      success: true,
      data: rest,
    })
  } catch (error) {
    console.error('Failed to update permission config:', error)
    return NextResponse.json(
      { success: false, message: '更新权限配置失败' },
      { status: 500 }
    )
  }
}