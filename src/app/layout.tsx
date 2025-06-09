import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { NavbarWrapper } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'H_dajun 的博客',
  description: '一个使用 Next.js 构建的个人博客',
  icons: [{ rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AntdRegistry>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen flex-col bg-white text-black dark:bg-gray-950 dark:text-white">
              <div className="h-16" aria-hidden="true" />
              <NavbarWrapper />
              <main className="flex-1 overflow-auto no-scrollbar">
                <div className="mx-auto max-w-4xl px-6 py-20">{children}</div>
              </main>
            </div>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}