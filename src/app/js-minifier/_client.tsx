'use client'

import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CopyButton } from '@/components/ui/CopyButton'

// ─── JS Minification Logic ────────────────────────────────────────────────

function minifyJS(code: string): string {
  if (!code.trim()) return ''

  // 1. Remove single-line comments (but not inside strings)
  let result = removeComments(code)

  // 2. Collapse all whitespace to single space (but not inside strings/regExps)
  result = collapseWhitespace(result)

  // 3. Remove spaces around operators where safe
  result = result
    .replace(/\s*([=+\-*/%&|^<>!?:;{},()[\]])\s*/g, '$1')
    // Restore space after keywords: if, while, for, return, switch, catch
    .replace(/\b(if|while|for|switch|catch|with|typeof|instanceof|void|delete)\s*\(/g, '$1 (')
    .replace(/\b(return|throw|yield|case)\s+(\S)/g, '$1 $2')
    .replace(/\b(else|do|finally|try)\s*{/g, '$1 {')
    .replace(/}\s*(else|catch|finally|while)\s*{/g, '} $1 {')

  // 4. Remove trailing semicolons before }
  result = result.replace(/;\s*}/g, '}')

  // 5. Remove empty statements
  result = result.replace(/;;+/g, ';')

  // 6. Remove leading/trailing whitespace
  result = result.trim()

  return result
}

function removeComments(code: string): string {
  let result = ''
  let i = 0
  let inSingle = false
  let inMulti = false
  let inString: string | null = null

  while (i < code.length) {
    const c = code[i]
    const n = code[i + 1] || ''

    if (inString) {
      result += c
      if (c === '\\' && i + 1 < code.length) {
        result += code[i + 1]
        i += 2
        continue
      }
      if (c === inString) inString = null
      i++
      continue
    }

    if (!inSingle && !inMulti) {
      if (c === "'" || c === '"' || c === '`') {
        inString = c
        result += c
        i++
        continue
      }
    }

    if (!inMulti && c === '/' && n === '/' && !inString) {
      inSingle = true
      i += 2
      continue
    }
    if (inSingle) {
      if (c === '\n') {
        inSingle = false
        result += '\n'
      }
      i++
      continue
    }

    if (!inSingle && c === '/' && n === '*' && !inString) {
      inMulti = true
      i += 2
      continue
    }
    if (inMulti) {
      if (c === '*' && n === '/') {
        inMulti = false
        i += 2
        continue
      }
      i++
      continue
    }

    result += c
    i++
  }

  return result
}

function collapseWhitespace(code: string): string {
  let result = ''
  let i = 0
  let inString: string | null = null

  // First pass: handle template literals and strings
  while (i < code.length) {
    const c = code[i]
    const n = code[i + 1] || ''

    if (inString) {
      result += c
      if (c === '\\') {
        result += code[i + 1] || ''
        i += 2
        continue
      }
      if (c === inString) {
        if (inString === '`') {
          // Check for template literal interpolation ${}
          if (code[i + 1] === '$' && code[i + 2] === '{') inString = null
        }
        inString = null
      }
      i++
      continue
    }

    if (c === "'" || c === '"' || c === '`') {
      inString = c
      result += c
      i++
      continue
    }

    // Collapse whitespace to single space
    if (/\s/.test(c)) {
      // Check if previous char is already a space or we're at boundary
      const prev = result[result.length - 1]
      if (prev && /\s/.test(prev)) {
        i++
        continue
      }
      // Check context for safe whitespace removal
      const nextNonSpace = code.slice(i + 1).match(/\S/)
      const nextChar = nextNonSpace ? nextNonSpace[0] : ''

      // Remove space before punctuation: ; , ) ] }
      if (prev && /[;,\])}]/.test(nextChar)) {
        i++
        continue
      }
      // Remove space after punctuation: ( [ { ; , = + - etc
      if (prev && /[(\[{;,:!=+\-*/%&|^<>?]/.test(prev)) {
        i++
        continue
      }

      result += ' '
      i++
      continue
    }

    result += c
    i++
  }

  return result
}

// ─── Sample Code ──────────────────────────────────────────────────────────

const SAMPLE_CODE = `// Utility: format currency
function formatCurrency(amount, currency = 'USD') {
  /*
   * Format a number as currency string
   * using the Intl API
   */
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

// Calculate total with tax
function calculateTotal(items, taxRate = 0.08) {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: formatCurrency(subtotal),
    tax: formatCurrency(tax),
    total: formatCurrency(total),
  };
}

// Example usage
const cart = [
  { name: 'Widget', price: 19.99, quantity: 2 },
  { name: 'Gadget', price: 34.99, quantity: 1 },
];

console.log(calculateTotal(cart));`

export default function JSMinifierClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter JavaScript code to minify.')
      setOutput('')
      return
    }
    setError('')
    try {
      const minified = minifyJS(input)
      setOutput(minified)
    } catch (e) {
      setError('Minification error: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }, [input])

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
      question: 'How does this JavaScript minifier work?',
      answer: 'It processes your JS code entirely in your browser — no server upload. The minifier strips single-line (//) and multi-line (/* */) comments, collapses whitespace, removes unnecessary spaces around operators and punctuation, eliminates trailing semicolons before closing braces, and removes empty statements. The result is a smaller, production-ready JavaScript file.',
    },
    {
      question: 'Is my code uploaded to any server?',
      answer: 'No. All minification happens client-side in your browser using JavaScript string processing. Your code never leaves your device, making it safe for proprietary or sensitive codebases.',
    },
    {
      question: 'How much smaller will my JavaScript file be?',
      answer: 'Typical savings range from 20–50% depending on how much comments and whitespace your original code contains. Heavily documented code with lots of comments sees the biggest reduction. The tool shows exact byte counts and percentage saved after each minification.',
    },
    {
      question: 'Is this as good as Terser or esbuild?',
      answer: 'This minifier handles safe structural optimizations — comment removal, whitespace collapse, and punctuation tightening. It does not perform AST-level optimizations like dead code elimination, variable renaming, or constant folding that tools like Terser and esbuild do. For production builds, we recommend using those tools in your build pipeline. This is ideal for quick ad-hoc minification, code snippets, or learning how minification works.',
    },
    {
      question: 'Can I minify TypeScript or JSX code?',
      answer: 'The minifier handles plain JavaScript. For TypeScript or JSX files, consider using a proper build tool like esbuild, Vite, or webpack with Babel. You can still paste TypeScript code, but some type annotations may remain as they look like regular identifiers to the minifier.',
    },
  ]

  const seoContent = (
    <div className="space-y-4">
      <p>
        JavaScript minification is a critical step in web performance optimization. Every byte counts when it comes to page load times — and minifying your JavaScript files is one of the simplest, most effective ways to reduce bandwidth usage and improve Time to Interactive (TTI).
      </p>
      <p>
        This free online JavaScript minifier removes comments, whitespace, and unnecessary syntax from your JS code, reducing file size by 20–50% with zero configuration. Unlike many online tools, it runs entirely in your browser — no code is uploaded to any server, making it safe for proprietary and confidential code.
      </p>
      <p>
        Use it to quickly minify code snippets for demos, strip comments from shared code, or benchmark how much weight comments and formatting add to your scripts. For production builds, pair it with a bundler like esbuild, Vite, or webpack for AST-level optimizations like dead code elimination and variable renaming.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="JavaScript Minifier & Compressor"
      description="Strip comments, remove whitespace, and compress JS code for faster page loads. All processing happens client-side — nothing is uploaded."
      toolSlug="js-minifier"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="font-mono text-xs text-[#888888] block mb-1.5">
            <span className="text-[#555555]">$</span> Input JavaScript
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your JavaScript code here..."
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
          <TerminalButton onClick={() => setInput(SAMPLE_CODE)}>
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
            <pre className="w-full bg-[#0a0a0a] border border-[#333333] text-[#00FF41] font-mono text-xs p-3 overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
