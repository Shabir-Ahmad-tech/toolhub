'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Calculator, ArrowRight, CornerDownLeft, Command } from 'lucide-react'
import { TOOLS, BUILT_TOOLS, CATEGORIES } from '@/lib/constants'
import * as Icons from 'lucide-react'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const builtTools = TOOLS.filter(t => BUILT_TOOLS.includes(t.slug))
  const filteredTools = query.trim()
    ? builtTools.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
        t.slug.includes(query.toLowerCase())
      )
    : builtTools.slice(0, 6)

  useEffect(() => { setSelectedIndex(0) }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(filteredTools.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredTools.length) % Math.max(filteredTools.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredTools[selectedIndex]) {
        handleSelect(filteredTools[selectedIndex].slug)
      }
    }
  }

  const handleSelect = (slug: string) => {
    router.push(`/${slug}`)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) setIsOpen(false)
      }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-[#000000]/90"
    >
      <div
        className="w-full max-w-xl bg-[#000000] overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="relative flex items-center border-b border-[#333333] px-4">
          <span className="text-[#00FF41] font-mono text-lg mr-3 shrink-0">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a tool name or keyword to search..."
            className="w-full py-4 bg-transparent border-none text-[#F9F9F9] font-mono text-sm md:text-base placeholder-[#555555] outline-none focus:outline-none focus:ring-0 caret-[#00FF41]"
            autoComplete="off"
          />
          <span className="hidden sm:inline-flex items-center px-2 text-[10px] font-mono text-[#555555] select-none">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto py-2">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-mono text-[#666666]">
                No tools found for &quot;<span className="text-[#00FF41] font-bold">{query}</span>&quot;
              </p>
              <p className="text-xs font-mono text-[#444444]">
                Try searching for other keywords like &quot;json&quot;, &quot;encode&quot;, or &quot;formatter&quot;.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-1 text-[10px] font-mono text-[#555555] uppercase tracking-wider flex items-center justify-between">
                <span>{query ? 'Search Results' : 'Suggestions'}</span>
                <span className="text-[9px] lowercase font-normal italic">Use ↑↓ arrows</span>
              </div>
              <div className="space-y-0.5 px-2">
                {filteredTools.map((tool, index) => {
                  const isSelected = index === selectedIndex
                  const ToolIcon = (Icons as any)[tool.icon] || Calculator

                  return (
                    <button
                      key={tool.slug}
                      onClick={() => handleSelect(tool.slug)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-3 font-mono transition-none text-left cursor-pointer ${
                        isSelected
                          ? 'text-[#00FF41]'
                          : 'text-[#888888] hover:text-[#F9F9F9]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`shrink-0 ${
                          isSelected ? 'text-[#00FF41]' : 'text-[#555555]'
                        }`}>
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold truncate">{tool.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono block truncate ${
                            isSelected ? 'text-[#00FF41]' : 'text-[#666666]'
                          }`}>
                            {tool.shortDescription}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-4 shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#00FF41]">
                            Navigate <CornerDownLeft className="w-3 h-3" />
                          </span>
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-[#444444]" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#333333] px-4 py-3 bg-[#000000] flex items-center justify-between text-[11px] font-mono text-[#555555]">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5"><Command className="w-3 h-3" /> + K</span>
            <span>Toggle</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Icons.ArrowDownUp className="w-3 h-3" /> Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
          </div>
        </div>
      </div>
    </div>
  )
}
