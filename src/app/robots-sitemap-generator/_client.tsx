'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Download } from 'lucide-react'

const robotsSitemapFaq = [
  {
    question: 'What is a robots.txt file and why do I need one?',
    answer: 'A robots.txt file tells search engine crawlers which parts of your website they are allowed or disallowed to crawl. It lives at the root of your domain (e.g., https://example.com/robots.txt) and follows the Robots Exclusion Protocol. Every production website should have one to prevent crawlers from wasting quota on admin pages, duplicate content, staging environments, or internal search results. Without it, search engines will crawl everything they can reach.'
  },
  {
    question: 'What is an XML sitemap and how does it help SEO?',
    answer: 'An XML sitemap is a machine-readable file that lists all important URLs on your website along with metadata like last modification date, change frequency, and priority. Search engines use it to discover pages they might miss during regular crawling. This is especially valuable for new sites with few external backlinks, sites with deep content hierarchies, or pages that are only reachable through JavaScript navigation.'
  },
  {
    question: 'Can a robots.txt block a page from appearing in Google?',
    answer: 'No. A robots.txt disallow directive prevents crawling but does not prevent indexing. If a page is disallowed in robots.txt but still gets discovered through external links, Google may index it without seeing the content — showing only the URL and a "description not available" snippet. To truly block a page from search results, use a <code>noindex</code> meta tag or HTTP <code>X-Robots-Tag</code> header instead.'
  },
  {
    question: 'Where should I place my robots.txt and sitemap.xml files?',
    answer: 'The robots.txt file must be placed at the root of your domain: <code>https://example.com/robots.txt</code>. The sitemap can live anywhere on your site but is conventionally placed at <code>https://example.com/sitemap.xml</code>. You can also specify the sitemap location inside your robots.txt file using the <code>Sitemap:</code> directive and submit it directly to Google Search Console and Bing Webmaster Tools for faster indexing.'
  },
  {
    question: 'What do changefreq and priority values mean in a sitemap?',
    answer: 'Changefreq (always, hourly, daily, weekly, monthly, yearly, never) is a hint to search engines about how often a page is likely to change — it is not a guarantee and modern crawlers largely ignore it. Priority (0.0 to 1.0) lets you hint which pages are more important relative to others on your site, with 1.0 being the highest. These are only hints and do not directly influence ranking, but they help crawlers allocate their crawl budget more intelligently.'
  }
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Robots.txt &amp; Sitemap Generator</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      This tool generates two essential SEO files for any website: a <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">robots.txt</code> file that controls crawler access to your site, and an XML sitemap that helps search engines discover and prioritize your pages. Both files are created client-side with no server upload, giving you full control over the output before deploying to production.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p>
      The robots.txt section follows the Robots Exclusion Protocol: each crawler (identified by <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">User-agent</code>) gets a set of <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">Disallow</code> and <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">Allow</code> directives specifying which URL paths are blocked or permitted. The optional <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">Crawl-delay</code> directive throttles aggressive bots, and the <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">Sitemap</code> directive points crawlers to your XML sitemap. The sitemap section builds a valid <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">&lt;urlset&gt;</code> document where each <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">&lt;url&gt;</code> entry contains a <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">&lt;loc&gt;</code> (the page URL), an optional <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">&lt;changefreq&gt;</code> hint, and an optional <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">&lt;priority&gt;</code> value between 0.0 and 1.0.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Worked Example</h3>
    <p>
      <strong>Robots.txt input:</strong> User-agent: <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">*</code> with Disallow: <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">/admin</code>, Allow: <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">/public</code>, and Sitemap: <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">https://example.com/sitemap.xml</code>. <strong>Output:</strong> A standard robots.txt allowing all crawlers, blocking the <code>/admin</code> path, explicitly allowing <code>/public</code>, and pointing to the sitemap. <strong>Sitemap input:</strong> One entry with <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">https://example.com/</code>, changefreq <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">weekly</code>, priority <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">1.0</code>. <strong>Output:</strong> A valid XML sitemap document ready for upload to your server root.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Mistakes</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
      <li><strong>Using robots.txt for security.</strong> Robots.txt only blocks well-behaved crawlers — malicious bots and scrapers ignore it entirely. Do not rely on it to hide sensitive pages. Use authentication or server-side access controls instead.</li>
      <li><strong>Listing pages in robots.txt that you also want indexed.</strong> If you disallow a URL in robots.txt, crawlers cannot access it to see <code>noindex</code> tags or other metadata. The page may still appear in search results with missing or incorrect snippets.</li>
      <li><strong>Setting every sitemap URL to priority 1.0.</strong> When every page has the same priority, the hint is meaningless. Reserve 1.0 for your homepage and highest-value landing pages, and scale other pages down to 0.5–0.8.</li>
      <li><strong>Forgetting to update the sitemap after adding new pages.</strong> An outdated sitemap is almost as bad as no sitemap. Regenerate and re-submit your sitemap whenever you publish significant new content.</li>
    </ul>
  </div>
)

type Tab = 'robots' | 'sitemap'
type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapEntry {
  id: string
  loc: string
  changefreq: Changefreq
  priority: string
}

const CHANGEFREQ_OPTIONS: Changefreq[] = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']

const PRIORITY_OPTIONS = Array.from({ length: 11 }, (_, i) => (i / 10).toFixed(1))

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

let entryCounter = 0
function createEntry(loc = '', changefreq: Changefreq = 'weekly', priority = '0.5'): SitemapEntry {
  entryCounter += 1
  return { id: `entry-${entryCounter}-${Date.now()}`, loc, changefreq, priority }
}

export default function RobotsSitemapClient() {
  const [activeTab, setActiveTab] = useState<Tab>('robots')

  // Robots.txt state
  const [userAgent, setUserAgent] = useState('*')
  const [disallowPaths, setDisallowPaths] = useState('/admin\n/wp-admin\n/private')
  const [allowPaths, setAllowPaths] = useState('/public')
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml')
  const [crawlDelay, setCrawlDelay] = useState('10')

  // Sitemap state
  const [entries, setEntries] = useState<SitemapEntry[]>([
    createEntry('https://example.com/', 'weekly', '1.0'),
  ])

  // Clipboard
  const [copiedRobots, setCopiedRobots] = useState(false)
  const [copiedSitemap, setCopiedSitemap] = useState(false)

  const robotsContent = useMemo(() => {
    const lines: string[] = []
    const ua = userAgent.trim()
    if (ua) {
      lines.push(`User-agent: ${ua}`)
    }

    const disallows = disallowPaths
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    for (const d of disallows) {
      lines.push(`Disallow: ${d}`)
    }

    const allows = allowPaths
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    for (const a of allows) {
      lines.push(`Allow: ${a}`)
    }

    const delay = crawlDelay.trim()
    if (delay) {
      lines.push(`Crawl-delay: ${delay}`)
    }

    const sitemap = sitemapUrl.trim()
    if (sitemap) {
      lines.push('')
      lines.push(`Sitemap: ${sitemap}`)
    }

    return lines.join('\n')
  }, [userAgent, disallowPaths, allowPaths, crawlDelay, sitemapUrl])

  const sitemapContent = useMemo(() => {
    const validEntries = entries.filter(e => e.loc.trim())
    if (validEntries.length === 0) return ''

    const urlElements = validEntries
      .map(e => {
        let block = `  <url>\n    <loc>${escapeXml(e.loc.trim())}</loc>`
        block += `\n    <changefreq>${e.changefreq}</changefreq>`
        block += `\n    <priority>${e.priority}</priority>`
        block += '\n  </url>'
        return block
      })
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`
  }, [entries])

  const handleCopy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Robots.txt presets
  const applyRobotsPreset = (preset: 'standard' | 'allow-all' | 'disallow-all' | 'wordpress') => {
    switch (preset) {
      case 'standard':
        setUserAgent('*')
        setDisallowPaths('/admin\n/wp-admin\n/private')
        setAllowPaths('/public')
        setCrawlDelay('10')
        setSitemapUrl('https://example.com/sitemap.xml')
        break
      case 'allow-all':
        setUserAgent('*')
        setDisallowPaths('')
        setAllowPaths('/')
        setCrawlDelay('')
        setSitemapUrl('https://example.com/sitemap.xml')
        break
      case 'disallow-all':
        setUserAgent('*')
        setDisallowPaths('/')
        setAllowPaths('')
        setCrawlDelay('')
        setSitemapUrl('https://example.com/sitemap.xml')
        break
      case 'wordpress':
        setUserAgent('*')
        setDisallowPaths('/wp-admin/\n/wp-includes/\n/wp-content/plugins/\n/wp-content/cache/\n/wp-json/')
        setAllowPaths('/wp-content/uploads/')
        setCrawlDelay('10')
        setSitemapUrl('https://example.com/sitemap.xml')
        break
    }
  }

  // Sitemap presets
  const applySitemapPreset = (preset: 'starter' | 'standard' | 'complete') => {
    let newEntries: SitemapEntry[]
    switch (preset) {
      case 'starter':
        newEntries = [createEntry('https://example.com/', 'weekly', '1.0')]
        break
      case 'standard':
        newEntries = [
          createEntry('https://example.com/', 'weekly', '1.0'),
          createEntry('https://example.com/about', 'monthly', '0.8'),
          createEntry('https://example.com/services', 'monthly', '0.7'),
          createEntry('https://example.com/blog', 'weekly', '0.8'),
          createEntry('https://example.com/contact', 'monthly', '0.6'),
        ]
        break
      case 'complete':
        newEntries = [
          createEntry('https://example.com/', 'weekly', '1.0'),
          createEntry('https://example.com/about', 'monthly', '0.8'),
          createEntry('https://example.com/services', 'monthly', '0.7'),
          createEntry('https://example.com/portfolio', 'monthly', '0.7'),
          createEntry('https://example.com/blog', 'weekly', '0.8'),
          createEntry('https://example.com/blog/seo-tips', 'monthly', '0.6'),
          createEntry('https://example.com/blog/web-dev', 'monthly', '0.6'),
          createEntry('https://example.com/pricing', 'monthly', '0.7'),
          createEntry('https://example.com/contact', 'monthly', '0.6'),
          createEntry('https://example.com/faq', 'monthly', '0.5'),
        ]
        break
    }
    setEntries(newEntries)
  }

  const addEntry = () => {
    setEntries(prev => [...prev, createEntry('https://example.com/page', 'monthly', '0.5')])
  }

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const updateEntry = (id: string, field: keyof SitemapEntry, value: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  return (
    <ToolLayout
      title="Robots.txt &amp; Sitemap Generator"
      description="Generate robots.txt and XML sitemaps for your website. Create SEO-ready crawler directives for search engine indexing."
      toolSlug="robots-sitemap-generator"
      faq={robotsSitemapFaq}
      seoContent={seoContent}
    >
      <div className="space-y-6">
        {/* Tab Toggle */}
        <div className="flex border-b border-[#333333]">
          <button
            type="button"
            onClick={() => setActiveTab('robots')}
            className={`flex-1 py-3 text-center border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
              activeTab === 'robots'
                ? 'border-[#F9F9F9] text-[#F9F9F9]'
                : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
            }`}
          >
            {`>`} Robots.txt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`flex-1 py-3 text-center border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
              activeTab === 'sitemap'
                ? 'border-[#F9F9F9] text-[#F9F9F9]'
                : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
            }`}
          >
            {`>`} Sitemap.xml
          </button>
        </div>

        {/* === ROBOTS.TXT TAB === */}
        {activeTab === 'robots' && (
          <div className="space-y-5">
            {/* Preset Buttons */}
            <div>
              <p className="text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-2">Presets</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyRobotsPreset('standard')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Standard]
                </button>
                <button
                  type="button"
                  onClick={() => applyRobotsPreset('allow-all')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Allow All]
                </button>
                <button
                  type="button"
                  onClick={() => applyRobotsPreset('disallow-all')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Disallow All]
                </button>
                <button
                  type="button"
                  onClick={() => applyRobotsPreset('wordpress')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> WordPress]
                </button>
              </div>
            </div>

            {/* User-agent */}
            <div>
              <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                {`>`} User-agent
              </label>
              <input
                type="text"
                value={userAgent}
                onChange={e => setUserAgent(e.target.value)}
                placeholder="*"
                className="w-full px-4 py-3 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm focus:border-[#00FF41] focus:outline-none"
              />
            </div>

            {/* Disallow */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                  {`>`} Disallow (one per line)
                </label>
              </div>
              <textarea
                value={disallowPaths}
                onChange={e => setDisallowPaths(e.target.value)}
                rows={3}
                placeholder="/admin"
                className="w-full px-4 py-3 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm focus:border-[#00FF41] focus:outline-none resize-y"
              />
            </div>

            {/* Allow */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                  {`>`} Allow (one per line)
                </label>
              </div>
              <textarea
                value={allowPaths}
                onChange={e => setAllowPaths(e.target.value)}
                rows={2}
                placeholder="/public"
                className="w-full px-4 py-3 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm focus:border-[#00FF41] focus:outline-none resize-y"
              />
            </div>

            {/* Sitemap URL + Crawl-delay in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                  {`>`} Sitemap URL
                </label>
                <input
                  type="url"
                  value={sitemapUrl}
                  onChange={e => setSitemapUrl(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="w-full px-4 py-3 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm focus:border-[#00FF41] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                  {`>`} Crawl-delay (seconds)
                </label>
                <input
                  type="number"
                  value={crawlDelay}
                  onChange={e => setCrawlDelay(e.target.value)}
                  placeholder="10"
                  min="0"
                  className="w-full px-4 py-3 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm focus:border-[#00FF41] focus:outline-none"
                />
              </div>
            </div>

            {/* Preview & Copy / Download */}
            <div className="border-t border-[#333333] pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-[#888888] uppercase tracking-wider">
                  {`>`} Generated robots.txt
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(robotsContent, setCopiedRobots)}
                    className="terminal-btn"
                  >
                    [<span className="green-chevron">&gt;</span> {copiedRobots ? 'COPIED' : 'COPY'}]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(robotsContent, 'robots.txt', 'text/plain')}
                    className="terminal-btn"
                  >
                    [<span className="green-chevron">&gt;</span> <Download className="w-3 h-3 inline" /> .TXT]
                  </button>
                </div>
              </div>
              <textarea
                value={robotsContent}
                readOnly
                rows={8}
                className="w-full px-4 py-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none resize-y"
              />
            </div>
          </div>
        )}

        {/* === SITEMAP TAB === */}
        {activeTab === 'sitemap' && (
          <div className="space-y-5">
            {/* Preset Buttons */}
            <div>
              <p className="text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-2">Presets</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applySitemapPreset('starter')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Starter (1 URL)]
                </button>
                <button
                  type="button"
                  onClick={() => applySitemapPreset('standard')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Standard (5)]
                </button>
                <button
                  type="button"
                  onClick={() => applySitemapPreset('complete')}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Complete (10)]
                </button>
              </div>
            </div>

            {/* URL Entries */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                {`>`} URL Entries ({entries.length})
              </p>
              {entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="p-3 border border-[#333333] bg-[#1a1a1a]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#666666] uppercase">
                      URL #{idx + 1}
                    </span>
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="text-[10px] font-mono text-[#555555] hover:text-[#F9F9F9] uppercase"
                      >
                        [X REMOVE]
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={entry.loc}
                      onChange={e => updateEntry(entry.id, 'loc', e.target.value)}
                      placeholder="https://example.com/page"
                      className="w-full px-3 py-2 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm focus:border-[#00FF41] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono text-[#666666] uppercase mb-1">
                          Changefreq
                        </label>
                        <select
                          value={entry.changefreq}
                          onChange={e => updateEntry(entry.id, 'changefreq', e.target.value)}
                          className="w-full px-3 py-2 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:border-[#00FF41] focus:outline-none"
                        >
                          {CHANGEFREQ_OPTIONS.map(cf => (
                            <option key={cf} value={cf}>{cf}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-[#666666] uppercase mb-1">
                          Priority
                        </label>
                        <select
                          value={entry.priority}
                          onChange={e => updateEntry(entry.id, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:border-[#00FF41] focus:outline-none"
                        >
                          {PRIORITY_OPTIONS.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add URL button */}
            <button
              type="button"
              onClick={addEntry}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> Add URL]
            </button>

            {/* Preview & Copy / Download */}
            {sitemapContent && (
              <div className="border-t border-[#333333] pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-[#888888] uppercase tracking-wider">
                    {`>`} Generated sitemap.xml
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(sitemapContent, setCopiedSitemap)}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> {copiedSitemap ? 'COPIED' : 'COPY'}]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(sitemapContent, 'sitemap.xml', 'application/xml')}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> <Download className="w-3 h-3 inline" /> .XML]
                    </button>
                  </div>
                </div>
                <textarea
                  value={sitemapContent}
                  readOnly
                  rows={8}
                  className="w-full px-4 py-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none resize-y"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
