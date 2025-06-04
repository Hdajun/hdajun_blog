import Link from 'next/link'
import { format } from 'date-fns'
import { getPostsByTag } from '@/lib/mdx'

interface TagPageProps {
  params: {
    tag: string
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const posts = await getPostsByTag(params.tag)

  return (
    <div className="space-y-12 py-6">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-primary-900 dark:text-white">
          Posts tagged with "#{params.tag}"
        </h1>
        <p className="mt-2 text-primary-600 dark:text-gray-300">
          Found {posts.length} post{posts.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {posts.map((post) => (
          <article key={post._raw.flattenedPath} className="py-8">
            <div className="space-y-2">
              <dl>
                <dt className="sr-only">Published on</dt>
                <dd className="text-sm text-primary-600 dark:text-gray-400">
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </dd>
              </dl>
              <h2 className="text-2xl font-medium tracking-tight">
                <Link 
                  href={post.url}
                  className="text-primary-900 hover:text-primary-600 dark:text-white dark:hover:text-gray-300"
                >
                  {post.title}
                </Link>
              </h2>
              <div className="flex gap-2">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag}`}
                    className="text-sm text-primary-600 hover:text-primary-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
              <p className="text-primary-600 dark:text-gray-300">
                {post.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}