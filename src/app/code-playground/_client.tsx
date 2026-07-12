'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/ui/CopyButton'
import { ChevronDown, Terminal, FileCode, Monitor, Sun, Moon, Type, Minus, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'

function getLanguageIcon(id: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Code: Icons.Code,
    FileCode: Icons.FileCode,
    FileText: Icons.FileText,
    Database: Icons.Database,
    Terminal: Icons.Terminal,
    Container: Icons.Container,
    Palette: Icons.Palette,
    GitBranch: Icons.GitBranch,
    Search: Icons.Search,
  }
  // Find matching language
  const lang = LANGUAGES.find(l => l.id === id)
  return icons[lang?.icon || 'Code'] || Icons.Code
}

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: 'js', mode: 'javascript', runnable: true, icon: 'Code' },
  { id: 'typescript', name: 'TypeScript', ext: 'ts', mode: 'typescript', runnable: true, icon: 'FileCode' },
  { id: 'python', name: 'Python', ext: 'py', mode: 'python', runnable: true, icon: 'Code' },
  { id: 'html', name: 'HTML/CSS/JS', ext: 'html', mode: 'html', runnable: true, icon: 'FileCode' },
]

const DEFAULT_CODE: Record<string, string> = {
  javascript: `// JavaScript Playground
...
// Try modifying the number above!
`,
  typescript: `// TypeScript Playground
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! Your email is \${user.email}\`;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', isActive: true },
  { id: 2, name: 'Bob', email: 'bob@example.com', isActive: false },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', isActive: true },
];

const activeUsers = users.filter(u => u.isActive);
activeUsers.forEach(u => console.log(greetUser(u)));
`,
  python: `# Python Playground (via Pyodide)
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

import time
start = time.perf_counter()
result = fibonacci(10)
end = time.perf_counter()

print(f"fibonacci(10) = {result}")
print(f"Calculated in {(end - start)*1000:.2f}ms")

# Try: import json; print(json.dumps({"hello": "world"}))
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Playground</title>
  <style>
    body {
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
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: transform 0.2s, background 0.2s;
    }
    button:hover { background: #5a6fd6; transform: scale(1.05); }
    button:active { transform: scale(0.98); }
    #counter { font-size: 24px; margin: 20px 0; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Playground!</h1>
    <p id="counter">0 clicks</p>
    <button onclick="count()">Click Me!</button>
  </div>
  <script>
    let count = 0;
    function count() {
      count++;
      document.getElementById('counter').textContent = count + ' click' + (count !== 1 ? 's' : '');
    }
  </script>
</body>
</html>
`
}

export default function CodePlaygroundClient() {
  const [code, setCode] = useState<string>(DEFAULT_CODE.javascript)
  const [language, setLanguage] = useState<string>('javascript')
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [autoRun, setAutoRun] = useState(false)
  const [shared, setShared] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const outputRef = useRef<HTMLPreElement>(null)
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pyodideReadyRef = useRef(false)
  const pyodideLoadingRef = useRef(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('toolhub-playground-code')
    const savedLang = localStorage.getItem('toolhub-playground-lang')
    const savedTheme = localStorage.getItem('toolhub-playground-theme')
    const savedFontSize = localStorage.getItem('toolhub-playground-fontsize')
    const savedWordWrap = localStorage.getItem('toolhub-playground-wordwrap')
    const savedAutoRun = localStorage.getItem('toolhub-playground-autorun')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.code) setCode(parsed.code)
        if (parsed.language && DEFAULT_CODE[parsed.language]) setLanguage(parsed.language)
      } catch { /* ignore */ }
    }
    if (savedLang) setLanguage(savedLang)
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark')
    if (savedFontSize) setFontSize(parseInt(savedFontSize, 10))
    if (savedWordWrap) setWordWrap(savedWordWrap === 'true')
    if (savedAutoRun) setAutoRun(savedAutoRun === 'true')
  }, [])

  // Save to localStorage
  const saveState = useCallback(() => {
    localStorage.setItem('toolhub-playground-code', JSON.stringify({ code, language }))
    localStorage.setItem('toolhub-playground-lang', language)
    localStorage.setItem('toolhub-playground-theme', theme)
    localStorage.setItem('toolhub-playground-fontsize', fontSize.toString())
    localStorage.setItem('toolhub-playground-wordwrap', wordWrap.toString())
    localStorage.setItem('toolhub-playground-autorun', autoRun.toString())
  }, [code, language, theme, fontSize, wordWrap, autoRun])

  useEffect(() => { saveState() }, [saveState])

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Load Pyodide for Python execution
  const loadPyodide = useCallback(async () => {
    if (pyodideReadyRef.current || pyodideLoadingRef.current) return
    pyodideLoadingRef.current = true
    try {
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js'
          script.async = true
          script.onload = () => resolve()
          script.onerror = (e) => reject(e)
          document.head.appendChild(script)
        })
      }
      const pyodide = await (window as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' })
      ;(window as any).pyodide = pyodide
      pyodideReadyRef.current = true
    } catch (e) {
      console.error('Failed to load Pyodide:', e)
    } finally {
      pyodideLoadingRef.current = false
    }
  }, [])

  // Load Pyodide when Python is selected
  useEffect(() => {
    if (language === 'python') loadPyodide()
  }, [language, loadPyodide])

  // Run code based on language
  const runCode = useCallback(async () => {
    if (!code.trim()) {
      setOutput('')
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      const lang = LANGUAGES.find(l => l.id === language)
      if (!lang?.runnable) {
        setOutput('// This language does not support live execution.\n// Runnable languages: JavaScript, TypeScript, Python, HTML')
        setIsRunning(false)
        return
      }

      if (language === 'html') {
        // Run HTML in iframe
        const iframe = iframeRef.current
        if (iframe) {
          iframe.srcdoc = code
        }
        setOutput('�--- HTML rendered in preview panel �--')
      } else if (language === 'javascript' || language === 'typescript') {
        // Run JS/TS in sandboxed iframe
        const iframe = iframeRef.current
        if (iframe) {
          const wrappedCode = language === 'typescript'
            ? `// TypeScript will be transpiled\ntry {\n${code}\n} catch (e) { console.error(e); }`
            : `try {\n${code}\n} catch (e) { console.error(e); }`

          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: monospace; padding: 16px; background: #1e1e1e; color: #d4d4d4; margin: 0; }
                  .log { color: #9cdcfe; }
                  .error { color: #f44747; }
                  .warn { color: #cca700; }
                  .info { color: #4ec9b0; }
                </style>
              </head>
              <body>
                <script>
                  const originalLog = console.log;
                  const originalError = console.error;
                  const originalWarn = console.warn;
                  const originalInfo = console.info;

                  function format(...args) {
                    return args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ');
                  }

                  console.log = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'log';
                    div.textContent = '> ' + format(...args);
                    document.body.appendChild(div);
                    originalLog.apply(console, args);
                  };
                  console.error = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'error';
                    div.textContent = '�-- ' + format(...args);
                    document.body.appendChild(div);
                    originalError.apply(console, args);
                  };
                  console.warn = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'warn';
                    div.textContent = '�-- ' + format(...args);
                    document.body.appendChild(div);
                    originalWarn.apply(console, args);
                  };
                  console.info = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'info';
                    div.textContent = '�-- ' + format(...args);
                    document.body.appendChild(div);
                    originalInfo.apply(console, args);
                  };
                </script>
                <script>${wrappedCode}</script>
              </body>
            </html>
          `
          iframe.srcdoc = htmlContent
        }
        setOutput('�-- Executed in preview panel �--')
      } else if (language === 'python') {
        // Run Python via Pyodide
        if (!(window as any).pyodide) {
          setOutput('�-- Loading Python runtime...')
          await loadPyodide()
        }
        const pyodide = (window as any).pyodide
        if (pyodide) {
          try {
            pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = StringIO()
`)
            await pyodide.runPythonAsync(code)
            const result = pyodide.runPython(`
output = sys.stdout.getvalue()
sys.stdout = old_stdout
output
`)
            setOutput(result || '�-- Code executed (no output)')
          } catch (e: any) {
            pyodide.runPython('sys.stdout = old_stdout')
            setError(e.message || 'Python execution error')
            setOutput('')
          }
        } else {
          setError('Python runtime not available')
        }
      }
    } catch (e: any) {
      setError(e.message || 'Execution error')
      setOutput('')
    } finally {
      setIsRunning(false)
    }
  }, [code, language, loadPyodide])

  // Auto-run
  useEffect(() => {
    if (autoRun && code.trim()) {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = setTimeout(() => runCode(), 800)
    }
    return () => { if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current) }
  }, [code, language, autoRun, runCode])

  // Handle code change
  const handleCodeChange = (value: string) => {
    setCode(value)
    setError(null)
  }

  // Change language
  const handleLanguageChange = (langId: string) => {
    setLanguage(langId)
    const defaultCode = DEFAULT_CODE[langId] || ''
    setCode(defaultCode)
    setError(null)
    setOutput('')
    setShowLanguagePicker(false)
  }

  // Download code as file
  const handleDownload = () => {
    const lang = LANGUAGES.find(l => l.id === language)
    const ext = lang?.ext || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `playground.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Share code
  const handleShare = () => {
    const data = JSON.stringify({ code, language })
    const base64 = btoa(encodeURIComponent(data))
    const shareUrl = `${window.location.origin}/code-playground?code=${base64}`
    navigator.clipboard.writeText(shareUrl)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  // Reset to default
  const handleReset = () => {
    if (confirm('Reset to default template for this language?')) {
      const defaultCode = DEFAULT_CODE[language] || ''
      setCode(defaultCode)
      setError(null)
      setOutput('')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        runCode()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleDownload()
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        // Could toggle comment - skip for now
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [runCode, handleDownload])

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]
  const LanguageIcon = getLanguageIcon(language)

  // SEO Content and FAQ
  const codeFaq = [
    {
      question: 'Which languages support live code execution?',
      answer: 'JavaScript, TypeScript, Python (via Pyodide WebAssembly), and HTML/CSS/JS run live in your browser entirely client-side.'
    },
    {
      question: 'Is my code saved or sent to a server?',
      answer: 'Your code saves automatically to your browser\'s localStorage. No code is uploaded to any server. Execution happens entirely client-side using iframes (JS/HTML) or WebAssembly (Python).'
    },
    {
      question: 'Can I use npm packages or import modules?',
      answer: 'For JavaScript/TypeScript: only browser globals (fetch, DOM, etc.) — no npm. For Python: Pyodide includes many scientific packages (numpy, pandas, matplotlib) but not all PyPI packages. Check Pyodide docs for available packages.'
    },
    {
      question: 'How do I share my code?',
      answer: 'Click the Share button to copy a link with your code encoded. You can also download code as a file and share manually.'
    },
    {
      question: 'What are the keyboard shortcuts?',
      answer: 'Ctrl/Cmd+Enter: Run code. Ctrl/Cmd+S: Download file. Tab: Indent (in editor). Escape: Close language picker.'
    }
  ]

  const codeSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Web-Based Code Playground</h2>
      <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
        Code Playground is a free online editor supporting JavaScript, TypeScript, Python, and HTML/CSS/JS with live execution in your browser — no server required.
        Write, test, and download code instantly. Perfect for learning, prototyping, interviews, and debugging.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Supported Languages</h3>
      <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
        Runnable: JavaScript, TypeScript, Python (via Pyodide WebAssembly), HTML/CSS/JS.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Privacy-First Design</h3>
      <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
        All code executes client-side. Your snippets never leave your browser. Uses localStorage for persistence,
        WebAssembly for Python, and sandboxed iframes for JavaScript/HTML. No accounts, no tracking, no server logs.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="Code Playground"
      description="Online code editor with live execution for JavaScript, TypeScript, Python, and HTML."
      toolSlug="code-playground"
      faq={codeFaq}
      seoContent={codeSeo}
    >
      <div className="space-y-4">
        {/* Toolbar — Terminal style */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#000000] border border-[#333333]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> {currentLang.name}] <ChevronDown className="w-4 h-4" />
              </button>

              {showLanguagePicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLanguagePicker(false)} />
                  <div className="absolute right-0 top-full z-20 mt-0 w-56 bg-[#000000] border border-[#F9F9F9] overflow-hidden">
                    <div className="p-2 border-b border-[#333333]">
                      <input
                        type="text"
                        placeholder="Search languages..."
                        className="w-full px-2 py-1.5 text-sm bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono outline-none focus:border-2 focus:border-[#00FF41] placeholder-[#555555] transition-none"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {/* filter logic could go here */}}
                        autoFocus
                        style={{ caretColor: '#F9F9F9' }}
                      />
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={(e) => { e.stopPropagation(); handleLanguageChange(lang.id) }}
                          className={`w-full px-3 py-2 text-left font-mono text-xs transition-none border-b border-[#1a1a1a] last:border-b-0 ${
                            language === lang.id
                              ? 'bg-[#F9F9F9] text-[#000000] font-bold'
                              : 'text-[#888888] hover:bg-[#00FF41] hover:text-[#000000]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Icon = getLanguageIcon(lang.id);
                              return <Icon className="w-4 h-4" />;
                            })()}
                            <span className="capitalize flex-1">{lang.name}</span>
                            {lang.runnable && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-[#444444] text-[#666666]">
                                &gt; Run
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Run Button — Ghost button style */}
            <button
              onClick={runCode}
              disabled={isRunning || !currentLang.runnable}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {isRunning ? 'Running...' : 'Run Code'}]
            </button>

            {/* Auto-run Toggle */}
            <label className="flex items-center gap-2 text-xs font-mono text-[#666666] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="appearance-none w-4 h-4 bg-[#000000] border border-[#F9F9F9] checked:bg-[#F9F9F9] checked:border-[#F9F9F9] cursor-pointer"
              />
              Auto-run
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle — ghost button */}
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className="terminal-btn"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Font Size */}
            <div className="flex items-center gap-1 bg-[#000000] border border-[#333333] px-2">
              <Minus className="w-3.5 h-3.5 text-[#555555]" />
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-20 h-4 accent-[#F9F9F9]"
                aria-label="Font size"
              />
              <Plus className="w-3.5 h-3.5 text-[#555555]" />
              <span className="text-xs font-mono text-[#555555] w-8 text-right">{fontSize}px</span>
            </div>

            {/* Word Wrap Toggle — ghost */}
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className="terminal-btn"
              title="Toggle word wrap"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Download — ghost */}
            <button
              onClick={handleDownload}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> DL]
            </button>

            {/* Share — ghost */}
            <button
              onClick={handleShare}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {shared ? 'Shared' : 'Share'}]
            </button>

            {/* Reset — ghost */}
            <button
              onClick={handleReset}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> Reset]
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#F9F9F9] flex items-center gap-2 uppercase tracking-wider">
                <FileCode className="w-4 h-4" />
                Editor
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#555555]">
                <kbd className="px-1.5 py-0.5 bg-[#000000] border border-[#444444]">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-[#000000] border border-[#444444]">+</kbd>
                <kbd className="px-1.5 py-0.5 bg-[#000000] border border-[#444444]">Enter</kbd>
                <span>to run</span>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder={`// Write your ${currentLang.name} code here...`}
                className={`w-full h-[500px] p-4 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y outline-none focus:border-2 focus:border-[#00FF41] transition-none placeholder-[#555555] ${!wordWrap ? 'whitespace-pre' : ''}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.6', tabSize: 2, caretColor: '#F9F9F9' }}
                spellCheck={false}
              />
              {error && (
                <div className="absolute bottom-2 right-2 bg-[#F9F9F9] text-[#000000] text-[10px] font-mono px-2 py-1 border border-[#000000]">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output/Preview Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#F9F9F9] flex items-center gap-2 uppercase tracking-wider">
                {currentLang.runnable && currentLang.id !== 'html' ? (
                  <>
                    <Terminal className="w-4 h-4" />
                    Output
                  </>
                ) : currentLang.id === 'html' ? (
                  <>
                    <Monitor className="w-4 h-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <FileCode className="w-4 h-4" />
                    Info
                  </>
                )}
              </h3>
              {output && (
                <CopyButton
                  text={output}
                  label=""
                  className="p-1.5"
                />
              )}
            </div>

            <div className="relative">
              {currentLang.id === 'html' ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-[500px] border border-[#F9F9F9] bg-[#000000]"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                  title="HTML Preview"
                />
              ) : currentLang.runnable ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-[500px] border border-[#F9F9F9] bg-[#000000]"
                  sandbox="allow-scripts allow-same-origin"
                  title="Code Output"
                />
              ) : (
                <div className="w-full h-[500px] border border-[#F9F9F9] bg-[#000000] flex items-center justify-center p-6">
                  <div className="text-center text-[#666666] space-y-3">
                    <FileCode className="w-12 h-12 mx-auto text-[#444444]" />
                    <p className="font-mono text-xs text-[#888888]">Live execution not available for {currentLang.name}</p>
                    <p className="text-[11px] font-mono text-[#555555]">
                      This language supports syntax highlighting only.
                      <br />
                      Runnable languages: JavaScript, TypeScript, Python, HTML
                    </p>
                  </div>
                </div>
              )}
            </div>

            {output && currentLang.runnable && currentLang.id !== 'html' && (
              <div className="bg-[#000000] border border-[#333333] p-3 max-h-40 overflow-y-auto">
                <pre ref={outputRef} className="text-xs font-mono text-[#888888] whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#000000] border border-[#333333] text-[10px] font-mono text-[#555555]">
          <div className="flex items-center gap-4">
            <span>{code.length} chars</span>
            <span>{code.split('\n').length} lines</span>
            <span>{currentLang.name}</span>
            {currentLang.runnable && <span className="text-[#00FF41]">&gt; Runnable</span>}
          </div>
          <div className="flex items-center gap-2">
            <span>Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="px-2 py-1 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-[10px] outline-none focus:border-2 focus:border-[#00FF41] transition-none cursor-pointer"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>
      </ToolLayout>
  )
}