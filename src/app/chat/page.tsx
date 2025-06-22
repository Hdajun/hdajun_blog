'use client'

import {
  AppstoreAddOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  HeartOutlined,
  OpenAIOutlined,
  UserOutlined,
  ReloadOutlined,
  SmileOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  WarningOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import Image from 'next/image'
import {
  Attachments,
  Bubble,
  BubbleProps,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x'
import {
  Button,
  ConfigProvider,
  Flex,
  type GetProp,
  Space,
  Spin,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { useTheme } from 'next-themes'
import { createStyles } from 'antd-style'
import React, { useRef, useState, useEffect } from 'react'
import markdownit from 'markdown-it'
import dynamic from 'next/dynamic'
import { v4 as uuidv4 } from 'uuid'
import { getCustomData } from './customData'

const md = markdownit({ html: true, breaks: true })
// 覆盖默认的段落渲染规则
md.renderer.rules.paragraph_open = () => '<div>'
md.renderer.rules.paragraph_close = () => '</div>'

type BubbleDataType = {
  role: string
  content: string
  [key: string]: any
}

type JuejinArticle = {
  title: string
  url: string
}

type SenderPrompt = {
  key: string
  description: string
  icon: React.ReactNode
  customContent?: string
}

const darkTextColor = '#9ca3af'

const SENDER_PROMPTS: SenderPrompt[] = [
  {
    key: '1',
    description: '自我介绍',
    icon: <UserOutlined />,
  },
  {
    key: '2',
    description: '项目经历',
    icon: <AppstoreAddOutlined />,
  },
  {
    key: '3',
    description: '个人成长',
    icon: <HeartOutlined />,
  },
]

const COLORS = [
  '#f93a4a',
  '#ff6565',
  '#ff8f1f',
  '#ff6b23',
  '#af3cb8',
  '#53b6ff',
  '#3b82f6',
  '#10b981',
  '#facc15',
  '#f59e0b',
  '#eab308',
  '#f97316',
  '#ec4899',
  '#ec4899',
  '#8b5cf6',
  '#a855f7',
  '#6366f1',
  '#4f46e5',
  '#8b5cf6',
]

const ICONS = [
  <BulbOutlined style={{ color: '#FFD700' }} />,
  <InfoCircleOutlined style={{ color: '#1890FF' }} />,
  <RocketOutlined style={{ color: '#722ED1' }} />,
  <SmileOutlined style={{ color: '#52C41A' }} />,
  <WarningOutlined style={{ color: '#FF4D4F' }} />,
]

const HOT_TOPICS = {
  key: '1',
  label: '推荐博客',
  children: [
    {
      key: '1-1',
      url: '/blog/build-blog-from-zero-to-one',
      label: '从零搭建个人博客',
      icon: ICONS[0],
    },
    {
      key: '1-2',
      url: '/blog/chat-component-and-juejin-crawler',
      label: '如何构建一个AI对话窗口',
      icon: ICONS[1],
    },
  ],
}

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      position: absolute;
      top: 64px;
      left: 0;
      width: 100vw;
      min-width: 320px;
      height: calc(100vh - 64px);
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      @media (max-width: 768px) {
        height: calc(100vh - 64px);
      }

      *::-webkit-scrollbar {
        display: none;
      }

      * {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
      }
    `,
    // sider 样式
    sider: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0 12px;
      box-sizing: border-box;
    `,
    logo: css`
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;
      gap: 8px;
      margin: 24px 0;

      span {
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      height: 40px;
    `,
    conversations: css`
      flex: 1;
      overflow-y: auto;
      margin-top: 12px;
      padding: 0;

      .ant-conversations-list {
        padding-inline-start: 0;
      }
    `,
    siderFooter: css`
      border-top: 1px solid ${token.colorBorderSecondary};
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `,
    // chat list 样式
    chat: css`
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding-block: ${token.paddingLG}px;
      gap: 16px;

      @media (max-width: 768px) {
        padding: 12px;
      }
    `,
    chatPrompt: css`
      flex: 1;
      /* min-height: 220px; */
      .ant-prompts-label {
        /* color: #6b7280 !important; */
        font-weight: 400 !important;
      }
      .ant-prompts {
        overflow-y: auto;
        max-height: 212px;
      }
      .ant-prompts-desc {
        color: #6b7280 !important;
        width: 100%;
      }
      .ant-prompts-icon {
        color: #6b7280 !important;
      }
    `,
    chatList: css`
      flex: 1;
      overflow: auto;

      @media (max-width: 768px) {
        padding: 0;
      }
    `,
    loadingMessage: css`
      background-image: linear-gradient(
        90deg,
        rgb(31,41,55) 0%,
        rgb(55,65,81) 50%,
        rgb(31,41,55) 100%
      );
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    // sender 样式
    sender: css`
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      transition: all 0.3s ease;

      .ant-btn {
        box-shadow: none !important;
      }

      &:focus-within {
        border-color: rgb(31, 41, 55);
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        max-width: 100%;
        padding: 0 8px;
      }
    `,
    speechButton: css`
      font-size: 18px;
      color: ${token.colorText} !important;
    `,
    senderPrompt: css`
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      color: ${token.colorText};
    `,
  }
})

const useDarkStyle = createStyles(({ css }) => {
  return {
    layout: css`
      background: #000;
    `,
    sender: css`
      .ant-sender-input {
        color: ${darkTextColor};
      } // #1F293780
    `,
    senderPrompt: css`
      .ant-prompts-item {
        color: ${darkTextColor};
        background-color: #111827;
      }
    `,
    chatPrompt: css`
      flex: 1;
      .ant-prompts-label {
        color: ${darkTextColor} !important;

        span {
          color: ${darkTextColor} !important;
        }
      }
      .ant-prompts-desc {
        color: ${darkTextColor} !important;
        width: 100%;
      }
      .ant-prompts-icon {
        color: #fff !important;
      }
    `,
  }
})

const RecommendList = ({ items }: { items: typeof HOT_TOPICS }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white py-3 px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 text-base text-[#000000E0] dark:text-gray-400">
        推荐博客
      </div>
      <div className="flex flex-col gap-3">
        {items.children.map(item => (
          <a
            key={item.key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center rounded-xl bg-gray-50 px-4 py-3 transition-all duration-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700`}
            style={{ textDecoration: 'none' }}
          >
            <span className="mr-3 text-[14px]">{item.icon}</span>
            <span className="flex-1 text-[14px] font-normal text-[#000000E0] dark:text-gray-400">{item.label}</span>
            <ArrowRightOutlined
              className="ml-2 text-gray-800 transition-transform duration-300 group-hover:translate-x-1"
              style={{ fontSize: 14, color: 'rgb(31,41,55)' }}
            />
          </a>
        ))}
      </div>
    </div>
  )
}

const Independent: React.FC = () => {
  const { theme } = useTheme()
  const { styles } = useStyle()
  const { styles: darkStyles } = useDarkStyle()
  const abortController = useRef<AbortController | null>(null)
  const [attachmentsOpen, setAttachmentsOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<
    GetProp<typeof Attachments, 'items'>
  >([])
  const [bookLoading, setBookLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [juejinArticles, setJuejinArticles] = useState<JuejinArticle[]>([])

  /**
   * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
   */

  // ==================== Runtime ====================
  const [agent] = useXAgent<BubbleDataType>({
    baseURL: '/api/chat',
    model: 'deepseek-chat',
  })
  const loading = agent.isRequesting()

  const { onRequest, messages, setMessages } = useXChat({
    agent,
    requestPlaceholder() {
      return {
        content: `正在思考...`,
        role: 'assistant',
      }
    },
    requestFallback: (_, { error }) => {
      if (error.name === 'AbortError') {
        return {
          content: '请求已取消',
          role: 'assistant',
        }
      }
      return {
        content: 'Request failed, please try again!',
        role: 'assistant',
      }
    },
    transformMessage: info => {
      const { originMessage, chunk } = info || {}
      let currentContent = ''
      let currentThink = ''
      try {
        if (chunk?.data && !chunk?.data.includes('DONE')) {
          const message = JSON.parse(chunk?.data)
          currentThink = message?.choices?.[0]?.delta?.reasoning_content || ''
          currentContent = message?.choices?.[0]?.delta?.content || ''
        }
      } catch (error) {
        console.error(error)
      }

      let content = ''

      if (!originMessage?.content && currentThink) {
        content = `<think>${currentThink}`
      } else if (
        originMessage?.content?.includes('<think>') &&
        !originMessage?.content.includes('</think>') &&
        currentContent
      ) {
        content = `${originMessage?.content}</think>${currentContent}`
      } else {
        content = `${
          originMessage?.content || ''
        }${currentThink}${currentContent}`
      }
      return {
        content: content,
        role: 'assistant',
      }
    },
    resolveAbortController: controller => {
      abortController.current = controller
    },
  })

  useEffect(() => {
    // 获取掘金文章
    fetch('/api/juejin')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setJuejinArticles(data.articles)
        }
      })
      .catch(error => console.error('Error fetching Juejin articles:', error))
      .finally(() => setBookLoading(false))
  }, [])

  const DESIGN_GUIDE = {
    key: '2',
    label: '掘金前端热门',
    children: juejinArticles.map((article, index) => ({
      key: `2-${index + 1}`,
      label: <span style={{ fontWeight: 400 }}>{article.title}</span>,
      url: article.url,
      icon: (
        <span style={{ color: COLORS[index], fontWeight: 700 }}>
          {index + 1}
        </span>
      ),
    })),
  }

  // ==================== Event ====================
  const onSubmit = (val: string) => {
    if (!val) return

    if (loading) {
      message.error(
        'Request is in progress, please wait for the request to complete.'
      )
      return
    }

    // 关键字如果命中 则使用以下
    const customData = getCustomData(val)
    if (!!customData) {
      setMessages(prev => [
        ...prev,
        {
          message: {
            role: 'user',
            content: val,
          },
          id: uuidv4(),
          status: 'success',
        },
        {
          message: {
            role: 'assistant',
            content: customData,
          },
          id: uuidv4(),
          status: 'success',
        },
      ])
      return
    }

    onRequest({
      stream: true,
      message: { role: 'user', content: val },
    })
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      message.success('复制成功')
    } catch (err) {
      message.error('复制失败')
    }
  }

  const handleRegenerate = (currentMessage: any) => {
    if (loading) {
      message.error('请等待当前回答完成')
      return
    }
    // 找到当前消息的索引
    const currentIndex = messages.findIndex(
      msg => msg.message.content === currentMessage
    )
    if (currentIndex > 0) {
      // 获取上一条用户消息
      const userMessage = messages[currentIndex - 1].message
      // 移除当前的助手回答
      setMessages(prev => prev.slice(0, currentIndex - 1))
      // 重新发送请求
      onSubmit(userMessage.content)
    }
  }

  const renderMarkdown: BubbleProps['messageRender'] = content => {
    return (
      <Typography>
        <div
          style={{ color: theme === 'dark' ? '#fff' : '' }}
          dangerouslySetInnerHTML={{ __html: md.render(content) }}
        />
      </Typography>
    )
  }

  const chatList = (
    <div className={styles.chatList}>
      {messages?.length ? (
        /* 🌟 消息列表 */
        <Bubble.List
          items={messages?.map(i => ({
            ...i.message,
            classNames: {
              content: i.status === 'loading' ? styles.loadingMessage : '',
            },
            typing: i.status === 'loading' ? true : false,
            variant: 'outlined',
            avatar:
              i?.message?.role === 'assistant'
                ? {
                    icon: (
                      <Image
                        src="/icon.svg"
                        alt="SVG Image"
                        width={20}
                        height={20}
                      />
                    ),
                  }
                : undefined,
            messageRender: renderMarkdown,
          }))}
          style={{
            height: '100%',
            paddingInline:
              window.innerWidth > 768 ? 'calc(calc(100% - 900px) /2)' : '8px',
          }}
          roles={{
            assistant: {
              placement: 'start',
              footer: message => (
                <div style={{ display: 'flex', gap: 4 }}>
                  {!loading && (
                    <Tooltip title="重新生成">
                      <Button
                        type="text"
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => handleRegenerate(message)}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="复制">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(message)}
                    />
                  </Tooltip>
                </div>
              ),
              loadingRender: () => <Spin size="small" />,
            },
            user: { placement: 'end' },
          }}
        />
      ) : (
        <Space
          direction="vertical"
          size={16}
          style={{
            paddingInline: 'calc(calc(100% - 850px) /2)',
            width: '100%',
          }}
          className={styles.placeholder}
        >
          <Welcome
            variant="borderless"
            title={
              <span style={{ color: theme === 'dark' ? darkTextColor : '' }}>
                {window.innerWidth > 768 ? "Hi, I'm Your AI Assistant" : 'Hi 👋'}
              </span>
            }
            description={
              <span style={{ color: theme === 'dark' ? darkTextColor : '' }}>
                {window.innerWidth > 768
                  ? '我是你的 AI 助手，可以帮你解答任何前端技术问题，也可以在这了解我老大的个人经历。让我们开始愉快的交谈吧！'
                  : '让我们开始愉快的交谈吧！'}
              </span>
            }
          />
          <Flex
            gap={16}
            justify="space-between"
            vertical={window.innerWidth < 768}
          >
            <div style={{ flex: 1 }}>
              <Spin spinning={bookLoading}>
                <Prompts
                  items={[{
                    ...DESIGN_GUIDE,
                    label: '掘金热门文章'
                  }]}
                  styles={{
                    list: { height: '100%' },
                    item: {
                      flex: 1,
                      backgroundColor: theme === 'dark' ? '#111827' : '',
                      borderRadius: 12,
                      border:
                        theme === 'dark'
                          ? '0px solid #fff'
                          : '1px solid rgba(0, 0, 0, 0.06)',
                    },
                    subItem: { padding: 0, background: 'transparent' },
                  }}
                  onItemClick={(info: any) => {
                    window.open(info.data?.url, '_blank')
                  }}
                  className={`${styles.chatPrompt} ${
                    theme === 'dark' ? darkStyles.chatPrompt : ''
                  }`}
                />
              </Spin>
            </div>
            <RecommendList items={HOT_TOPICS} />
          </Flex>
        </Space>
      )}
    </div>
  )
  const senderHeader = (
    <Sender.Header
      title="Upload File"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{ content: { padding: 0 } }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={info => setAttachedFiles(info.fileList)}
        placeholder={type =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  )
  const chatSender = (
    <>
      {/* 🌟 提示词 */}
      <Prompts
        items={SENDER_PROMPTS}
        onItemClick={(info: any) => {
          // 分两种情况如果是自己定义的标签，需要返回自己定义的内容，不做请求，反之请求
          if (info.data.customContent) {
          } else {
            onSubmit(info.data.description as string)
          }
        }}
        styles={{
          item: { padding: '6px 12px' },
        }}
        className={`${styles.senderPrompt} ${
          theme === 'dark' ? darkStyles.senderPrompt : ''
        }`}
      />
      {/* 🌟 输入框 */}
      <Sender
        value={inputValue}
        header={senderHeader}
        onSubmit={() => {
          onSubmit(inputValue)
          setInputValue('')
        }}
        onChange={setInputValue}
        onCancel={() => {
          abortController.current?.abort()
        }}
        loading={loading}
        className={`${styles.sender} ${
          theme === 'dark' ? darkStyles.sender : ''
        }`}
        actions={(_, info) => {
          const { SendButton, LoadingButton } = info.components
          return (
            <Flex gap={4}>
              {loading ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton icon={<OpenAIOutlined />} type="primary" />
              )}
            </Flex>
          )
        }}
        style={{ maxWidth: '900px' }}
        placeholder="给 洪大俊 发送消息"
      />
    </>
  )

  return (
    <ConfigProvider theme={{ token: { colorPrimary: 'rgb(31,41,55)' } }}>
      <div
        className={`${styles.layout} ${
          theme === 'dark' ? darkStyles.layout : ''
        }`}
      >
        <div className={styles.chat}>
          {chatList}
          {chatSender}
        </div>
      </div>
    </ConfigProvider>
  )
}

// 使用 dynamic import 禁用 SSR
const ChatComponent = dynamic(() => Promise.resolve(Independent), {
  ssr: false,
})

// 导出一个包装组件
export default function ChatPage() {
  return <ChatComponent />
}