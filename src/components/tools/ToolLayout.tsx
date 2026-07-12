'use client'

import { ReactNode, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ToolSchema } from './ToolSchema'
import { ShareButtons } from './ShareButtons'
import { RelatedTools } from './RelatedTools'
import { trackToolUsage } from '@/lib/utils'
import { TerminalButton } from '@/components/ui/TerminalButton'

interface ToolLayoutProps {
  title: string
  description: string
  toolSlug: string
  children: ReactNode
  categorySlug?: string
  faq?: Array<{ question: string; answer: string }>
  seoContent?: ReactNode
}

export function ToolLayout({
  title,
  description,
  toolSlug,
  children,
  categorySlug,
  faq,
  seoContent,
}: ToolLayoutProps) {
  useEffect(() => {
    trackToolUsage(toolSlug)
  }, [toolSlug])

  return (
    <>
      <ToolSchema
        name={title}
        description={description}
        slug={toolSlug}
        categorySlug={categorySlug}
        faq={faq}
      />

      <div className="max-w-4xl mx-auto py-4 md:py-8 space-y-4 md:space-y-6">
        {/* Back button + Header */}
        <div className="space-y-1 select-none">
          <TerminalButton href="/tools">
            <span className="green-chevron">&gt;</span> Back to Explorer
          </TerminalButton>

          <div className="pt-2">
            <h1 className="text-xl md:text-3xl font-heading font-bold text-[#F9F9F9] mb-1 leading-snug">
              {title}
            </h1>
            <p className="text-[#888888] text-xs md:text-sm font-mono leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Tool Workspace — no border box, just content */}
        <div className="py-4">
          {children}
        </div>

        {/* SEO Content & FAQ — terminal section separator */}
        {seoContent && (
          <article className="py-6 space-y-6">
            <div className="border-t border-[#333333]" />
            <div className="max-w-none text-[#888888] font-mono text-xs md:text-sm leading-relaxed space-y-4">
              {seoContent}
            </div>

            {faq && faq.length > 0 && (
              <div className="border-t border-[#1a1a1a] pt-6 space-y-4">
                <h3 className="text-sm md:text-base font-heading font-bold text-[#F9F9F9]">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4 divide-y divide-[#1a1a1a]">
                  {faq.map((item, idx) => (
                    <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-1.5`}>
                      <h4 className="text-xs md:text-sm font-mono font-bold text-[#F9F9F9] flex items-start gap-1.5">
                        <span className="text-[#00FF41] shrink-0 select-none">Q:</span>
                        <span>{item.question}</span>
                      </h4>
                      <p className="text-xs md:text-xs font-mono text-[#888888] pl-4 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}

        {/* Share buttons — no border box */}
        <div className="border-t border-[#333333] pt-4 select-none">
          <ShareButtons toolSlug={toolSlug} title={title} />
        </div>

        {/* Related tools */}
        <div className="select-none">
          <RelatedTools currentTool={toolSlug} />
        </div>
      </div>
    </>
  )
}
