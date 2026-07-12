'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

// ===== FAQ & SEO =====

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
  },
  {
    question: 'What does WCAG AA and AAA mean for contrast?',
    answer: 'WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. WCAG AAA is stricter at 7:1 for normal text and 4.5:1 for large text. These standards ensure content is readable for users with visual impairments.'
  },
  {
    question: 'What is the OKLCH color space?',
    answer: 'OKLCH is a perceptually uniform color space introduced by Bjorn Ottosson. It separates color into Lightness (L, 0-100), Chroma (C - color intensity), and Hue (H, 0-360). It provides more consistent gradients and better perceptual accuracy than HSL, making it ideal for modern design systems.'
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

// ===== Conversion Utilities =====

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

function rgbToHexString(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sN = s / 100
  const lN = l / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lN - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function srgbLinearize(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function getLuminance(r: number, g: number, b: number): number {
  const rL = srgbLinearize(r / 255)
  const gL = srgbLinearize(g / 255)
  const bL = srgbLinearize(b / 255)
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL
}

function getContrastRatio(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const l1 = getLuminance(r1, g1, b1)
  const l2 = getLuminance(r2, g2, b2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const rL = srgbLinearize(r / 255)
  const gL = srgbLinearize(g / 255)
  const bL = srgbLinearize(b / 255)

  // sRGB to LMS
  const lmsL = 0.4122214708 * rL + 0.5363325363 * gL + 0.0514459929 * bL
  const lmsM = 0.2119034982 * rL + 0.6806995451 * gL + 0.1073969566 * bL
  const lmsS = 0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL

  // Cube root
  const l_ = Math.cbrt(lmsL)
  const m_ = Math.cbrt(lmsM)
  const s_ = Math.cbrt(lmsS)

  // LMS to OKLab
  const okl = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const oka = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const okb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  // OKLab to OKLCH
  const c = Math.sqrt(oka * oka + okb * okb)
  let h = Math.atan2(okb, oka) * (180 / Math.PI)
  if (h < 0) h += 360

  return {
    l: Math.round(okl * 100),
    c: Math.round(c * 100),
    h: Math.round(h),
  }
}

// ===== CSS Named Colors Map (hex → name) =====

const NAMED_COLORS: Record<string, string> = {
  '000000': 'Black', '000080': 'Navy', '00008b': 'DarkBlue', '0000cd': 'MediumBlue',
  '0000ff': 'Blue', '006400': 'DarkGreen', '008000': 'Green', '008080': 'Teal',
  '008b8b': 'DarkCyan', '00bfff': 'DeepSkyBlue', '00ced1': 'DarkTurquoise',
  '00fa9a': 'MediumSpringGreen', '00ff00': 'Lime', '00ff7f': 'SpringGreen',
  '00ffff': 'Cyan', '191970': 'MidnightBlue', '1e90ff': 'DodgerBlue',
  '20b2aa': 'LightSeaGreen', '228b22': 'ForestGreen', '2e8b57': 'SeaGreen',
  '2f4f4f': 'DarkSlateGray', '32cd32': 'LimeGreen', '3cb371': 'MediumSeaGreen',
  '40e0d0': 'Turquoise', '4169e1': 'RoyalBlue', '4682b4': 'SteelBlue',
  '483d8b': 'DarkSlateBlue', '48d1cc': 'MediumTurquoise', '4b0082': 'Indigo',
  '556b2f': 'DarkOliveGreen', '5f9ea0': 'CadetBlue', '6495ed': 'CornflowerBlue',
  '663399': 'RebeccaPurple', '66cdaa': 'MediumAquamarine', '696969': 'DimGray',
  '6a5acd': 'SlateBlue', '6b8e23': 'OliveDrab', '708090': 'SlateGray',
  '778899': 'LightSlateGray', '7b68ee': 'MediumSlateBlue', '7cfc00': 'LawnGreen',
  '7fff00': 'Chartreuse', '7fffd4': 'Aquamarine', '800000': 'Maroon',
  '800080': 'Purple', '808000': 'Olive', '808080': 'Gray',
  '87ceeb': 'SkyBlue', '87cefa': 'LightSkyBlue', '8a2be2': 'BlueViolet',
  '8b0000': 'DarkRed', '8b008b': 'DarkMagenta', '8b4513': 'SaddleBrown',
  '8fbc8f': 'DarkSeaGreen', '90ee90': 'LightGreen', '9370db': 'MediumPurple',
  '9400d3': 'DarkViolet', '98fb98': 'PaleGreen', '9932cc': 'DarkOrchid',
  '9acd32': 'YellowGreen', 'a0522d': 'Sienna', 'a52a2a': 'Brown',
  'a9a9a9': 'DarkGray', 'add8e6': 'LightBlue', 'adff2f': 'GreenYellow',
  'afeeee': 'PaleTurquoise', 'b0c4de': 'LightSteelBlue', 'b0e0e6': 'PowderBlue',
  'b22222': 'FireBrick', 'b8860b': 'DarkGoldenrod', 'ba55d3': 'MediumOrchid',
  'bc8f8f': 'RosyBrown', 'bdb76b': 'DarkKhaki', 'c0c0c0': 'Silver',
  'c71585': 'MediumVioletRed', 'cd5c5c': 'IndianRed', 'cd853f': 'Peru',
  'd2691e': 'Chocolate', 'd2b48c': 'Tan', 'd3d3d3': 'LightGray',
  'd8bfd8': 'Thistle', 'da70d6': 'Orchid', 'daa520': 'Goldenrod',
  'db7093': 'PaleVioletRed', 'dc143c': 'Crimson', 'dcdcdc': 'Gainsboro',
  'dda0dd': 'Plum', 'deb887': 'Burlywood', 'e0ffff': 'LightCyan',
  'e6e6fa': 'Lavender', 'e9967a': 'DarkSalmon', 'ee82ee': 'Violet',
  'eee8aa': 'PaleGoldenrod', 'f08080': 'LightCoral', 'f0e68c': 'Khaki',
  'f0f8ff': 'AliceBlue', 'f0fff0': 'Honeydew', 'f0ffff': 'Azure',
  'f4a460': 'SandyBrown', 'f5deb3': 'Wheat', 'f5f5dc': 'Beige',
  'f5f5f5': 'WhiteSmoke', 'f5fffa': 'MintCream', 'f8f8ff': 'GhostWhite',
  'fa8072': 'Salmon', 'faebd7': 'AntiqueWhite', 'faf0e6': 'Linen',
  'fafad2': 'LightGoldenrodYellow', 'fdf5e6': 'OldLace', 'ff0000': 'Red',
  'ff00ff': 'Magenta', 'ff1493': 'DeepPink', 'ff4500': 'OrangeRed',
  'ff6347': 'Tomato', 'ff69b4': 'HotPink', 'ff7f50': 'Coral',
  'ff8c00': 'DarkOrange', 'ffa07a': 'LightSalmon', 'ffa500': 'Orange',
  'ffb6c1': 'LightPink', 'ffc0cb': 'Pink', 'ffd700': 'Gold',
  'ffdab9': 'PeachPuff', 'ffdead': 'NavajoWhite', 'ffdf00': 'LemonChiffon',
  'ffe4b5': 'Moccasin', 'ffe4c4': 'Bisque', 'ffe4e1': 'MistyRose',
  'ffebcd': 'BlanchedAlmond', 'ffefd5': 'PapayaWhip', 'fff0f5': 'LavenderBlush',
  'fff5ee': 'SeaShell', 'fff8dc': 'Cornsilk', 'fffacd': 'LemonChiffon2',
  'fffaf0': 'FloralWhite', 'fffafa': 'Snow', 'ffff00': 'Yellow',
  'ffffe0': 'LightYellow', 'fffff0': 'Ivory', 'ffffff': 'White',
}

function getNamedColor(hex: string): string | null {
  const clean = hex.replace('#', '').toLowerCase()
  // Try 6-char match first
  if (NAMED_COLORS[clean]) return NAMED_COLORS[clean]
  // Expand 3-char hex to 6-char
  if (clean.length === 3) {
    const expanded = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
    return NAMED_COLORS[expanded] ?? null
  }
  return null
}

// ===== Predefined Swatch Colors =====

const SWATCH_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Green', hex: '#008000' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Tomato', hex: '#FF6347' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Salmon', hex: '#FA8072' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Chocolate', hex: '#D2691E' },
  { name: 'Orchid', hex: '#DA70D6' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'SlateBlue', hex: '#6A5ACD' },
  { name: 'LawnGreen', hex: '#7CFC00' },
]

// ===== Copy Button Component =====

function ColorCopyButton({ text, label }: { text: string; label?: string }) {
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
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : label || 'COPY'}]
    </button>
  )
}

// ===== Main Component =====

export default function HexToRgbPage() {
  const [hexInput, setHexInput] = useState('#3498db')

  // Reverse conversion states (RGB)
  const [revR, setRevR] = useState('52')
  const [revG, setRevG] = useState('152')
  const [revB, setRevB] = useState('219')
  const [revH, setRevH] = useState('204')
  const [revS, setRevS] = useState('70')
  const [revL, setRevL] = useState('53')
  const [editingRev, setEditingRev] = useState<'none' | 'rgb' | 'hsl'>('none')

  // Contrast checker states
  const [fgHex, setFgHex] = useState('#000000')
  const [bgHex, setBgHex] = useState('#ffffff')

  // Parse main color
  const parsed = hexToRgb(hexInput)
  const isValid = parsed.valid
  const { r, g, b } = parsed
  const hsl = isValid ? rgbToHsl(r, g, b) : null
  const oklch = isValid ? rgbToOklch(r, g, b) : null
  const named = isValid ? getNamedColor(hexInput) : null

  // Sync reverse input displays when main hex changes (unless user is editing)
  useEffect(() => {
    if (!isValid) return
    if (editingRev !== 'rgb') {
      setRevR(String(r))
      setRevG(String(g))
      setRevB(String(b))
    }
    if (editingRev !== 'hsl' && hsl) {
      setRevH(String(hsl.h))
      setRevS(String(hsl.s))
      setRevL(String(hsl.l))
    }
  }, [hexInput, isValid, r, g, b, editingRev])

  // Auto-convert when the user finishes editing reverse inputs
  const applyRgb = useCallback(() => {
    const nr = parseInt(revR, 10)
    const ng = parseInt(revG, 10)
    const nb = parseInt(revB, 10)
    if (!isNaN(nr) && !isNaN(ng) && !isNaN(nb) &&
        nr >= 0 && nr <= 255 && ng >= 0 && ng <= 255 && nb >= 0 && nb <= 255) {
      setHexInput(rgbToHexString(nr, ng, nb))
    }
  }, [revR, revG, revB])

  const applyHsl = useCallback(() => {
    const nh = parseInt(revH, 10)
    const ns = parseInt(revS, 10)
    const nl = parseInt(revL, 10)
    if (!isNaN(nh) && !isNaN(ns) && !isNaN(nl) &&
        nh >= 0 && nh <= 360 && ns >= 0 && ns <= 100 && nl >= 0 && nl <= 100) {
      const { r: rr, g: rg, b: rb } = hslToRgb(nh, ns, nl)
      setHexInput(rgbToHexString(rr, rg, rb))
    }
  }, [revH, revS, revL])

  // Contrast checker derived values
  const fgParsed = hexToRgb(fgHex)
  const bgParsed = hexToRgb(bgHex)
  const fgValid = fgParsed.valid
  const bgValid = bgParsed.valid
  const contrastRatio = fgValid && bgValid
    ? getContrastRatio(fgParsed.r, fgParsed.g, fgParsed.b, bgParsed.r, bgParsed.g, bgParsed.b)
    : null
  const passesAA = contrastRatio !== null && contrastRatio >= 4.5
  const passesAAA = contrastRatio !== null && contrastRatio >= 7
  const passesAALarge = contrastRatio !== null && contrastRatio >= 3
  const passesAAALarge = contrastRatio !== null && contrastRatio >= 4.5

  // Hex string for display
  const hexDisplay = isValid
    ? rgbToHexString(r, g, b)
    : hexInput.startsWith('#') ? hexInput.toUpperCase() : '#' + hexInput.toUpperCase()

  return (
    <ToolLayout
      title="Hex to RGB Converter"
      description="Convert hex color codes to RGB and HSL values. Free online color converter with color picker, palette swatches, contrast checker, and OKLCH support."
      toolSlug="hex-to-rgb"
      categorySlug="developer-tools"
      faq={hexRgbFaq}
      seoContent={hexRgbSeo}
    >
      <div className="space-y-6 font-mono">

        {/* ===== HEX INPUT WITH COLOR PICKER ===== */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-mono text-[#888888] mb-2 uppercase tracking-wider">
              [&gt; HEX COLOR]
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              autoFocus
              className={`w-full px-4 py-3 bg-[#000000] border text-[#F9F9F9] font-mono text-lg outline-none focus:border-2 transition-none ${
                hexInput.trim() && !isValid
                  ? 'border-[#ff4444] focus:border-[#ff4444]'
                  : isValid
                    ? 'border-[#00FF41]'
                    : 'border-[#F9F9F9] focus:border-[#00FF41]'
              }`}
              placeholder="#3498db"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-mono text-[#888888] mb-2 uppercase tracking-wider">
              PICKER
            </label>
            <input
              type="color"
              value={isValid ? hexDisplay : '#000000'}
              onChange={(e) => setHexInput(e.target.value)}
              className="block w-14 h-[50px] bg-[#000000] border border-[#F9F9F9] cursor-pointer outline-none focus:border-2 focus:border-[#00FF41] p-0.5"
              style={{ borderRadius: 0, appearance: 'none', WebkitAppearance: 'none' }}
            />
          </div>
        </div>

        {hexInput.trim() && !isValid ? (
          <div className="p-4 bg-[#F9F9F9] text-[#000000] font-mono text-xs border-l-4" style={{ borderImage: 'repeating-linear-gradient(45deg, #000 0px, #000 4px, transparent 4px, transparent 8px) 1' }}>
            Invalid hex color code. Use format like <span className="font-bold">#3498db</span> or <span className="font-bold">3498db</span>
          </div>
        ) : isValid ? (
          <>
            {/* ===== LARGE COLOR PREVIEW ===== */}
                <div
                  className="h-32 border border-[#F9F9F9] flex items-center justify-center"
                  style={{ backgroundColor: hexDisplay }}
                >
                  <span
                    className="font-mono text-sm font-bold px-3 py-1"
                    style={{
                      color: r * 0.299 + g * 0.587 + b * 0.114 > 128 ? '#000000' : '#FFFFFF',
                      backgroundColor: r * 0.299 + g * 0.587 + b * 0.114 > 128 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    {hexDisplay}
                  </span>
                </div>

                {/* ===== NAMED COLOR DETECTION ===== */}
                {named && (
                  <div className="border border-[#333333] p-3 text-center">
                    <span className="text-[10px] text-[#888888] uppercase tracking-wider">NAMED COLOR</span>
                    <p className="text-lg font-bold text-[#00FF41] mt-1">{named}</p>
                  </div>
                )}

                {/* ===== MULTIPLE FORMATS ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* HEX */}
                  <div className="border border-[#333333] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">HEX</span>
                      <ColorCopyButton text={hexDisplay} label="COPY" />
                    </div>
                    <p className="text-lg font-mono font-bold text-[#F9F9F9] break-all">{hexDisplay}</p>
                  </div>

                  {/* RGB */}
                  <div className="border border-[#333333] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">RGB</span>
                      <ColorCopyButton text={`rgb(${r}, ${g}, ${b})`} label="COPY" />
                    </div>
                    <p className="text-lg font-mono font-bold text-[#F9F9F9] break-all">rgb({r}, {g}, {b})</p>
                  </div>

                  {/* HSL */}
                  {hsl && (
                    <div className="border border-[#333333] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">HSL</span>
                        <ColorCopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} label="COPY" />
                      </div>
                      <p className="text-lg font-mono font-bold text-[#F9F9F9] break-all">hsl({hsl.h}&deg;, {hsl.s}%, {hsl.l}%)</p>
                    </div>
                  )}

                  {/* OKLCH */}
                  {oklch && (
                    <div className="border border-[#333333] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">OKLCH</span>
                        <ColorCopyButton text={`oklch(${oklch.l}% ${oklch.c} ${oklch.h})`} label="COPY" />
                      </div>
                      <p className="text-lg font-mono font-bold text-[#F9F9F9] break-all">oklch({oklch.l}% {oklch.c} {oklch.h}&deg;)</p>
                    </div>
                  )}
                </div>

                {/* ===== REVERSE CONVERSION ===== */}
                <div className="border border-[#333333] p-4 space-y-4">
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">REVERSE CONVERSION</span>

                  {/* RGB inputs */}
                  <div>
                    <label className="text-[10px] text-[#888888] mb-2 block">RGB</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={revR}
                          onChange={(e) => { setRevR(e.target.value); setEditingRev('rgb') }}
                          onFocus={() => setEditingRev('rgb')}
                          onBlur={() => { setEditingRev('none'); applyRgb() }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setEditingRev('none'); applyRgb() } }}
                          min={0} max={255}
                          className="w-full px-3 py-2 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm text-center outline-none focus:border-[#00FF41]"
                          placeholder="R"
                        />
                        <input
                          type="number"
                          value={revG}
                          onChange={(e) => { setRevG(e.target.value); setEditingRev('rgb') }}
                          onFocus={() => setEditingRev('rgb')}
                          onBlur={() => { setEditingRev('none'); applyRgb() }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setEditingRev('none'); applyRgb() } }}
                          min={0} max={255}
                          className="w-full px-3 py-2 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm text-center outline-none focus:border-[#00FF41]"
                          placeholder="G"
                        />
                        <input
                          type="number"
                          value={revB}
                          onChange={(e) => { setRevB(e.target.value); setEditingRev('rgb') }}
                          onFocus={() => setEditingRev('rgb')}
                          onBlur={() => { setEditingRev('none'); applyRgb() }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setEditingRev('none'); applyRgb() } }}
                          min={0} max={255}
                          className="w-full px-3 py-2 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm text-center outline-none focus:border-[#00FF41]"
                          placeholder="B"
                        />
                      </div>
                      <button
                        onClick={() => { setEditingRev('none'); applyRgb() }}
                        className="terminal-btn flex-shrink-0"
                      >
                        [<span className="green-chevron">&gt;</span> APPLY]
                      </button>
                    </div>
                  </div>

                  {/* HSL inputs */}
                  <div>
                    <label className="text-[10px] text-[#888888] mb-2 block">HSL</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={revH}
                          onChange={(e) => { setRevH(e.target.value); setEditingRev('hsl') }}
                          onFocus={() => setEditingRev('hsl')}
                          onBlur={() => { setEditingRev('none'); applyHsl() }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setEditingRev('none'); applyHsl() } }}
                          min={0} max={360}
                          className="w-full px-3 py-2 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm text-center outline-none focus:border-[#00FF41]"
                          placeholder="H"
                        />
                        <input
                          type="number"
                          value={revS}
                          onChange={(e) => { setRevS(e.target.value); setEditingRev('hsl') }}
                          onFocus={() => setEditingRev('hsl')}
                          onBlur={() => { setEditingRev('none'); applyHsl() }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setEditingRev('none'); applyHsl() } }}
                          min={0} max={100}
                          className="w-full px-3 py-2 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm text-center outline-none focus:border-[#00FF41]"
                          placeholder="S"
                        />
                        <input
                          type="number"
                          value={revL}
                          onChange={(e) => { setRevL(e.target.value); setEditingRev('hsl') }}
                          onFocus={() => setEditingRev('hsl')}
                          onBlur={() => { setEditingRev('none'); applyHsl() }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setEditingRev('none'); applyHsl() } }}
                          min={0} max={100}
                          className="w-full px-3 py-2 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm text-center outline-none focus:border-[#00FF41]"
                          placeholder="L"
                        />
                      </div>
                      <button
                        onClick={() => { setEditingRev('none'); applyHsl() }}
                        className="terminal-btn flex-shrink-0"
                      >
                        [<span className="green-chevron">&gt;</span> APPLY]
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===== COLOR PALETTE / SWATCHES ===== */}
                <div className="border border-[#333333] p-4">
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">COLOR PALETTE</span>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-3">
                    {SWATCH_COLORS.map(({ name, hex }) => (
                      <button
                        key={hex}
                        onClick={() => setHexInput(hex)}
                        className="group relative flex flex-col items-center gap-1 cursor-pointer border border-[#333333] hover:border-[#00FF41] focus:outline-none focus:border-[#00FF41] transition-none p-1"
                        title={name}
                      >
                        <div
                          className="w-full aspect-square border border-[#222222]"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-[8px] text-[#888888] font-mono truncate w-full text-center leading-tight">
                          {name}
                        </span>
                        {/* Active indicator */}
                        {hexInput.toUpperCase() === hex.toUpperCase() && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FF41]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ===== CONTRAST CHECKER ===== */}
                <div className="border border-[#333333] p-4 space-y-4">
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">CONTRAST CHECKER</span>

                  {/* FG and BG inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Foreground */}
                    <div>
                      <label className="text-[10px] text-[#888888] mb-2 block">FOREGROUND</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 flex-shrink-0 border border-[#333333]"
                          style={{ backgroundColor: fgValid ? fgHex : '#000000' }}
                        />
                        <input
                          type="text"
                          value={fgHex}
                          onChange={(e) => setFgHex(e.target.value)}
                          className={`flex-1 px-3 py-2 bg-[#000000] border text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 ${
                            fgHex.trim() && !fgValid
                              ? 'border-[#ff4444]'
                              : fgValid
                                ? 'border-[#333333] focus:border-[#00FF41]'
                                : 'border-[#333333] focus:border-[#00FF41]'
                          }`}
                          placeholder="#000000"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    {/* Background */}
                    <div>
                      <label className="text-[10px] text-[#888888] mb-2 block">BACKGROUND</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 flex-shrink-0 border border-[#333333]"
                          style={{ backgroundColor: bgValid ? bgHex : '#000000' }}
                        />
                        <input
                          type="text"
                          value={bgHex}
                          onChange={(e) => setBgHex(e.target.value)}
                          className={`flex-1 px-3 py-2 bg-[#000000] border text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 ${
                            bgHex.trim() && !bgValid
                              ? 'border-[#ff4444]'
                              : bgValid
                                ? 'border-[#333333] focus:border-[#00FF41]'
                                : 'border-[#333333] focus:border-[#00FF41]'
                          }`}
                          placeholder="#ffffff"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contrast Ratio Display */}
                  {contrastRatio !== null ? (
                    <div className="space-y-3">
                      <div className="text-center py-4 border border-[#333333]">
                        <span className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">CONTRAST RATIO</span>
                        <span className="text-4xl font-bold text-[#F9F9F9]">{contrastRatio.toFixed(2)}</span>
                        <span className="text-lg text-[#888888]"> : 1</span>
                      </div>

                      {/* WCAG Results */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className={`p-3 border text-center ${passesAA ? 'border-[#00FF41]' : 'border-[#333333]'}`}>
                          <span className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">WCAG AA Normal</span>
                          <span className={`text-lg font-bold ${passesAA ? 'text-[#00FF41]' : 'text-[#888888]'}`}>
                            {passesAA ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-xs text-[#888888] block mt-1">4.5:1 required</span>
                        </div>
                        <div className={`p-3 border text-center ${passesAALarge ? 'border-[#00FF41]' : 'border-[#333333]'}`}>
                          <span className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">WCAG AA Large</span>
                          <span className={`text-lg font-bold ${passesAALarge ? 'text-[#00FF41]' : 'text-[#888888]'}`}>
                            {passesAALarge ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-xs text-[#888888] block mt-1">3.0:1 required</span>
                        </div>
                        <div className={`p-3 border text-center ${passesAAA ? 'border-[#00FF41]' : 'border-[#333333]'}`}>
                          <span className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">WCAG AAA Normal</span>
                          <span className={`text-lg font-bold ${passesAAA ? 'text-[#00FF41]' : 'text-[#888888]'}`}>
                            {passesAAA ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-xs text-[#888888] block mt-1">7.0:1 required</span>
                        </div>
                        <div className={`p-3 border text-center ${passesAAALarge ? 'border-[#00FF41]' : 'border-[#333333]'}`}>
                          <span className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">WCAG AAA Large</span>
                          <span className={`text-lg font-bold ${passesAAALarge ? 'text-[#00FF41]' : 'text-[#888888]'}`}>
                            {passesAAALarge ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-xs text-[#888888] block mt-1">4.5:1 required</span>
                        </div>
                      </div>

                      {/* Preview text sample */}
                      <div
                        className="p-4 border border-[#333333] text-center"
                        style={{ backgroundColor: bgValid ? bgHex : '#ffffff', color: fgValid ? fgHex : '#000000' }}
                      >
                        <p className="text-lg font-bold">Sample Text (Large)</p>
                        <p className="text-sm mt-1">Sample text for normal body copy contrast preview.</p>
                        <p className="text-[10px] text-[#888888] mt-2">
                          BG: {bgValid ? bgHex.toUpperCase() : '#FFFFFF'} &middot; FG: {fgValid ? fgHex.toUpperCase() : '#000000'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F9F9F9] text-[#000000] font-mono text-xs border-l-4" style={{ borderImage: 'repeating-linear-gradient(45deg, #000 0px, #000 4px, transparent 4px, transparent 8px) 1' }}>
                      Enter valid hex colors for both foreground and background to check the contrast ratio.
                    </div>
                  )}
                </div>
              </>
            ) : null}
      </div>
    </ToolLayout>
  )
}
