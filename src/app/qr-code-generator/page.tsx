'use client'

import { useState, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

const qrFaq = [
  {
    question: 'What data can QR codes contain?',
    answer: 'QR codes can encode URLs, plain text, contact information (vCard), WiFi credentials (SSID/password), phone numbers, email addresses, calendar events, and more. They support up to approximately 4,000 characters depending on the data type.'
  },
  {
    question: 'How do I scan the generated QR codes?',
    answer: 'Use your phone\'s camera app (iOS/Android), a dedicated QR scanner app, or web-based scanner. Most smartphone cameras now detect QR codes automatically when pointed at the screen or printed code. Simply open your camera and point it at the QR code.'
  },
  {
    question: 'Are QR codes secure for sensitive data?',
    answer: 'QR codes contain data in plain text - anyone who scans them can read the content. Do not encode passwords, credit card numbers, or private keys. For WiFi sharing, note that network passwords are visible in the QR code to anyone who scans it.'
  }
]

const qrSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Generate QR Codes for URLs, Text, and Contact Info</h2>
    <p className="text-[#888888] font-mono">
      QR Code Generator creates scannable codes from URLs, text, or contact details. Download high-resolution PNG files with white or transparent backgrounds. Ideal for sharing links, Wi-Fi credentials, business cards, and event information.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">QR Code Size Guide</h3>
    <p className="text-[#888888] font-mono">
      Larger QR codes scan more reliably at greater distances. Use 300x300px for digital sharing, 500px+ for printing. Higher error correction allows up to 30% damage while remaining readable.
    </p>
  </div>
)

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState<string>('https://toolhub.com')
  const [size, setSize] = useState<number>(300)
  const [generated, setGenerated] = useState<boolean>(false)
  const [transparentBg, setTransparentBg] = useState<boolean>(false)
  const [downloading, setDownloading] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const qrUrl = generated && text.trim()
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text.trim())}`
    : ''

  const handleGenerate = () => {
    if (text.trim()) setGenerated(true)
  }

  const handleDownload = async () => {
    if (!generated || !text.trim()) return
    setDownloading(true)
    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = qrUrl })
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')!
      if (transparentBg) {
        ctx.drawImage(img, 0, 0, size, size)
        const imageData = ctx.getImageData(0, 0, size, size)
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i] > 200 && imageData.data[i + 1] > 200 && imageData.data[i + 2] > 200)
            imageData.data[i + 3] = 0
        }
        ctx.putImageData(imageData, 0, 0)
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
      }
      canvas.toBlob((blob) => {
        const url = blob ? URL.createObjectURL(blob) : qrUrl
        const a = document.createElement('a')
        a.href = url; a.download = `qrcode-${size}x${size}${transparentBg ? '-transparent' : ''}.png`
        a.click()
        if (blob) URL.revokeObjectURL(url)
        setDownloading(false)
      }, 'image/png')
    } catch {
      const a = document.createElement('a')
      a.href = qrUrl; a.download = `qrcode-${size}x${size}.png`
      a.click()
      setDownloading(false)
    }
  }

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes for free. Enter any URL or text, choose background style, and download a high-quality PNG."
      toolSlug="qr-code-generator"
      categorySlug="developer-tools"
      faq={qrFaq}
      seoContent={qrSeo}
    >
      <div className="space-y-6 font-mono">
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Text or URL to Encode</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-2 focus:border-[#00FF41] transition-none"
            placeholder="Enter text or URL..."
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">QR Code Size</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none"
            >
              <option value={100}>100 x 100</option>
              <option value={200}>200 x 200</option>
              <option value={300}>300 x 300</option>
              <option value={400}>400 x 400</option>
              <option value={500}>500 x 500</option>
              <option value={800}>800 x 800</option>
              <option value={1000}>1000 x 1000</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Background</label>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setTransparentBg(false)}
                className={`terminal-btn ${!transparentBg ? 'text-[#00FF41]' : ''}`}
              >
                {!transparentBg ? (
                  <>[<span className="green-chevron">&gt;</span> White]</>
                ) : (
                  <>[White]</>
                )}
              </button>
              <button
                onClick={() => setTransparentBg(true)}
                className={`terminal-btn ${transparentBg ? 'text-[#00FF41]' : ''}`}
              >
                {transparentBg ? (
                  <>[<span className="green-chevron">&gt;</span> Transparent]</>
                ) : (
                  <>[Transparent]</>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="terminal-btn"
        >
          [<span className="green-chevron">&gt;</span> Generate QR Code]
        </button>

        {generated && text.trim() && (
          <div className="mt-6 space-y-4">
            <div className="text-center border border-[#333333] p-6">
              <p className="text-xs font-mono text-[#888888] mb-4">Your QR Code ({transparentBg ? 'Transparent' : 'White'} Background)</p>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className={`inline-block p-2 ${transparentBg ? 'bg-[#000000]' : ''}`}>
                <img src={qrUrl} alt={`QR Code for ${text}`} className="mx-auto" width={size} height={size} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> {downloading ? 'Processing...' : 'Download PNG'}]
                </button>
              </div>
            </div>

            <div className="border border-[#333333] p-4">
              <p className="text-[10px] font-mono text-[#888888] mb-1 uppercase">Encoded Text</p>
              <p className="text-xs font-mono text-[#F9F9F9] break-all">{text}</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
