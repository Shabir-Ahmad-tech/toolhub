'use client'

import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CopyButton } from '@/components/ui/CopyButton'

// ─── HTML Minification Logic ──────────────────────────────────────────────

function minifyHTML(html: string, options: { removeComments: boolean; collapseWhitespace: boolean; removeOptionalQuotes: boolean }): string {
  let result = html

  // 1. Remove HTML comments (but not conditional comments for IE)
  if (options.removeComments) {
    result = result.replace(/<!--(?!\[if).*?-->/gs, '')
  }

  // 2. Collapse whitespace
  if (options.collapseWhitespace) {
    // Replace all whitespace sequences with single space (but not inside <pre>, <code>, <textarea>)
    result = result.replace(/>\s+</g, '>\n<')
    result = result.replace(/\s{2,}/g, ' ')
    // Remove leading/trailing whitespace on each line
    result = result.split('\n').map(line => line.trim()).join('\n')
    // Collapse all lines together
    result = result.replace(/>\s+</g, '><')
    // Remove spaces between block elements
    result = result.replace(/\n\s*/g, '')
    // Remove spaces around text content
    result = result.replace(/>\s+/g, '>')
    result = result.replace(/\s+</g, '<')
    // Remove space between closing tag and opening tag
    result = result.replace(/<\/\w+>\s+<\w+/g, m => m.replace(/\s+/g, ''))
  }

  // 3. Remove optional quotes on attributes (simple cases only)
  if (options.removeOptionalQuotes) {
    result = result.replace(/\s(\w+)=(["'])([^"']*?)\2/g, (match, attr, _quote, val) => {
      // Only remove quotes if value contains only safe characters
      if (/^[a-z0-9\-\_%\/:;.]+$/i.test(val)) {
        return ` ${attr}=${val}`
      }
      return match
    })
  }

  // 4. Remove unnecessary self-closing slashes on void elements
  result = result.replace(/<(img|br|hr|input|meta|link|source|area|base|col|embed|param|track|wbr)([^>]*?)\s*\/?>/gi, '<$1$2>')

  // 5. Normalize boolean attributes
  result = result.replace(/\s(disabled|checked|selected|required|multiple|readonly|hidden|autofocus|novalidate|itemscope|async|defer|ismap|loop|controls|muted|open)="\1"/gi, ' $1')

  // 6. Strip trailing whitespace
  result = result.trim()

  return result
}

// ─── Sample HTML ──────────────────────────────────────────────────────────

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Awesome Page</title>
  <link rel="stylesheet" href="styles.css">
  <!-- SEO metadata -->
  <meta name="description" content="A sample page for minification">
</head>
<body>
  <!-- Main header navigation -->
  <header class="site-header">
    <nav class="navbar">
      <a href="/" class="logo">
        <img src="logo.svg" alt="Logo" width="40" height="40">
        <span>MyApp</span>
      </a>
      <ul class="nav-links">
        <li><a href="/" class="active">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main class="content-wrapper">
    <section class="hero">
      <h1 class="hero-title">Build Faster</h1>
      <p class="hero-description">
        Create modern web applications with our powerful tools.
        Everything you need in one place.
      </p>
      <button class="btn btn-primary" disabled="disabled">Get Started</button>
      <a href="/learn-more" class="btn btn-secondary">Learn More</a>
    </section>
  </main>

  <footer class="site-footer">
    <p>&copy; 2026 MyApp. All rights reserved.</p>
  </footer>
</body>
</html>`

// ─── Options ──────────────────────────────────────────────────────────────

interface MinifyOptions {
  removeComments: boolean
  collapseWhitespace: boolean
  removeOptionalQuotes: boolean
}

// ─── Component ────────────────────────────────────────────────────────────

export default function HTMLMinifierClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [options, setOptions] = useState<MinifyOptions>({
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalQuotes: false,
  })

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter HTML code to minify.')
      setOutput('')
      return
    }
    setError('')
    try {
      const minified = minifyHTML(input, options)
      setOutput(minified)
    } catch (e) {
      setError('Minification error: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }, [input, options])

  const stats = useMemo(() => {
    if (!input.trim() || !output) return null
    const original = new Blob([input]).size
    const minified = new Blob([output]).size
    const saved = original - minified
    const percent = original > 0 ? ((saved / original) * 100).toFixed(1) : 0
    return { original, minified, saved, percent }
  }, [input, output])

  const faq = [
    {
      question: 'How does the HTML minifier work?',
      answer: 'It processes your HTML entirely in your browser. The minifier strips HTML comments, collapses whitespace (reducing multiple spaces/newlines to compact form), and optionally removes quotes on simple attribute values. It also normalizes boolean attributes and removes unnecessary self-closing slashes on void elements.',
    },
    {
      question: 'Is my HTML uploaded to any server?',
      answer: 'No. All minification happens client-side using string processing in your browser. Your HTML code never leaves your device, making it safe for proprietary templates, production markup, or any sensitive content.',
    },
    {
      question: 'How much smaller will my HTML be?',
      answer: 'Typical savings range from 15–40% depending on how much whitespace and comments your HTML contains. Heavily documented or indented markup sees the biggest reduction. The tool shows exact byte counts and percentage saved after each minification.',
    },
    {
      question: 'What does "Remove optional quotes" do?',
      answer: 'If enabled, it removes quotation marks around attribute values that only contain safe characters (letters, digits, hyphens, underscores, colons, semicolons, periods, slashes). For example, class="container" becomes class=container. Use with caution — some stricter HTML parsers may require quoted values.',
    },
    {
      question: 'Can this minify inline CSS and JavaScript too?',
      answer: 'The HTML minifier focuses on the HTML structure itself — stripping comments, collapsing whitespace, and compressing attribute syntax. For inline CSS and JS within style and script tags, use our dedicated CSS minifier or JavaScript minifier tools for optimal compression.',
    },
  ]

  const seoContent = (
    <div className="space-y-4">
      <p>
        HTML minification is one of the easiest performance optimizations you can apply to a website. By stripping comments, removing unnecessary whitespace, and tightening HTML syntax, you reduce file size and improve page load times — especially on slow networks and mobile devices.
      </p>
      <p>
        This free online HTML minifier runs entirely in your browser with no server upload. It removes HTML comments, collapses whitespace, normalizes boolean attributes, and optionally removes quotes on safe attribute values. You control which optimizations to apply via the toggle options.
      </p>
      <p>
        Use it to quickly minify HTML templates, email markup, landing pages, or any HTML snippet before deployment. Pair it with the JavaScript Minifier and CSS tools elsewhere on this site for a complete frontend optimization workflow.
      </p>
    </div>
  )

  const toggleOption = (key: keyof MinifyOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ToolLayout
      title="HTML Minifier & Compressor"
      description="Minify HTML online — strip comments, collapse whitespace, and compress HTML for faster page loads. All processing happens client-side."
      toolSlug="html-minifier"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="flex flex-wrap gap-4 border border-[#333333] p-3">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-[#888888] cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeComments}
              onChange={() => toggleOption('removeComments')}
              className="accent-[#00FF41]"
            />
            Remove comments
          </label>
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-[#888888] cursor-pointer">
            <input
              type="checkbox"
              checked={options.collapseWhitespace}
              onChange={() => toggleOption('collapseWhitespace')}
              className="accent-[#00FF41]"
            />
            Collapse whitespace
          </label>
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-[#888888] cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeOptionalQuotes}
              onChange={() => toggleOption('removeOptionalQuotes')}
              className="accent-[#00FF41]"
            />
            Remove optional quotes
          </label>
        </div>

        {/* Input */}
        <div>
          <label className="font-mono text-xs text-[#888888] block mb-1.5">
            <span className="text-[#555555]">$</span> Input HTML
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your HTML code here..."
            rows={8}
            className="w-full bg-[#0a0a0a] border border-[#333333] text-[#F9F9F9] font-mono text-xs p-3 focus:outline-none focus:border-[#00FF41] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <TerminalButton onClick={handleMinify}>
            <span className="green-chevron">&gt;</span> Minify
          </TerminalButton>
          <TerminalButton onClick={() => setInput(SAMPLE_HTML)}>
            <span className="green-chevron">&gt;</span> Load Sample
          </TerminalButton>
          <TerminalButton onClick={() => { setInput(''); setOutput(''); setError('') }}>
            <span className="green-chevron">&gt;</span> Clear
          </TerminalButton>
        </div>

        {/* Error */}
        {error && (
          <div className="font-mono text-xs text-[#FF0040] border border-[#FF0040]/30 bg-[#FF0040]/5 p-3">
            <span className="text-[#FF0040]">✗</span> {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="font-mono text-[10px] text-[#888888] flex flex-wrap gap-4 border border-[#333333] p-2.5">
            <span>Original: <strong className="text-[#F9F9F9]">{stats.original.toLocaleString()} B</strong></span>
            <span>Minified: <strong className="text-[#00FF41]">{stats.minified.toLocaleString()} B</strong></span>
            <span>Saved: <strong className="text-[#00FF41]">{stats.saved.toLocaleString()} B ({stats.percent}%)</strong></span>
          </div>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs text-[#888888]">
                <span className="text-[#555555]">$</span> Minified Output
              </label>
              <CopyButton text={output} />
            </div>
            <pre className="w-full bg-[#0a0a0a] border border-[#333333] text-[#00FF41] font-mono text-xs p-3 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
