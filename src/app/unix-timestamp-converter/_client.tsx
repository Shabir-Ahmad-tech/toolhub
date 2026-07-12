'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/ui/CopyButton'
import { Clock, Calendar, RefreshCw, Copy, Check } from 'lucide-react'

const unixTimestampFaq = [
  {
    question: 'What is Unix timestamp and why is it used?',
    answer: 'Unix timestamp (also called epoch time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. It is widely used in programming, databases, and APIs because it provides a simple numeric representation of time that is independent of timezones and daylight saving time.'
  },
  {
    question: 'What is the difference between Unix seconds and milliseconds?',
    answer: 'Unix seconds are the standard epoch timestamp counted in seconds (e.g., 1704067200). Milliseconds are the same epoch value multiplied by 1000 (e.g., 1704067200000). JavaScript Date objects use milliseconds, while many APIs and JSON standards use seconds.'
  },
  {
    question: 'Is this timestamp converter accurate for all timezones?',
    answer: 'This converter shows both local time (your browser timezone) and UTC/GMT time. Unix timestamps themselves are always in UTC. The tool converts the same epoch value to your local timezone for convenience, making it useful for debugging timezone-related issues in applications.'
  },
  {
    question: 'What is the Year 2038 problem?',
    answer: 'The Year 2038 problem affects 32-bit signed integers storing Unix timestamps: the maximum value 2^31 - 1 = 2147483647 corresponds to January 19, 2038 at 03:14:07 UTC. One second later it overflows to a negative number. Most modern systems use 64-bit integers, which extend the limit to about 292 billion years.'
  },
  {
    question: 'How do I get the current Unix timestamp in different languages?',
    answer: 'In JavaScript: <code>Math.floor(Date.now() / 1000)</code>. In Python: <code>int(time.time())</code>. In Go: <code>time.Now().Unix()</code>. In SQL: <code>UNIX_TIMESTAMP()</code> (MySQL) or <code>EXTRACT(EPOCH FROM NOW())</code> (PostgreSQL).'
  }
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Unix Timestamp Converter</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      This tool converts Unix epoch timestamps to human-readable dates and vice versa, supporting both seconds and millisecond precision. Developers use it constantly when debugging authentication tokens (JWT <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">exp</code> claims), inspecting database records, correlating log entries across distributed systems, or resolving timezone-related integration bugs.
    </p>
    <h3 className="text-sm font-semibold text-[#888888]">How It Works</h3>
    <p>
      The Unix epoch counts seconds elapsed since 1970-01-01T00:00:00Z, ignoring leap seconds. The <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">new Date(timestamp * 1000)</code> constructor converts second-precision values into JavaScript Date objects. From there, <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">toISOString()</code> produces UTC time in ISO 8601 format, <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">toLocaleString()</code> applies the browser's timezone offset, and <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">toUTCString()</code> renders RFC 7231 format used in HTTP headers. The reverse conversion (<code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">date.getTime() / 1000</code>) rounds to whole seconds.
    </p>
    <h3 className="text-sm font-semibold text-[#888888]">Worked Example</h3>
    <p>
      <strong>Input:</strong> timestamp <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">1710086400</code> in seconds mode. <strong>Outputs:</strong> Local time - "3/10/2024, 12:00:00 PM" (America/New_York); ISO 8601 - "2024-03-10T16:00:00.000Z"; UTC string - "Sun, 10 Mar 2024 16:00:00 GMT"; Unix milliseconds - "1710086400000". The reverse conversion of "2024-03-10T16:00:00.000Z" via <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">new Date("2024-03-10T16:00:00.000Z").getTime() / 1000</code> returns the original <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">1710086400</code>.
    </p>
    <h3 className="text-sm font-semibold text-[#888888]">Common Mistakes</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
      <li><strong>Mixing seconds and milliseconds.</strong> Passing a millisecond value (e.g., <code className="px-1 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">Date.now()</code> returns milliseconds) into an API expecting seconds produces a date in the year 5138. Always divide by 1000 before sending to epoch-second endpoints.</li>
      <li><strong>Assuming timestamps are timezone-aware.</strong> Unix timestamps are always UTC. Storing "local" timestamps without offset metadata is unrecoverable - the same epoch value represents different wall-clock times across timezones.</li>
      <li><strong>Ignoring leap seconds.</strong> The Unix epoch explicitly ignores leap seconds, meaning a timestamp can be exactly one second off from UTC during a leap-second event. This is negligible for most applications but critical for high-frequency trading or astronomy.</li>
    </ul>
  </div>
)

export default function UnixTimestampClient() {
  const [timestamp, setTimestamp] = useState<string>('')
  const [dateString, setDateString] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000))
  const [precision, setPrecision] = useState<'seconds' | 'milliseconds'>('seconds')
  const [copied, setCopied] = useState(false)
  const PRO_LIMIT = false

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const timestampToDate = (ts: number) => {
    const date = new Date(ts * 1000)
    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      date: date.toDateString(),
      time: date.toTimeString()
    }
  }

  const handleTimestampChange = (value: string) => {
    setTimestamp(value)
    const num = parseInt(value, 10)

    if (!isNaN(num) && num > 0) {
      const date = timestampToDate(num)
      setDateString(date.local)
    } else {
      setDateString('')
    }
  }

  const handleDateChange = (value: string) => {
    setDateString(value)
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        const ts = Math.floor(date.getTime() / 1000)
        setTimestamp(ts.toString())
      }
    }
  }

  const generateCurrentTimestamp = () => {
    setTimestamp(currentTime.toString())
  }

  const copyCurrentTs = () => {
    navigator.clipboard.writeText(currentTime.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const dateFormats = timestamp ? timestampToDate(parseInt(timestamp, 10)) : null

  return (
    <ToolLayout
      title="Unix Timestamp Converter"
      description="Convert Unix timestamps (epoch time) to human-readable dates and vice versa. Free online tool for developers."
      toolSlug="unix-timestamp-converter"
            faq={unixTimestampFaq}
      seoContent={seoContent}
    >
      <div className="space-y-6">
        {/* Current Time Display */}
        <div className="flex items-center justify-between p-4 border border-[#333333] bg-[#000000]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#00FF41]" />
            <div>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-wider">Current Unix Timestamp</p>
              <p className="font-mono text-lg text-[#00FF41]">{currentTime}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyCurrentTs}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timestamp Input */}
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1.5">
              Unix Timestamp
            </label>
            <input
              type="number"
              value={timestamp}
              onChange={(e) => handleTimestampChange(e.target.value)}
              placeholder="1704067200"
              className="w-full px-4 py-3 border border-[#333333] font-mono text-sm bg-[#000000]"
            />
            <button
              onClick={generateCurrentTimestamp}
              className="terminal-btn mt-2"
            >
              [<span className="green-chevron">&gt;</span> CURRENT TIME]
            </button>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1.5">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateString ? new Date(dateString).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-[#333333] text-sm bg-[#000000]"
            />
          </div>
        </div>

        {/* Precision Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#888888]">Precision:</span>
          <div className="flex gap-1 bg-[#1a1a1a] rounded-none p-1">
            <button
              onClick={() => setPrecision('seconds')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-none ${
                precision === 'seconds'
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'bg-[#000000] text-[#555555] border border-[#333333] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
              }`}
            >
              Seconds
            </button>
            <button
              onClick={() => setPrecision('milliseconds')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-none ${
                precision === 'milliseconds'
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'bg-[#000000] text-[#555555] border border-[#333333] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
              }`}
            >
              Milliseconds
            </button>
          </div>
        </div>

        {/* Date Format Outputs */}
        {dateFormats && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#888888] flex items-center gap-2">
              <Calendar size={14} />
              Converted Outputs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-[#1a1a1a] rounded-none">
                <p className="text-xs text-[#666666] mb-1">Local Date & Time</p>
                <p className="font-mono text-sm text-[#F9F9F9]">{dateFormats.local}</p>
              </div>
              <div className="p-3 bg-[#1a1a1a] rounded-none">
                <p className="text-xs text-[#666666] mb-1">ISO 8601</p>
                <p className="font-mono text-sm text-[#F9F9F9]">{dateFormats.iso}</p>
              </div>
              <div className="p-3 bg-[#1a1a1a] rounded-none">
                <p className="text-xs text-[#666666] mb-1">UTC String</p>
                <p className="font-mono text-sm text-[#F9F9F9]">{dateFormats.utc}</p>
              </div>
              <div className="p-3 bg-[#1a1a1a] rounded-none">
                <p className="text-xs text-[#666666] mb-1">Unix (ms)</p>
                <p className="font-mono text-sm text-[#F9F9F9]">
                  {parseInt(timestamp, 10) * 1000}
                </p>
              </div>
            </div>
          </div>
        )}

              </div>
    </ToolLayout>
  )
}



