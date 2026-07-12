'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

type CronField = { value: string; label: string; options: { value: string; label: string }[] }

const MINUTE_OPTS = Array.from({ length: 60 }, (_, i) => ({ value: String(i), label: String(i) }))
const HOUR_OPTS   = Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: String(i) }))
const DOM_OPTS    = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
const MONTH_OPTS  = [
  { value: '1', label: 'January' },   { value: '2', label: 'February' },
  { value: '3', label: 'March' },      { value: '4', label: 'April' },
  { value: '5', label: 'May' },         { value: '6', label: 'June' },
  { value: '7', label: 'July' },        { value: '8', label: 'August' },
  { value: '9', label: 'September' },   { value: '10', label: 'October' },
  { value: '11', label: 'November' },   { value: '12', label: 'December' },
]
const DOW_OPTS = [
  { value: '0', label: 'Sunday' },   { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

const PRESETS: { label: string; cron: string; desc: string }[] = [
  { label: '@hourly',  cron: '0 * * * *',     desc: 'Every hour at minute 0' },
  { label: '@daily',   cron: '0 0 * * *',     desc: 'Every day at midnight' },
  { label: '@weekly',  cron: '0 0 * * 0',     desc: 'Every Sunday at midnight' },
  { label: '@monthly', cron: '0 0 1 * *',     desc: 'First day of every month at midnight' },
  { label: '@yearly',  cron: '0 0 1 1 *',     desc: 'January 1st at midnight' },
]

function cronToHuman(min: string, hour: string, dom: string, mon: string, dow: string): string {
  const parts = [min, hour, dom, mon, dow]
  if (parts.every(p => p === '*')) return 'Every minute'
  if (min !== '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*')
    return `Every hour at minute ${min}`
  if (min !== '*' && hour !== '*' && dom === '*' && mon === '*' && dow === '*')
    return `Every day at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
  if (min !== '*' && hour !== '*' && dom !== '*' && mon === '*' && dow === '*')
    return `Day ${dom} of every month at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
  if (min !== '*' && hour !== '*' && dom === '*' && mon === '*' && dow !== '*') {
    const dayName = DOW_OPTS.find(d => d.value === dow)?.label ?? dow
    return `Every ${dayName} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
  }
  if (min !== '*' && hour !== '*' && dom !== '*' && mon !== '*' && dow === '*') {
    const monName = MONTH_OPTS.find(m => m.value === mon)?.label ?? mon
    return `${monName} ${dom} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
  }
  const bits: string[] = []
  if (min !== '*') bits.push(`minute ${min}`)
  if (hour !== '*') bits.push(`hour ${hour}`)
  if (dom !== '*') bits.push(`day ${dom}`)
  if (mon !== '*') bits.push(`month ${mon}`)
  if (dow !== '*') bits.push(`weekday ${dow}`)
  return bits.length ? bits.join(', ') : 'Every minute'
}

function CronCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="terminal-btn"
    >
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
    </button>
  )
}

const faq = [
  {
    question: 'What does a cron expression look like?',
    answer: 'A cron expression has 5 fields separated by spaces: minute (0-59), hour (0-23), day-of-month (1-31), month (1-12 or JAN-DEC), and day-of-week (0-6 or SUN-SAT). An asterisk (*) means "every." For example, "30 9 * * 1-5" means "at 9:30 AM, Monday through Friday."'
  },
  {
    question: 'How do I run a job every 15 minutes?',
    answer: 'Use "*/15 * * * *" -- the */15 in the minute field means "every 15 minutes." Similarly, "*/30 * * * *" runs every 30 minutes, and "0 */2 * * *" runs every 2 hours at the top of the hour.'
  },
  {
    question: 'What is the difference between @daily and @weekly?',
    answer: '@daily runs at midnight (0 0 * * *) every day. @weekly runs at midnight every Sunday (0 0 * * 0). @monthly runs at midnight on the 1st of every month (0 0 1 * *). Use the preset buttons above to see the expanded expression for each shortcut.'
  },
  {
    question: 'Can I schedule a job for specific days of the week?',
    answer: 'Yes -- use the Day of Week field (0-6, where 0 = Sunday). Use commas for specific days: "0 9 * * 1,3,5" means 9 AM Monday, Wednesday, and Friday. Use hyphens for ranges: "0 9 * * 1-5" means weekdays at 9 AM. You can also combine Day of Month and Day of Week, though this can create confusing schedules.'
  },
  {
    question: 'What does "*/5" mean in a cron field?',
    answer: 'The forward slash (/) is the step operator. "*/5" in the minute field means "every 5 minutes" (0, 5, 10, 15...). In the hour field, "*/3" means "every 3 hours" (0, 3, 6, 9...). Steps can also start from a specific value: "10-59/5" means "starting at minute 10, every 5 minutes until minute 59."'
  }
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Cron Expression Builder -- Visual Scheduler</h2>
    <p className="text-[#888888] font-mono"><strong>A cron expression</strong> is a string of five fields that defines a schedule: minute, hour, day of month, month, and day of week. This tool lets you build cron expressions visually by selecting values for each field, with instant human-readable translation so you always know what your schedule means.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p className="text-[#888888] font-mono">Each of the five fields accepts either a specific value, a range (hyphen), a list (comma), a step value (forward slash), or an asterisk meaning "every." The minute field accepts 0-59, hour accepts 0-23, day-of-month accepts 1-31, month accepts 1-12, and day-of-week accepts 0-6 where 0 is Sunday.</p>
  </div>
)

export default function CronExpressionBuilderPage() {
  const [min, setMin] = useState('0')
  const [hour, setHour] = useState('*')
  const [dom, setDom] = useState('*')
  const [mon, setMon] = useState('*')
  const [dow, setDow] = useState('*')

  const expression = `${min} ${hour} ${dom} ${mon} ${dow}`
  const humanReadable = useMemo(() => cronToHuman(min, hour, dom, mon, dow), [min, hour, dom, mon, dow])

  const applyPreset = useCallback((cron: string) => {
    const [m, h, d, mo, w] = cron.split(' ')
    setMin(m); setHour(h); setDom(d); setMon(mo); setDow(w)
  }, [])

  const selectOptions = [
    { id: 'minute', label: 'Minute', value: min, set: setMin, opts: [{ value: '*', label: 'Every' }, ...MINUTE_OPTS] },
    { id: 'hour', label: 'Hour', value: hour, set: setHour, opts: [{ value: '*', label: 'Every' }, ...HOUR_OPTS] },
    { id: 'dom', label: 'Day of Month', value: dom, set: setDom, opts: [{ value: '*', label: 'Every' }, ...DOM_OPTS] },
    { id: 'month', label: 'Month', value: mon, set: setMon, opts: [{ value: '*', label: 'Every' }, ...MONTH_OPTS] },
    { id: 'dow', label: 'Day of Week', value: dow, set: setDow, opts: [{ value: '*', label: 'Every' }, ...DOW_OPTS] },
  ]

  return (
    <ToolLayout
      title="Cron Expression Builder"
      description="Build cron expressions visually with human-readable translations. Free online cron scheduler for developers."
      toolSlug="cron-expression-builder"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-6 font-mono">
        {/* Presets */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.cron)}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> {p.label}]
              </button>
            ))}
          </div>
        </div>

        {/* Field selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {selectOptions.map(f => (
            <div key={f.id}>
              <label className="block text-[10px] font-mono text-[#888888] mb-1.5 uppercase tracking-wider">{f.label}</label>
              <select
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="w-full px-2 py-2.5 text-xs font-mono bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] outline-none focus:border-2 focus:border-[#00FF41] transition-none"
              >
                {f.opts.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="border border-[#F9F9F9] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Cron Expression</span>
            <CronCopyButton text={expression} />
          </div>
          <div className="px-4 py-3 border border-[#333333]">
            <code className="text-lg font-mono font-bold text-[#00FF41]">{expression}</code>
          </div>
          <div className="px-4 py-3 border border-[#00FF41]">
            <p className="text-xs font-mono text-[#00FF41]">
              <span className="font-bold">Human readable:</span> {humanReadable}
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
