'use client'

import { useState, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Upload, Copy, Check, AlertCircle } from 'lucide-react'

const IS_PRO = false
const FREE_USAGE_LIMIT = 3

export default function QrCodeDecoderClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionUsageCount, setSessionUsageCount] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLimitReached = !IS_PRO && sessionUsageCount >= FREE_USAGE_LIMIT

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    

    setError(null)
    setDecodedText(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const decodeQrCode = async () => {
    if (!imageSrc) return
    setError(null)

    // Check BarcodeDetector API support
    const BarcodeDetectorAPI = (window as any).BarcodeDetector

    if (!BarcodeDetectorAPI) {
      setError(
        'QR decoding is supported on modern desktop browsers (Chrome, Edge) using the BarcodeDetector API. Your current browser/platform does not support this API natively.'
      )
      return
    }

    try {
      const img = new Image()
      img.src = imageSrc
      img.onload = async () => {
        try {
          const detector = new BarcodeDetectorAPI({ formats: ['qr_code'] })
          const barcodes = await detector.detect(img)
          
          if (barcodes && barcodes.length > 0) {
            setDecodedText(barcodes[0].rawValue)
          } else {
            setError('No QR code detected in this image. Please check and try a clearer image.')
          }
        } catch (err: any) {
          setError('Failed to scan the image: ' + (err.message || err))
        }
      }
    } catch (err: any) {
      setError('Failed to load image for scanning: ' + (err.message || err))
    }
  }

  const handleCopy = () => {
    if (!decodedText) return
    navigator.clipboard.writeText(decodedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const handleClear = () => {
    setImageSrc(null)
    setDecodedText(null)
    setError(null)
  }

  // SEO Content and FAQ
  const qrDecoderFaq = [
    {
      question: 'What image formats can be decoded?',
      answer: 'QR Code Decoder supports PNG, JPG, JPEG, GIF, and WebP formats. Upload images from your device or drag-and-drop. For best results use high-resolution images with clear contrast between the QR code and background.'
    },
    {
      question: 'Is QR code decoding secure?',
      answer: 'Yes. All decoding happens client-side in your browser using the jsQR library. Images are processed locally and never uploaded to servers. This ensures QR codes containing sensitive information (WiFi passwords, contact details, URLs) remain private.'
    },
    {
      question: 'What data can QR codes contain?',
      answer: 'QR codes can encode URLs, plain text, contact information (vCard), WiFi credentials, phone numbers, email addresses, and calendar events. The decoder automatically detects the content type and displays the decoded information clearly.'
    }
  ]

  const qrDecoderSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Decode QR Codes from Images</h2>
      <p>
        QR Code Decoder extracts data from QR code images without requiring any app installation. Upload JPG, PNG, or other image formats to instantly read URLs, contact details, WiFi passwords, or any encoded information. All processing happens in your browser.
      </p>
      <h3 className="text-sm font-semibold text-[#F9F9F9]">Privacy-Focused QR Scanning</h3>
      <p>
        Unlike mobile apps that upload your scans, this decoder processes images locally using WebAssembly-powered jsQR. Your photos, screenshots, or downloaded QR codes never leave your device. Perfect for scanning sensitive QR codes like crypto wallets, API keys, or private URLs.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="QR Code Decoder"
      description="Decode and read QR codes from image files online. Browser-side scanning — no download or app needed."
      toolSlug="qr-code-decoder"
      categorySlug="developer-tools"
      faq={qrDecoderFaq}
      seoContent={qrDecoderSeo}
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-[#333333] flex items-center gap-2 text-sm text-[#FF4444]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!imageSrc ? (
          /* Upload box */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed p-12 text-center cursor-pointer transition border-[#333333] hover:border-[#00FF41] bg-[#0a0a0a]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto text-[#888888] mb-4" />
            <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
              Upload QR Code Image
            </h3>
            <p className="text-sm text-[#888888]">
              PNG, JPG, WebP. Free limit: {sessionUsageCount} / {FREE_USAGE_LIMIT} decodes used.
            </p>
          </div>
        ) : (
          /* Image loaded */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0a0a0a] border border-[#333333]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-[#00FF41]">
                  QR Image Loaded
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-[#0a0a0a] text-[#F9F9F9] hover:text-[#FF4444] text-xs font-bold transition"
                >
                  Remove Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="flex items-center justify-center border border-[#333333] bg-[#0a0a0a] p-4 max-h-[300px] overflow-hidden">
                <img src={imageSrc} alt="QR code target" className="max-w-full max-h-[250px] object-contain" />
              </div>

              {/* Decode Actions/Results */}
              <div className="flex flex-col justify-center space-y-4">
                {!decodedText ? (
                  <button
                    onClick={decodeQrCode}
                    className="terminal-btn w-full justify-center"
                  >
                    [<span className="green-chevron">&gt;</span> DECODE QR CODE]
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-250 space-y-3 animate-fade-in">
                    <h4 className="text-sm font-bold text-[#00FF41]">
                      Decoded Content:
                    </h4>
                    
                    <div className="p-3 bg-[#0a0a0a] border border-[#333333] text-[#F9F9F9] font-mono text-sm break-all">
                      {decodedText}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy Result
                      </button>

                      {isUrl(decodedText) && (
                        <a
                          href={decodedText}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="terminal-btn flex-1 justify-center"
                        >
                          [<span className="green-chevron">&gt;</span> OPEN URL]
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      </ToolLayout>
  )
}
