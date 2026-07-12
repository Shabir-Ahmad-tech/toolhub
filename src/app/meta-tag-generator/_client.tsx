'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'


// ─────────────────────────── helpers ───────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function extractDomain(raw: string): string {
  if (!raw.trim()) return 'example.com'
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return u.hostname
  } catch {
    return raw || 'example.com'
  }
}

// ─────────────────────────── constants ─────────────────────────

type TabId = 'og' | 'twitter' | 'html'

const TABS: { id: TabId; label: string }[] = [
  { id: 'og', label: 'OG Tags (Facebook)' },
  { id: 'twitter', label: 'Twitter Cards' },
  { id: 'html', label: 'HTML Output' },
]

// ─────────────────────────── FAQ / SEO ─────────────────────────

const faq = [
  {
    question: 'What are Open Graph meta tags?',
    answer:
      'Open Graph (OG) meta tags are HTML snippets that control how a webpage appears when shared on social media platforms like Facebook, LinkedIn, and Twitter. They define the title, description, image, and URL that get displayed in a link preview card. Without OG tags, platforms fall back to guessing this content, often giving poor results.',
  },
  {
    question: 'What is the difference between OG tags and Twitter Cards?',
    answer:
      'Open Graph tags (og:*) are the standard protocol used by Facebook, LinkedIn, and many other services. Twitter Cards use both OG tags (twitter:title, twitter:description, twitter:image fall back to og:*) and their own namespaced tags (twitter:card, twitter:site). For best results you should include both — this generator produces both sets automatically.',
  },
  {
    question: 'How can I test if my OG tags are working?',
    answer:
      'Use platform-specific debuggers: Facebook Sharing Debugger (developers.facebook.com/tools/debug), Twitter Card Validator (cards-dev.twitter.com/validator), and LinkedIn Post Inspector (linkedin.com/post-inspector). These tools fetch your URL and show exactly how your tags are being parsed. Paste your URL into any of these to verify the output matches your intent.',
  },
  {
    question: 'What size should my OG image be?',
    answer:
      'The recommended OG image size is 1200x630 pixels with a 1.91:1 aspect ratio. Images should be under 8 MB and use JPEG or PNG format. Facebook recommends images with <20% text overlay for optimal display. Twitter large-card images also use 1200x630, while small-card images use 800x400.',
  },
  {
    question: 'Do I need a trailing slash in my og:url?',
    answer:
      'Yes, or be consistent. The og:url should exactly match the canonical URL of the page — including or excluding the trailing slash. Inconsistency can confuse social crawlers and lead to duplicate shares. If your site uses trailing slashes, include one in og:url. If it does not, omit it.',
  },
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">
      Generate and Preview Social Media Meta Tags Instantly
    </h2>
    <p>
      Meta Tag / OG Preview Generator helps you create, preview, and validate
      Open Graph and Twitter Card meta tags before deploying your page. Enter
      your page details, see a live visual mockup of how the share card will
      look on Facebook and Twitter, and copy the ready-to-use HTML.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      Why Meta Tags Matter for SEO and Engagement
    </h3>
    <p>
      Proper Open Graph tags boost click-through rates by controlling exactly
      how your content appears in social feeds. A well-crafted preview card
      with a compelling title, clear description, and high-quality image can
      significantly increase shares and engagement. This tool takes the guesswork
      out of formatting the HTML correctly.
    </p>
  </div>
)

// ──────────────────────── Text input helper ────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-mono text-[#F9F9F9] uppercase tracking-wider"
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] resize-y min-h-[80px]"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41]"
        />
      )}
    </div>
  )
}

// ───────────────────── Preview cards ────────────────────────────

function OGCardPreview({
  title,
  description,
  url,
  imageUrl,
  siteName,
}: {
  title: string
  description: string
  url: string
  imageUrl: string
  siteName: string
}) {
  const domain = extractDomain(url)
  const finalTitle = title || 'Page Title'
  const finalDesc = description || 'Page description appears here…'
  const hasImage = imageUrl.trim().length > 0

  return (
    <div className="border border-[#333333] overflow-hidden max-w-md mx-auto">
      {/* Image area */}
      {hasImage ? (
        <div className="w-full aspect-[1.91/1] bg-[#111111] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="OG preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
              const parent = (e.currentTarget as HTMLImageElement).parentElement
              if (parent) {
                parent.classList.add('flex', 'items-center', 'justify-center')
                parent.innerHTML =
                  '<span class="text-[#555555] font-mono text-xs">image failed to load</span>'
              }
            }}
          />
        </div>
      ) : (
        <div className="w-full aspect-[1.91/1] bg-[#111111] flex items-center justify-center">
          <span className="text-[#555555] font-mono text-xs">og:image</span>
        </div>
      )}

      {/* Text area */}
      <div className="p-3 space-y-1 bg-[#1a1a1a]">
        <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider truncate">
          {domain}
          {siteName && <span className="text-[#555555]"> / {siteName}</span>}
        </p>
        <p className="text-sm font-mono font-bold text-[#F9F9F9] leading-snug line-clamp-2">
          {finalTitle}
        </p>
        <p className="text-[11px] font-mono text-[#888888] leading-relaxed line-clamp-2">
          {finalDesc}
        </p>
      </div>
    </div>
  )
}

function TwitterCardPreview({
  title,
  description,
  url,
  imageUrl,
  twitterHandle,
}: {
  title: string
  description: string
  url: string
  imageUrl: string
  twitterHandle: string
}) {
  const domain = extractDomain(url)
  const finalTitle = title || 'Page Title'
  const finalDesc = description || 'Page description appears here…'
  const hasImage = imageUrl.trim().length > 0

  return (
    <div className="border border-[#333333] overflow-hidden max-w-md mx-auto bg-[#1a1a1a]">
      {/* Top row: small avatar + handle */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <div className="w-7 h-7 rounded-full bg-[#333333] flex items-center justify-center text-[10px] font-mono text-[#888888]">
          @
        </div>
        <div className="text-xs font-mono text-[#00FF41]">
          {twitterHandle ? `@${twitterHandle.replace(/^@/, '')}` : '@username'}
        </div>
      </div>

      {/* Image */}
      {hasImage ? (
        <div className="w-full aspect-[2/1] bg-[#111111] overflow-hidden border-t border-b border-[#333333]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Twitter preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
              const parent = (e.currentTarget as HTMLImageElement).parentElement
              if (parent) {
                parent.classList.add('flex', 'items-center', 'justify-center')
                parent.innerHTML =
                  '<span class="text-[#555555] font-mono text-xs">image failed to load</span>'
              }
            }}
          />
        </div>
      ) : (
        <div className="w-full aspect-[2/1] bg-[#111111] flex items-center justify-center border-t border-b border-[#333333]">
          <span className="text-[#555555] font-mono text-xs">twitter:image</span>
        </div>
      )}

      {/* Text */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-mono font-bold text-[#F9F9F9] leading-snug line-clamp-2">
          {finalTitle}
        </p>
        <p className="text-[11px] font-mono text-[#888888] leading-relaxed line-clamp-2">
          {finalDesc}
        </p>
        <p className="text-[10px] font-mono text-[#555555] uppercase tracking-wider truncate pt-1">
          {domain}
        </p>
      </div>
    </div>
  )
}

// ──────────────────────── HTML Output ──────────────────────────

function MetaTagOutput({
  metaHtml,
}: {
  metaHtml: string
}) {
  const [localCopied, setLocalCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(metaHtml)
    setLocalCopied(true)
    setTimeout(() => setLocalCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
          Generated Meta Tags
        </p>
        <button
          onClick={handleCopy}
          className="terminal-btn"
        >
          [<span className="green-chevron">&gt;</span> {localCopied ? 'COPIED' : 'COPY ALL'}]
        </button>
      </div>
      <pre className="border border-[#333333] bg-[#0a0a0a] p-4 text-xs font-mono text-[#F9F9F9] overflow-x-auto whitespace-pre leading-relaxed max-h-[400px]">
        {metaHtml || (
          <span className="text-[#555555]">Fill in the form above to generate meta tags…</span>
        )}
      </pre>
    </div>
  )
}

// ────────────────────────── Main Component ─────────────────────

export default function MetaTagGeneratorPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [siteName, setSiteName] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('og')

  // ── derived ──

  const escaped = useMemo(
    () => ({
      title: escapeHtml(title),
      description: escapeHtml(description),
      url: escapeHtml(url),
      image: escapeHtml(imageUrl),
      siteName: escapeHtml(siteName),
      twitterHandle: escapeHtml(twitterHandle),
    }),
    [title, description, url, imageUrl, siteName, twitterHandle],
  )

  const fullHtml = useMemo(() => {
    if (
      !escaped.title &&
      !escaped.description &&
      !escaped.image &&
      !escaped.url &&
      !escaped.siteName &&
      !escaped.twitterHandle
    ) {
      return ''
    }
    return [
      '<!-- Open Graph / Facebook -->',
      `<meta property="og:title" content="${escaped.title}" />`,
      `<meta property="og:description" content="${escaped.description}" />`,
      `<meta property="og:image" content="${escaped.image}" />`,
      `<meta property="og:url" content="${escaped.url}" />`,
      '<meta property="og:type" content="website" />',
      `<meta property="og:site_name" content="${escaped.siteName}" />`,
      '',
      '<!-- Twitter -->',
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escaped.title}" />`,
      `<meta name="twitter:description" content="${escaped.description}" />`,
      `<meta name="twitter:image" content="${escaped.image}" />`,
      `<meta name="twitter:site" content="${escaped.twitterHandle}" />`,
    ].join('\n')
  }, [escaped])

  // ── render ──

  return (
    <ToolLayout
      title="Meta Tag / OG Preview Generator"
      description="Generate, preview, and copy Open Graph and Twitter Card meta tags for social media sharing."
      toolSlug="meta-tag-generator"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-8 font-mono">
        {/* ── Form ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              label="Page Title"
              value={title}
              onChange={setTitle}
              placeholder="My Amazing Article"
            />
            <FormField
              label="Page URL"
              value={url}
              onChange={setUrl}
              placeholder="https://example.com/my-article"
            />
            <FormField
              label="Site Name"
              value={siteName}
              onChange={setSiteName}
              placeholder="Example Blog"
            />
          </div>
          <div className="space-y-4">
            <FormField
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="A concise summary of the page content…"
              multiline
            />
            <FormField
              label="Image URL"
              value={imageUrl}
              onChange={setImageUrl}
              placeholder="https://example.com/image.jpg"
            />
            <FormField
              label="Twitter Handle"
              value={twitterHandle}
              onChange={setTwitterHandle}
              placeholder="@username"
            />
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="border-t border-[#333333]" />

        {/* ── Tabs ── */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-mono cursor-pointer min-h-[44px] border transition-none ${
                  activeTab === tab.id
                    ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                    : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          {activeTab === 'og' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider mb-3">
                  Facebook / LinkedIn Preview
                </p>
                <OGCardPreview
                  title={title}
                  description={description}
                  url={url}
                  imageUrl={imageUrl}
                  siteName={siteName}
                />
              </div>
              <div>
                <p className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider mb-3">
                  Open Graph Tags
                </p>
                <pre className="border border-[#333333] bg-[#0a0a0a] p-4 text-xs font-mono text-[#F9F9F9] overflow-x-auto whitespace-pre leading-relaxed">
                  {fullHtml ? (
                    fullHtml.split('\n').slice(0, 7).join('\n')
                  ) : (
                    <span className="text-[#555555]">Fill in the form to generate OG tags…</span>
                  )}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'twitter' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider mb-3">
                  Twitter Card Preview
                </p>
                <TwitterCardPreview
                  title={title}
                  description={description}
                  url={url}
                  imageUrl={imageUrl}
                  twitterHandle={twitterHandle}
                />
              </div>
              <div>
                <p className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider mb-3">
                  Twitter Card Tags
                </p>
                <pre className="border border-[#333333] bg-[#0a0a0a] p-4 text-xs font-mono text-[#F9F9F9] overflow-x-auto whitespace-pre leading-relaxed">
                  {fullHtml ? (
                    fullHtml.split('\n').slice(8).join('\n')
                  ) : (
                    <span className="text-[#555555]">Fill in the form to generate Twitter tags…</span>
                  )}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'html' && (
            <MetaTagOutput metaHtml={fullHtml} />
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
