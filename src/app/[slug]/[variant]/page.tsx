import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SEO_VARIANTS } from '@/lib/seo-variants'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { RelatedTools } from '@/components/tools/RelatedTools'

// ── Static generation ──────────────────────────────────────

export function generateStaticParams() {
  return SEO_VARIANTS.map((v) => ({
    slug: v.toolSlug,
    variant: v.slug,
  }))
}

// ── Metadata ───────────────────────────────────────────────

export function generateMetadata({
  params,
}: {
  params: { slug: string; variant: string }
}): Metadata {
  const entry = SEO_VARIANTS.find(
    (v) => v.toolSlug === params.slug && v.slug === params.variant,
  )
  if (!entry) return {}
  return {
    title: entry.meta.title,
    description: entry.meta.description,
    openGraph: {
      title: entry.meta.title,
      description: entry.meta.description,
      type: 'website',
    },
  }
}

// ── Page ───────────────────────────────────────────────────

export default function VariantPage({
  params,
}: {
  params: { slug: string; variant: string }
}) {
  const entry = SEO_VARIANTS.find(
    (v) => v.toolSlug === params.slug && v.slug === params.variant,
  )
  if (!entry) notFound()

  const canonicalUrl = `https://toolhub.com/${entry.toolSlug}/${entry.slug}`

  return (
    <>
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Tools',
                item: `https://toolhub.com/tools`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: entry.toolName,
                item: `https://toolhub.com/${entry.toolSlug}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: entry.h1,
                item: canonicalUrl,
              },
            ],
          }),
        }}
      />

      {/* JSON-LD: WebPage with freshness dates */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: entry.meta.title,
            description: entry.meta.description,
            url: canonicalUrl,
            datePublished: '2026-01-15',
            dateModified: '2026-07-12',
          }),
        }}
      />

      {/* JSON-LD: FAQPage */}
      {entry.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: entry.faq.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.answer,
                },
              })),
            }),
          }}
        />
      )}

      <main className="max-w-4xl mx-auto py-4 md:py-8 space-y-6 md:space-y-8">
        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#666666] select-none">
          <Link href="/tools" className="hover:text-[#F9F9F9] transition-none">
            Tools
          </Link>
          <span>/</span>
          <Link
            href={`/${entry.toolSlug}`}
            className="hover:text-[#F9F9F9] transition-none"
          >
            {entry.toolName}
          </Link>
          <span>/</span>
          <span className="text-[#888888]">{entry.slug}</span>
        </nav>

        {/* ── Back to tool ───────────────────────────── */}
        <TerminalButton href={`/${entry.toolSlug}`}>
          <span className="green-chevron">&gt;</span> Use the {entry.toolName}
        </TerminalButton>

        {/* ── H1 + Intro ─────────────────────────────── */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-3xl font-heading font-bold text-[#F9F9F9] leading-snug">
            {entry.h1}
          </h1>
          <p className="text-xs md:text-sm font-mono text-[#888888] leading-relaxed">
            {entry.intro}
          </p>
        </div>

        {/* ── Content sections ────────────────────────── */}
        <div className="space-y-6">
          {entry.sections.map((section, i) => (
            <section key={i} className="space-y-2">
              <h2 className="text-sm md:text-base font-heading font-bold text-[#F9F9F9]">
                {section.heading}
              </h2>
              <p className="text-xs md:text-sm font-mono text-[#888888] leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {/* ── Collection note ─────────────────────────── */}
        <p className="text-[10px] font-mono text-[#555555] leading-relaxed">
          This page is part of the{' '}
          <Link
            href="/free-developer-tools"
            className="text-[#888888] hover:text-[#F9F9F9] underline underline-offset-4 decoration-[#333333] transition-none"
          >
            collection of 46 free developer tools
          </Link>
          . Each tool runs entirely in your browser — no signup, no server upload.
        </p>

        {/* ── CTA ─────────────────────────────────────── */}
        <div className="bg-[#000000] border border-[#333333] p-4 md:p-6 space-y-3">
          <p className="text-xs md:text-sm font-mono font-bold text-[#F9F9F9]">
            Ready to format your {entry.slug} code?
          </p>
          <p className="text-xs font-mono text-[#888888]">
            Paste your code into the{' '}
            <Link
              href={`/${entry.toolSlug}`}
              className="text-[#00FF41] hover:underline"
            >
              {entry.toolName}
            </Link>{' '}
            tool above and format it instantly. No signup, no upload — everything
            runs in your browser.
          </p>
        </div>

        {/* ── FAQ ──────────────────────────────────────── */}
        {entry.faq.length > 0 && (
          <div className="space-y-4">
            <div className="border-t border-[#333333]" />
            <h2 className="text-sm md:text-base font-heading font-bold text-[#F9F9F9]">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 divide-y divide-[#1a1a1a]">
              {entry.faq.map((item, i) => (
                <div key={i} className="pt-4 first:pt-0 first:border-t-0 border-t border-[#1a1a1a]">
                  <h3 className="text-xs md:text-sm font-heading font-bold text-[#F9F9F9] mb-1">
                    {item.question}
                  </h3>
                  <p className="text-xs font-mono text-[#888888] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Related tools ──────────────────────────── */}
        <div className="space-y-4">
          <div className="border-t border-[#333333]" />
          <h2 className="text-sm md:text-base font-heading font-bold text-[#F9F9F9]">
            Related Developer Tools
          </h2>
          <RelatedTools currentTool={entry.toolSlug} />
        </div>
      </main>
    </>
  )
}
