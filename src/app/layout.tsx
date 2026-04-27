import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { NavbarWrapper } from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'H_dajun 的个人空间',
  description: '一个使用 Next.js 构建的个人网站',
  icons: [{ rel: 'icon', url: '/newLogo.svg', type: 'image/svg+xml' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <div className="flex h-screen bg-white text-black dark:bg-gray-950 dark:text-white">
                  <NavbarWrapper />
                  <main className="relative flex-1 overflow-auto no-scrollbar pt-12 md:pt-0">
                    <div className="w-full px-4 md:px-8 pb-6">
                      {children}
                    </div>
                  </main>
                </div>
              </AuthProvider>
            </ThemeProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}