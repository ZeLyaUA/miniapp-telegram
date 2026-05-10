import { useState, useEffect, useRef, useCallback } from 'react'

type SwipeDir = 'left' | 'right' | null

export function useSwipeTabs<T extends string>(
  tabs: { id: T }[],
  activeTab: T,
  onTabChange: (id: T) => void
) {
  const [animKey, setAnimKey] = useState(0)
  const [swipeDir, setSwipeDir] = useState<SwipeDir>(null)

  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const isHorizRef = useRef(false)
  const isVertRef = useRef(false)
  const pillsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const active = pillsRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTab])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
    isHorizRef.current = false
    isVertRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartXRef.current
    const dy = e.touches[0].clientY - touchStartYRef.current

    if (!isHorizRef.current) {
      if (isVertRef.current) return

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx > 12 && absDx > absDy * 1.5) {
        isHorizRef.current = true
      } else if (absDy > 8 || (absDy > 0 && absDy >= absDx)) {
        isVertRef.current = true
        return
      } else {
        return
      }
    }

    if (contentRef.current) {
      contentRef.current.style.transform = `translateX(${dx}px)`
      contentRef.current.style.transition = 'none'
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartXRef.current
    if (!isHorizRef.current) return
    isHorizRef.current = false

    const idx = tabs.findIndex(t => t.id === activeTab)
    const canGoNext = dx < 0 && idx < tabs.length - 1
    const canGoPrev = dx > 0 && idx > 0

    if (Math.abs(dx) < 50 || (!canGoNext && !canGoPrev)) {
      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.25s ease-out'
        contentRef.current.style.transform = 'translateX(0)'
      }
      return
    }
    const dir: SwipeDir = dx < 0 ? 'left' : 'right'
    setSwipeDir(dir)
    setAnimKey(k => k + 1)
    onTabChange(tabs[idx + (dx < 0 ? 1 : -1)].id)
  }, [tabs, activeTab, onTabChange])

  const animClass = swipeDir === 'left' ? 'swipe-in-right' : swipeDir === 'right' ? 'swipe-in-left' : ''

  return {
    animKey,
    animClass,
    setSwipeDir,
    pillsRef,
    contentRef,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
