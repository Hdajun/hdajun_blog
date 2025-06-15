import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypePrism from 'rehype-prism-plus'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' }, required: true }
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/blog/${post._raw.flattenedPath.split('/').pop()}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'src/content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [rehypePrism],
  },
  disableImportAliasWarning: true,
})