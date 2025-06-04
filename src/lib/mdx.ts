import { allPosts } from 'contentlayer/generated'

export function getPostsByTag(tag: string) {
  return allPosts
    .filter((post) => post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}