export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center  text-center">
      <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
        欢迎来到我的博客
      </h1>
      <p className="mt-6 max-w-[42rem] text-lg text-gray-600 dark:text-gray-400">
        分享关于Web开发、技术心得和其他有趣的话题。如果你对技术有任何疑问或想法，欢迎点击下方按钮和我交流，一起探讨编程的乐趣。
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <a
          href="/chat"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          和我聊聊
        </a>
        <a
          href="/blog"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          阅读博客
        </a>
      </div>
    </div>
  )
}