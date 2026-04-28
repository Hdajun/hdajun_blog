import { useEffect, useState, useRef } from 'react'

export function useScrollSpy(headingIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const visibleIdsRef = useRef<Set<string>>(new Set())
  const idsRef = useRef<string[]>([])

  // 用 ref 存储 ids，避免 effect 频繁重建 observer
  idsRef.current = headingIds

  useEffect(() => {
    const visibleIds = visibleIdsRef.current
    visibleIds.clear()

    const getElements = () =>
      idsRef.current
        .map(id => document.getElementById(id))
        .filter(Boolean) as HTMLElement[]

    const getClosestId = () => {
      let closest: string | null = null
      let closestTop = Infinity
      for (const id of Array.from(visibleIds)) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top < closestTop) {
          closestTop = top
          closest = id
        }
      }
      return closest
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id)
          } else {
            visibleIds.delete(entry.target.id)
          }
        }
        const newActiveId = getClosestId()
        if (newActiveId) setActiveId(newActiveId)
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    // 初始扫描：observe 当前所有标题元素
    const elements = getElements()
    elements.forEach(el => observer.observe(el))

    // 初始高亮
    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      if (rect.top >= -80 && rect.top < window.innerHeight * 0.4) {
        visibleIds.add(el.id)
      }
    }
    const initialActiveId = getClosestId()
    if (initialActiveId) setActiveId(initialActiveId)

    // 当 headingIds 变化时，重新 observe
    const idsChanged = () => {
      observer.disconnect()
      visibleIds.clear()
      const newElements = getElements()
      newElements.forEach(el => observer.observe(el))
      for (const el of newElements) {
        const rect = el.getBoundingClientRect()
        if (rect.top >= -80 && rect.top < window.innerHeight * 0.4) {
          visibleIds.add(el.id)
        }
      }
      const newActiveId = getClosestId()
      setActiveId(newActiveId)
    }

    // 用 MutationObserver 监听 DOM 变化来触发重新 observe
    const mo = new MutationObserver(() => {
      // 延迟检查，等 DOM 更新完毕
      setTimeout(idsChanged, 100)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mo.disconnect()
    }
  }, [])

  return activeId
}