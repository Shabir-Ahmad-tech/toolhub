'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CopyButton } from '@/components/ui/CopyButton'

// ─── Color utilities ──────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '')
  if (h.length !== 6 && h.length !== 3) return null
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

// ─── Palette generation ───────────────────────────────────────────────────

type PaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'

interface PaletteColor {
  hex: string
  name: string
}

function generatePalette(baseHex: string, type: PaletteType): PaletteColor[] {
  const rgb = hexToRgb(baseHex)
  if (!rgb) return []
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const colors: PaletteColor[] = []

  switch (type) {
    case 'monochromatic': {
      // Vary lightness only
      const lightnesses = [15, 35, 50, 65, 80]
      colors.push(...lightnesses.map((l, i) => {
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, l)
        return { hex: rgbToHex(r, g, b), name: i === 0 ? 'Dark' : i === 2 ? 'Base' : i === 4 ? 'Light' : i === 1 ? 'Shadow' : 'Tint' }
      }))
      break
    }
    case 'analogous': {
      // ±30°, ±60°
      const angles = [-60, -30, 0, 30, 60]
      colors.push(...angles.map((a, i) => {
        const h = ((hsl.h + a) % 360 + 360) % 360
        const { r, g, b } = hslToRgb(h, hsl.s, hsl.l)
        return { hex: rgbToHex(r, g, b), name: i === 2 ? 'Base' : a === -60 ? 'Left 2' : a === -30 ? 'Left' : a === 30 ? 'Right' : 'Right 2' }
      }))
      break
    }
    case 'complementary': {
      // Base + 180°, with accent variants
      const comp = (hsl.h + 180) % 360
      const baseLight = { r: hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 15)), g: 0, b: 0 } as { r: number; g: number; b: number }
      ;({ r: baseLight.r, g: baseLight.g, b: baseLight.b } = hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 15)))
      const compLight = hslToRgb(comp, hsl.s, Math.min(100, hsl.l + 15))
      const baseDark = hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 15))
      const compDark = hslToRgb(comp, hsl.s, Math.max(0, hsl.l - 15))
      colors.push(
        { hex: rgbToHex(baseDark.r, baseDark.g, baseDark.b), name: 'Base Dark' },
        { hex: baseHex, name: 'Base' },
        { hex: rgbToHex(baseLight.r, baseLight.g, baseLight.b), name: 'Base Light' },
        { hex: rgbToHex(compDark.r, compDark.g, compDark.b), name: 'Complement Dark' },
        { hex: rgbToHex(compLight.r, compLight.g, compLight.b), name: 'Complement Light' },
      )
      break
    }
    case 'triadic': {
      // 0°, 120°, 240° — vary each by lightness
      const angles3 = [0, 120, 240]
      const lightnesses3 = [hsl.l - 12, hsl.l, hsl.l + 12]
      for (const a of angles3) {
        const h = ((hsl.h + a) % 360 + 360) % 360
        for (const l of lightnesses3) {
          const { r, g, b } = hslToRgb(h, hsl.s, Math.max(0, Math.min(100, l)))
          const name = a === 0 ? 'Primary' : a === 120 ? 'Secondary' : 'Accent'
          const shade = l === hsl.l - 12 ? 'Dark' : l === hsl.l ? '' : 'Light'
          colors.push({ hex: rgbToHex(r, g, b), name: shade ? `${name} ${shade}` : name })
        }
      }
      break
    }
    case 'tetradic': {
      // 0°, 90°, 180°, 270° (rectangle)
      const angles4 = [0, 90, 180, 270]
      const lightnesses4 = [hsl.l - 8, hsl.l + 8]
      for (const a of angles4) {
        const h = ((hsl.h + a) % 360 + 360) % 360
        const { r, g, b } = hslToRgb(h, hsl.s, hsl.l)
        const label = a === 0 ? 'A' : a === 90 ? 'B' : a === 180 ? 'C' : 'D'
        colors.push({ hex: rgbToHex(r, g, b), name: label })
      }
      // Add 4 more lighter variants
      for (const a of angles4) {
        const h = ((hsl.h + a) % 360 + 360) % 360
        const { r, g, b } = hslToRgb(h, hsl.s, Math.min(100, hsl.l + 15))
        const label = a === 0 ? 'A' : a === 90 ? 'B' : a === 180 ? 'C' : 'D'
        colors.push({ hex: rgbToHex(r, g, b), name: `${label} Light` })
      }
      break
    }
  }

  return colors
}

// ─── Presets ──────────────────────────────────────────────────────────────

const PRESETS = [
  { hex: '#00FF41', name: 'Neon Green' },
  { hex: '#FF0040', name: 'Ruby Red' },
  { hex: '#00BFFF', name: 'Deep Sky' },
  { hex: '#FF8800', name: 'Orange' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#F9F9F9', name: 'White' },
  { hex: '#FFD700', name: 'Gold' },
  { hex: '#FF69B4', name: 'Hot Pink' },
]

const PALETTE_TYPES: { value: PaletteType; label: string; desc: string }[] = [
  { value: 'monochromatic', label: 'Monochromatic', desc: 'Single hue, varying lightness' },
  { value: 'analogous', label: 'Analogous', desc: 'Adjacent hues on the wheel' },
  { value: 'complementary', label: 'Complementary', desc: 'Base + opposite hue' },
  { value: 'triadic', label: 'Triadic', desc: 'Three evenly-spaced hues' },
  { value: 'tetradic', label: 'Tetradic', desc: 'Four hues (rectangle)' },
]

// ─── Component ────────────────────────────────────────────────────────────

export default function ColorPaletteGeneratorClient() {
  const [baseColor, setBaseColor] = useState('#00FF41')
  const [paletteType, setPaletteType] = useState<PaletteType>('monochromatic')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const rgb = useMemo(() => hexToRgb(baseColor), [baseColor])

  const palette = useMemo(() => generatePalette(baseColor, paletteType), [baseColor, paletteType])

  const handlePreset = useCallback((hex: string) => {
    setBaseColor(hex)
  }, [])

  const handleCopyColor = useCallback(async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {}
  }, [])

  const handleExportPalette = useCallback(() => {
    const css = palette.map(c => c.hex).join(', ')
    const text = `/* Color Palette — ${paletteType} */\n${palette.map(c => `${c.name}: ${c.hex}`).join('\n')}`
    try {
      navigator.clipboard.writeText(text)
    } catch {}
  }, [palette, paletteType])

  const faq = [
    {
      question: 'How does the color palette generator work?',
      answer: 'Pick a base color and choose a harmony type — monochromatic, analogous, complementary, triadic, or tetradic. The tool generates 5–9 harmonious colors based on color theory rules, using HSL (hue, saturation, lightness) transformations to create balanced schemes.',
    },
    {
      question: 'What is the difference between palette types?',
      answer: 'Monochromatic uses one hue with varying lightness. Analogous uses adjacent hues on the color wheel. Complementary pairs a hue with its opposite. Triadic uses three evenly-spaced hues. Tetradic (rectangle) uses four hues forming a rectangle on the wheel. Each creates a different visual mood.',
    },
    {
      question: 'Can I use these palettes in commercial projects?',
      answer: 'Yes, all generated color palettes are royalty-free and can be used in any project — personal, commercial, or open-source. The tool simply generates colors based on mathematical color theory and does not store or copyright any palette.',
    },
    {
      question: 'How do I copy colors to my clipboard?',
      answer: 'Click any color swatch to copy its hex code. Use the "Export CSS" button to copy all palette colors at once as CSS variable declarations. You can also copy individual hex codes by clicking on a color name.',
    },
    {
      question: 'What is color harmony in design?',
      answer: 'Color harmony refers to aesthetically pleasing color combinations based on their positions on the color wheel. Harmonious palettes create visual balance and cohesion in designs. The five standard schemes (monochromatic, analogous, complementary, triadic, tetradic) cover the most common design needs.',
    },
  ]

  const seoContent = (
    <div className="space-y-4">
      <p>
        A great color palette can make or break a design. Whether you are building a website, creating a brand identity, designing a UI, or working on data visualizations, having a harmonious set of colors is essential for professional results.
      </p>
      <p>
        This free online color palette generator uses proven color theory principles to create balanced, visually appealing color schemes. Pick any base color — using the color picker or one of the presets — and instantly see five different harmony types. Each palette is mathematically calculated from your base hue using HSL transformations, ensuring the colors work together naturally.
      </p>
      <p>
        Unlike many online palette tools, this one runs entirely in your browser with no server interaction. Copy individual hex codes by clicking a swatch, or export the entire palette as CSS variables. Use it for web design, app development, graphic design, data viz, or any project that needs a professional color scheme.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate harmonious color palettes from any base color. Monochromatic, analogous, complementary, triadic, and tetradic schemes. Free online color scheme generator."
      toolSlug="color-palette-generator"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-5">
        {/* Color picker + presets */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
                className="w-12 h-12 border border-[#333333] cursor-pointer bg-transparent p-0.5"
              />
            </div>
            <div className="font-mono">
              <div className="text-xs text-[#F9F9F9]">{baseColor.toUpperCase()}</div>
              {rgb && (
                <div className="text-[10px] text-[#888888]">
                  rgb({rgb.r}, {rgb.g}, {rgb.b})
                </div>
              )}
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p.hex}
                onClick={() => handlePreset(p.hex)}
                className="w-7 h-7 border border-[#333333] hover:border-[#F9F9F9] transition-colors cursor-pointer"
                style={{ backgroundColor: p.hex }}
                title={p.name}
                aria-label={p.name}
              />
            ))}
          </div>
        </div>

        {/* Palette type selector */}
        <div className="flex flex-wrap gap-1.5">
          {PALETTE_TYPES.map(pt => (
            <button
              key={pt.value}
              onClick={() => setPaletteType(pt.value)}
              className={`font-mono text-[10px] px-2.5 py-1.5 border transition-colors cursor-pointer ${
                paletteType === pt.value
                  ? 'border-[#00FF41] text-[#00FF41] bg-[#00FF41]/5'
                  : 'border-[#333333] text-[#888888] hover:border-[#555555]'
              }`}
              title={pt.desc}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {/* Palette display */}
        <div className="border border-[#333333] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#888888]">
              <span className="text-[#555555]">$</span> Palette — {paletteType}
            </span>
            <TerminalButton onClick={handleExportPalette}>
              <span className="green-chevron">&gt;</span> Export CSS
            </TerminalButton>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
            {palette.map((c, i) => (
              <div key={i} className="space-y-1">
                <button
                  onClick={() => handleCopyColor(c.hex, i)}
                  className="w-full aspect-square border border-[#333333] hover:border-[#F9F9F9] transition-colors cursor-pointer relative group"
                  style={{ backgroundColor: c.hex }}
                  title={`Click to copy ${c.hex}`}
                >
                  {copiedIndex === i && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[8px] font-mono text-[#00FF41]">
                      Copied!
                    </span>
                  )}
                </button>
                <div className="text-center">
                  <div className="font-mono text-[9px] text-[#888888] truncate">{c.name}</div>
                  <div className="font-mono text-[8px] text-[#555555] truncate">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
