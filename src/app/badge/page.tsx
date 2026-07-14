'use client'

import { useState } from 'react'

export default function BadgePage() {
  const badgeHtml = `<a href="https://krumb.dev" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 20px; background: #000000; border: 1px solid #333333; text-decoration: none; font-family: 'Courier New', monospace;">
  <span style="color: #00FF41; font-size: 16px; font-weight: bold;">&gt;</span>
  <div style="display: flex; flex-direction: column;">
    <span style="color: #F9F9F9; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">KRUMB.DEV</span>
    <span style="color: #888888; font-size: 10px; letter-spacing: 0.3px;">Free Developer Tools</span>
  </div>
</a>`

  const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="48" viewBox="0 0 180 48">
  <rect width="180" height="48" fill="#000000" stroke="#333333" stroke-width="1"/>
  <text x="20" y="23" fill="#00FF41" font-family="monospace" font-size="14" font-weight="bold">&gt;</text>
  <text x="36" y="22" fill="#F9F9F9" font-family="monospace" font-size="12" font-weight="bold">KRUMB.DEV</text>
  <text x="36" y="37" fill="#888888" font-family="monospace" font-size="9">Free Developer Tools</text>
</svg>`

  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 space-y-10 max-w-3xl">
        <div className="space-y-4 border-b border-[#333333] pb-6">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F9F9F9] leading-none tracking-tight">
            <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> BADGE / SHARE
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
            <span className="text-[#555555]">#</span> Embed a &quot;Powered by KRUMB.DEV&quot; badge on your site. Helps others discover these free tools.
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#F9F9F9] uppercase tracking-wider">Preview</h2>
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-[#000000] border border-[#333333]">
            <span className="text-[#00FF41] text-base font-bold">&gt;</span>
            <div className="flex flex-col">
              <span className="text-[#F9F9F9] text-sm font-bold tracking-wide">KRUMB.DEV</span>
              <span className="text-[#888888] text-[10px] tracking-wide">Free Developer Tools</span>
            </div>
          </div>
        </div>

        {/* HTML embed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-heading font-bold text-[#F9F9F9] uppercase tracking-wider">HTML Snippet</h2>
            <CopyButton text={badgeHtml} label="COPY HTML" />
          </div>
          <pre className="border border-[#333333] bg-[#000000] text-[#00FF41] p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
            <code>{badgeHtml}</code>
          </pre>
        </div>

        {/* SVG embed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-heading font-bold text-[#F9F9F9] uppercase tracking-wider">SVG Image Badge</h2>
            <CopyButton text={badgeSvg} label="COPY SVG" />
          </div>
          <pre className="border border-[#333333] bg-[#000000] text-[#00FF41] p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
            <code>{badgeSvg}</code>
          </pre>
        </div>

        {/* Usage */}
        <div className="border-t border-[#333333] pt-6 space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#F9F9F9] uppercase tracking-wider">Usage</h2>
          <p className="text-xs font-mono text-[#888888] leading-relaxed">
            Copy the HTML snippet and paste it anywhere in your site&apos;s HTML. The badge links to krumb.dev and opens in a new tab. No tracking, no JavaScript, no external requests.
          </p>
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button onClick={copy} className="terminal-btn">
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : label}]
    </button>
  )
}
