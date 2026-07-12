'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TOOLS, BUILT_TOOLS, FEATURED_TOOLS } from '@/lib/constants'

const TOOL_TAGS: Record<string, string[]> = {
  'jwt-decoder': ['security', 'crypto'],
  'json-formatter': ['data', 'format'],
  'regex-tester': ['text', 'logic'],
  'code-formatter': ['code', 'beautify'],
  'diff-checker': ['compare', 'text'],
  'base64-encoder': ['encode', 'crypto'],
  'url-encoder': ['encode', 'web'],
  'hash-generator': ['crypto', 'security'],
  'password-generator': ['security', 'auth'],
  'uuid-generator': ['id', 'generate'],
  'qr-code-generator': ['image', 'share'],
  'qr-code-decoder': ['image', 'scan'],
  'html-playground': ['code', 'preview'],
  'markdown-editor': ['text', 'write'],
  'json-csv-converter': ['data', 'convert'],
  'yaml-json-converter': ['data', 'convert'],
  'binary-converter': ['math', 'convert'],
  'hex-to-rgb': ['color', 'design'],
  'api-response-validator': ['api', 'debug'],
  'unix-timestamp-converter': ['time', 'convert'],
  'webhook-tester': ['api', 'test'],
}

export function HeroSection() {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Auto-focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !dropdownRef.current) return
    const item = dropdownRef.current.children[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  // Featured tools (only these, not all of them)
  const featuredTools = useMemo(() =>
    TOOLS.filter(t => FEATURED_TOOLS.includes(t.slug)),
    []
  )

  const filteredTools = useMemo(() => {
    if (!query.trim()) return featuredTools
    const q = query.toLowerCase()
    return featuredTools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q)
    )
  }, [query, featuredTools])

  const navigateTo = (slug: string) => {
    setQuery('')
    setSelectedIndex(-1)
    router.push(`/${slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!query.trim() || !filteredTools.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i < filteredTools.length - 1 ? i + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i > 0 ? i - 1 : filteredTools.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          navigateTo(filteredTools[selectedIndex].slug)
        } else {
          navigateTo(filteredTools[0].slug)
        }
        break
      case 'Escape':
        e.preventDefault()
        setQuery('')
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    if (filteredTools.length > 0) {
      const idx = selectedIndex >= 0 ? selectedIndex : 0
      navigateTo(filteredTools[idx].slug)
    }
  }

  return (
    <div className="min-h-full bg-[#000000] text-[#F9F9F9] font-mono flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <section className="pt-14 md:pt-16 pb-14 md:pb-16 w-full flex flex-col items-start relative">
        <h1 className="font-heading text-6xl md:text-[10vw] leading-none font-bold tracking-tighter mb-4 text-[#F9F9F9] select-none">
          <span className="text-[#00FF41]">&gt;</span> KRUMB.DEV
        </h1>
        <p className="text-base md:text-lg text-[#888888] mb-8 select-none">
          &gt; Zero-server dev toolkit. Paste your payload below.
        </p>

        <div className="w-full relative">
          <form onSubmit={handleSubmit} className="w-full flex items-center">
            <span className="text-[#00FF41] font-mono text-lg md:text-2xl font-bold mr-3 select-none shrink-0">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="SEARCH_QUERY: [ type tool or keyword... ]"
              className="w-full bg-transparent text-lg md:text-2xl text-[#F9F9F9] placeholder-[#555555] font-mono outline-none border-none transition-none caret-[#00FF41]"
              autoComplete="off"
              spellCheck={false}
            />
          </form>

          {/* Inline results dropdown */}
          {query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 border border-[#333333] bg-[#0a0a0a] max-h-[360px] overflow-y-auto">
              {filteredTools.length === 0 ? (
                <div className="px-4 py-6 text-center font-mono text-xs text-[#555555]">
                  <span className="text-[#FF4444]">✗</span> No tools matching &quot;{query}&quot;
                </div>
              ) : (
                <div ref={dropdownRef}>
                  {filteredTools.map((tool, i) => {
                    const tags = TOOL_TAGS[tool.slug] || ['tool']
                    const isSelected = i === selectedIndex
                    return (
                      <button
                        key={tool.slug}
                        type="button"
                        onClick={() => navigateTo(tool.slug)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full text-left px-4 py-3 border-b border-[#1a1a1a] last:border-b-0 font-mono transition-none cursor-pointer ${
                          isSelected
                            ? 'bg-[#111111] text-[#F9F9F9]'
                            : 'bg-transparent text-[#888888] hover:bg-[#0d0d0d]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${isSelected ? 'text-[#00FF41]' : 'text-[#F9F9F9]'}`}>
                            {isSelected ? '[>' : '['} {tool.name}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-[#00FF41]' : 'text-[#555555]'}`}>
                            [RUN]
                          </span>
                        </div>
                        <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">
                          {tool.shortDescription}
                        </p>
                        <div className="flex gap-2 mt-1.5">
                          {tags.map(tag => (
                            <span key={tag} className="text-[10px] text-[#444444] font-mono uppercase">
                              [{tag}]
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              {/* Status bar */}
              <div className="px-4 py-1.5 bg-[#000000] border-t border-[#1a1a1a] font-mono text-[10px] text-[#444444] flex items-center gap-3">
                <span>↑↓ navigate</span>
                <span>⏎ select</span>
                <span>⎋ close</span>
                <span className="ml-auto">{filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURED TOOLS GRID ===== */}
      <section className="pb-16 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-[#F9F9F9] pb-4 mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase">
              Developer Tools
            </h2>
            <p className="text-[#888888] text-xs mt-1 font-mono">
              SYS_DIR: /tools/{query.trim() ? query.toLowerCase().replace(/\s+/g, '_') : 'featured'}
            </p>
          </div>
          <Link
            href="/tools"
            className="terminal-btn mt-4 md:mt-0"
          >
            [<span className="green-chevron">&gt;</span> Browse All Tools <ArrowRight className="w-3 h-3" />]
          </Link>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-[#888888] text-sm py-12 text-center select-none">
            <span className="text-[#FF4444]">✗</span>{' '}
            No tools matching &quot;{query}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => {
              const tags = TOOL_TAGS[tool.slug] || ['tool']
              return (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group block border-b border-[#333333] hover:border-[#00FF41] pb-4 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00FF41]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-heading text-lg font-bold text-[#F9F9F9] group-hover:text-[#00FF41] transition-none">
                      {tool.name}
                    </h3>
                    <span className="text-[#00FF41] font-mono text-xs opacity-0 group-hover:opacity-100 transition-none shrink-0 ml-2">
                      [RUN]
                    </span>
                  </div>
                  <p className="text-[#888888] text-xs mb-2 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] text-[#555555] font-mono uppercase tracking-wider select-none"
                      >
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ===== EXECUTION POLICY ===== */}
      <section className="pb-24 w-full">
        <div className="border-l-4 border-[#00FF41] pl-6 py-1.5">
          <h2 className="font-heading text-2xl font-bold uppercase mb-4 text-[#F9F9F9]">
            Execution Policy
          </h2>
          <p className="text-[#888888] leading-relaxed mb-4 text-xs md:text-sm">
            KRUMB.DEV operates on a strict zero-server-call architecture. Every
            conversion, hash generation, and formatting task executes entirely
            within your browser&apos;s JavaScript engine.
          </p>
          <p className="text-[#888888] leading-relaxed text-xs md:text-sm">
            We maintain no database storage, record no server logs, and do not
            track your payload data. Your code remains yours.
          </p>
        </div>
      </section>
    </div>
  )
}
