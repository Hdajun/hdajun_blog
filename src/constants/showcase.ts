// ─── 成果数据源（单一数据源，showcase 页和权限管理页共用） ─────────────────────────

export type ShowcaseType = 'video' | 'image' | 'pdf'

export interface ShowcaseItem {
  id: string
  title: string
  subtitle: string
  description: string
  type: ShowcaseType
  tags: string[]
  url: string
  cover?: string
  date: string
}

export const SHOWCASE_LIST: ShowcaseItem[] = [
  {
    id: 'poc-platform-demo',
    title: 'POC 演示设计平台',
    subtitle: '自研 PPT 式画布编辑器，AI 多模型驱动',
    description:
      '自研 PPT 式画布编辑器引擎，支持上传图片、拖拽模板、AI 自然语言生成三种方式快速搭建交互式产品演示 Demo。支持 PC/Mobile/iPad 三端适配，集成 Claude/Gemini/Qwen 多模型 AI 页面生成能力。',
    type: 'video',
    tags: ['React', 'Canvas', 'AIGC', 'Low-Code'],
    url: 'https://gw.alipayobjects.com/v/morserta_material/afts/video/GPoJSr-AiMwAAAAAg0AAAAgAoCLEAQFr',
    cover: '/showcase/cover-poc.png',
    date: '2025',
  },
  {
    id: 'system-architect-cert',
    title: '系统架构设计师',
    subtitle: '软考高级职称，国家级认证',
    description:
      '国家人力资源和社会保障部、工业和信息化部联合颁发的软考高级证书。',
    type: 'image',
    tags: ['软考', '高级职称', '系统架构'],
    url: '/showcase/certificate.png',
    cover: '/showcase/cover-resume.png',
    date: '2025',
  },
  {
    id: 'resume-2025',
    title: '个人简历',
    subtitle: '高级前端工程师 · 5 年行业经验',
    description:
      '专注低代码平台与 AIGC 产品研发，深耕可视化编辑器与智能生成方向。',
    type: 'pdf',
    tags: ['前端', '低代码', 'AIGC'],
    url: '/HZQ.pdf',
    cover: '/showcase/cover-cert.png',
    date: '2025',
  },
]