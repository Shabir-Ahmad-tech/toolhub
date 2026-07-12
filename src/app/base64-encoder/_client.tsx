'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  AlertTriangle,
  Download
} from 'lucide-react'

const base64Faq = [
  {
    question: 'What is Base64 encoding used for?',
    answer: 'Base64 encodes binary data into ASCII characters. It is commonly used for embedding images in CSS/HTML, transmitting binary files via HTTP, and encoding JWT tokens. The encoding increases data size by approximately 33%, making it inefficient for large files.'
  },
  {
    question: 'Is my file data secure when encoding?',
    answer: 'Yes. All encoding happens client-side in your browser. No files are uploaded to servers, and no data leaves your device. This makes it safe for encoding sensitive documents, private images, or confidential text.'
  },
  {
    question: 'Can I encode any file type?',
    answer: 'Most file types work: images (PNG, JPG), PDFs, text files, and more. The tool shows a preview for images and you can download the encoded output. All file sizes are supported with no limits.'
  },
  {
    question: 'What is the difference between Base64 and Base64URL?',
    answer: 'Standard Base64 uses <code>+</code> and <code>/</code> as the 63rd and 64th characters, which are not URL-safe. Base64URL replaces them with <code>-</code> and <code>_</code> respectively, and omits padding (<code>=</code>). JWT parts use Base64URL encoding.'
  },
  {
    question: 'Why does Base64 increase the data size by about 33%?',
    answer: 'Base64 maps every 3 bytes (24 bits) of input into 4 ASCII characters (6 bits each = 24 bits). For every 3 input bytes, you get 4 output characters. If input bytes are not divisible by 3, <code>=</code> padding is added. The overhead ratio is 4/3 = 1.33, hence ~33% larger.'
  }
]

const base64Seo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Base64 Encoder / Decoder</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      This tool encodes text or files to Base64 strings and decodes Base64 back to the original text, entirely in the browser. Developers use it to create data URIs for inline images in CSS/HTML, inspect JWT token payloads, encode binary files for API transmission, and debug authentication headers -- all without uploading data to any server.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p>
      Base64 uses a 64-character alphabet (A-Z, a-z, 0-9, +, /) where each character represents 6 bits of data. The encoding processes input in 3-byte groups: 3 bytes (24 bits) are split into four 6-bit values, each mapped to an alphabet character. If the input length is not divisible by 3, one or two <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono font-bold text-[#818cf8]">=</code> padding characters are appended. For text encoding, this implementation uses <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono font-bold text-[#818cf8]">TextEncoder</code> to convert the string to UTF-8 bytes, then <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono font-bold text-[#818cf8]">btoa()</code> produces the Base64 output. File encoding reads the file as a data URL via <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono font-bold text-[#818cf8]">FileReader.readAsDataURL()</code>, splitting on the comma to extract the raw Base64 portion.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Worked Example</h3>
    <p>
      <strong>Input (encode):</strong> text <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">"Hello, World!"</code>. <strong>Output:</strong> <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">"SGVsbG8sIFdvcmxkIQ=="</code>. Step-by-step: The string is encoded to UTF-8 bytes (13 bytes). <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">btoa("Hello, World!")</code> maps the byte sequence through the Base64 lookup table. The trailing <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">==</code> indicates one padding byte was added (13 mod 3 = 1). Decoding <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">atob("SGVsbG8sIFdvcmxkIQ==")</code> returns the original string.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Mistakes</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
      <li><strong>Forgetting that Base64 is not encryption.</strong> Base64 is an encoding scheme, not encryption. Anyone can trivially decode a Base64 string back to the original -- never use it to protect sensitive data. Use proper encryption (AES, etc.) for confidentiality.</li>
      <li><strong>Using standard Base64 in URLs.</strong> The <code>+</code> and <code>/</code> characters in standard Base64 are interpreted as spaces and path separators in URLs. Use Base64URL (with <code>-</code> and <code>_</code> instead) for query parameters or URL segments.</li>
      <li><strong>Applying Base64 to UTF-16 strings without byte conversion.</strong> JavaScript strings are UTF-16. Passing a string directly to <code>btoa()</code> with characters outside the Latin-1 range throws an error. Always convert to UTF-8 bytes first via <code>TextEncoder</code> before encoding.</li>
    </ul>
  </div>
)

interface TextHistoryItem {
  id: string
  type: 'text'
  mode: 'encode' | 'decode'
  input: string
  output: string
  timestamp: number
}

interface FileHistoryItem {
  id: string
  type: 'file'
  name: string
  size: number
  mimeType: string
  timestamp: number
}

type HistoryItem = TextHistoryItem | FileHistoryItem

export default function Base64EncoderClient() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  // Text Tab State
  const [textMode, setTextMode] = useState<'encode' | 'decode'>('encode')
  const [textInput, setTextInput] = useState<string>('Hello, World!')
  const [textOutput, setTextOutput] = useState<string>('')

  // URL-safe mode toggle
  const [urlSafe, setUrlSafe] = useState(false)

  // File Tab State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string>('')
  const [fileDataUrl, setFileDataUrl] = useState<string>('')
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  // Copy and UI State
  const [copiedText, setCopiedText] = useState<'output' | 'dataUrl' | 'rawBase64' | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('base64_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading history:', e)
      }
    }
  }, [])

  // Text encoder / decoder (Unicode safe) with URL-safe support
  const encodeText = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str)
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
      let base64 = btoa(binString)
      if (urlSafe) {
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
      return base64
    } catch {
      return 'Error: Could not encode text'
    }
  }

  const decodeText = (str: string) => {
    try {
      let input = str.trim()
      if (urlSafe) {
        // Convert URL-safe back to standard Base64
        input = input.replace(/-/g, '+').replace(/_/g, '/')
        while (input.length % 4) input += '='
      }
      const binString = atob(input)
      const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch {
      return 'Error: Invalid Base64 input'
    }
  }

  const handleTextConvert = () => {
    if (!textInput.trim()) {
      setTextOutput('')
      return
    }

    let result = ''
    if (textMode === 'encode') {
      result = encodeText(textInput)
    } else {
      result = decodeText(textInput)
    }

    setTextOutput(result)

    // Save to history
    const item: TextHistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      type: 'text',
      mode: textMode,
      input: textInput,
      output: result,
      timestamp: Date.now()
    }
    saveToHistory(item)
  }

  const handleClearText = () => {
    setTextInput('')
    setTextOutput('')
  }

  // Stats calculation
  const stats = useMemo(() => {
    if (activeTab === 'text' && textInput && textOutput && !textOutput.startsWith('Error')) {
      const inputBytes = new TextEncoder().encode(textInput).length
      const outputBytes = new TextEncoder().encode(textOutput).length
      const overhead = inputBytes > 0 ? ((outputBytes - inputBytes) / inputBytes * 100) : 0
      return { inputBytes, outputBytes, overhead }
    }
    if (activeTab === 'file' && uploadedFile && fileBase64) {
      const inputBytes = uploadedFile.size
      const outputBytes = new TextEncoder().encode(fileBase64).length
      const overhead = inputBytes > 0 ? ((outputBytes - inputBytes) / inputBytes * 100) : 0
      return { inputBytes, outputBytes, overhead }
    }
    return null
  }, [activeTab, textInput, textOutput, uploadedFile, fileBase64])

  // File Handlers
  const handleFile = (file: File) => {
    setFileError(null)
    setUploadedFile(null)
    setFileBase64('')
    setFileDataUrl('')

    setIsProcessingFile(true)
    const reader = new FileReader()

    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64Raw = dataUrl.split(',')[1] || ''

      setFileDataUrl(dataUrl)
      setFileBase64(base64Raw)
      setUploadedFile(file)
      setFileError(null)
      setIsProcessingFile(false)

      const item: FileHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        type: 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        timestamp: Date.now()
      }
      saveToHistory(item)
    }

    reader.onerror = () => {
      setFileError("Error occurred while reading the file.")
      setIsProcessingFile(false)
    }

    reader.readAsDataURL(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setFileBase64('')
    setFileDataUrl('')
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // History operations
  const saveToHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      let next = [item, ...prev]
      next = next.slice(0, 15)
      localStorage.setItem('base64_history', JSON.stringify(next))
      return next
    })
  }

  const clearHistory = () => {
    localStorage.removeItem('base64_history')
    setHistory([])
  }

  const loadHistoryItem = (item: HistoryItem) => {
    if (item.type === 'text') {
      setActiveTab('text')
      setTextMode(item.mode)
      setTextInput(item.input)
      setTextOutput(item.output)
    } else {
      setActiveTab('file')
      toast(`"${item.name}" (${formatBytes(item.size)}) logged. File data not stored for privacy -- upload again to view.`, 'info');
    }
  }

  const copyToClipboard = (text: string, key: 'output' | 'dataUrl' | 'rawBase64') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(key)
      setTimeout(() => setCopiedText(null), 2000)
    }).catch(err => {
      console.error('Failed to copy: ', err)
    })
  }

  const handleDownload = () => {
    if (!fileDataUrl) return

    const element = document.createElement("a")
    const file = new Blob([fileDataUrl], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${uploadedFile?.name || 'file'}_base64.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Download decoded text as .txt file
  const handleDownloadDecoded = () => {
    if (!textOutput || textMode !== 'decode' || textOutput.startsWith('Error')) return
    const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'decoded-text.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const getDisplayValue = (str: string) => {
    if (str.length > 5000) {
      return str.substring(0, 5000) + '\n\n... [Preview truncated for speed. Click Copy to get full data] ...'
    }
    return str
  }

  // Get URL-safe version of raw base64 for file mode
  const getFileRawBase64 = () => {
    if (!fileBase64) return ''
    if (urlSafe) {
      return fileBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }
    return fileBase64
  }

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode and decode text or files to Base64 instantly. Client-side processing, no data leaves your browser."
      toolSlug="base64-encoder"
            faq={base64Faq}
      seoContent={base64Seo}
    >
      <div className="space-y-6">
        {/* Top-level Tabs -- Terminal style */}
        <div className="flex border-b border-[#333333]">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-center border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
              activeTab === 'text'
                ? 'border-[#F9F9F9] text-[#F9F9F9]'
                : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
            }`}
          >
            {`>`} Text Base64
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 text-center border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
              activeTab === 'file'
                ? 'border-[#F9F9F9] text-[#F9F9F9]'
                : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
            }`}
          >
            {`>`} File to Base64
          </button>
        </div>

        {/* Tab Content: Text */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTextMode('encode')}
                  className={`terminal-btn ${textMode === 'encode' ? 'text-[#00FF41]' : ''}`}
                >
                  [<span className="green-chevron">&gt;</span> Encode Text]
                </button>
                <button
                  type="button"
                  onClick={() => setTextMode('decode')}
                  className={`terminal-btn ${textMode === 'decode' ? 'text-[#00FF41]' : ''}`}
                >
                  [<span className="green-chevron">&gt;</span> Decode Text]
                </button>
              </div>
              <button
                type="button"
                onClick={() => setUrlSafe(!urlSafe)}
                className={`terminal-btn ${urlSafe ? 'text-[#00FF41]' : ''}`}
              >
                [<span className="green-chevron">&gt;</span> URL-SAFE: {urlSafe ? 'ON' : 'OFF'}]
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono text-[#888888] uppercase">
                  {textMode === 'encode' ? <>{'>'} TEXT TO ENCODE</> : <>{'>'} BASE64 TO DECODE</>}
                </label>
                {textInput && (
                  <button
                    type="button"
                    onClick={handleClearText}
                    className="text-[10px] font-mono text-[#555555] hover:text-[#F9F9F9] uppercase tracking-wider"
                  >
                    [ CLEAR ]
                  </button>
                )}
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs md:text-sm focus:border-2 focus:border-[#00FF41] focus:outline-none resize-y"
              />
            </div>

            <button
              type="button"
              onClick={handleTextConvert}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {textMode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}]
            </button>

            {textOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono text-[#888888] uppercase">{'>'} RESULT</label>
                  <div className="flex gap-2">
                    {textMode === 'decode' && !textOutput.startsWith('Error') && (
                      <button
                        type="button"
                        onClick={handleDownloadDecoded}
                        className="terminal-btn"
                      >
                        [<span className="green-chevron">&gt;</span> DOWNLOAD .TXT]
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(textOutput, 'output')}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> {copiedText === 'output' ? 'COPIED' : 'COPY'}]
                    </button>
                  </div>
                </div>
                <textarea
                  value={textOutput}
                  readOnly
                  rows={5}
                  className="w-full px-4 py-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs md:text-sm focus:outline-none resize-y"
                />

                {/* Stats display */}
                {stats && !textOutput.startsWith('Error') && (
                  <div className="mt-2 p-3 border border-[#333333] bg-[#000000]">
                    <p className="text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1.5">{'>'} STATS</p>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-[#888888]">
                        Input: <span className="text-[#F9F9F9]">{formatBytes(stats.inputBytes)}</span>
                      </span>
                      <span className="text-[#888888]">
                        Output: <span className="text-[#F9F9F9]">{formatBytes(stats.outputBytes)}</span>
                      </span>
                      <span className="text-[#888888]">
                        Overhead: <span className={`${stats.overhead >= 0 ? 'text-[#FFD700]' : 'text-[#00FF41]'}`}>
                          {stats.overhead >= 0 ? '+' : ''}{stats.overhead.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: File */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            {/* URL-safe toggle for file mode */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setUrlSafe(!urlSafe)}
                className={`terminal-btn ${urlSafe ? 'text-[#00FF41]' : ''}`}
              >
                [<span className="green-chevron">&gt;</span> URL-SAFE: {urlSafe ? 'ON' : 'OFF'}]
              </button>
            </div>

            {/* Drag & Drop Area */}
            {!uploadedFile && !isProcessingFile && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed p-8 cursor-pointer transition-none ${
                  dragActive
                    ? 'border-[#00FF41] bg-[#000000]'
                    : 'border-[#444444] hover:border-[#F9F9F9] bg-[#000000]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-[#555555] mb-3" />
                <p className="text-sm font-mono text-[#F9F9F9] text-center">{'>'} DRAG & DROP FILE HERE, OR CLICK TO BROWSE</p>
                <p className="text-[10px] font-mono text-[#555555] mt-1.5 text-center">
                  Supports images, PDFs, document files - no size limit
                </p>
              </div>
            )}

            {/* Processing State */}
            {isProcessingFile && (
              <div className="flex flex-col items-center justify-center py-12 border border-[#333333] bg-[#000000]">
                <div className="w-10 h-10 border-2 border-t-transparent border-[#F9F9F9] mb-3" style={{animation: 'spin 1s linear infinite'}} />
                <p className="text-xs font-mono text-[#666666]">{'>'} PROCESSING FILE...</p>
              </div>
            )}

            {/* File Error State */}
            {fileError && (
              <div className="p-4 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-mono text-[#F9F9F9] underline">{'>'} ERROR PROCESSING FILE</p>
                  <p className="text-[10px] font-mono mt-0.5 text-[#888888]">{fileError}</p>
                </div>
              </div>
            )}

            {/* Uploaded File Info Card and Preview */}
            {uploadedFile && (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 border border-[#333333] bg-[#000000]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 border border-[#444444] bg-[#000000] text-[#888888] flex-shrink-0">
                      {uploadedFile.type.startsWith('image/') ? (
                        <ImageIcon className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-[#F9F9F9] truncate max-w-[200px] sm:max-w-md">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#555555] mt-0.5">
                        {formatBytes(uploadedFile.size)} {uploadedFile.type || 'Unknown Type'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-1.5 text-[#555555] hover:text-[#F9F9F9] transition-none"
                    title="Remove file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Preview if it is an image */}
                {uploadedFile.type.startsWith('image/') && fileDataUrl && (
                  <div className="border border-[#333333] p-4 bg-[#000000]">
                    <p className="text-xs font-mono text-[#666666] mb-2">Image Preview</p>
                    <div className="flex justify-center">
                      <img
                        src={fileDataUrl}
                        alt="Preview"
                        className="max-h-64 object-contain border border-[#333333] bg-[#000000] p-1"
                      />
                    </div>
                  </div>
                )}

                {/* Outputs */}
                <div className="space-y-4">
                  {/* Data URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider">Base64 Data URL</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(fileDataUrl, 'dataUrl')}
                          className="terminal-btn"
                        >
                          [<span className="green-chevron">&gt;</span> {copiedText === 'dataUrl' ? 'COPIED' : 'COPY DATA URL'}]
                        </button>
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="terminal-btn"
                        >
                          [<span className="green-chevron">&gt;</span> Download (.txt)]
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={getDisplayValue(fileDataUrl)}
                      readOnly
                      rows={4}
                      className="w-full px-4 py-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none resize-y"
                    />
                  </div>

                  {/* Raw Base64 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#888888]">Raw Base64 String</label>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(getFileRawBase64(), 'rawBase64')}
                        className="terminal-btn"
                      >
                        [<span className="green-chevron">&gt;</span> {copiedText === 'rawBase64' ? 'COPIED' : 'COPY RAW BASE64'}]
                      </button>
                    </div>
                    <textarea
                      value={getDisplayValue(getFileRawBase64())}
                      readOnly
                      rows={4}
                      className="w-full px-4 py-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* File stats */}
                {stats && (
                  <div className="p-3 border border-[#333333] bg-[#000000]">
                    <p className="text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1.5">{'>'} STATS</p>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-[#888888]">
                        Input (file): <span className="text-[#F9F9F9]">{formatBytes(stats.inputBytes)}</span>
                      </span>
                      <span className="text-[#888888]">
                        Base64 size: <span className="text-[#F9F9F9]">{formatBytes(stats.outputBytes)}</span>
                      </span>
                      <span className="text-[#888888]">
                        Overhead: <span className="text-[#FFD700]">+{stats.overhead.toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="mt-8 border-t border-[#333333] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider">Recent Conversions</h3>
              <button
                type="button"
                onClick={clearHistory}
                className="text-[10px] font-mono text-[#555555] hover:text-[#F9F9F9] flex items-center gap-1 transition-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.type === 'file' ? (
                      <File className="w-4 h-4 text-[#888888] flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#00FF41] flex-shrink-0" />
                    )}
                    <span className="font-mono text-[#F9F9F9] truncate max-w-[200px] sm:max-w-xs">
                      {item.type === 'file'
                        ? item.name
                        : item.input.substring(0, 30) + (item.input.length > 30 ? '...' : '')
                      }
                    </span>
                    <span className="text-[10px] font-mono text-[#555555]">
                      {item.type === 'file' ? `(${formatBytes(item.size)})` : `(${item.mode})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#888888]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => loadHistoryItem(item)}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> Load]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
