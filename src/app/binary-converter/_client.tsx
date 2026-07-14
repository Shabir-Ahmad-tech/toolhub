'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

const binaryFaq = [
  {
    question: 'What number systems does this converter support?',
    answer: 'The converter supports binary (base-2), octal (base-8), decimal (base-10), and hexadecimal (base-16). Binary uses only 0s and 1s. Octal uses digits 0-7. Decimal uses 0-9. Hexadecimal uses 0-9 and A-F.'
  },
  {
    question: 'How does binary to decimal conversion work?',
    answer: 'Each binary digit (bit) represents a power of 2. For example, 101010 in binary equals 1×32 + 0×16 + 1×8 + 0×4 + 1×2 + 0×1 = 42 in decimal. The converter handles all conversions instantly in your browser.'
  },
  {
    question: 'When would I need to convert between these formats?',
    answer: 'Binary conversion is essential for bitwise operations, low-level programming, and computer science. Hex is common for memory addresses, color codes, and debugging. Octal appears in Unix file permissions. Use this tool for programming exercises, debugging, or learning number systems.'
  }
]

const binarySeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Convert Between Number Systems Instantly</h2>
    <p className="text-[#888888] font-mono">
      Binary Converter translates numbers between binary, decimal, octal, and hexadecimal bases. Enter any value, select the source base, and see all conversions instantly. Perfect for programming, computer science, and debugging low-level code.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Understanding Number Bases</h3>
    <p className="text-[#888888] font-mono">
      Binary (base-2) is how computers store all data. Decimal (base-10) is human-standard. Hexadecimal (base-16) compresses binary for readability. Octal (base-8) is used in Unix permissions. Converting between them reveals how numbers are represented at different levels of computing.
    </p>
  </div>
)

const BASES = [
  { value: 2, label: 'Binary', prefix: '0b' },
  { value: 8, label: 'Octal', prefix: '0o' },
  { value: 10, label: 'Decimal', prefix: '' },
  { value: 16, label: 'Hexadecimal', prefix: '0x' },
]

function BinCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="terminal-btn"
    >
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
    </button>
  )
}

export default function BinaryConverterPage() {
  const [input, setInput] = useState<string>('42')
  const [fromBase, setFromBase] = useState<number>(10)
  const [error, setError] = useState<string>('')
  const [results, setResults] = useState<{ base: number; label: string; value: string }[]>([])

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError('')
      setResults([])
      return
    }
    const decimal = parseInt(input, fromBase)
    if (isNaN(decimal)) {
      setError('Invalid input for the selected base')
      setResults([])
      return
    }
    setError('')
    setResults(
      BASES.map(b => ({
        base: b.value,
        label: b.label,
        value: b.value === fromBase
          ? input.toUpperCase()
          : decimal.toString(b.value).toUpperCase(),
      }))
    )
  }, [input, fromBase])

  useEffect(() => { convert() }, [convert])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') convert()
  }

  return (
    <ToolLayout title="Binary Converter" description="Convert between binary, decimal, octal, and hexadecimal number systems." toolSlug="binary-converter" categorySlug="developer-tools" faq={binaryFaq} seoContent={binarySeo}>
      <div className="space-y-6 font-mono">
        {/* Base Selection */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Input Base</label>
          <div className="flex gap-2">
            {BASES.map(b => (
              <button
                key={b.value}
                onClick={() => setFromBase(b.value)}
                className={`group relative flex-1 px-3 py-3 border text-xs uppercase tracking-wider transition-none cursor-pointer overflow-hidden min-h-[44px] ${
                  fromBase === b.value
                    ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                    : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Enter Value</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-3 bg-[#000000] border text-[#F9F9F9] font-mono text-lg outline-none focus:border-2 transition-none ${
              error ? 'border-[#ff4444] focus:border-[#ff4444]' : 'border-[#F9F9F9] focus:border-[#00FF41]'
            }`}
            placeholder={fromBase === 2 ? '101010' : fromBase === 8 ? '52' : fromBase === 10 ? '42' : '2A'}
            autoComplete="off"
          />
          {error && (
            <p className="text-xs font-mono text-[#ff4444] mt-1">{error}</p>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && !error && (
          <div className="space-y-3">
            <p className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">Results</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map(r => (
                <div key={r.base} className="border border-[#333333] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">{r.label}</span>
                    <BinCopyButton text={r.value} />
                  </div>
                  <p className="text-lg font-mono font-bold text-[#F9F9F9] break-all">{r.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#333333] p-4">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Input Length</p>
                <p className="text-lg font-mono font-bold text-[#F9F9F9]">{input.length}</p>
              </div>
              <div className="border border-[#333333] p-4">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">From Base</p>
                <p className="text-lg font-mono font-bold text-[#F9F9F9]">{fromBase.toString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
