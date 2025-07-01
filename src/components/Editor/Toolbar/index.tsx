import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import {
  Dropdown,
  Button,
  Tooltip,
  ColorPicker,
  Input,
  Form,
  Popover,
  Switch,
} from 'antd'
import type { MenuProps } from 'antd'
import type { Color } from 'antd/es/color-picker'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/Modal'
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  BgColorsOutlined,
  FontColorsOutlined,
  SaveOutlined,
  LoadingOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'

interface ToolbarProps {
  editor: Editor | null
  onSave?: () => Promise<void>
  saveStatus: 'default' | 'saved' | 'saving' | 'error' | 'waitingSaved'
  isPublic: boolean
  onNoteChange: (isPublic?: boolean, isTop?: boolean) => void
  onDelete?: () => Promise<any>
  isTop?: boolean
}

const headingOptions: MenuProps['items'] = [
  { key: '0', label: '正文' },
  { key: '1', label: '标题1' },
  { key: '2', label: '标题2' },
  { key: '3', label: '标题3' },
  { key: '4', label: '标题4' },
  { key: '5', label: '标题5' },
  { key: '6', label: '标题6' },
]

const fontSizeOptions: MenuProps['items'] = [
  { key: '12px', label: '小' },
  { key: '16px', label: '正常' },
  { key: '20px', label: '大' },
  { key: '24px', label: '超大' },
]

// 预设的颜色选项
const presetColors = [
  '#000000', // 黑色
  '#F5222D', // 红色
  '#FA8C16', // 橙色
  '#FADB14', // 黄色
  '#52C41A', // 绿色
  '#1890FF', // 蓝色
  '#722ED1', // 紫色
  '#EB2F96', // 粉色
  '#FFFFFF', // 白色
  '#BFBFBF', // 灰色
]

// 自定义颜色按钮组件
const ColorButton = ({
  color,
  icon: Icon,
  tooltip,
  onChange,
}: {
  color: string
  icon: typeof FontColorsOutlined
  tooltip: string
  onChange: (color: Color) => void
}) => (
  <div className="relative inline-flex items-center">
    <Tooltip title={tooltip}>
      <div className="flex items-center gap-[6px] cursor-pointer">
        <div className="flex flex-col items-center">
          <Button
            type="text"
            icon={
              <Icon
                style={{ color: color === '#ffffff' ? 'inherit' : color }}
              />
            }
          />
        </div>
        <ColorPicker value={color} onChange={onChange}>
          <Button
            type="text"
            style={{ width: 16 }}
            icon={
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400" />
            }
          />
        </ColorPicker>
      </div>
    </Tooltip>
  </div>
)

export const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  onSave,
  saveStatus,
  isPublic,
  onNoteChange,
  onDelete,
  isTop = false,
}) => {
  const [textColor, setTextColor] = useState<string>('#000000')
  const [bgColor, setBgColor] = useState<string>('#ffffff')
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [linkForm] = Form.useForm()
  const [popOpen, setPopOpen] = useState(false)

  if (!editor) {
    return null
  }

  const handleHeadingSelect: MenuProps['onClick'] = ({ key }) => {
    if (key === '0') {
      editor.chain().focus().setParagraph().run()
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: parseInt(key) as 1 | 2 | 3 | 4 | 5 | 6 })
        .run()
    }
  }

  const handleFontSizeSelect: MenuProps['onClick'] = ({ key }) => {
    editor.chain().focus().setFontSize(key).run()
  }

  const handleColorChange = (color: Color) => {
    const hexColor = color.toHexString()
    setTextColor(hexColor)
    editor.chain().focus().setColor(hexColor).run()
  }

  const handleBgColorChange = (color: Color) => {
    const hexColor = color.toHexString()
    setBgColor(hexColor)
    editor.chain().focus().setBackgroundColor(hexColor).run()
  }

  const formatUrl = (url: string) => {
    if (!url) return ''
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`
    }
    return url
  }

  const handleLinkClick = () => {
    const { href = '', text = '' } = editor.getAttributes('link')
    const selectedText = editor.state.selection.empty
      ? ''
      : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ''
        )

    linkForm.setFieldsValue({
      url: href,
      text: selectedText || text,
    })
    setIsLinkModalOpen(true)
  }

  const handleLinkModalCancel = () => {
    linkForm.resetFields()
    setIsLinkModalOpen(false)
  }

  const getSaveIcon = () => {
    switch (true) {
      case saveStatus === 'saving':
        return <LoadingOutlined className="text-blue-500" />
      case saveStatus === 'saved':
        return <CheckCircleOutlined className="text-green-500" />
      case saveStatus === 'waitingSaved':
        return <EditOutlined className="text-yellow-500" />
      case saveStatus === 'error':
        return <WarningOutlined className="text-red-500" />
      default:
        return <SaveOutlined />
    }
  }

  const getSaveTooltip = () => {
    switch (true) {
      case saveStatus === 'saving':
        return '保存中...'
      case saveStatus === 'saved':
        return '已保存'
      case saveStatus === 'waitingSaved':
        return '有未保存的更改'
      case saveStatus === 'error':
        return '保存失败，请重试'
      default:
        return '保存'
    }
  }

  return (
    <>
      <div className="fixed top-[82px] left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-800 shadow-md rounded-lg px-4 py-2 flex items-center gap-2">
        <Dropdown
          menu={{ items: headingOptions, onClick: handleHeadingSelect }}
        >
          <Button type="text">
            {editor.isActive('heading', { level: 1 })
              ? '标题1'
              : editor.isActive('heading', { level: 2 })
              ? '标题2'
              : editor.isActive('heading', { level: 3 })
              ? '标题3'
              : editor.isActive('heading', { level: 4 })
              ? '标题4'
              : editor.isActive('heading', { level: 5 })
              ? '标题5'
              : editor.isActive('heading', { level: 6 })
              ? '标题6'
              : '正文'}
          </Button>
        </Dropdown>

        <Dropdown
          menu={{ items: fontSizeOptions, onClick: handleFontSizeSelect }}
        >
          <Button type="text">字号</Button>
        </Dropdown>

        <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

        <Tooltip title="加粗">
          <Button
            type="text"
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={
              editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }
          />
        </Tooltip>

        <Tooltip title="斜体">
          <Button
            type="text"
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={
              editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }
          />
        </Tooltip>

        <Tooltip title="删除线">
          <Button
            type="text"
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={
              editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }
          />
        </Tooltip>

        <Tooltip title="下划线">
          <Button
            type="text"
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={
              editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }
          />
        </Tooltip>

        <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

        <ColorButton
          color={textColor}
          icon={FontColorsOutlined}
          tooltip="字体颜色"
          onChange={handleColorChange}
        />

        <ColorButton
          color={bgColor}
          icon={BgColorsOutlined}
          tooltip="背景颜色"
          onChange={handleBgColorChange}
        />

        <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

        <Tooltip title="左对齐">
          <Button
            type="text"
            icon={<AlignLeftOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={
              editor.isActive({ textAlign: 'left' })
                ? 'bg-gray-200 dark:bg-gray-700'
                : ''
            }
          />
        </Tooltip>

        <Tooltip title="居中对齐">
          <Button
            type="text"
            icon={<AlignCenterOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={
              editor.isActive({ textAlign: 'center' })
                ? 'bg-gray-200 dark:bg-gray-700'
                : ''
            }
          />
        </Tooltip>

        <Tooltip title="右对齐">
          <Button
            type="text"
            icon={<AlignRightOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={
              editor.isActive({ textAlign: 'right' })
                ? 'bg-gray-200 dark:bg-gray-700'
                : ''
            }
          />
        </Tooltip>

        <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

        <Tooltip title="无序列表">
          <Button
            type="text"
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={
              editor.isActive('bulletList')
                ? 'bg-gray-200 dark:bg-gray-700'
                : ''
            }
          />
        </Tooltip>

        <Tooltip title="有序列表">
          <Button
            type="text"
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={
              editor.isActive('orderedList')
                ? 'bg-gray-200 dark:bg-gray-700'
                : ''
            }
          />
        </Tooltip>

        <Tooltip title="插入链接">
          <Button
            type="text"
            icon={<LinkOutlined />}
            onClick={handleLinkClick}
            className={
              editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }
          />
        </Tooltip>

        {onSave && (
          <>
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />
            <Tooltip title={getSaveTooltip()}>
              <Button type="text" icon={getSaveIcon()} onClick={onSave} />
            </Tooltip>

            <Popover
              open={popOpen}
              onOpenChange={setPopOpen}
              content={
                <div className="w-[360px] space-y-6 p-2">
                  {/* 权限设置行 */}
                  <div className="flex items-center gap-6 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-purple-500 dark:bg-purple-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 dark:text-gray-200">
                          权限管控
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          设置文档的访问权限
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Switch
                        value={isPublic}
                        checkedChildren="公开"
                        unCheckedChildren="私密"
                        onChange={res => {
                          onNoteChange(res, undefined)
                        }}
                      />
                    </div>
                  </div>

                  {/* 置顶设置行 */}
                  <div className="flex items-center gap-6 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-amber-500 dark:bg-amber-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2L12 13M12 13L8 9M12 13L16 9M20 18H4"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 dark:text-gray-200">
                          置顶小记
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          置顶后会优先展示在列表顶部
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Switch
                        value={isTop}
                        checkedChildren="置顶"
                        unCheckedChildren="普通"
                        onChange={res => {
                          onNoteChange(undefined, res)
                        }}
                      />
                    </div>
                  </div>

                  {/* 分享链接行 */}
                  <div className="flex items-center gap-6 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-blue-500 dark:bg-blue-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 dark:text-gray-200">
                          分享小记
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          通过链接分享给他人，所以需要先把小记设置为公开哦
                        </div>
                      </div>
                    </div>
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 删除文档行 */}
                  <div className="flex items-center gap-6 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-red-500 dark:bg-red-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 dark:text-gray-200">
                          删除小记
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          删除后将无法恢复，请谨慎操作
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(true)
                        setPopOpen(false)
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      删除
                    </button>
                  </div>
                </div>
              }
              trigger="click"
              placement="bottom"
              arrow={false}
              style={{
                borderRadius: '12px',
              }}
            >
              <Button type="text" icon={<SettingOutlined />} />
            </Popover>
          </>
        )}
      </div>

      <AnimatePresence>
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLinkModalCancel}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-white/80 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md dark:bg-gray-800/80"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleLinkModalCancel()
                }}
                className="absolute right-6 top-6 z-10 rounded-xl p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="relative">
                <h2 className="mb-4 text-2xl font-bold text-gray-700 dark:text-gray-200">
                  插入链接
                </h2>
                <Form form={linkForm} layout="vertical" className="space-y-5">
                  <div>
                    <label
                      htmlFor="text"
                      className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      链接文本
                    </label>
                    <Form.Item
                      name="text"
                      rules={[{ required: true, message: '请输入链接文本' }]}
                      className="mb-0"
                    >
                      <Input
                        id="text"
                        placeholder="请输入链接显示的文本"
                        className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm
                          transition-all duration-300 ease-out placeholder:text-gray-400
                          hover:border-gray-800 hover:bg-white
                          focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
                          focus:shadow-[0_0_0_1px_rgb(31,41,55),0_0_0_2px_rgb(55,65,81)] focus:-translate-y-[1px]
                          dark:border-gray-700 dark:bg-gray-800/50 dark:text-white
                          dark:hover:border-gray-800 dark:hover:bg-gray-800
                          dark:focus:bg-gray-800"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <label
                      htmlFor="url"
                      className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      链接地址
                    </label>
                    <Form.Item
                      name="url"
                      rules={[{ required: true, message: '请输入链接地址' }]}
                      className="mb-0"
                    >
                      <Input
                        id="url"
                        placeholder="请输入链接URL（如: https://example.com）"
                        className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm
                          transition-all duration-300 ease-out placeholder:text-gray-400
                          hover:border-gray-800 hover:bg-white
                          focus:border-transparent focus:bg-white focus:outline-none focus:ring-0
                          focus:shadow-[0_0_0_1px_rgb(31,41,55),0_0_0_2px_rgb(55,65,81)] focus:-translate-y-[1px]
                          dark:border-gray-700 dark:bg-gray-800/50 dark:text-white
                          dark:hover:border-gray-800 dark:hover:bg-gray-800
                          dark:focus:bg-gray-800"
                      />
                    </Form.Item>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      如果不输入 http:// 或 https:// 将自动添加 https://
                    </p>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleLinkModalCancel}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                        rounded-xl transition-all duration-200 
                        hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 
                        dark:hover:bg-gray-600"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => linkForm.submit()}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white 
                        bg-gray-800 rounded-xl transition-all duration-200 
                        hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 
                        dark:hover:bg-white transform hover:-translate-y-[1px]"
                    >
                      确定
                    </button>
                  </div>
                </Form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="真的要说再见吗？"
        description={
          <>
            这篇小记可能会伤心的偷偷躲起来，再也找不到啦！
            <br />
            你确定要这么做吗？🥺
          </>
        }
        cancelText="再想想"
        confirmText="确定删除"
        type="danger"
        onConfirm={async () => {
          if (onDelete) {
            const res = await onDelete()
            return res
          }
        }}
      />
    </>
  )
}