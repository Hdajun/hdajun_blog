import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { NavbarWrapper } from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'H_dajun 的个人空间',
  description: '一个使用 Next.js 构建的个人网站',
  icons: [{ rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AntdRegistry>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="flex h-screen flex-col bg-white text-black dark:bg-gray-950 dark:text-white">
                <div className="h-16" aria-hidden="true" />
                <NavbarWrapper />
                <main className="flex-1 overflow-auto no-scrollbar">
                  <div className="mx-auto max-w-6xl px-6 pt-20 pb-8">{children}</div>
                </main>
              </div>
            </AuthProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}