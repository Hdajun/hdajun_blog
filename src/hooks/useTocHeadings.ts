import { useEffect, useState, useRef, type RefObject } from 'react'
import type { Editor } from '@tiptap/react'

export interface TocHeading {
  id: string
  text: string
  level: number
}

// Editor mode: extract headings from TipTap document
export function useEditorHeadings(editor: Editor | null): TocHeading[] {
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!editor) return

    const extractHeadings = () => {
      const items: TocHeading[] = []
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'heading') {
          items.push({
            id: node.attrs.id || '',
            text: node.textContent,
            level: node.attrs.level as number,
          })
        }
      })
      setHeadings(items)
    }

    extractHeadings()

    const handler = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      if (!transaction.docChanged) return
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(extractHeadings, 150)
    }

    editor.on('transaction', handler)
    return () => {
      editor.off('transaction', handler)
      clearTimeout(timerRef.current)
    }
  }, [editor])

  return headings
}

// View mode: extract headings from DOM
export function useDomHeadings(containerRef: RefObject<HTMLElement | null>): TocHeading[] {
  const [headings, setHeadings] = useState<TocHeading[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const extractHeadings = () => {
      const elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const items: TocHeading[] = Array.from(elements).map((el) => ({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName[1], 10),
      }))
      setHeadings(items)
    }

    extractHeadings()

    const observer = new MutationObserver(extractHeadings)
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [containerRef])

  return headings
}