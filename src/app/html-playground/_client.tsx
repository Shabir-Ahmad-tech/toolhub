'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Monitor, RefreshCw, Share2, Lock, Check } from 'lucide-react'

const IS_PRO = false

const DEFAULT_HTML = `<div class="card">
  <h1>Hello, World!</h1>
  <p>Welcome to the KRUMB.DEV HTML Playground.</p>
  <button id="btn">Click Me!</button>
  <p id="clicks">0 clicks</p>
</div>`

const DEFAULT_CSS = `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  color: #333;
}
.card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  text-align: center;
}
button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background: #5a6fd6;
}`

const DEFAULT_JS = `let count = 0;
const btn = document.getElementById('btn');
const text = document.getElementById('clicks');

btn.addEventListener('click', () => {
  count++;
  text.innerText = count + ' clicks';
});`

export default function HtmlPlaygroundClient() {
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState(DEFAULT_JS)
  const [activeEditorTab, setActiveEditorTab] = useState<'html' | 'css' | 'js'>('html')
  const [autoRun, setAutoRun] = useState(true)
  const [shared, setShared] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('toolhub-playground-code')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.html !== undefined) setHtml(parsed.html)
        if (parsed.css !== undefined) setCss(parsed.css)
        if (parsed.js !== undefined) setJs(parsed.js)
      } catch {
        // ignore
      }
    }
  }, [])

  // Save to localStorage
  const saveToLocal = (h: string, c: string, j: string) => {
    localStorage.setItem('toolhub-playground-code', JSON.stringify({ html: h, css: c, js: j }))
  }

  // Compile and run the code
  const runCode = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    const combinedSource = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `
    iframe.srcdoc = combinedSource
  }

  // Handle code changes
  const handleCodeChange = (type: 'html' | 'css' | 'js', value: string) => {
    let nextHtml = html
    let nextCss = css
    let nextJs = js

    if (type === 'html') {
      setHtml(value)
      nextHtml = value
    } else if (type === 'css') {
      setCss(value)
      nextCss = value
    } else {
      setJs(value)
      nextJs = value
    }

    saveToLocal(nextHtml, nextCss, nextJs)

    if (autoRun) {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = setTimeout(() => {
        runCode()
      }, 600)
    }
  }

  // Run on mount
  useEffect(() => {
    runCode()
  }, [])

  const handleShare = () => {
    if (!IS_PRO) return
    const data = JSON.stringify({ html, css, js })
    const base64 = btoa(encodeURIComponent(data))
    const shareUrl = `${window.location.origin}/html-playground?code=${base64}`
    navigator.clipboard.writeText(shareUrl)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Reset to default template? This will clear your current progress.')) {
      setHtml(DEFAULT_HTML)
      setCss(DEFAULT_CSS)
      setJs(DEFAULT_JS)
      saveToLocal(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS)
      setTimeout(() => runCode(), 50)
    }
  }

  // SEO Content and FAQ
  const htmlFaq = [
    {
      question: 'What is an HTML playground used for?',
      answer: 'An HTML playground lets you write HTML, CSS, and JavaScript code and see results instantly. It is perfect for testing snippets, learning web development, debugging CSS, or prototyping interactive components without setting up a project.'
    },
    {
      question: 'Is my code saved or shared when I use the playground?',
      answer: 'Your code saves to your browser\'s localStorage automatically. No code is uploaded to servers. The Pro upgrade adds snippet sharing and cloud saving capabilities.'
    },
    {
      question: 'What features does the HTML playground support?',
      answer: 'The playground supports full HTML, CSS, and JavaScript. It renders in an sandboxed iframe for security. Use the auto-run toggle for live preview, copy buttons for each panel, and reset to see the default template.'
    }
  ]

  const htmlSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Live HTML, CSS, and JavaScript Playground</h2>
      <p>
        HTML Playground is a browser-based code sandbox for frontend development. Write HTML structure, style with CSS, and add interactivity with JavaScript. See live results in the preview pane, test responsive designs, and experiment with code snippets instantly.
      </p>
      <h3 className="text-sm font-semibold text-[#F9F9F9]">Perfect for Learning and Prototyping</h3>
      <p>
        Whether you are learning web development, testing CSS animations, or debugging layout issues, this sandbox provides instant feedback. Use it for coding interviews, front-end experiments, or demonstrating code to teammates. No setup required - just start coding.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="HTML Playground"
      description="Write HTML, CSS, and JS and get a live interactive preview instantly. Like a browser-based CodePen code sandbox."
      toolSlug="html-playground"
      categorySlug="developer-tools"
      faq={htmlFaq}
      seoContent={htmlSeo}
    >
      <div className="space-y-4">
        {/* Play control bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0a0a0a] border border-[#333333]">
          <div className="flex items-center gap-3">
            <button
              onClick={runCode}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> RUN CODE]
            </button>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#F9F9F9] cursor-pointer">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="border-[#333333] text-[#00FF41]"
              />
              Auto-run on change
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0a0a0a] text-[#F9F9F9] text-xs font-bold hover:bg-red-50 hover:text-[#FF4444] transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Template
            </button>

            <button
              onClick={handleShare}
              disabled={!IS_PRO}
              className={`group relative inline-flex items-center gap-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-none overflow-hidden ${
                IS_PRO
                  ? 'bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] cursor-pointer'
                  : 'bg-[#000000] border border-[#333333] text-[#555555] cursor-not-allowed opacity-40'
              }`}
            >
              {!IS_PRO && <Lock className="w-3 h-3 text-[#00FF41]" />}
              {shared ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Share2 className="w-3.5 h-3.5" />}
              Share Link
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editors panel */}
          <div className="space-y-3">
            <div className="flex border-b border-[#333333]">
              {(['html', 'css', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEditorTab(tab)}
                  className={`px-4 py-2 border-b-2 text-xs font-bold transition uppercase ${
                    activeEditorTab === tab
                      ? 'border-[#00FF41] text-[#00FF41]'
                      : 'border-transparent text-[#888888] hover:text-[#F9F9F9]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Current Editor Container */}
            <div className="relative">
              {activeEditorTab === 'html' && (
                <textarea
                  value={html}
                  onChange={(e) => handleCodeChange('html', e.target.value)}
                  placeholder="<!-- Write your HTML code here -->"
                  className="w-full h-96 p-4 border border-[#333333] bg-[#0a0a0a] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y"
                />
              )}

              {activeEditorTab === 'css' && (
                <textarea
                  value={css}
                  onChange={(e) => handleCodeChange('css', e.target.value)}
                  placeholder="/* Write your CSS rules here */"
                  className="w-full h-96 p-4 border border-[#333333] bg-[#0a0a0a] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y"
                />
              )}

              {activeEditorTab === 'js' && (
                <textarea
                  value={js}
                  onChange={(e) => handleCodeChange('js', e.target.value)}
                  placeholder="// Write your JavaScript code here"
                  className="w-full h-96 p-4 border border-[#333333] bg-[#0a0a0a] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y"
                />
              )}
            </div>
          </div>

          {/* Iframe Preview Panel */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 py-2 text-xs font-bold text-[#888888] uppercase tracking-wide border-b border-transparent">
              <Monitor className="w-4 h-4 text-[#00FF41]" /> Live Output Preview
            </div>

            <div className="w-full h-96 bg-[#0a0a0a] border border-[#333333] overflow-hidden">
              <iframe
                ref={iframeRef}
                title="Playground Preview"
                className="w-full h-full border-none bg-[#0a0a0a]"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>

      </ToolLayout>
  )
}
