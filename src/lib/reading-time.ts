/**
 * 计算文章阅读时间
 * @param text 文章内容
 * @param wordsPerMinute 每分钟阅读字数，默认200（英文）或300（中文）
 * @returns 阅读时间（分钟）
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 250): number {
  // 移除 HTML 标签和 Markdown 语法
  const cleanText = text
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .replace(/[#*`_~\[\]()]/g, '') // 移除 Markdown 语法
    .replace(/\s+/g, ' ') // 合并多个空白字符
    .trim()

  // 统计中文字符数
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length
  
  // 统计英文单词数
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
    .split(/\s+/)
    .filter(word => word.length > 0).length

  // 中文按字符计算，英文按单词计算
  // 中文阅读速度约 300-500 字/分钟，英文约 200-250 词/分钟
  const chineseReadingTime = chineseChars / 350 // 中文阅读速度
  const englishReadingTime = englishWords / wordsPerMinute // 英文阅读速度
  
  const totalMinutes = chineseReadingTime + englishReadingTime
  
  // 至少 1 分钟，向上取整
  return Math.max(1, Math.ceil(totalMinutes))
}

/**
 * 格式化阅读时间显示
 * @param minutes 阅读时间（分钟）
 * @returns 格式化的阅读时间字符串
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min read'
  } else if (minutes === 1) {
    return '1 min read'
  } else {
    return `${minutes} min read`
  }
}