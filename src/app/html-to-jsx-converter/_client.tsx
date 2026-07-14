'use client'

import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CopyButton } from '@/components/ui/CopyButton'

// ─── SVG attributes that keep their original names ────────────────────────
const SVG_ATTRS = new Set([
  'cx', 'cy', 'd', 'dx', 'dy', 'fill', 'fx', 'fy', 'g', 'height', 'id',
  'mask', 'offset', 'opacity', 'path', 'points', 'r', 'rx', 'ry',
  'stopColor', 'stopOpacity', 'stroke', 'strokeDasharray', 'strokeLinecap',
  'strokeLinejoin', 'strokeWidth', 'textAnchor', 'transform', 'viewBox',
  'width', 'x', 'x1', 'x2', 'y', 'y1', 'y2', 'xmlns',
])

// ─── HTML→JSX conversion ─────────────────────────────────────────────────

function convertHtmlToJsx(html: string): string {
  // 1. Handle doctype (rare but possible)
  let result = html.replace(/<!DOCTYPE[^>]*>/gi, '')

  // 2. Self-closing tags
  result = result.replace(/<(\w[\w-]*)([^>]*?)\s*\/?>/g, (match, tag, attrs) => {
    const selfClosing = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr',
    ]
    // Only self-close if it's truly empty (no content) or is a known void element
    if (selfClosing.includes(tag.toLowerCase())) {
      return `<${tag}${attrs} />`
    }
    return match
  })

  // 3. Convert attributes
  result = result.replace(/(\w[\w-]*)\s*=\s*"([^"]*)"|(\w[\w-]*)\s*=\s*'([^']*)'/g, (match, attr1, val1, attr2, val2) => {
    const attr = attr1 || attr2
    const val = attr1 !== undefined ? val1 : val2

    if (!attr) return match

    // Class → className
    if (attr === 'class') return `className="${val}"`
    // For → htmlFor
    if (attr === 'for') return `htmlFor="${val}"`
    // Autofocus → autoFocus
    if (attr.toLowerCase() === 'autofocus') return `autoFocus="${val}"`
    // Tabindex → tabIndex
    if (attr.toLowerCase() === 'tabindex') return `tabIndex="${val}"`
    // Readonly → readOnly
    if (attr.toLowerCase() === 'readonly') return `readOnly="${val}"`
    // Maxlength → maxLength
    if (attr.toLowerCase() === 'maxlength') return `maxLength="${val}"`
    // Contenteditable → contentEditable
    if (attr.toLowerCase() === 'contenteditable') return `contentEditable="${val}"`
    // Spellcheck → spellCheck
    if (attr.toLowerCase() === 'spellcheck') return `spellCheck="${val}"`
    // Autocomplete → autoComplete
    if (attr.toLowerCase() === 'autocomplete') return `autoComplete="${val}"`
    // Autoplay → autoPlay
    if (attr.toLowerCase() === 'autoplay') return `autoPlay="${val}"`
    // Enctype → encType
    if (attr.toLowerCase() === 'enctype') return `encType="${val}"`
    // Formnovalidate → formNoValidate
    if (attr.toLowerCase() === 'formnovalidate') return `formNoValidate="${val}"`
    // Hreflang → hrefLang
    if (attr.toLowerCase() === 'hreflang') return `hrefLang="${val}"`
    // Img crossOrigin
    if (attr.toLowerCase() === 'crossorigin') return `crossOrigin="${val}"`
    // SVGs: keep as-is
    if (SVG_ATTRS.has(attr)) return `${attr}="${val}"`

    // Convert kebab-case to camelCase (general case)
    if (attr.includes('-')) {
      const camel = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      return `${camel}="${val}"`
    }

    return `${attr}="${val}"`
  })

  // 4. Handle boolean attributes (disabled, checked, selected, etc.)
  const booleanAttrs = [
    'disabled', 'checked', 'selected', 'readOnly', 'multiple', 'required',
    'hidden', 'open', 'async', 'defer', 'autoplay', 'controls', 'loop',
    'muted', 'novalidate', 'formnovalidate', 'itemscope', 'allowfullscreen',
    'autofocus', 'draggable', 'spellcheck',
  ]
  for (const attr of booleanAttrs) {
    // Replace attr="attrname" with just {attr}
    const regex = new RegExp(`${attr}="${attr}"`, 'gi')
    result = result.replace(regex, attr)
    // Also handle just the bare attribute
    const bareRegex = new RegExp(`\\s${attr}(?=[\\s>/])`, 'gi')
    result = result.replace(bareRegex, ` ${attr}`)
  }

  // 5. Style attribute: convert semicolons to object? No — keep as string for simplicity
  //    Advanced users can inline objects manually

  // 6. Replace <script> with proper escaping
  //    (handled automatically by JSX)

  // 7. Clean up extra whitespace
  result = result.replace(/\s{2,}/g, ' ')
  result = result.replace(/>\s+</g, '>\n<')

  // 8. Indent properly (simple auto-indent)
  result = indentJSX(result)

  return result.trim()
}

function indentJSX(jsx: string): string {
  const lines = jsx.split('\n')
  let indent = 0
  const result: string[] = []

  for (let line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Decrease indent for closing tags
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1)
    }

    result.push('  '.repeat(indent) + trimmed)

    // Increase indent for opening tags (but not self-closing or closing)
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.endsWith('/ >')) {
      indent++
    }
  }

  return result.join('\n')
}

// ─── Sample HTML ──────────────────────────────────────────────────────────

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <a href="/" class="logo">
        <img src="logo.svg" alt="Logo" width="40" height="40">
        <span>MyApp</span>
      </a>
      <ul class="nav-links">
        <li><a href="/features" class="link">Features</a></li>
        <li><a href="/pricing" class="link active">Pricing</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main class="container">
    <section class="hero">
      <h1 class="hero-title">Welcome to MyApp</h1>
      <p class="hero-subtitle">Build faster with modern tools</p>
      <button class="btn btn-primary" disabled>Get Started</button>
    </section>

    <form class="signup-form">
      <label for="email">Email address:</label>
      <input type="email" id="email" name="email" placeholder="you@example.com" required>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" minlength="8">
      <button type="submit" class="btn">Sign Up</button>
    </form>
  </main>

  <footer>
    <p>&copy; 2026 MyApp. All rights reserved.</p>
  </footer>
</body>
</html>`

// ─── Component ────────────────────────────────────────────────────────────

export default function HtmlToJsxConverterClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [wrapInFragment, setWrapInFragment] = useState(true)

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter HTML to convert.')
      setOutput('')
      return
    }
    setError('')
    try {
      let converted = convertHtmlToJsx(input)
      if (wrapInFragment) {
        converted = `<>\n${converted}\n</>`
      }
      setOutput(converted)
    } catch (e) {
      setError('Conversion error: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }, [input, wrapInFragment])

  const stats = useMemo(() => {
    if (!input.trim() || !output) return null
    return {
      lines: output.split('\n').length,
      chars: output.length,
    }
  }, [input, output])

  const faq = [
    {
      question: 'How does the HTML to JSX converter work?',
      answer: 'It uses regex-based string transformation to convert standard HTML into React-compatible JSX syntax. It handles className (from class), htmlFor (from for), camelCase attribute conversion (e.g., tabindex → tabIndex, autocomplete → autoComplete), boolean attributes (disabled, checked, required), self-closing tags for void elements like img and input, and SVG attribute preservation.',
    },
    {
      question: 'Does this handle all edge cases?',
      answer: 'It handles the most common HTML to JSX conversions, including class names, labels, form attributes, boolean attributes, kebab-case to camelCase conversion, and self-closing tags. For complex cases with inline event handlers (onclick → onClick), dynamic JavaScript expressions, or dangerouslySetInnerHTML, you may need manual adjustments.',
    },
    {
      question: 'Can I convert SVG code to JSX?',
      answer: 'Yes — SVG attributes like viewBox, strokeWidth, fillOpacity, and strokeDasharray are preserved correctly. The converter recognizes SVG-specific attributes and keeps them in their original form while still converting standard HTML attributes within the SVG.',
    },
    {
      question: 'Do I need to wrap the output in a fragment?',
      answer: 'The converter offers an option to wrap output in a React fragment (<>...</>). Enable this when converting HTML that has multiple root elements (like a list of items) to avoid adding unnecessary wrapper divs. Disable it when you want to control the structure yourself.',
    },
    {
      question: 'Is this safe for converting production code?',
      answer: 'The conversion is deterministic and runs entirely in your browser. While it handles almost all standard HTML patterns, always review the output for correctness, especially for complex nested structures, inline event handlers, and dynamic expressions that may need custom JSX syntax.',
    },
  ]

  const seoContent = (
    <div className="space-y-4">
      <p>
        Converting HTML to JSX is a common task when migrating static HTML templates to React projects or when integrating third-party HTML snippets into JSX-based frameworks like Next.js, Gatsby, or Create React App.
      </p>
      <p>
        This free online HTML to JSX converter handles the mechanical transformation automatically: it converts class attributes to className, for attributes to htmlFor, and transforms kebab-case attributes to their camelCase equivalents. It also self-closes void elements (img, input, br, hr) and properly handles boolean attributes like disabled, checked, and required.
      </p>
      <p>
        All processing happens client-side — your HTML never leaves your browser. Use the wrap-in-fragment option for multi-root HTML structures, or disable it for single-root templates you want to control manually. Combined with our other developer tools like the code formatter and HTML playground, it is part of a complete toolkit for React developers.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="HTML to JSX Converter"
      description="Convert HTML markup into React-compatible JSX syntax. Handles className, htmlFor, camelCase attributes, self-closing tags, boolean attrs & SVG."
      toolSlug="html-to-jsx-converter"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="font-mono text-xs text-[#888888] block mb-1.5">
            <span className="text-[#555555]">$</span> Input HTML
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your HTML here..."
            rows={8}
            className="w-full bg-[#0a0a0a] border border-[#333333] text-[#F9F9F9] font-mono text-xs p-3 focus:outline-none focus:border-[#00FF41] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <TerminalButton onClick={handleConvert}>
            <span className="green-chevron">&gt;</span> Convert to JSX
          </TerminalButton>
          <TerminalButton onClick={() => setInput(SAMPLE_HTML)}>
            <span className="green-chevron">&gt;</span> Load Sample
          </TerminalButton>
          <TerminalButton onClick={() => { setInput(''); setOutput(''); setError('') }}>
            <span className="green-chevron">&gt;</span> Clear
          </TerminalButton>
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-[#888888] cursor-pointer">
            <input
              type="checkbox"
              checked={wrapInFragment}
              onChange={e => setWrapInFragment(e.target.checked)}
              className="accent-[#00FF41]"
            />
            Wrap in fragment {'(<> )'}
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="font-mono text-xs text-[#FF0040] border border-[#FF0040]/30 bg-[#FF0040]/5 p-3">
            <span className="text-[#FF0040]">✗</span> {error}
          </div>
        )}

        {/* Stats */}
        {stats && output && (
          <div className="font-mono text-[10px] text-[#888888] flex flex-wrap gap-4 border border-[#333333] p-2.5">
            <span>Output lines: <strong className="text-[#F9F9F9]">{stats.lines}</strong></span>
            <span>Characters: <strong className="text-[#F9F9F9]">{stats.chars.toLocaleString()}</strong></span>
          </div>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs text-[#888888]">
                <span className="text-[#555555]">$</span> JSX Output
              </label>
              <CopyButton text={output} />
            </div>
            <pre className="w-full bg-[#0a0a0a] border border-[#333333] text-[#00FF41] font-mono text-xs p-3 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
