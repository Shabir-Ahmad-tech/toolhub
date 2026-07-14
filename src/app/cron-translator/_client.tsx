'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, Clock, ChevronRight, Calendar } from 'lucide-react'

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_ABBR: Record<string, string> = { jan: '1', feb: '2', mar: '3', apr: '4', may: '5', jun: '6', jul: '7', aug: '8', sep: '9', oct: '10', nov: '11', dec: '12' }
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DOW_ABBR: Record<string, string> = { sun: '0', mon: '1', tue: '2', wed: '3', thu: '4', fri: '5', sat: '6' }

function normalizeField(field: string): string {
  const lower = field.toLowerCase()
  if (DOW_ABBR[lower] !== undefined) return DOW_ABBR[lower]
  if (MONTH_ABBR[lower] !== undefined) return MONTH_ABBR[lower]
  return field
}

function describeCronField(field: string, type: 'minute' | 'hour' | 'dom' | 'month' | 'dow'): string {
  if (field === '*') return 'every'

  const normalized = normalizeField(field)
  const items = normalized.split(',').map(s => s.trim()).filter(Boolean)

  if (items.length === 1) return describeSingleField(items[0], type)
  const described = items.map(i => describeSingleField(i, type))
  return joinList(described)
}

function joinList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1]
}

function describeSingleField(field: string, type: 'minute' | 'hour' | 'dom' | 'month' | 'dow'): string {
  // Step pattern: */5, 1/3, 1-10/2
  const stepMatch = field.match(/^(\S+)\/(\d+)$/)
  if (stepMatch) {
    const range = stepMatch[1]
    const step = parseInt(stepMatch[2], 10)
    const rangeDesc = range === '*' ? '' : describeSingleField(range, type)
    return `every ${step}${type === 'minute' ? ' minutes' : type === 'hour' ? ' hours' : ''} starting at ${rangeDesc || '0'}`
  }

  // Range pattern: 1-5, JAN-JUL
  const rangeMatch = field.match(/^(\S+)-(\S+)$/)
  if (rangeMatch) {
    const start = normalizeField(rangeMatch[1])
    const end = normalizeField(rangeMatch[2])
    switch (type) {
      case 'minute': return `minutes ${start} through ${end}`
      case 'hour': return `${start} through ${end}`
      case 'dom': return `days ${start} through ${end}`
      case 'month': return `${MONTH_NAMES[parseInt(start)] || start} through ${MONTH_NAMES[parseInt(end)] || end}`
      case 'dow': return `${DOW_NAMES[parseInt(start)] || start} through ${DOW_NAMES[parseInt(end)] || end}`
    }
  }

  // Single value
  const num = parseInt(normalized(field), 10)
  switch (type) {
    case 'minute':
      if (field === '0') return 'at minute 0'
      if (field === '30') return 'at minute 30'
      return `at minute ${normalized(field)}`
    case 'hour':
      return `at ${normalized(field).padStart(2, '0')}:00`
    case 'dom':
      return `on day ${normalized(field)}`
    case 'month':
      return `in ${MONTH_NAMES[num] || normalized(field)}`
    case 'dow':
      return `on ${DOW_NAMES[num] || normalized(field)}`
  }
}

function translateCron(cron: string): string {
  // Trim and handle @-presets
  let expr = cron.trim()
  const presets: Record<string, string> = {
    '@yearly': '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
    '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0',
    '@daily': '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@hourly': '0 * * * *',
  }
  if (presets[expr.toLowerCase()]) expr = presets[expr.toLowerCase()]

  const parts = expr.split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression — must have exactly 5 fields.'

  const [minute, hour, dom, month, dow] = parts

  const minDesc = describeCronField(minute!, 'minute')
  const hourDesc = describeCronField(hour!, 'hour')
  const domDesc = describeCronField(dom!, 'dom')
  const monthDesc = describeCronField(month!, 'month')
  const dowDesc = describeCronField(dow!, 'dow')

  // "Every minute" — all *
  if (parts.every(p => p === '*')) return 'Every minute of every hour, every day, all year.'

  // Build the description from most significant to least
  const sentences: string[] = []

  // Month constraint
  const monthActive = month !== '*'
  const dowActive = dow !== '*'
  const domActive = dom !== '*'
  const hourActive = hour !== '*'
  const minActive = minute !== '*'

  // Time part
  if (!hourActive && !minActive) {
    // Both * → every minute of every hour
    // Handled by "every minute" case below
  }

  if (minActive && hourActive) {
    // Specific time
    const minuteVal = minute!.padStart(2, '0')
    if (domActive || monthActive || dowActive) {
      sentences.push(`At ${hourDesc} and ${minDesc}`)
    } else {
      sentences.push(`Every day at ${hourDesc} and ${minDesc}`)
    }
  } else if (minActive && !hourActive) {
    sentences.push(`Every hour, ${minDesc}`)
  } else if (!minActive && hourActive) {
    sentences.push(`Every minute during hour ${hourDesc}`)
  } else {
    // Both wildcards
    if (!domActive && !monthActive && !dowActive) {
      return 'Every minute of every day.'
    }
  }

  // Day of week
  if (dowActive) {
    if (domActive) {
      // Both DOM and DOW are active — this is an OR condition in cron
      sentences.push(`OR ${dowDesc}`)
    } else {
      sentences.push(dowDesc)
    }
  }

  // Day of month
  if (domActive && !dowActive) {
    sentences.push(`on day ${dom}`)
  }

  // Month
  if (monthActive) {
    sentences.push(`in month ${month}`)
  }

  // Fix up: "on day 15 in month 6" → "on day 15 of June, at 14:30"
  let human = sentences.join(', ').replace(/, OR /g, ' OR ')

  // Clean up: "at 14:00 and at minute 30" → "at 14:30"
  human = human.replace(/at (\d{2}):00 and at minute (\d+)/g, 'at $1:$2')
  human = human.replace(/at (\d+):00 and at minute (\d+)/g, 'at $1:$2')

  return human
}

function getNextFireTimes(cron: string, count = 5): string[] {
  // Simplified next-fire-time calculation for common patterns
  // Since we can't actually run cron, we show approximate times for the current day
  const now = new Date()
  const times: string[] = []
  const parts = cron.trim().split(/\s+/)

  try {
    // Parse fields
    const presets: Record<string, string> = {
      '@yearly': '0 0 1 1 *',
      '@annually': '0 0 1 1 *',
      '@monthly': '0 0 1 * *',
      '@weekly': '0 0 * * 0',
      '@daily': '0 0 * * *',
      '@midnight': '0 0 * * *',
      '@hourly': '0 * * * *',
    }
    let expr = cron.trim()
    if (presets[expr.toLowerCase()]) expr = presets[expr.toLowerCase()]
    const p = expr.split(/\s+/)
    if (p.length !== 5) return []

    const [minF, hourF, domF, monF, dowF] = p

    for (let i = 0; i < count; i++) {
      const d = new Date(now)
      d.setSeconds(0)
      d.setMilliseconds(0)

      if (minF !== '*') {
        d.setMinutes(parseInt(minF, 10))
      } else {
        d.setMinutes(0)
      }

      if (hourF !== '*') {
        d.setHours(parseInt(hourF, 10))
      } else {
        d.setHours(now.getHours() + i)
      }

      if (i > 0) d.setDate(d.getDate() + 1)
      times.push(d.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }))
    }
  } catch {
    return []
  }

  return times
}

const EXAMPLES = [
  { cron: '*/15 * * * *', label: 'Every 15 minutes' },
  { cron: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
  { cron: '30 14 1 * *', label: '1st of month at 2:30 PM' },
  { cron: '0 */2 * * *', label: 'Every 2 hours' },
  { cron: '0 0 * * 0', label: 'Weekly (Sunday midnight)' },
  { cron: '0 0 1 1 *', label: 'Yearly (Jan 1st)' },
  { cron: '*/30 * * * 1-5', label: 'Every 30 min weekdays' },
  { cron: '0 22 * * 5', label: 'Friday at 10 PM' },
  { cron: '0 0,12 * * *', label: 'Twice daily (noon & midnight)' },
  { cron: '15,45 * * * *', label: 'Twice per hour' },
]

const faq = [
  {
    question: 'What is a cron expression?',
    answer: 'A cron expression is a string of 5 fields (space-separated) that defines a repeating schedule: minute (0-59), hour (0-23), day-of-month (1-31), month (1-12 or JAN-DEC), and day-of-week (0-7, where 0 and 7 = Sunday). A wildcard (*) means "every possible value" for that field. For example, "30 9 * * 1-5" means "at 9:30 AM, Monday through Friday."',
  },
  {
    question: 'How do I read */15 in a cron field?',
    answer: 'The slash (/) is a step operator. "*/15" in the minute field means "every 15 minutes" (0, 15, 30, 45). "*/2" in the hour field means "every 2 hours" (0, 2, 4, 6...). Steps can also start from a specific value: "10-59/5" means "starting at minute 10, every 5 minutes until minute 59."',
  },
  {
    question: 'What do commas and hyphens mean in cron?',
    answer: 'Commas create a list — "1,3,5" matches those specific values. Hyphens create a range — "1-5" matches values 1 through 5. Both can be combined: "1,3,5-7" means 1, 3, 5, 6, 7. List elements can also use step notation: "1-10/3" means 1, 4, 7, 10.',
  },
  {
    question: 'Can I use both day-of-month and day-of-week together?',
    answer: 'Yes, but be careful. When both fields contain specific values (not *), cron runs if EITHER condition matches. For example, "0 0 15 * 5" runs at midnight on the 15th day of the month AND every Friday. If you mean "the 15th AND it must be Friday," you cannot express that in standard cron — use a script wrapper instead.',
  },
  {
    question: 'What is the difference between @daily and @midnight?',
    answer: 'Both expand to "0 0 * * *" (midnight every day). They are aliases in most cron implementations. @hourly expands to "0 * * * *" (every hour at minute 0), @weekly to "0 0 * * 0" (Sunday midnight), @monthly to "0 0 1 * *" (first of the month), and @yearly to "0 0 1 1 *" (January 1st).',
  },
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Cron Schedule Translator &mdash; Decode Any Cron Expression</h2>
    <p className="text-[#888888] font-mono"><strong>A cron expression</strong> uses 5 space-separated fields to define repeating schedules. This tool translates any cron string into plain descriptive English, helping you understand what a schedule actually means without memorizing cron syntax. It works as the inverse of a cron builder — paste an expression you found in a config file, and read the schedule.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How Field Values Work</h3>
    <p className="text-[#888888] font-mono">Each field accepts several value types: wildcards (<code>*</code>) mean &ldquo;every&rdquo;; plain numbers set a specific value; ranges (<code>1-5</code>) cover consecutive values; lists (<code>1,3,5</code>) cover multiple values; and step values (<code>*/15</code>) set intervals. Month and day-of-week fields also accept three-letter abbreviations (<code>JAN</code>, <code>MON</code>). This decoder handles all standard formats.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Cron Patterns</h3>
    <p className="text-[#888888] font-mono">The example buttons show frequently used patterns: every 15 minutes (<code>*/15 * * * *</code>), weekdays at 9 AM (<code>0 9 * * 1-5</code>), monthly on the 1st at 2:30 PM (<code>30 14 1 * *</code>), and every 2 hours (<code>0 */2 * * *</code>). Each example translates instantly so you can learn from real patterns.</p>
  </div>
)

export default function CronTranslatorPage() {
  const [cron, setCron] = useState('*/15 * * * *')
  const [copied, setCopied] = useState(false)

  const translation = (() => {
    try {
      return translateCron(cron)
    } catch {
      return 'Invalid cron expression.'
    }
  })()

  const nextTimes = getNextFireTimes(cron, 5)

  const copy = async () => {
    try { await navigator.clipboard.writeText(cron) } catch { return }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Cron Schedule Translator"
      description="Translate cron expressions into plain English. Paste any cron string and see the schedule explained in simple language."
      toolSlug="cron-translator"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-6 font-mono">

        {/* Examples */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Example Expressions</label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button
                key={ex.cron}
                onClick={() => setCron(ex.cron)}
                className="terminal-btn text-[10px]"
              >
                [<span className="green-chevron">&gt;</span> {ex.label}]
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
            [ Cron Expression ]
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cron}
              onChange={e => setCron(e.target.value)}
              placeholder="e.g. */15 * * * *"
              className="flex-1 px-4 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
            />
            <button onClick={copy} className="terminal-btn">
              [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
            </button>
          </div>
        </div>

        {/* Translation Output */}
        <div className="border border-[#00FF41] p-5">
          <div className="flex items-center gap-2 mb-3 border-b border-[#00FF41]/20 pb-2">
            <Clock className="h-4 w-4 text-[#00FF41]" />
            <span className="text-[10px] font-mono text-[#00FF41] uppercase tracking-wider">Schedule Description</span>
          </div>
          <p className="text-base font-mono font-bold text-[#F9F9F9] leading-relaxed">
            {translation}
          </p>
        </div>

        {/* Expression breakdown */}
        {cron.trim().split(/\s+/).length === 5 && translation !== 'Invalid cron expression — must have exactly 5 fields.' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'].map((label, idx) => {
              const val = cron.trim().split(/\s+/)[idx] || '*'
              return (
                <div key={label} className="border border-[#333333] p-3 text-center">
                  <div className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">{label}</div>
                  <div className="text-lg font-bold font-mono text-[#00FF41]">{val}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Next fire times (approximate) */}
        {nextTimes.length > 0 && translation !== 'Invalid cron expression — must have exactly 5 fields.' && (
          <div className="border border-[#333333] p-4">
            <div className="flex items-center gap-2 mb-3 border-b border-[#1a1a1a] pb-2">
              <Calendar className="h-4 w-4 text-[#fbbf24]" />
              <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Approximate Next Fire Times</span>
            </div>
            <div className="space-y-1.5">
              {nextTimes.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono text-[#888888]">
                  <ChevronRight className="h-3 w-3 text-[#555555]" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-mono text-[#555555] mt-3 italic">* Estimates for simple patterns. Actual times depend on the scheduler implementation.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
