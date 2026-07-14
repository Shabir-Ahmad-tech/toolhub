'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'

interface ShadowLayer {
  inset: boolean
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
}

const DEFAULT_LAYER: ShadowLayer = {
  inset: false,
  offsetX: 4,
  offsetY: 4,
  blur: 12,
  spread: 0,
  color: '#00000040',
}

const PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  {
    name: 'Soft Float',
    layers: [
      { inset: false, offsetX: 0, offsetY: 10, blur: 30, spread: 0, color: '#0000001a' },
      { inset: false, offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#0000000d' },
    ],
  },
  {
    name: 'Neon Glow',
    layers: [
      { inset: false, offsetX: 0, offsetY: 0, blur: 10, spread: 0, color: '#00FF41' },
      { inset: false, offsetX: 0, offsetY: 0, blur: 40, spread: 0, color: '#00FF4166' },
    ],
  },
  {
    name: 'Sharp Edge',
    layers: [
      { inset: false, offsetX: 8, offsetY: 8, blur: 0, spread: 0, color: '#00000033' },
    ],
  },
  {
    name: 'Inset Pressed',
    layers: [
      { inset: true, offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#00000033' },
    ],
  },
  {
    name: 'Long Shadow',
    layers: [
      { inset: false, offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: '#00000033' },
      { inset: false, offsetX: 0, offsetY: 2, blur: 6, spread: 0, color: '#00000026' },
      { inset: false, offsetX: 0, offsetY: 6, blur: 18, spread: 0, color: '#0000001a' },
      { inset: false, offsetX: 0, offsetY: 12, blur: 36, spread: 0, color: '#0000000d' },
    ],
  },
  {
    name: 'Double Glow',
    layers: [
      { inset: false, offsetX: 0, offsetY: 0, blur: 10, spread: 2, color: '#FF007F' },
      { inset: false, offsetX: 0, offsetY: 0, blur: 30, spread: 4, color: '#00F0FF66' },
    ],
  },
]

export default function CssBoxShadowGenerator() {
  const { toast } = useToast()
  const [layers, setLayers] = useState<ShadowLayer[]>([{ ...DEFAULT_LAYER }])

  const css = useMemo(() => {
    if (layers.length === 0) return '/* No shadow layers */'
    return layers
      .map(l => {
        const parts = [
          l.inset ? 'inset' : '',
          `${l.offsetX}px`,
          `${l.offsetY}px`,
          `${l.blur}px`,
          `${l.spread}px`,
          l.color,
        ].filter(Boolean)
        return parts.join(' ')
      })
      .join(',\n  ')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers])

  const boxCss = useMemo(() => {
    if (layers.length === 0) return ''
    return `box-shadow: ${css.replace(/\n  /g, '\n  ')};`
  }, [css])

  const copyShadow = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(boxCss)
      toast('CSS copied!', 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = boxCss
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast('CSS copied!', 'success')
    }
  }, [boxCss, toast])

  const updateLayer = (index: number, field: keyof ShadowLayer, value: boolean | number | string) => {
    setLayers(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  const addLayer = () => {
    setLayers(prev => [...prev, { ...DEFAULT_LAYER }])
  }

  const removeLayer = (index: number) => {
    if (layers.length <= 1) return
    setLayers(prev => prev.filter((_, i) => i !== index))
  }

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setLayers(preset.layers.map(l => ({ ...l })))
  }

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What is a CSS Box Shadow Generator?</strong> A CSS box shadow
        generator helps you create shadow effects for HTML elements visually. Box shadows add depth, emphasis,
        and visual hierarchy to web designs — from subtle elevation cues to dramatic glow effects.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Understanding shadow properties.</strong> <strong>Offset X/Y</strong>
        controls the shadow&apos;s position relative to the element. <strong>Blur</strong> softens the shadow
        edge — higher values create softer shadows. <strong>Spread</strong> expands or contracts the shadow size.
        <strong>Color</strong> sets the shadow color (use transparency for realistic shadows).
        <strong>Inset</strong> places the shadow inside the element for pressed or recessed effects.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Multiple shadow layers.</strong> Realistic shadows often use multiple
        layers at different offsets and blurs. This is called &quot;layered shadows.&quot; For example, a
        floating card effect uses a small offset shadow for the near edge and a larger, more blurred shadow for
        the distant edge. Try the &quot;Long Shadow&quot; preset to see layered shadows in action.
      </p>
      <p>
        Experiment with the controls to create your perfect shadow. Preview changes in real time on the demo
        box, then copy the generated CSS for use in your projects.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'How do I create a realistic shadow?',
      answer: 'Use semi-transparent colors (hex with alpha like #00000033 or rgba(0,0,0,0.2)) rather than solid colors. Layer multiple shadows: a small offset with low blur for the close shadow and larger offset with more blur for the distant shadow. The "Long Shadow" preset demonstrates this technique.',
    },
    {
      question: 'What is the difference between box-shadow and drop-shadow?',
      answer: 'box-shadow creates a rectangular shadow around the element box, while filter: drop-shadow() creates a shadow that follows the element\'s actual shape, including transparency. For irregular shapes (PNGs with transparency, clipped elements), use drop-shadow. For UI cards and buttons, use box-shadow.',
    },
    {
      question: 'Are multiple box shadows supported in all browsers?',
      answer: 'Yes, multiple box shadows are supported in all modern browsers. CSS3 box-shadow has been supported since Chrome 10+, Firefox 4+, Safari 5.1+, and IE 9+. Multiple shadows are created by separating each shadow definition with a comma.',
    },
    {
      question: 'What does the inset keyword do?',
      answer: 'Inset draws the shadow inside the element, creating a recessed or pressed-in effect. This is commonly used for pressed buttons, inset text fields, or to create inner borders. Without inset, shadows appear outside the element and create raised or floating effects.',
    },
    {
      question: 'How do I create a glow effect?',
      answer: 'Set offset X and Y to 0, then use a bright color with some blur. For a neon glow, use multiple layers: one with small blur and full opacity color, another with larger blur and the same color at 30-50% opacity. The "Neon Glow" preset demonstrates this effect.',
    },
  ]

  return (
    <ToolLayout
      title="CSS Box Shadow Generator"
      description="Create custom CSS box shadows visually. Configure offset, blur, spread, color, and inset for multiple shadow layers. Live preview and one-click CSS copy."
      toolSlug="css-box-shadow-generator"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Presets */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; presets</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => loadPreset(p)}
                className="terminal-btn text-[10px]"
              >
                <span className="green-chevron">&gt;</span> {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Shadow layers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; layers ({layers.length})</span>
            <button onClick={addLayer} className="text-[10px] font-mono text-[#555555] hover:text-[#00FF41]/60 transition-colors">
              [&gt; add layer]
            </button>
          </div>
          {layers.map((layer, i) => (
            <div key={i} className="border border-[#333333] rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#888888]">Layer {i + 1}</span>
                {layers.length > 1 && (
                  <button onClick={() => removeLayer(i)} className="text-[10px] font-mono text-red-400/60 hover:text-red-400">
                    [remove]
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-[#555555]">Offset X</span>
                  <input
                    type="number"
                    value={layer.offsetX}
                    onChange={e => updateLayer(i, 'offsetX', Number(e.target.value))}
                    className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-[#555555]">Offset Y</span>
                  <input
                    type="number"
                    value={layer.offsetY}
                    onChange={e => updateLayer(i, 'offsetY', Number(e.target.value))}
                    className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-[#555555]">Blur</span>
                  <input
                    type="number"
                    min="0"
                    value={layer.blur}
                    onChange={e => updateLayer(i, 'blur', Number(e.target.value))}
                    className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-[#555555]">Spread</span>
                  <input
                    type="number"
                    value={layer.spread}
                    onChange={e => updateLayer(i, 'spread', Number(e.target.value))}
                    className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layer.inset}
                    onChange={e => updateLayer(i, 'inset', e.target.checked)}
                    className="accent-[#00FF41]"
                  />
                  <span className="text-[10px] font-mono text-[#555555]">inset</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#555555]">Color</span>
                  <input
                    type="color"
                    value={layer.color.length > 7 ? `#${layer.color.slice(1, 7).toLowerCase()}` : layer.color}
                    onChange={e => {
                      const hex = e.target.value
                      const alpha = layer.color.length > 7 ? layer.color.slice(7) : 'ff'
                      updateLayer(i, 'color', hex + alpha)
                    }}
                    className="w-7 h-7 rounded border border-[#333333] bg-transparent cursor-pointer"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-[10px] font-mono text-[#555555] mr-1">Hex</span>
                  <input
                    type="text"
                    value={layer.color}
                    onChange={e => updateLayer(i, 'color', e.target.value)}
                    className="w-24 bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#00FF41]/50"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; preview</span>
          <div className="w-full min-h-[180px] bg-[#0A0A0A] border border-[#333333] rounded flex items-center justify-center p-4">
            <div
              className="w-32 h-32 md:w-40 md:h-40 bg-[#1a1a2e] rounded-lg transition-shadow duration-200"
              style={{ boxShadow: css }}
            />
          </div>
        </div>

        {/* CSS Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; output.css</span>
            <button onClick={copyShadow} className="terminal-btn text-[10px]">
              <span className="green-chevron">&gt;</span> Copy CSS
            </button>
          </div>
          <pre className="bg-[#0A0A0A] border border-[#00FF41]/20 text-[#F9F9F9] font-mono text-xs p-3 rounded overflow-x-auto">
            {boxCss || '/* Adjust controls to generate a box-shadow */'}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
