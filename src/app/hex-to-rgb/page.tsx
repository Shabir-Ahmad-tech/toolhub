'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

const hexRgbFaq = [
  {
    question: 'What is the difference between HEX, RGB, and HSL?',
    answer: 'HEX uses hexadecimal notation (#RRGGBB) for red, green, blue values. RGB uses decimal values (rgb(255, 0, 0)) for red, green, blue channels. HSL uses hue (0-360), saturation (0-100%), and lightness (0-100%) for more intuitive color manipulation.'
  },
  {
    question: 'How accurate are the color conversions?',
    answer: 'Conversions are mathematically precise. HEX to RGB parses each pair of hex digits as 0-255 values. RGB to HSL uses standard color space conversion formulas. All calculations happen client-side in your browser for instant results.'
  },
  {
    question: 'What is a valid hex color format?',
    answer: 'Valid formats include 3-digit (#RGB) or 6-digit (#RRGGBB) hex codes. The # prefix is optional - the converter adds it automatically. Examples: #3498db, 3498db, #fff, fff all work correctly.'
  }
]

const hexRgbSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Convert Hex Colors to RGB and HSL</h2>
    <p className="text-[#888888] font-mono">
      Hex to RGB conversion translates color codes between formats used in design, development, and CSS. Enter any hex color to get RGB decimal values and HSL representation instantly. Perfect for developers translating design specs or designers working with code.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Color Format Uses</h3>
    <p className="text-[#888888] font-mono">
      Use HEX for CSS colors, HTML attributes, and design tools. Use RGB for JavaScript color manipulation and canvas operations. HSL is ideal for adjusting color lightness or saturation programmatically, making it popular for theme generators and design systems.
    </p>
  </div>
)

function hexToRgb(hex: string): { r: number; g: number; b: number; valid: boolean } {
  let h = hex.trim()
  if (!h.startsWith('#')) h = '#' + h
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  const m = h.match(/^#([0-9a-fA-F]{6})$/)
  if (!m) return { r: 0, g: 0, b: 0, valid: false }
  return {
    r: parseInt(m[1].slice(0, 2), 16),
    g: parseInt(m[1].slice(2, 4), 16),
    b: parseInt(m[1].slice(4, 6), 16),
    valid: true,
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rN = r / 255, gN = g / 255, bN = b / 255
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) * 60
  else if (max === gN) h = ((bN - rN) / d + 2) * 60
  else h = ((rN - gN) / d + 4) * 60
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function ColorCopyButton({ text }: { text: string }) {
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

export default function HexToRgbPage() {
  const [hex, setHex] = useState<string>('#3498db')
  const [result, setResult] = useState<{ r: number; g: number; b: number; valid: boolean } | null>(null)

  const convert = useCallback(() => {
    setResult(hexToRgb(hex))
  }, [hex])

  useEffect(() => { convert() }, [convert])

  const isValid = result?.valid ?? false
  const hsl = result?.valid ? rgbToHsl(result.r, result.g, result.b) : null

  return (
    <ToolLayout title="Hex to RGB Converter" description="Convert hex color codes to RGB and HSL values. Free online color converter." toolSlug="hex-to-rgb" categorySlug="developer-tools" faq={hexRgbFaq} seoContent={hexRgbSeo}>
      <div className="space-y-6 font-mono">
        {/* Input */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Hex Color</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              autoFocus
              className={`w-full px-4 py-3 bg-[#000000] border text-[#F9F9F9] font-mono text-lg outline-none focus:border-2 transition-none ${
                hex.trim() && !isValid
                  ? 'border-[#ff4444] focus:border-[#ff4444]'
                  : isValid
                    ? 'border-[#00FF41]'
                    : 'border-[#F9F9F9] focus:border-[#00FF41]'
              }`}
              placeholder="#3498db"
              autoComplete="off"
            />
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            {!isValid ? (
              <div className="p-4 bg-[#F9F9F9] text-[#000000] font-mono text-xs border-l-4" style={{ borderImage: 'repeating-linear-gradient(45deg, #000 0px, #000 4px, transparent 4px, transparent 8px) 1' }}>
                Invalid hex color code. Use format like <span className="font-bold">#3498db</span> or <span className="font-bold">3498db</span>
              </div>
            ) : (
              <>
                {/* Color preview */}
                <div
                  className="h-24 border border-[#F9F9F9]"
                  style={{ backgroundColor: `#${result.r.toString(16).padStart(2, '0')}${result.g.toString(16).padStart(2, '0')}${result.b.toString(16).padStart(2, '0')}` }}
                />

                {/* Color values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-[#333333] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">HEX</span>
                      <ColorCopyButton text={`#${result.r.toString(16).padStart(2, '0')}${result.g.toString(16).padStart(2, '0')}${result.b.toString(16).padStart(2, '0')}`.toUpperCase()} />
                    </div>
                    <p className="text-lg font-mono font-bold text-[#F9F9F9]">
                      #{(result.r.toString(16).padStart(2, '0') + result.g.toString(16).padStart(2, '0') + result.b.toString(16).padStart(2, '0')).toUpperCase()}
                    </p>
                  </div>

                  <div className="border border-[#333333] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">RGB</span>
                      <ColorCopyButton text={`rgb(${result.r}, ${result.g}, ${result.b})`} />
                    </div>
                    <p className="text-lg font-mono font-bold text-[#F9F9F9]">rgb({result.r}, {result.g}, {result.b})</p>
                  </div>

                  {hsl && (
                    <div className="border border-[#333333] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">HSL</span>
                        <ColorCopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
                      </div>
                      <p className="text-lg font-mono font-bold text-[#F9F9F9]">hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
