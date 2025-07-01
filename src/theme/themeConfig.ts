import type { ThemeConfig } from 'antd'

const theme: ThemeConfig = {
  token: {
    // 颜色
    colorPrimary: 'rgb(31,41,55)',
    colorInfo: 'rgb(31,41,55)',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorTextBase: '#374151',
    
    // 字体
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    
    // 圆角
    borderRadius: 8,
    
    // 线框
    lineWidth: 1,
    
    // 动画
    motionDurationMid: '0.2s',
    
    // 其他
    controlHeight: 36,
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      paddingContentHorizontal: 16,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Modal: {
      borderRadius: 12,
      paddingContentHorizontal: 24,
      paddingContentVertical: 24,
    },
    Card: {
      borderRadius: 12,
    },
    Message: {
      borderRadius: 8,
    },
  },
}

export default theme