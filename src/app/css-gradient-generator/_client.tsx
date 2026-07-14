'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'

type GradientType = 'linear' | 'radial' | 'conic'

interface ColorStop {
  color: string
  position: number // 0-100
}

const DEFAULT_STOPS: ColorStop[] = [
  { color: '#00C9FF', position: 0 },
  { color: '#92FE9D', position: 100 },
]

const GRADIENT_PRESETS: { name: string; type: GradientType; stops: ColorStop[]; angle: number }[] = [
  { name: 'Ocean Blue', type: 'linear', stops: [{ color: '#00C9FF', position: 0 }, { color: '#92FE9D', position: 100 }], angle: 90 },
  { name: 'Sunset', type: 'linear', stops: [{ color: '#F27121', position: 0 }, { color: '#E94057', position: 50 }, { color: '#8A2387', position: 100 }], angle: 135 },
  { name: 'Mojave', type: 'linear', stops: [{ color: '#FCCB90', position: 0 }, { color: '#D57EBB', position: 100 }], angle: 45 },
  { name: 'Night Sky', type: 'radial', stops: [{ color: '#0F2027', position: 0 }, { color: '#203A43', position: 50 }, { color: '#2C5364', position: 100 }], angle: 0 },
  { name: 'Neon', type: 'linear', stops: [{ color: '#FF007F', position: 0 }, { color: '#00F0FF', position: 100 }], angle: 45 },
  { name: 'Forest', type: 'linear', stops: [{ color: '#134E5E', position: 0 }, { color: '#71B280', position: 100 }], angle: 315 },
]

export default function CssGradientGenerator() {
  const { toast } = useToast()
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [stops, setStops] = useState<ColorStop[]>(DEFAULT_STOPS)

  const css = useMemo(() => {
    const stopStr = stops.map(s => `${s.color} ${s.position}%`).join(', ')
    switch (gradientType) {
      case 'linear':
        return `background: linear-gradient(${angle}deg, ${stopStr});`
      case 'radial':
        return `background: radial-gradient(circle, ${stopStr});`
      case 'conic':
        return `background: conic-gradient(from ${angle}deg, ${stopStr});`
    }
  }, [gradientType, angle, stops])

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(css)
      toast('CSS copied!', 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = css
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast('CSS copied!', 'success')
    }
  }, [css, toast])

  const updateStop = (index: number, field: keyof ColorStop, value: string | number) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const addStop = () => {
    if (stops.length >= 8) return
    const last = stops[stops.length - 1]
    const mid = Math.round((stops[stops.length - 2]?.position ?? 0) + last.position / 2)
    setStops([...stops, { color: '#888888', position: Math.min(mid, 100) }])
  }

  const removeStop = (index: number) => {
    if (stops.length <= 2) return
    setStops(prev => prev.filter((_, i) => i !== index))
  }

  const loadPreset = (preset: typeof GRADIENT_PRESETS[0]) => {
    setGradientType(preset.type)
    setAngle(preset.angle)
    setStops(preset.stops)
  }

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What is a CSS Gradient Generator?</strong> A CSS gradient
        generator is a visual tool that helps you create gradient backgrounds without manually writing CSS.
        Gradients are smooth transitions between two or more colors used extensively in modern web design for
        backgrounds, buttons, overlays, and decorative elements.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Types of gradients explained.</strong> <strong>Linear gradients</strong>
        transition colors along a straight line at a specified angle. <strong>Radial gradients</strong> radiate
        from a center point outward in a circular pattern. <strong>Conic gradients</strong> rotate colors around
        a center point like a color wheel. Each type creates a distinct visual effect suitable for different
        design contexts.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">How to use this generator.</strong> Choose a gradient type, then
        add and arrange color stops. Each stop has a color and position percentage. Adjust the angle for linear
        and conic gradients. Preview changes in real time and copy the generated CSS with one click.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'Can I use gradients in Tailwind CSS?',
      answer: 'Yes. Tailwind supports gradient utilities via bg-gradient-to-*, from-*, via-*, and to-* classes. Linear gradients translate directly: a 45deg gradient from #00C9FF to #92FE9D becomes bg-gradient-to-br from-[#00C9FF] to-[#92FE9D]. For radial and conic gradients, use arbitrary values or inline styles.',
    },
    {
      question: 'What is the difference between linear and radial gradients?',
      answer: 'Linear gradients transition colors along a straight line (controlled by angle or direction keywords like "to bottom right"). Radial gradients emanate from a central point outward in a circular or elliptical shape. Use linear for headers and banners, radial for spotlight effects or depth illusions.',
    },
    {
      question: 'How many color stops should I use?',
      answer: 'Two to four color stops is typical. Two creates a clean, modern transition. Three allows for more complex palettes. Beyond four stops can become visually busy. This generator supports up to 8 stops for advanced use cases.',
    },
    {
      question: 'Are conic gradients widely supported in browsers?',
      answer: 'Conic gradients are supported in all modern browsers including Chrome 69+, Firefox 83+, Safari 12.1+, and Edge 79+. They are safe to use for production web applications as of 2026.',
    },
    {
      question: 'How do I create a gradient that goes diagonally?',
      answer: 'Set the angle to 45deg (bottom-right diagonal) or 135deg (top-right diagonal). For linear gradients, each 45-degree increment changes the direction: 0 is bottom-to-top, 45 is bottom-left-to-top-right, 90 is left-to-right, 135 is top-left-to-bottom-right, 180 is top-to-bottom, etc.',
    },
  ]

  return (
    <ToolLayout
      title="CSS Gradient Generator"
      description="Create beautiful CSS gradients visually. Choose from linear, radial, and conic gradient types. Customize colors, positions, and angles with a live preview."
      toolSlug="css-gradient-generator"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Gradient type selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; type</span>
          {(['linear', 'radial', 'conic'] as GradientType[]).map(t => (
            <button
              key={t}
              onClick={() => setGradientType(t)}
              className={`px-2 py-1 text-[10px] md:text-xs font-mono rounded border transition-colors ${
                gradientType === t
                  ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]'
                  : 'bg-[#0A0A0A] border-[#333333] text-[#888888] hover:border-[#555555]'
              }`}
            >
              {t}
            </button>
          ))}
          <span className="text-[#555555] text-[10px] select-none">]</span>
        </div>

        {/* Angle slider (for linear and conic) */}
        {gradientType !== 'radial' && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#555555] select-none shrink-0">[&gt; angle</span>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={e => setAngle(Number(e.target.value))}
              className="flex-1 accent-[#00FF41] max-w-[200px]"
            />
            <span className="text-[10px] font-mono text-[#888888] w-10">{angle}°</span>
          </div>
        )}

        {/* Color stops */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; color stops</span>
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={e => updateStop(i, 'color', e.target.value)}
                className="w-8 h-8 rounded border border-[#333333] bg-transparent cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={stop.position}
                onChange={e => updateStop(i, 'position', Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
              />
              <span className="text-[10px] font-mono text-[#555555]">%</span>
              {stops.length > 2 && (
                <button onClick={() => removeStop(i)} className="text-[10px] font-mono text-red-400/60 hover:text-red-400">
                  [x]
                </button>
              )}
            </div>
          ))}
          {stops.length < 8 && (
            <button onClick={addStop} className="text-[10px] font-mono text-[#555555] hover:text-[#00FF41]/60 transition-colors">
              [&gt; add stop]
            </button>
          )}
        </div>

        {/* Live preview */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; preview</span>
          <div
            className="w-full h-40 md:h-56 rounded border border-[#333333]"
            style={{ background: css.replace('background: ', '').replace(';', '') }}
          />
        </div>

        {/* CSS Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; output.css</span>
            <button onClick={copyCss} className="terminal-btn text-[10px]">
              <span className="green-chevron">&gt;</span> Copy CSS
            </button>
          </div>
          <pre className="bg-[#0A0A0A] border border-[#00FF41]/20 text-[#F9F9F9] font-mono text-xs p-3 rounded overflow-x-auto">
            {css}
          </pre>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; presets</span>
          <div className="flex flex-wrap gap-2">
            {GRADIENT_PRESETS.map(p => {
              const bg = p.type === 'linear'
                ? `linear-gradient(${p.angle}deg, ${p.stops.map(s => s.color).join(', ')})`
                : p.type === 'radial'
                  ? `radial-gradient(circle, ${p.stops.map(s => s.color).join(', ')})`
                  : `conic-gradient(from ${p.angle}deg, ${p.stops.map(s => s.color).join(', ')})`
              return (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p)}
                  className="w-14 h-14 rounded border border-[#333333] hover:border-[#00FF41]/40 transition-colors"
                  style={{ background: bg }}
                  title={p.name}
                />
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
