'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

const IS_PRO = false
const FREE_CHAR_LIMIT = 5000

export default function JsonCsvConverterClient() {
  const [mode, setMode] = useState<'json2csv' | 'csv2json'>('json2csv')
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > FREE_CHAR_LIMIT) {
      setInputVal(val.substring(0, FREE_CHAR_LIMIT))
      return
    }
    setInputVal(val)
    setError(null)
  }

  // Convert JSON array of objects to CSV
  const jsonToCsv = (jsonStr: string): string => {
    const parsed = JSON.parse(jsonStr)
    const items = Array.isArray(parsed) ? parsed : [parsed]
    
    if (items.length === 0) return ''

    // Extract all unique headers/keys
    const headers = Array.from(
      new Set(items.flatMap(item => Object.keys(item)))
    )

    const csvRows = [
      headers.join(','), // Header row
      ...items.map(item => 
        headers
          .map(header => {
            const val = item[header]
            if (val === null || val === undefined) return ''
            const strVal = String(val)
            // Escape double quotes and wrap in quotes if contains commas or quotes
            if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
              return `"${strVal.replace(/"/g, '""')}"`
            }
            return strVal
          })
          .join(',')
      )
    ]
    return csvRows.join('\n')
  }

  // Convert CSV text to JSON array of objects
  const csvToJson = (csvStr: string): string => {
    const lines = csvStr.split('\n').filter(line => line.trim())
    if (lines.length === 0) return '[]'

    // Simple CSV parser that handles quoted commas
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = []
      let cell = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cell += '"' // Escaped quote
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(cell.trim())
          cell = ''
        } else {
          cell += char
        }
      }
      result.push(cell.trim())
      return result
    }

    const headers = parseCsvLine(lines[0])
    const data = lines.slice(1).map(line => {
      const values = parseCsvLine(line)
      const obj: Record<string, any> = {}
      headers.forEach((header, index) => {
        let val: any = values[index] !== undefined ? values[index] : ''
        
        // Try parsing number or boolean
        if (val.toLowerCase() === 'true') val = true
        else if (val.toLowerCase() === 'false') val = false
        else if (val !== '' && !isNaN(Number(val))) val = Number(val)

        obj[header] = val
      })
      return obj
    })

    return JSON.stringify(data, null, 2)
  }

  const handleConvert = () => {
    setError(null)
    if (!inputVal.trim()) {
      setOutputVal('')
      return
    }

    try {
      if (mode === 'json2csv') {
        const csv = jsonToCsv(inputVal)
        setOutputVal(csv)
      } else {
        const json = csvToJson(inputVal)
        setOutputVal(json)
      }
    } catch (err: any) {
      setError(
        mode === 'json2csv'
          ? 'Invalid JSON format. Make sure it is a valid JSON object or array of objects.'
          : 'Invalid CSV format. Please verify the structure.'
      )
    }
  }

  const handleCopy = () => {
    if (!outputVal) return
    navigator.clipboard.writeText(outputVal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!IS_PRO) return
    const extension = mode === 'json2csv' ? 'csv' : 'json'
    const mime = mode === 'json2csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([outputVal], { type: `${mime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `converted_data.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  // SEO Content and FAQ
  const jsonCsvFaq = [
    {
      question: 'How does JSON to CSV conversion work?',
      answer: 'JSON arrays convert to CSV rows, with object keys becoming column headers. Each object property maps to a cell. CSV must have headers in the first row. Nested JSON objects are flattened, and the tool handles escaped values, quotes, and special characters automatically.'
    },
    {
      question: 'Is my data secure during conversion?',
      answer: 'Yes. All conversion happens client-side in your browser. No JSON or CSV data is uploaded to servers. Your spreadsheets, API responses, and sensitive data remain private.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'The converter handles standard JSON (arrays of objects) and RFC 4180 compliant CSV. Copy-paste or import files up to 2MB. For larger files or batch processing, the Pro upgrade provides unlimited file size and multiple file handling.'
    }
  ]

  const jsonCsvSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Convert Between JSON and CSV Data Formats</h2>
      <p>
        JSON to CSV conversion transforms array data into spreadsheet-ready format. Each JSON object becomes a row, with keys as headers. CSV to JSON does the reverse, creating an array of objects. All processing happens locally without server uploads.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Conversion Scenarios</h3>
      <p>
        Use JSON to CSV for exporting API data to Excel, analyzing logs in spreadsheets, or preparing data for analytics tools. Use CSV to JSON for importing spreadsheet data into web applications, converting database exports, or processing form submissions.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="JSON to CSV / CSV to JSON Converter"
      description="Convert JSON to CSV or CSV to JSON format online. Fast, browser-based two-way data conversion."
      toolSlug="json-csv-converter"
      categorySlug="developer-tools"
      faq={jsonCsvFaq}
      seoContent={jsonCsvSeo}
    >
      <div className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center justify-center">
          <div className="inline-flex border border-[#333333] bg-[#000000]">
            <button
              onClick={() => {
                setMode('json2csv')
                setInputVal('')
                setOutputVal('')
                setError(null)
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
                mode === 'json2csv'
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'text-[#666666] hover:text-[#F9F9F9]'
              }`}
            >
              JSON → CSV
            </button>
            <button
              onClick={() => {
                setMode('csv2json')
                setInputVal('')
                setOutputVal('')
                setError(null)
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-none ${
                mode === 'csv2json'
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'text-[#666666] hover:text-[#F9F9F9]'
              }`}
            >
              CSV → JSON
            </button>
          </div>
        </div>

        {/* Input & Output Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-[#888888]">
                {mode === 'json2csv' ? 'Input JSON' : 'Input CSV'}
              </label>
              <span className="text-xs text-[#555555] tabular-nums">
                {inputVal.length} / 50,000 chars
              </span>
            </div>
            <textarea
              value={inputVal}
              onChange={handleInputChange}
              placeholder={
                mode === 'json2csv'
                  ? '[\n  { "name": "John Doe", "age": 30, "city": "New York" },\n  { "name": "Jane Smith", "age": 25, "city": "Boston" }\n]'
                  : 'name,age,city\nJohn Doe,30,New York\nJane Smith,25,Boston'
              }
              className="w-full h-80 p-4 border border-[#333333] rounded-none bg-[#000000] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y"
            />
          </div>

          {/* Output Panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-[#888888]">
                {mode === 'json2csv' ? 'Output CSV' : 'Output JSON'}
              </label>
              <div className="flex items-center gap-3">
                {outputVal && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
                    </button>

                    <button
                      onClick={handleDownload}
                      disabled={!IS_PRO}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> DOWNLOAD]
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={outputVal}
              readOnly
              placeholder="Your converted data will appear here..."
              className="w-full h-80 p-4 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs md:text-sm leading-relaxed resize-y focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs">
            <strong className="text-[#F9F9F9] underline">ERROR:</strong> {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConvert}
          className="terminal-btn w-full justify-center"
        >
          [<span className="green-chevron">&gt;</span> Convert Data]
        </button>
      </div>

      </ToolLayout>
  )
}
