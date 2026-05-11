import { useCallback, useEffect, useState } from 'react'

export function useSlideNav(slideIds: string[]) {
  const [activeIndex, setActiveIndex] = useState(0)

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(slideIds.length - 1, index))
      const el = document.querySelector(`[data-slide-id="${slideIds[clamped]}"]`)
      el?.scrollIntoView({ behavior: 'smooth' })
    },
    [slideIds],
  )

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const id = (entry.target as HTMLElement).dataset.slideId
            const idx = slideIds.findIndex((s) => s === id)
            if (idx !== -1) setActiveIndex(idx)
          }
        }
      },
      { threshold: [0.6] },
    )
    slideIds.forEach((id) => {
      const el = document.querySelector(`[data-slide-id="${id}"]`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [slideIds])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        goTo(0)
      } else if (e.key === 'End') {
        goTo(slideIds.length - 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, goTo, slideIds.length])

  return { activeIndex, next, prev, goTo }
}
