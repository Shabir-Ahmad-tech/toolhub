'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { TOOLS, BUILT_TOOLS } from '@/lib/constants'

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
  'cron-expression-builder': ['time', 'logic'],
  'curl-to-code': ['api', 'code'],
  'gitignore-generator': ['generate', 'code'],
  'code-playground': ['code', 'preview'],
  'json-to-typescript': ['data', 'code'],
  'svg-to-jsx': ['code', 'convert'],
  'meta-tag-generator': ['web', 'generate'],
  'robots-sitemap-generator': ['web', 'generate'],
  'css-grid-generator': ['code', 'design'],
  'iban-validator': ['data', 'validate'],
  'dns-ssl-checker': ['api', 'security'],
}

const CATEGORIES = [
  { label: 'ENCODING & FORMATTING', key: 'format', matchTags: ['format', 'encode', 'beautify', 'convert', 'data'] },
  { label: 'SECURITY & CRYPTO', key: 'crypto', matchTags: ['security', 'crypto', 'auth', 'validate'] },
  { label: 'GENERATORS & IDS', key: 'generate', matchTags: ['generate', 'id', 'share'] },
  { label: 'TEXT & CODE', key: 'text', matchTags: ['text', 'logic', 'code', 'write', 'preview'] },
  { label: 'API & DEBUG', key: 'api', matchTags: ['api', 'debug', 'test', 'time', 'compare'] },
  { label: 'IMAGE & COLOR', key: 'image', matchTags: ['image', 'scan', 'color', 'design', 'math'] },
  { label: 'SEO & WEB', key: 'web', matchTags: ['web', 'generate'] },
]

export default function ToolsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [bootDone, setBootDone] = useState(false)
  const [bootLines, setBootLines] = useState<string[]>([])

  const bootMessages = [
    'SYS_INIT: loading tool directory...',
    'SYS_INIT: mounting 46 developer tools...',
    'SYS_INIT: all systems ready.',
  ]

  // Mobile-optimized: reveal lines at intervals with CSS animation
  // No char-by-char re-renders — just 3 state steps total
  useEffect(() => {
    let cancelled = false
    let lineIdx = 0
    const revealNext = () => {
      if (cancelled || lineIdx >= bootMessages.length) {
        if (!cancelled) setBootDone(true)
        return
      }
      setBootLines(bootMessages.slice(0, lineIdx + 1))
      lineIdx++
      setTimeout(revealNext, 400 + (lineIdx === bootMessages.length ? 200 : 0))
    }
    setTimeout(revealNext, 300)
    return () => { cancelled = true }
  }, [])

  const builtTools = useMemo(() => TOOLS.filter(t => BUILT_TOOLS.includes(t.slug)), [])

  const filteredTools = useMemo(() => {
    let tools = builtTools
    if (search.trim()) {
      const q = search.toLowerCase()
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.slug.includes(q) ||
        t.shortDescription.toLowerCase().includes(q)
      )
    }
    if (activeCategory) {
      const cat = CATEGORIES.find(c => c.key === activeCategory)
      if (cat) {
        tools = tools.filter(t => {
          const tags = TOOL_TAGS[t.slug] || []
          return tags.some(tag => cat.matchTags.includes(tag))
        })
      }
    }
    return tools
  }, [builtTools, search, activeCategory])

  const activeLabel = CATEGORIES.find(c => c.key === activeCategory)?.label || 'ALL_TOOLS'

  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">

      {/* === BOOT SEQUENCE === */}
      <div className="border-b border-[#333333] px-6 py-3 font-mono text-xs">
        {bootLines.map((line, i) => (
          <p key={i} className={`${i < bootLines.length - 1 ? 'text-[#555555]' : 'text-[#00FF41]'} boot-line-enter`}>
            <span className="text-[#00FF41]">&gt;</span> {line}
            {i === bootLines.length - 1 && !bootDone && (
              <span className="animate-terminal-blink text-[#00FF41]">_</span>
            )}
          </p>
        ))}
        {bootDone && (
          <p className="text-[#555555] mt-1">
            <span className="text-[#00FF41]">&gt;</span> {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} loaded. Type to search or select a category.
          </p>
        )}
      </div>

      {/* === SEARCH + CATEGORIES + VIEW TOGGLE === */}
      <section className="border-b border-[#333333]">
        <div className="px-6 pt-6 pb-4 space-y-4">
          {/* Search */}
          <div className="flex items-center">
            <span className="text-[#00FF41] mr-3 font-mono text-lg md:text-xl font-bold shrink-0">&gt;</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH: type tool name or keyword..."
              className="w-full bg-transparent text-base md:text-lg text-[#F9F9F9] placeholder-[#555555] font-mono outline-none border-none transition-none caret-[#00FF41]"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Category pills + view toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`terminal-btn text-[10px] md:text-[11px] ${
                  !activeCategory ? 'text-[#00FF41]' : ''
                }`}
              >
                {!activeCategory ? (
                  <>[<span className="green-chevron">&gt;</span> ALL TOOLS]</>
                ) : (
                  <>[ALL TOOLS]</>
                )}
              </button>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(isActive ? null : cat.key)}
                    className={`terminal-btn text-[10px] md:text-[11px] ${
                      isActive ? 'text-[#F9F9F9]' : ''
                    }`}
                  >
                    {isActive ? (
                      <>[<span className="green-chevron">&gt;</span> {cat.label}]</>
                    ) : (
                      <>[{cat.label}]</>
                    )}
                  </button>
                )
              })}
            </div>

            {/* View toggle */}
            <div className="flex gap-1 border border-[#333333]">
              <button
                onClick={() => setViewMode('grid')}
                className={`terminal-btn px-2 py-1 text-[10px] ${viewMode === 'grid' ? 'text-[#00FF41]' : ''}`}
              >
                [<span className={`${viewMode === 'grid' ? 'green-chevron' : ''}`}>{viewMode === 'grid' ? '>' : ''}</span> GRID]
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`terminal-btn px-2 py-1 text-[10px] ${viewMode === 'list' ? 'text-[#00FF41]' : ''}`}
              >
                [<span className={`${viewMode === 'list' ? 'green-chevron' : ''}`}>{viewMode === 'list' ? '>' : ''}</span> LIST]
              </button>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="border-t border-[#333333] px-6 py-2 flex items-center justify-between text-[10px] font-mono text-[#555555]">
          <span>[ TOOLS: {filteredTools.length}/{builtTools.length} ]</span>
          <span>[ CATEGORY: {activeLabel} ]</span>
          <span>[ VIEW: {viewMode === 'grid' ? 'GRID' : 'LIST'} ]</span>
          <span>[ STATUS: <span className="text-[#00FF41]">READY</span> ]</span>
        </div>
      </section>

      {/* === TOOLS LISTING === */}
      <main className="flex-grow px-6 py-8">

        {!bootDone ? (
          <div className="py-20 font-mono text-sm text-[#555555] animate-pulse">
            &gt; Loading tool directory...
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="py-20 space-y-4">
            <p className="font-mono text-sm text-[#FF4444]">
              <span className="text-[#FF4444]">✗</span> No tools matching &quot;{search}&quot;
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory(null) }}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> Reset Filters]
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* === GRID VIEW — terminal-style cards, no box borders, text-driven === */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a1a1a]">
            {filteredTools.map((tool) => {
              const tags = TOOL_TAGS[tool.slug] || ['tool']
              return (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group block bg-[#000000] px-5 py-5 cursor-pointer transition-none relative hover:z-10"
                >
                  {/* Index + execution prompt */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] text-[#444444] select-none">
                      {String(builtTools.indexOf(tool) + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] text-[#00FF41] opacity-0 group-hover:opacity-100 transition-none select-none">
                      [RUN]
                    </span>
                  </div>

                  {/* Name as terminal prompt */}
                  <h3 className="font-mono text-sm font-bold text-[#F9F9F9] group-hover:text-[#00FF41] transition-none mb-2 leading-snug">
                    <span className="text-[#555555] select-none">[ </span>
                    <span className="text-[#00FF41] opacity-0 group-hover:opacity-100 transition-none">&gt;</span>{' '}
                    {tool.name}
                  </h3>

                  {/* Description */}
                  <p className="font-mono text-[11px] text-[#666666] mb-3 line-clamp-2 leading-relaxed pl-5">
                    {tool.shortDescription}
                  </p>

                  {/* Tags as inline text, no boxes */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pl-5">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] text-[#444444] uppercase tracking-wider select-none"
                      >
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* === LIST VIEW — terminal ls-style === */
          <div className="font-mono">
            {/* Header line */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 text-[10px] text-[#555555] border-b border-[#333333] uppercase tracking-wider">
              <span className="w-6 shrink-0 text-center">#</span>
              <span className="flex-1">TOOL</span>
              <span className="w-32 text-right">TAGS</span>
            </div>

            {filteredTools.map((tool, idx) => {
              const tags = TOOL_TAGS[tool.slug] || ['tool']

              return (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group flex items-center gap-3 px-4 py-2.5 border-b border-[#1a1a1a] cursor-pointer transition-none hover:bg-[#0a0a0a]"
                >
                  {/* Index */}
                  <span className="w-6 shrink-0 text-center text-[10px] text-[#444444] group-hover:text-[#00FF41] transition-none select-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#F9F9F9] group-hover:text-[#00FF41] transition-none whitespace-nowrap">
                      [<span className="text-[#00FF41] opacity-0 group-hover:opacity-100 transition-none">&gt;</span> {tool.name}]
                    </span>
                    <span className="hidden md:inline text-[11px] text-[#555555] truncate">
                      {"// "}{tool.shortDescription}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="hidden md:flex w-32 shrink-0 gap-1.5 flex-wrap justify-end">
                    {tags.map(tag => (
                      <span key={tag} className="text-[9px] text-[#444444] uppercase tracking-wider select-none">
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Terminal footer */}
        <div className="mt-8 pt-4 border-t border-[#333333]">
          <p className="text-[10px] font-mono text-[#555555]">
            <span className="text-[#444444]">$</span> EOF &mdash; {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} in directory
          </p>
        </div>
      </main>
    </div>
  )
}
