import { Heading } from '@tiptap/extension-heading'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Attribute } from '@tiptap/core'

function generateSlug(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fff-]/g, '') || 'heading'
  )
}

export const HeadingWithId = Heading.extend({
  addAttributes() {
    const parentAttrs: Record<string, Attribute> = this.parent?.() || {}
    return {
      ...parentAttrs,
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('id'),
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.id) return {}
          return { id: attributes.id }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('headingWithId'),
        appendTransaction(transactions, _oldState, newState) {
          const docChanged = transactions.some(tr => tr.docChanged)
          if (!docChanged) return null

          const { tr } = newState
          let modified = false
          const usedIds = new Set<string>()

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== 'heading') return

            const text = node.textContent
            let id = (node.attrs.id as string | null) || null

            if (!id) {
              id = generateSlug(text)
            }

            let finalId = id
            let counter = 2
            while (usedIds.has(finalId)) {
              finalId = `${id}-${counter}`
              counter++
            }
            usedIds.add(finalId)

            if (finalId !== node.attrs.id) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                id: finalId,
              })
              modified = true
            }
          })

          return modified ? tr : null
        },
      }),
    ]
  },
})