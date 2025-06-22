import { allPosts } from 'contentlayer/generated'
import { getMDXComponent } from 'next-contentlayer/hooks'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath.split('/').pop() }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath.split('/').pop() === params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
  }
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath.split('/').pop() === params.slug)

  if (!post) {
    notFound()
  }

  const Content = getMDXComponent(post.body.code)

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      {/* 客户端组件处理统计和头部信息 */}
      <BlogPostClient post={post} slug={params.slug} />
      
      {/* 服务端渲染的文章内容 */}
      <div className="prose prose-lg prose-blue max-w-none dark:prose-invert
        prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-p:text-gray-700 dark:prose-p:text-gray-300
        prose-a:text-gray-800 hover:prose-a:text-gray-900
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-code:text-gray-800 prose-code:bg-gray-100 dark:prose-code:bg-gray-800
        prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900
        prose-blockquote:border-gray-800 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
        <Content />
      </div>
    </div>
  )
}

export default PostLayout