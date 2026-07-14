'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'

let TurndownService: new (opts?: Record<string, unknown>) => { turndown: (html: string) => string }

const SAMPLE_HTML = `<h1>Welcome to My Blog</h1>
<p>This is a <strong>sample article</strong> about web development. Here we discuss various topics including <em>frontend</em> and <em>backend</em> technologies.</p>
<h2>Features</h2>
<ul>
  <li>Responsive design with CSS Grid</li>
  <li>Server-side rendering with Next.js</li>
  <li>Type-safe code with TypeScript</li>
</ul>
<h2>Code Example</h2>
<pre><code>const greeting = "Hello, World!";
console.log(greeting);</code></pre>
<h2>Configuration Table</h2>
<table>
  <thead>
    <tr>
      <th>Setting</th>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>theme</td>
      <td>dark</td>
      <td>Color scheme for the UI</td>
    </tr>
    <tr>
      <td>locale</td>
      <td>en-US</td>
      <td>Language and region setting</td>
    </tr>
  </tbody>
</table>
<p>For more information, visit <a href="https://example.com">our website</a>.</p>`

export default function HtmlToMarkdownConverter() {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const turndownRef = useRef<ReturnType<typeof TurndownService> | null>(null)

  // Load turndown dynamically (it's a large module)
  useEffect(() => {
    const loadTurndown = async () => {
      try {
        const mod = await import('turndown')
        turndownRef.current = new mod.default({
          headingStyle: 'atx',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced',
          emDelimiter: '*',
        })
      } catch {
        // will handle on first convert
      }
    }
    loadTurndown()
  }, [])

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError('Please paste HTML to convert.')
      setOutput('')
      return
    }
    setError(null)
    setLoading(true)
    try {
      if (!turndownRef.current) {
        setError('Turndown library failed to load. Try refreshing the page.')
        setOutput('')
        return
      }
      const result = turndownRef.current.turndown(input)
      setOutput(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Conversion failed. Check your HTML syntax.'
      setError(msg)
      setOutput('')
    } finally {
      setLoading(false)
    }
  }, [input])

  const copyOutput = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      toast('Copied!', 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = output
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast('Copied!', 'success')
    }
  }, [output, toast])

  const loadSample = () => {
    setInput(SAMPLE_HTML)
    setOutput('')
    setError(null)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What is an HTML to Markdown Converter?</strong> An HTML to Markdown
        converter transforms HTML markup into clean, readable Markdown syntax. This is essential when migrating
        content between platforms, converting documentation, or extracting readable text from web pages.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Why convert HTML to Markdown?</strong> Markdown is simpler, more
        readable, and portable across many platforms. Developers convert HTML to Markdown when migrating blog
        posts, generating documentation from web content, creating GitHub README files, or moving content
        between content management systems. Markdown also renders consistently on GitHub, GitLab, and most
        static site generators.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">How it works.</strong> Paste your HTML in the input area and click
        Convert. The tool uses the Turndown library to transform HTML elements into their Markdown equivalents:
        headings become # marks, links become [text](url), bold becomes **text**, code blocks use triple
        backticks, and tables use pipe syntax. All processing happens client-side — your HTML never leaves your
        browser.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'What HTML elements are supported?',
      answer: 'This converter supports headings (h1-h6), paragraphs, bold/italic, links, images, lists (ordered and unordered), code blocks (inline and fenced), horizontal rules, blockquotes, tables, and line breaks. Complex elements like forms, iframes, and embedded scripts are not converted.',
    },
    {
      question: 'Does it handle tables and complex HTML?',
      answer: 'Yes, HTML tables are converted to Markdown pipe tables. The converter handles thead, tbody, th, and td elements. However, table attributes like colspan, rowspan, and alignment are not preserved in the Markdown output as Markdown table syntax does not support these features.',
    },
    {
      question: 'Is my HTML data safe?',
      answer: 'Yes. The conversion runs entirely in your browser using client-side JavaScript. Your HTML content is never sent to any server, stored, or logged. This makes it safe to convert sensitive content including proprietary code snippets and confidential documentation.',
    },
    {
      question: 'What is the difference between ATX and Setext heading styles?',
      answer: 'ATX headings use # symbols (# Heading 1, ## Heading 2), which is the most common Markdown style used on GitHub and most platforms. Setext headings use underlines (=== for h1, --- for h2). This tool uses ATX style by default, which is more widely compatible.',
    },
    {
      question: 'Can I customize the output options?',
      answer: 'Currently, the converter uses optimal defaults: ATX heading style, - bullet list markers, fenced code blocks with triple backticks, and * emphasis delimiters. These choices align with common Markdown best practices and GitHub-flavored Markdown (GFM).',
    },
  ]

  return (
    <ToolLayout
      title="HTML to Markdown Converter"
      description="Convert HTML to clean Markdown online. Free HTML to MD converter supporting headings, lists, tables, code blocks, links, and images. Client-side processing, no data leaves your browser."
      toolSlug="html-to-markdown-converter"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; input.html</span>
            <button onClick={loadSample} className="text-[10px] font-mono text-[#555555] hover:text-[#00FF41]/60 transition-colors">
              [&gt; load sample]
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste HTML content here..."
            rows={8}
            className="w-full bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-xs md:text-sm p-3 rounded focus:outline-none focus:border-[#00FF41]/50 placeholder:text-[#555555] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={convert} disabled={loading} className="terminal-btn text-[11px]">
            <span className="green-chevron">&gt;</span> {loading ? 'Converting...' : 'Convert to Markdown'}
          </button>
          <button
            onClick={copyOutput}
            disabled={!output}
            className="terminal-btn text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="green-chevron">&gt;</span> Copy Output
          </button>
          <button onClick={clearAll} className="terminal-btn text-[11px]">
            <span className="green-chevron">&gt;</span> Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-3 rounded">
            <p className="text-red-400 font-mono text-xs">
              <span className="text-red-400">&gt;</span> {error}
            </p>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; output.md</span>
            <pre className="bg-[#0A0A0A] border border-[#00FF41]/20 text-[#F9F9F9] font-mono text-xs md:text-sm p-3 rounded overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output}
            </pre>
            <p className="text-[9px] font-mono text-[#555555]">
              {output.split('\n').length} lines | {output.length} characters
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
