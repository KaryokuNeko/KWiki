'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface FullPageScrollProps {
  children: ReactNode
}

export function FullPageScroll({ children }: FullPageScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const lastScrollY = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sections = container.querySelectorAll<HTMLElement>('[data-section]')
    const sectionCount = sections.length

    const scrollToSection = (index: number) => {
      if (index < 0 || index >= sectionCount || isScrolling) return

      setIsScrolling(true)
      setCurrentSection(index)

      sections[index].scrollIntoView({ behavior: 'smooth' })

      setTimeout(() => {
        setIsScrolling(false)
      }, 800)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) {
        e.preventDefault()
        return
      }

      const section = sections[currentSection]
      if (!section) return

      // Check if this is the last section (items + footer)
      const isLastSection = currentSection === sectionCount - 1

      if (isLastSection) {
        const sectionRect = section.getBoundingClientRect()
        const isAtTop = sectionRect.top >= -5

        // Scrolling up from the top of items section -> go to characters
        if (e.deltaY < 0 && isAtTop) {
          e.preventDefault()
          scrollToSection(currentSection - 1)
          return
        }

        // Allow free scroll within last section (for footer)
        return
      }

      // For other sections, snap scroll
      e.preventDefault()

      if (e.deltaY > 0) {
        scrollToSection(currentSection + 1)
      } else if (e.deltaY < 0) {
        scrollToSection(currentSection - 1)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return

      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY.current - touchEndY

      const section = sections[currentSection]
      if (!section) return

      const isLastSection = currentSection === sectionCount - 1

      if (isLastSection) {
        const sectionRect = section.getBoundingClientRect()
        const isAtTop = sectionRect.top >= -5

        // Swiping up (scrolling down content) from top -> go to previous
        if (diff < -50 && isAtTop) {
          scrollToSection(currentSection - 1)
          return
        }
        // Allow free scroll within last section
        return
      }

      // For other sections, snap scroll
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          scrollToSection(currentSection + 1)
        } else {
          scrollToSection(currentSection - 1)
        }
      }
    }

    // Update current section based on scroll position
    const handleScroll = () => {
      if (isScrolling) return

      const scrollY = container.scrollTop
      const viewportHeight = window.innerHeight

      // Determine which section is most visible
      let newSection = 0
      let maxVisibility = 0

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
        const visibility = visibleHeight / viewportHeight

        if (visibility > maxVisibility) {
          maxVisibility = visibility
          newSection = index
        }
      })

      if (newSection !== currentSection) {
        setCurrentSection(newSection)
      }

      lastScrollY.current = scrollY
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [currentSection, isScrolling])

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll scrollbar-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  )
}
