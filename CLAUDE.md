# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人博客/知识管理全栈应用，包含笔记管理、AI 聊天、题目练习等功能模块。

## 技术栈

- **框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: TailwindCSS + Ant Design 5 + antd-style + Framer Motion
- **富文本**: TipTap 编辑器 + react-markdown + highlight.js
- **AI 聊天**: @ant-design/x 组件 + DeepSeek API
- **数据库**: MongoDB (通过 mongodb 驱动直连)
- **认证**: JWT (jose 库, HS256, 7 天过期, localStorage 存储)
- **图片**: Cloudinary 托管
- **动画**: Live2D 看板娘

## 常用命令

```bash
npm run dev      # 启动开发服务器 (localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务
npm run lint     # ESLint 检查
```

## 项目架构

```
src/
├── app/                  # Next.js App Router 页面与 API 路由
│   ├── api/              # API 路由 (auth, notes, questions, chat, upload, juejin)
│   ├── chat/             # AI 聊天页面 (含 customData 自定义上下文)
│   ├── notes/            # 笔记页面 (列表/详情/编辑)
│   └── questions/        # 题目页面 (创建/编辑/练习)
├── components/           # 共享组件
│   ├── Editor/           # TipTap 富文本编辑器 (含 extensions/ 和 Toolbar/)
│   └── ...               # Navbar, AuthGuard, LoginModal, Live2DWidget 等
├── contexts/             # React Context (AuthContext)
├── lib/                  # 工具库 (api-client, jwt, mongodb 连接)
├── types/                # TypeScript 类型定义
├── theme/                # Ant Design 主题配置
├── constants/            # 常量定义
└── config/               # 业务配置
```

## 关键架构决策

- **路径别名**: `@/*` 映射到 `./src/*`
- **客户端组件**: 交互组件需标记 `'use client'`
- **API 客户端**: `src/lib/api-client.ts` 封装了统一的请求和认证处理
- **认证流程**: AuthContext 全局提供认证状态，AuthGuard 保护路由，API 路由通过 JWT 校验
- **主题**: 支持明/暗模式切换 (next-themes, class 策略)，Ant Design 通过 token 自定义主题
- **数据库**: MongoDB 直连，笔记支持置顶和公开/私密，按 isTop + updatedAt 排序

## 注意事项

- **无测试框架**: 项目未配置测试工具，无法运行单元/集成测试
- **Next.js 配置**: 开启了 reactStrictMode、swcMinify、experimental.mdxRs
- **图片域名白名单**: next.config.js 中仅允许 `res.cloudinary.com` 的远程图片
- **AI 聊天**: `/api/chat` 调用 DeepSeek API，需配置 `DEEPSEEK_API_KEY`

## 环境变量

需要配置 `MONGODB_URI`、`JWT_SECRET`、`CLOUDINARY_*`、`DEEPSEEK_API_KEY`。

---

## UI 设计规范

### 布局断点

| 断点 | 前缀 | 说明 |
|------|------|------|
| < 768px | 无前缀 | 移动端，单列布局 |
| ≥ 768px | `md:` | 桌面端，侧边栏展开，多列布局 |
| ≥ 640px | `sm:` | 中间过渡，部分组件调整 |

### 整体布局结构

```
layout.tsx
├── Sidebar (hidden on mobile, md:flex)          左侧固定侧边栏，宽 52px(折叠) / 160px(展开)
├── MobileTopBar (md:hidden, fixed top-0 h-12)   移动端顶部导航栏
└── main (flex-1 overflow-auto)
    └── div.w-full.px-4.md:px-8.pb-6             主内容区，移动端 px-4，桌面端 px-8
```

移动端 `main` 需要加 `pt-12 md:pt-0` 避免被顶栏遮挡（已在 layout.tsx 中处理）。

### 页面顶部吸顶 Header 模板

每个页面顶部吸顶 header 统一使用以下结构，**不得使用 border-b，改用 after 伪元素渐变线**：

```tsx
<div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md py-6 mb-8 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gray-300/70 after:to-transparent dark:after:via-white/[0.08]">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">页面标题</h1>
  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">副标题</p>
</div>
```

关键点：
- `-mx-4 md:-mx-8` 与 `px-4 md:px-8` 配合，让 header 撑满容器宽度
- 移动端用 `-mx-4`，桌面端用 `-mx-8`，必须与 layout 主内容区 padding 一致

### 卡片规范（FeatureCard）

通用卡片组件位于 `src/components/FeatureCard.tsx`，支持以下 props：

```ts
{
  href: string          // 跳转链接
  icon: ReactNode       // 图标
  title: string         // 标题
  description?: string  // 描述（可选）
  actionText: string    // 底部操作文字
  tags?: string[]       // 标签列表
  themeColor: ColorKey  // 主题色，见下方色板
  delay?: number        // 动画延迟
  className?: string    // 额外类名
  ribbon?: { text, color } // 置顶角标（可选）
}
```

卡片宽度必须用 `w-full`，**不得**硬编码 `w-[340px]` 等固定宽度。

### 卡片网格布局

笔记列表使用自适应网格，移动端单列，桌面端多列：

```tsx
// 笔记卡片网格（自适应）
<div className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-5">

// 成果展示网格
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// 题库入口卡片（flex 自适应）
<div className="flex flex-wrap gap-4">
  <FeatureCard className="flex-1 min-w-[min(280px,100%)] max-w-full sm:max-w-[460px]" />
```

### 色板（colorStyles）

定义于 `src/app/notes/icons.tsx`，可用颜色：

`blue` `emerald` `indigo` `amber` `orange` `purple` `red` `rose` `teal` `green`

每种颜色包含 5 个 token：`bg` `text` `shadow`（用于 Ribbon）、`icon` `hover`（用于 Theme）。
新增页面/卡片时从以上色板中选取 `themeColor`，**不要自造颜色字符串**。

### 阴影规范

```
卡片默认阴影:  shadow-[0_4px_16px_rgba(0,0,0,0.10)]  dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]
卡片 hover:    shadow-[0_8px_28px_rgba(0,0,0,0.14)]   dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)]
旧值（勿用）:  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
```

### 动画规范

全局统一 ease 曲线：
```ts
const ease = [0.22, 1, 0.36, 1] as const
```

入场动画统一用 `initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}`，卡片 hover 用 `whileHover={{ y: -4, scale: 1.02 }}`。

### 侧边栏导航（Navbar）

- 导航项定义在 `src/components/Navbar.tsx` 的 `navigationItems` 数组，首页入口**单独**写在 Sidebar 内部，不加入该数组（避免在首页卡片列表中重复展示）
- 侧边栏折叠宽度 52px，展开 160px，通过 `motion.aside` 动画过渡
- `navigationItems` 被首页 `page.tsx` 复用，每项需包含 `href title description icon actionText tags themeColor`

---

## 双端适配规则

### 移动端必须遵守

1. **不得出现无响应式前缀的固定列数**：`grid-cols-4` → `grid-cols-1 md:grid-cols-4`
2. **不得出现无响应式前缀的固定宽度**（超过容器宽度的）：用 `min(Xpx, 100%)` 或加 `sm:` 前缀
3. **负 margin 配合 padding 必须同步响应式**：`-mx-8 px-8` → `-mx-4 md:-mx-8 px-4 md:px-8`
4. **固定 padding-right 偏移**：`pr-16` → `pr-0 md:pr-16`
5. **标题字号**：大标题加响应式缩小，如 `text-3xl md:text-5xl`
6. **flex 行在移动端允许换列**：`flex` 容器加 `flex-col sm:flex-row`

### 桌面端保持

- 侧边栏使用 `hidden md:flex`，移动端顶栏使用 `md:hidden`
- 主内容区桌面端 `px-8`，移动端 `px-4`
- 大网格（4列）仅在 `md:` 以上生效

---

## 默认语言

回复使用中文，代码和命令保持英文。