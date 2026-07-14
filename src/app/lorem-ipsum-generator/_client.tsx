'use client'

import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'
import { loremIpsum } from 'lorem-ipsum'

type Unit = 'paragraphs' | 'sentences' | 'words'
type Format = 'plain' | 'html'

export default function LoremIpsumGenerator() {
  const { toast } = useToast()
  const [count, setCount] = useState(3)
  const [unit, setUnit] = useState<Unit>('paragraphs')
  const [format, setFormat] = useState<Format>('plain')
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [output, setOutput] = useState('')

  const generate = useCallback(() => {
    const result = loremIpsum({
      count,
      units: unit,
      format,
      suffix: unit === 'paragraphs' ? '\n\n' : ' ',
    })
    setOutput(startWithLorem ? result : result.replace(/^Lorem ipsum dolor sit amet/i, '').trim())
  }, [count, unit, format, startWithLorem])

  const copyOutput = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      toast('Copied!', 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = output
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast('Copied!', 'success')
    }
  }, [output, toast])

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What is Lorem Ipsum?</strong> Lorem ipsum is placeholder text
        commonly used in publishing, graphic design, and web development to demonstrate the visual form of a
        document or typeface without relying on meaningful content. It has been the industry standard since the
        1500s.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Why use a Lorem Ipsum Generator?</strong> Developers and designers
        need placeholder text for wireframes, mockups, and development layouts. This generator lets you specify
        the exact amount of text (paragraphs, sentences, or words), choose between plain text and HTML format,
        and optionally start with the classic &quot;Lorem ipsum dolor sit amet&quot; opening.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">How to use.</strong> Select the unit type (paragraphs, sentences, or
        words), set the quantity, choose your format, and click Generate. The text appears instantly and can be
        copied with one click for use in your designs, templates, or development projects.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'Where does Lorem Ipsum come from?',
      answer: 'Lorem Ipsum comes from a Latin text written by Cicero in 45 BC. The standard passage used today is derived from sections 1.10.32–33 of "De Finibus Bonorum et Malorum" (The Extremes of Good and Evil). It was scrambled to create nonsensical placeholder text, likely by a 16th-century typesetter.',
    },
    {
      question: 'Should I use Lorem Ipsum or real content in my designs?',
      answer: 'Use Lorem Ipsum for wireframes and early-stage layouts where content has not been written yet. Switch to real content before finalizing user interfaces, as real content often has different length and rhythm that affects layout. For content-heavy sites, design with representative content lengths from the start.',
    },
    {
      question: 'What is the difference between plain text and HTML format?',
      answer: 'Plain text outputs raw text separated by double newlines between paragraphs. HTML format wraps each paragraph in &lt;p&gt; tags, making it ready for direct use in web pages without additional formatting.',
    },
    {
      question: 'Can I generate text without the "Lorem ipsum" opening?',
      answer: 'Yes. Toggle off "Start with Lorem ipsum" to generate text that begins with a random sentence instead of the classic opening. This is useful when you need placeholder text that does not look like the standard Lorem Ipsum passage.',
    },
    {
      question: 'How much text can I generate at once?',
      answer: 'You can generate up to 100 paragraphs, 500 sentences, or 1000 words in a single request. For larger amounts, generate multiple times and combine the results. All processing happens client-side with no server limits.',
    },
  ]

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs and layouts. Free online Lorem Ipsum generator with options for paragraphs, sentences, and words. HTML and plain text output."
      toolSlug="lorem-ipsum-generator"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Count */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; quantity</span>
            <input
              type="number"
              min="1"
              max={unit === 'paragraphs' ? 100 : unit === 'sentences' ? 500 : 1000}
              value={count}
              onChange={e => setCount(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
            />
            <span className="text-[#555555] text-[10px] select-none">]</span>
          </div>

          {/* Unit */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; unit</span>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value as Unit)}
              className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
            <span className="text-[#555555] text-[10px] select-none">]</span>
          </div>

          {/* Format */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; format</span>
            <select
              value={format}
              onChange={e => setFormat(e.target.value as Format)}
              className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
            >
              <option value="plain">Plain Text</option>
              <option value="html">HTML</option>
            </select>
            <span className="text-[#555555] text-[10px] select-none">]</span>
          </div>

          {/* Start with Lorem */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] font-mono text-[#555555] select-none">[</span>
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={e => setStartWithLorem(e.target.checked)}
              className="accent-[#00FF41]"
            />
            <span className="text-[10px] font-mono text-[#555555] select-none">Lorem ipsum]</span>
          </label>
        </div>

        {/* Generate button */}
        <div className="flex gap-2">
          <button onClick={generate} className="terminal-btn text-[11px]">
            <span className="green-chevron">&gt;</span> Generate
          </button>
          <button
            onClick={copyOutput}
            disabled={!output}
            className="terminal-btn text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="green-chevron">&gt;</span> Copy
          </button>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; output</span>
          <pre className="bg-[#0A0A0A] border border-[#00FF41]/20 text-[#F9F9F9] font-mono text-xs p-3 rounded overflow-x-auto whitespace-pre-wrap min-h-[6rem] max-h-96 overflow-y-auto">
            {output || <span className="text-[#555555]">Click Generate to create placeholder text...</span>}
          </pre>
          {output && (
            <p className="text-[9px] font-mono text-[#555555]">
              {output.split(/\s+/).length} words | {output.length} characters
            </p>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
