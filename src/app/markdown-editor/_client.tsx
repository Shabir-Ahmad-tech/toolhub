'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import {
  Copy, Check, Bold, Italic, Code, Heading1, Heading2, Quote, List,
  FileDown, Printer, Sun, Moon, PanelLeft,
  Type, Hash, AlignLeft, Clock,
} from 'lucide-react'

const CHAR_LIMIT = 50000
const LS_KEY = 'toolhub-markdown-content'

// ─── Types ──────────────────────────────────────────────────────────────────

interface HeadingItem {
  level: number
  text: string
  id: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function compileMarkdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers with data-heading-id for outline scroll
  html = html.replace(/^### (.*$)/gim, (_m: string, c: string) => {
    const id = makeId(c.trim())
    return `<h3 data-heading-id="${id}" class="text-lg font-bold mt-4 mb-2 text-[#F9F9F9]">${c}</h3>`
  })
  html = html.replace(/^## (.*$)/gim, (_m: string, c: string) => {
    const id = makeId(c.trim())
    return `<h2 data-heading-id="${id}" class="text-xl font-bold mt-4 mb-2 text-[#F9F9F9]">${c}</h2>`
  })
  html = html.replace(/^# (.*$)/gim, (_m: string, c: string) => {
    const id = makeId(c.trim())
    return `<h1 data-heading-id="${id}" class="text-2xl font-bold mt-4 mb-2 text-[#F9F9F9]">${c}</h1>`
  })

  // Code Blocks — cursor-pointer hints at click-to-copy
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-[#1a1a1a] p-3 rounded-none font-mono text-sm my-3 overflow-auto cursor-pointer group relative"><code class="block">$1</code></pre>',
  )

  // Inline Code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-[#1a1a1a] px-1.5 py-0.5 rounded-none font-mono text-sm text-[#FF4444]">$1</code>',
  )

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Blockquotes
  html = html.replace(
    /^\s*&gt;\s+(.*$)/gim,
    '<blockquote class="border-l-4 border-[#333333] pl-4 py-1 italic text-[#666666] my-3">$1</blockquote>',
  )

  // Unordered Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 text-[#888888]">$1</li>')

  // Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="list-decimal ml-5 text-[#888888]">$1</li>')

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00FF41] hover:underline">$1</a>',
  )

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr class="border-[#333333] my-6" />')

  // Line breaks
  html = html.replace(/\n/g, '<br />')

  return html
}

// ─── Footer / SEO / FAQ Constants ─────────────────────────────────────────

const MARKDOWN_FAQ = [
  {
    question: 'What is Markdown and why use it?',
    answer:
      'Markdown is a lightweight markup language for formatting text. It uses simple syntax (# for headings, * for bold, ` for code) that converts to HTML. Markdown is used for documentation, README files, blogs, and GitHub content.',
  },
  {
    question: 'Does my markdown content get saved or uploaded?',
    answer:
      "Your content is saved only in your browser's localStorage. No data is uploaded to servers. The editor auto-saves as you type and restores your content when you return.",
  },
  {
    question: 'What Markdown syntax is supported?',
    answer:
      'This editor supports headings, bold, italic, code blocks, lists, links, and blockquotes. It renders in real-time as you type, and you can insert common syntax with the toolbar buttons.',
  },
]

const SEO_CONTENT = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Write Markdown with Live Preview</h2>
    <p>
      Markdown Editor provides real-time preview of your Markdown content. Format text, insert headings,
      create lists, and add code blocks with our simple editor. All content saves to your browser
      automatically for easy access.
    </p>
    <h3 className="text-sm font-bold text-[#888888]">Markdown for Developers</h3>
    <p>
      Markdown is the standard for technical documentation, README files, and static site content.
      Use this editor to draft API docs, commit messages, blog posts, or any documentation.
      Export as HTML or PDF, or copy the rendered HTML to your clipboard.
    </p>
  </div>
)

// ─── Component ──────────────────────────────────────────────────────────────

export default function MarkdownEditorClient() {
  const [markdown, setMarkdown] = useState('')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [showOutline, setShowOutline] = useState(true)
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark')
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // ── Load from localStorage once on mount ──────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      setMarkdown(saved)
    }
    setIsLoaded(true)
  }, [])

  // ── Text change handler ───────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > CHAR_LIMIT) {
      setMarkdown(val.substring(0, CHAR_LIMIT))
      return
    }
    setMarkdown(val)
    localStorage.setItem(LS_KEY, val)
  }

  // ── Rendered HTML (memoised) ──────────────────────────────────────────
  const renderedHtml = useMemo(() => compileMarkdownToHtml(markdown), [markdown])

  // ── Stats ─────────────────────────────────────────────────────────────
  const wordCount = useMemo(
    () => (markdown.trim() ? markdown.trim().split(/\s+/).length : 0),
    [markdown],
  )
  const charCount = markdown.length
  const lineCount = markdown ? markdown.split('\n').length : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  // ── Headings outline ──────────────────────────────────────────────────
  const headings = useMemo(() => {
    const items: HeadingItem[] = []
    const regex = /^(#{1,6})\s+(.+)$/gm
    let match: RegExpExecArray | null
    while ((match = regex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = makeId(text)
      items.push({ level, text, id })
    }
    return items
  }, [markdown])

  const scrollToHeading = useCallback((id: string) => {
    if (!previewRef.current) return
    const el = previewRef.current.querySelector(`[data-heading-id="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ── Code block copy via event delegation ──────────────────────────────
  useEffect(() => {
    const container = previewRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const pre = target.closest('pre')
      if (!pre || !container.contains(pre)) return
      const code = pre.querySelector('code')
      if (!code) return
      const text = code.textContent || ''
      navigator.clipboard
        .writeText(text)
        .then(() => {
          const label = text.length > 40 ? text.slice(0, 40) + '...' : text
          setCopiedCodeText(label)
          setTimeout(() => setCopiedCodeText(null), 2000)
        })
        .catch(() => {})
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [renderedHtml])

  // ── Syntax insertion helper ───────────────────────────────────────────
  const insertSyntax = (syntaxBefore: string, syntaxAfter = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)
    const replacement = syntaxBefore + selectedText + syntaxAfter
    const newValue = text.substring(0, start) + replacement + text.substring(end)
    setMarkdown(newValue)
    localStorage.setItem(LS_KEY, newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + syntaxBefore.length,
        start + syntaxBefore.length + selectedText.length,
      )
    }, 50)
  }

  // ── Copy as HTML ──────────────────────────────────────────────────────
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderedHtml)
    setCopiedHtml(true)
    setTimeout(() => setCopiedHtml(false), 2000)
  }

  // ── Download .md ──────────────────────────────────────────────────────
  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'document.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Export as HTML file ───────────────────────────────────────────────
  const handleExportHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.7; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; }
  code { background: #f5f5f5; padding: 0.15rem 0.3rem; font-size: 0.9em; }
  img { max-width: 100%; }
  h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1rem; margin-left: 0; color: #666; }
</style>
</head>
<body>
${renderedHtml}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'document.html'
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Export as PDF via browser print ───────────────────────────────────
  const handleExportPdf = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) return

    printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.7; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; }
  code { background: #f5f5f5; padding: 0.15rem 0.3rem; font-size: 0.9em; }
  img { max-width: 100%; }
  h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1rem; margin-left: 0; color: #666; }
  @media print { body { margin: 0; padding: 1in; } }
</style>
</head>
<body>
${renderedHtml}
</body>
</html>`)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => printWin.print(), 300)
  }

  // ── Preview theme toggle ──────────────────────────────────────────────
  const togglePreviewTheme = () => {
    setPreviewTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // ── Skeleton while loading ────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <ToolLayout
        title="Markdown Editor"
        description="Write, edit, and preview Markdown in real-time. Free online live-updating Markdown editor with helpers."
        toolSlug="markdown-editor"
        categorySlug="developer-tools"
        faq={MARKDOWN_FAQ}
        seoContent={SEO_CONTENT}
      >
        <div className="space-y-4">
          <div className="h-10 bg-[#1a1a1a] animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[450px] bg-[#0a0a0a] animate-pulse" />
            <div className="h-[450px] bg-[#0a0a0a] animate-pulse" />
          </div>
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout
      title="Markdown Editor"
      description="Write, edit, and preview Markdown in real-time. Free online live-updating Markdown editor with helpers."
      toolSlug="markdown-editor"
      categorySlug="developer-tools"
      faq={MARKDOWN_FAQ}
      seoContent={SEO_CONTENT}
    >
      <div className="space-y-4">
        {/* ── Toolbar Row 1 — Formatting ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#1a1a1a] rounded-none border border-[#333333]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => insertSyntax('# ', '')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSyntax('## ', '')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSyntax('**', '**')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSyntax('*', '*')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSyntax('`', '`')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="Code inline"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSyntax('> ', '')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSyntax('- ', '')}
              className="p-1.5 hover:bg-[#0a0a0a] text-[#F9F9F9]"
              title="List item"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Toolbar Row 2 — Stats + Actions ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#1a1a1a] rounded-none border border-[#333333]">
          {/* Live stats */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#888888]">
            <span className="flex items-center gap-1" title="Words">
              <AlignLeft className="w-3 h-3" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1" title="Characters">
              <Type className="w-3 h-3" />
              {charCount} chars
            </span>
            <span className="flex items-center gap-1" title="Lines">
              <Hash className="w-3 h-3" />
              {lineCount} lines
            </span>
            <span className="flex items-center gap-1" title="Estimated reading time">
              <Clock className="w-3 h-3" />
              ~{readingTime} min read
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle outline */}
            <button
              onClick={() => setShowOutline((v) => !v)}
              className={`p-1.5 text-xs font-mono uppercase tracking-wider ${
                showOutline ? 'text-[#00FF41]' : 'text-[#888888]'
              } hover:text-[#00FF41] transition-none`}
              title="Toggle headings outline"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Preview theme toggle */}
            <button
              onClick={togglePreviewTheme}
              className="p-1.5 text-xs font-mono uppercase tracking-wider text-[#888888] hover:text-[#00FF41] transition-none"
              title={`Switch to ${previewTheme === 'dark' ? 'light' : 'dark'} preview`}
            >
              {previewTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Copy HTML */}
            <button
              onClick={handleCopyHtml}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0a0a0a] text-[#F9F9F9] hover:bg-[#0a0a0a] text-xs font-bold transition-none"
            >
              {copiedHtml ? (
                <Check className="w-3.5 h-3.5 text-[#00FF41]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy HTML
            </button>

            {/* Export HTML */}
            <button onClick={handleExportHtml} className="terminal-btn">
              [<span className="green-chevron">&gt;</span> Export HTML]
            </button>

            {/* Export PDF */}
            <button onClick={handleExportPdf} className="terminal-btn">
              [<span className="green-chevron">&gt;</span> Export PDF]
            </button>

            {/* Download .MD */}
            <button onClick={handleDownloadMd} className="terminal-btn">
              [<span className="green-chevron">&gt;</span> DOWNLOAD .MD]
            </button>
          </div>
        </div>

        {/* ── Mobile View Toggle ── */}
        <div className="flex md:hidden border border-[#333333] p-1 bg-[#0a0a0a] mb-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-1.5 text-xs font-bold text-center transition-none ${
              activeTab === 'editor' ? 'bg-[#0a0a0a] text-[#F9F9F9]' : 'text-[#888888]'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 text-xs font-bold text-center transition-none ${
              activeTab === 'preview' ? 'bg-[#0a0a0a] text-[#F9F9F9]' : 'text-[#888888]'
            }`}
          >
            Preview
          </button>
        </div>

        {/* ── Main Workspace ── */}
        <div className="flex gap-4">
          {/* Headings Outline Sidebar */}
          {showOutline && (
            <div className="hidden md:block w-48 shrink-0 border border-[#333333] bg-[#0a0a0a] max-h-[450px] overflow-y-auto">
              <div className="p-2 border-b border-[#333333] text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest">
                Outline
              </div>
              {headings.length === 0 ? (
                <div className="p-3 text-[10px] font-mono text-[#555555] italic">
                  No headings found.
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {headings.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToHeading(h.id)}
                      className="block w-full text-left p-1.5 text-xs font-mono text-[#888888] hover:text-[#00FF41] hover:bg-[#1a1a1a] transition-none truncate"
                      style={{ paddingLeft: `${0.5 + (h.level - 1) * 0.75}rem` }}
                      title={h.text}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor & Preview Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-w-0">
            {/* Text Editor */}
            <div className={`${activeTab === 'editor' ? 'block' : 'hidden md:block'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider font-bold">
                  Editor
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={handleTextChange}
                placeholder="# Welcome to Markdown Editor&#10;&#10;Start typing here... Use the buttons above for quick syntax formatting."
                className="w-full h-[450px] p-4 border border-[#333333] focus:border-[#00FF41] bg-[#0a0a0a] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y"
              />
            </div>

            {/* Preview */}
            <div className={`${activeTab === 'preview' ? 'block' : 'hidden md:block'} space-y-2`}>
              <div className="flex items-center justify-between min-h-[20px]">
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider font-bold">
                  Preview
                </span>
                {copiedCodeText && (
                  <span className="text-[10px] font-mono text-[#00FF41] animate-fade-in">
                    Copied: {copiedCodeText}
                  </span>
                )}
              </div>
              <div
                ref={previewRef}
                className={`w-full h-[450px] p-4 border border-[#333333] overflow-y-auto font-sans leading-relaxed transition-colors duration-0 ${
                  previewTheme === 'dark'
                    ? 'bg-[#0a0a0a] text-[#F9F9F9]'
                    : 'bg-white text-black'
                }`}
              >
                {renderedHtml.trim() ? (
                  <div
                    className={`[&_pre]:cursor-pointer [&_pre:hover]:ring-1 [&_pre:hover]:ring-[#00FF41] [&_pre]:relative ${
                      previewTheme === 'light'
                        ? '[&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_pre]:bg-[#f0f0f0] [&_code]:bg-[#f0f0f0] [&_code]:text-[#cc0000] [&_blockquote]:text-[#888888] [&_blockquote]:border-[#cccccc] [&_li]:text-[#555555] [&_hr]:border-[#cccccc]'
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <p className="text-[#888888] text-sm italic">
                    Markdown preview will render here in real-time...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
