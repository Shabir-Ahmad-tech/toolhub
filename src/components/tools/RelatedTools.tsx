'use client'

import Link from 'next/link'
import { TOOLS, BUILT_TOOLS, RELATED_TOOLS } from '@/lib/constants'

interface RelatedToolsProps {
  currentTool: string
  limit?: number
}

export function RelatedTools({ currentTool, limit = 4 }: RelatedToolsProps) {
  const current = TOOLS.find(t => t.slug === currentTool)
  if (!current) return null

  // Use curated map, then fall back to same-category filtering
  let relatedSlugs = RELATED_TOOLS[currentTool]
  if (!relatedSlugs) {
    relatedSlugs = TOOLS
      .filter(t => t.slug !== currentTool && t.category === current.category && BUILT_TOOLS.includes(t.slug))
      .map(t => t.slug)
  }

  const related = relatedSlugs
    .filter(slug => slug !== currentTool && BUILT_TOOLS.includes(slug))
    .slice(0, limit)
    .map(slug => TOOLS.find(t => t.slug === slug))
    .filter((t): t is typeof current => t !== undefined)

  if (related.length === 0) return null

  return (
    <div className="py-4">
      <div className="border-t border-[#333333] mb-4" />
      <h3 className="text-xs font-mono font-bold text-[#F9F9F9] mb-4 uppercase tracking-wider">
        Related Tools
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {related.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="terminal-btn border-b border-[#1a1a1a] hover:border-[#00FF41] pb-2 transition-none"
          >
            [<span className="green-chevron">&gt;</span> {tool.name}]
          </Link>
        ))}
      </div>
    </div>
  )
}
