'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

const urlFaq = [
  {
    question: 'What is URL encoding and why is it needed?',
    answer: 'URL encoding converts special characters (spaces, ampersands, unicode) into a percent-encoded format (%20, %26, etc.) that is safe for HTTP requests. Without encoding, URLs with special characters can break or be misinterpreted by servers.'
  },
  {
    question: 'How does URL decoding work?',
    answer: 'URL decoding reverses the encoding process, converting percent-encoded characters back to their original form. This is useful for reading encoded URLs, debugging API responses, or analyzing URL parameters.'
  },
  {
    question: 'Is my URL data secure when encoding?',
    answer: 'Yes. All URL encoding and decoding happens client-side in your browser. No URLs are uploaded to servers, and no data leaves your device during the conversion process.'
  }
]

const urlSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">URL Encoding for API Requests and Web Development</h2>
    <p className="text-[#888888] font-mono">
      URL encoding ensures special characters are transmitted correctly in HTTP requests. This tool handles both encoding and decoding, supporting query parameters, form data, and full URLs. Whether debugging API endpoints or preparing URLs for curl requests, process everything locally without server uploads.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Encoding Patterns</h3>
    <p className="text-[#888888] font-mono">
      Spaces become %20, ampersands become %26, and unicode characters get encoded as percent triplets. Use this when constructing REST API URLs, embedding query strings, or working with form-encoded request bodies. Decoding reversed URLs helps inspect what servers actually received.
    </p>
  </div>
)

export default function UrlEncoderPage() {
  const [input, setInput] = useState<string>('https://example.com/?name=John Doe & age=30')
  const [output, setOutput] = useState<string>('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(decodeURIComponent(input))
      }
    } catch {
      setOutput('Error: Invalid input')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = output
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <ToolLayout title="URL Encoder/Decoder" description="Encode and decode URLs online. Convert special characters to URL-safe format and back." toolSlug="url-encoder" categorySlug="developer-tools" faq={urlFaq} seoContent={urlSeo}>
      <div className="space-y-6 font-mono">
        {/* Mode Toggle — terminal style */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('encode')}
            className={`terminal-btn ${mode === 'encode' ? 'text-[#00FF41]' : ''}`}
          >
            {mode === 'encode' ? (
              <>[<span className="green-chevron">&gt;</span> Encode]</>
            ) : (
              <>[Encode]</>
            )}
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`terminal-btn ${mode === 'decode' ? 'text-[#00FF41]' : ''}`}
          >
            {mode === 'decode' ? (
              <>[<span className="green-chevron">&gt;</span> Decode]</>
            ) : (
              <>[Decode]</>
            )}
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-2 focus:border-[#00FF41] transition-none resize-y"
          />
        </div>

        {/* Convert Button — terminal style */}
        <button
          onClick={handleConvert}
          className="terminal-btn"
        >
          [<span className="green-chevron">&gt;</span> {mode === 'encode' ? 'Encode URL' : 'Decode URL'}]
        </button>

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">Result</label>
              <button
                onClick={copyToClipboard}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              rows={4}
              className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#00FF41] font-mono text-sm outline-none resize-none"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
