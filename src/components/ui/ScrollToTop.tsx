'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`group fixed bottom-6 right-6 z-[100] w-11 h-11 flex items-center justify-center bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] transition-none overflow-hidden ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <span className="absolute inset-0 bg-[#000000] group-hover:bg-[#F9F9F9] transition-none" />
      <span className="absolute inset-0 group-hover:shadow-[4px_4px_0px_0px_#00FF41] transition-none" />
      <span className="relative z-10 text-[#F9F9F9] group-hover:text-[#000000] transition-none">
        <ChevronUp className="w-5 h-5" />
      </span>
    </button>
  )
}
