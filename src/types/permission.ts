// 页面路由 key 类型
export type PageKey = 'showcase' | 'notes' | 'chat' | 'questions' | 'pet'

// 页面可见性配置
export interface PageVisibility {
  showcase: boolean
  notes: boolean
  chat: boolean
  questions: boolean
  pet: boolean
}

// 权限配置文档（MongoDB permissions collection）
export interface PermissionConfig {
  _id?: string
  pages: PageVisibility
  // 成果项展示权限（key = showcase item id）
  showcaseItems: Record<string, boolean>
  updatedAt: string
}

// 默认权限配置：所有页面可见，所有成果项可见
export const DEFAULT_PAGES: PageVisibility = {
  showcase: true,
  notes: true,
  chat: true,
  questions: true,
  pet: true,
}

export const DEFAULT_PERMISSION: Omit<PermissionConfig, '_id'> = {
  pages: { ...DEFAULT_PAGES },
  showcaseItems: {},
  updatedAt: new Date().toISOString(),
}

// 页面 key 到路由路径的映射
export const PAGE_KEY_TO_HREF: Record<PageKey, string> = {
  showcase: '/showcase',
  notes: '/notes',
  chat: '/chat',
  questions: '/questions',
  pet: '/pet',
}

// 页面 key 到中文名的映射
export const PAGE_KEY_LABEL: Record<PageKey, string> = {
  showcase: '成果页',
  notes: '小记页',
  chat: '聊天页',
  questions: '题库页',
  pet: '宠物页',
}