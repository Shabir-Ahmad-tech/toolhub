'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

// ─── Color palette for child cells ───
const CELL_COLORS = [
  '#00FF41', '#FF4444', '#4488FF', '#FFAA00',
  '#FF44FF', '#44FFCC', '#FFFF44', '#FF8844',
  '#8844FF', '#44FF88', '#FF4488', '#44AAFF',
]

// ─── Dropdown options ───
const JUSTIFY_ITEMS = ['stretch', 'start', 'center', 'end']
const ALIGN_ITEMS = ['stretch', 'start', 'center', 'end']
const JUSTIFY_CONTENT = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly']
const ALIGN_CONTENT = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly']
const FLEX_JUSTIFY = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']
const FLEX_ALIGN = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline']

const DIRECTION_OPTIONS = ['row', 'column'] as const

// ─── FAQ ───
const cssGridFaq = [
  {
    question: 'What is the difference between CSS Grid and Flexbox?',
    answer: 'CSS Grid is a two-dimensional layout system designed for arranging items in both rows and columns simultaneously. Flexbox is a one-dimensional system that arranges items in either a row or a column. Use Grid for full page layouts and complex alignment in two axes. Use Flexbox for navigation bars, card rows, toolbars, and content that wraps naturally in a single direction.',
  },
  {
    question: 'What do justify-items and align-items do in CSS Grid?',
    answer: 'justify-items controls the horizontal (inline) alignment of all grid items within their cells — options include stretch, start, center, and end. align-items controls the vertical (block) alignment of items within cells. Setting these at the container level avoids repeating alignment rules on every child element.',
  },
  {
    question: 'What does justify-content do in a flex container?',
    answer: 'justify-content controls how extra space is distributed between flex items along the main axis. flex-start packs items at the start, center groups them in the middle, space-between places equal space between items, and space-evenly adds equal space around every item. For row direction, this is horizontal alignment; for column, it is vertical.',
  },
  {
    question: 'How does flex-wrap work and when should I use it?',
    answer: 'flex-wrap controls whether flex items stay on a single line or wrap onto multiple lines. The default (nowrap) keeps all items on one line, potentially shrinking them. When you enable wrap, items that overflow the container move to the next line, preserving their intrinsic size. Use wrap for responsive layouts where items should rearrange naturally at different screen widths.',
  },
  {
    question: 'Can I use this generated CSS in production?',
    answer: 'Yes. The generated CSS uses standard Grid and Flexbox properties that work in all modern browsers (Chrome 57+, Firefox 52+, Safari 10.1+, Edge 16+). No vendor prefixes are needed for the properties shown here in modern browsers. Copy the CSS and paste it directly into your stylesheet.',
  },
]

// ─── SEO Content ───
const cssGridSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">
      Visual CSS Grid & Flexbox Layout Generator
    </h2>
    <p>
      Building layouts with CSS Grid and Flexbox can be tedious when you are iterating on alignment, gaps, and responsiveness. This visual generator lets you adjust every property with live feedback — change column counts, toggle alignment values, or switch between grid and flexbox mode, and the preview updates instantly. Copy the generated CSS and drop it straight into your project. No signup, no server uploads, no distractions.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      Why a Visual Grid Generator?
    </h3>
    <p>
      CSS Grid properties like <code className="text-xs font-mono">justify-items</code>, <code className="text-xs font-mono">align-content</code>, and <code className="text-xs font-mono">grid-template-columns</code> each interact with each other. A single misaligned value can break a layout in ways that are hard to debug by reading code alone. By seeing the layout change as you adjust each property, you build an intuition for how Grid and Flexbox actually behave. This is especially useful for developers learning CSS layout or prototyping a component quickly.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      When to Reach for Grid vs. Flexbox
    </h3>
    <p>
      CSS Grid excels at two-dimensional layouts where you control both rows and columns — think dashboard grids, image galleries, card decks, and full-page layouts. Flexbox shines in one-dimensional arrangements like navigation bars, button groups, form rows, centered content, and anything that needs to wrap naturally. Many real-world pages use both: a Grid for the overall page structure and Flexbox for the components inside each grid cell. This tool helps you experiment with both systems side by side.
    </p>
  </div>
)

// ─── Utility: generate grid child styles ───
function getGridChildStyle(index: number, total: number) {
  const color = CELL_COLORS[index % CELL_COLORS.length]
  return {
    backgroundColor: color,
    opacity: 0.25,
    border: `1px solid ${color}`,
  }
}

function getFlexChildStyle(index: number, total: number) {
  const color = CELL_COLORS[index % CELL_COLORS.length]
  return {
    backgroundColor: color,
    opacity: 0.2,
    border: `1px solid ${color}`,
    minWidth: '48px',
    minHeight: '36px',
  }
}

// ─── Grid/Flex value display helpers ───
const displayValue = (v: string) => v === 'flex-start' || v === 'flex-end' ? v : v === 'space-between' || v === 'space-around' || v === 'space-evenly' ? v : v

// ─── Select component matching terminal theme ───
function TerminalSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-xs appearance-none cursor-pointer focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  )
}

// ─── Main Component ───
export default function CssGridGeneratorClient() {
  const [mode, setMode] = useState<'grid' | 'flexbox'>('grid')

  // Grid state
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(3)
  const [gridGap, setGridGap] = useState(8)
  const [justifyItems, setJustifyItems] = useState('stretch')
  const [alignItems, setAlignItems] = useState('stretch')
  const [justifyContent, setJustifyContent] = useState('start')
  const [alignContent, setAlignContent] = useState('start')

  // Flexbox state
  const [flexDirection, setFlexDirection] = useState<'row' | 'column'>('row')
  const [flexJustify, setFlexJustify] = useState('flex-start')
  const [flexAlign, setFlexAlign] = useState('stretch')
  const [flexWrap, setFlexWrap] = useState(false)
  const [flexGap, setFlexGap] = useState(8)
  const [itemCount, setItemCount] = useState(5)

  // Copy state
  const [copied, setCopied] = useState(false)

  // ─── Generate CSS ───
  const gridCss = `.container {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  gap: ${gridGap}px;
  justify-items: ${justifyItems};
  align-items: ${alignItems};
  justify-content: ${justifyContent};
  align-content: ${alignContent};
}`

  const flexWrapValue = flexWrap ? 'wrap' : 'nowrap'
  const flexboxCss = `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${flexJustify};
  align-items: ${flexAlign};
  flex-wrap: ${flexWrapValue};
  gap: ${flexGap}px;
}`

  const generatedCss = mode === 'grid' ? gridCss : flexboxCss

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCss)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Grid preview items ───
  const gridItems = Array.from({ length: columns * rows }, (_, i) => i)

  // ─── Flexbox preview items ───
  const flexItems = Array.from({ length: itemCount }, (_, i) => i)

  return (
    <ToolLayout
      title="CSS Grid & Flexbox Generator"
      description="Visual CSS Grid and Flexbox layout generator. Create responsive layouts with a visual interface and get instant CSS code."
      toolSlug="css-grid-generator"
      categorySlug="developer-tools"
      faq={cssGridFaq}
      seoContent={cssGridSeo}
    >
      <div className="space-y-5">

        {/* ─── Mode Toggle ─── */}
        <div className="flex items-center justify-center">
          <div className="inline-flex border border-[#333333] bg-[#000000]">
            <button
              onClick={() => setMode('grid')}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
                mode === 'grid'
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'text-[#666666] hover:text-[#F9F9F9]'
              }`}
            >
              CSS Grid
            </button>
            <button
              onClick={() => setMode('flexbox')}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
                mode === 'flexbox'
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'text-[#666666] hover:text-[#F9F9F9]'
              }`}
            >
              Flexbox
            </button>
          </div>
        </div>

        {/* ─── Controls ─── */}
        {mode === 'grid' ? (
          /* ─── Grid Controls ─── */
          <div className="border border-[#333333] bg-[#000000] p-4 space-y-4">
            {/* Columns / Rows / Gap */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={columns}
                  onChange={(e) => setColumns(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                  className="w-full px-2 py-1.5 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                  className="w-full px-2 py-1.5 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Gap: {gridGap}px</label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={gridGap}
                  onChange={(e) => setGridGap(Number(e.target.value))}
                  className="w-full h-1 appearance-none bg-[#333333] cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:bg-[#F9F9F9] [&::-webkit-slider-thumb]:rounded-none
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#F9F9F9] [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0"
                />
              </div>
            </div>

            {/* Alignment Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TerminalSelect
                label="justify-items"
                value={justifyItems}
                options={JUSTIFY_ITEMS}
                onChange={setJustifyItems}
              />
              <TerminalSelect
                label="align-items"
                value={alignItems}
                options={ALIGN_ITEMS}
                onChange={setAlignItems}
              />
              <TerminalSelect
                label="justify-content"
                value={justifyContent}
                options={JUSTIFY_CONTENT}
                onChange={setJustifyContent}
              />
              <TerminalSelect
                label="align-content"
                value={alignContent}
                options={ALIGN_CONTENT}
                onChange={setAlignContent}
              />
            </div>
          </div>
        ) : (
          /* ─── Flexbox Controls ─── */
          <div className="border border-[#333333] bg-[#000000] p-4 space-y-4">
            {/* Direction */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Direction</label>
                <div className="flex border border-[#333333]">
                  {DIRECTION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFlexDirection(d)}
                      className={`flex-1 px-2 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
                        flexDirection === d
                          ? 'bg-[#F9F9F9] text-[#000000]'
                          : 'text-[#666666] hover:text-[#F9F9F9] bg-[#000000]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gap */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Gap: {flexGap}px</label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={flexGap}
                  onChange={(e) => setFlexGap(Number(e.target.value))}
                  className="w-full h-1 appearance-none bg-[#333333] cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:bg-[#F9F9F9] [&::-webkit-slider-thumb]:rounded-none
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#F9F9F9] [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0"
                />
              </div>

              {/* Items Count */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Items: {itemCount}</label>
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  className="w-full h-1 appearance-none bg-[#333333] cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:bg-[#F9F9F9] [&::-webkit-slider-thumb]:rounded-none
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#F9F9F9] [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0"
                />
              </div>
            </div>

            {/* Flex Alignment Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <TerminalSelect
                label="justify-content"
                value={flexJustify}
                options={FLEX_JUSTIFY}
                onChange={setFlexJustify}
              />
              <TerminalSelect
                label="align-items"
                value={flexAlign}
                options={FLEX_ALIGN}
                onChange={setFlexAlign}
              />
            </div>

            {/* Flex Wrap Toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setFlexWrap(!flexWrap)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border transition-none ${
                  flexWrap
                    ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                    : 'bg-[#000000] text-[#666666] border-[#333333] hover:text-[#F9F9F9]'
                }`}
              >
                [<span className="green-chevron">{flexWrap ? 'x' : ' '}</span>] flex-wrap: {flexWrapValue}
              </button>
            </div>
          </div>
        )}

        {/* ─── Preview Area ─── */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">Preview</span>
            <span className="text-[10px] font-mono text-[#555555]">{mode === 'grid' ? `${columns} × ${rows}` : `${itemCount} items`}</span>
          </div>

          {mode === 'grid' ? (
            <div
              className="border border-[#333333]"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: `${gridGap}px`,
                justifyItems,
                alignItems,
                justifyContent,
                alignContent,
                minHeight: '280px',
                backgroundColor: '#0a0a0a',
                padding: '2px',
              }}
            >
              {gridItems.map((i) => {
                const s = getGridChildStyle(i, gridItems.length)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center font-mono text-xs select-none"
                    style={{
                      backgroundColor: s.backgroundColor,
                      opacity: s.opacity,
                      border: s.border,
                      padding: '4px',
                      color: '#000000',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="border border-[#333333] min-h-[200px]"
              style={{
                display: 'flex',
                flexDirection,
                justifyContent: flexJustify,
                alignItems: flexAlign,
                flexWrap: flexWrapValue as 'wrap' | 'nowrap',
                gap: `${flexGap}px`,
                backgroundColor: '#0a0a0a',
                padding: '8px',
                minHeight: flexDirection === 'column' ? '280px' : '160px',
              }}
            >
              {flexItems.map((i) => {
                const s = getFlexChildStyle(i, flexItems.length)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center font-mono text-xs select-none"
                    style={{
                      backgroundColor: s.backgroundColor,
                      opacity: s.opacity,
                      border: s.border,
                      padding: '8px 12px',
                      color: '#000000',
                      fontWeight: 700,
                      flex: flexWrap === false ? '0 0 auto' : undefined,
                    }}
                  >
                    {i + 1}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── CSS Output ─── */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">
              Generated CSS
            </label>
            <button
              onClick={handleCopy}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY CSS'}]
            </button>
          </div>
          <pre
            className="w-full p-4 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre select-text"
          >
            {generatedCss}
          </pre>
        </div>

      </div>
    </ToolLayout>
  )
}
