'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function ReportBugPage() {
  const { toast } = useToast()
  const [form, setForm] = useState({
    type: 'bug',
    tool: '',
    subject: '',
    description: '',
    email: '',
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    // Simulate sending (in production, this would POST to an API)
    await new Promise(r => setTimeout(r, 1000))

    toast('Report submitted. Thank you!', 'success')
    setSending(false)
    setForm({ type: 'bug', tool: '', subject: '', description: '', email: '' })
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 space-y-10 max-w-3xl">
        {/* Page header */}
        <div className="space-y-4 border-b border-[#333333] pb-6">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F9F9F9] leading-none tracking-tight">
            <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> REPORT BUG
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
            <span className="text-[#555555]">#</span> Help us improve KRUMB.DEV by reporting issues, suggesting features, or sharing feedback.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs md:text-sm">
          {/* Type selection */}
          <div className="space-y-2">
            <label className="block text-[#F9F9F9] uppercase tracking-wider text-xs">
              [ <span className="text-[#00FF41]">&gt;</span> Report Type ]
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'bug', label: 'Bug Report' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'feedback', label: 'General Feedback' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                  className={`terminal-btn ${form.type === opt.value ? 'text-[#F9F9F9]' : ''}`}
                >
                  {form.type === opt.value ? (
                    <>[<span className="green-chevron">&gt;</span> {opt.label}]</>
                  ) : (
                    <>[{opt.label}]</>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tool selection */}
          <div className="space-y-2">
            <label htmlFor="tool" className="block text-[#F9F9F9] uppercase tracking-wider text-xs">
              [ <span className="text-[#00FF41]">&gt;</span> Affected Tool (optional) ]
            </label>
            <input
              id="tool"
              type="text"
              value={form.tool}
              onChange={(e) => setForm(f => ({ ...f, tool: e.target.value }))}
              placeholder="e.g. JWT Decoder, JSON Formatter..."
              className="w-full bg-transparent border-b border-[#333333] focus:border-[#00FF41] text-[#F9F9F9] font-mono text-sm py-2 outline-none caret-[#00FF41] placeholder-[#555555] transition-none"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-[#F9F9F9] uppercase tracking-wider text-xs">
              [ <span className="text-[#00FF41]">&gt;</span> Subject ]
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              required
              placeholder="Brief summary of the issue..."
              className="w-full bg-transparent border-b border-[#333333] focus:border-[#00FF41] text-[#F9F9F9] font-mono text-sm py-2 outline-none caret-[#00FF41] placeholder-[#555555] transition-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-[#F9F9F9] uppercase tracking-wider text-xs">
              [ <span className="text-[#00FF41]">&gt;</span> Description ]
            </label>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              required
              placeholder="Describe the issue in detail. What did you expect to happen? What actually happened?"
              className="w-full bg-transparent border border-[#333333] focus:border-[#00FF41] text-[#F9F9F9] font-mono text-sm p-3 outline-none caret-[#00FF41] placeholder-[#555555] transition-none resize-vertical"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[#F9F9F9] uppercase tracking-wider text-xs">
              [ <span className="text-[#00FF41]">&gt;</span> Email (optional) ]
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="For follow-up questions..."
              className="w-full bg-transparent border-b border-[#333333] focus:border-[#00FF41] text-[#F9F9F9] font-mono text-sm py-2 outline-none caret-[#00FF41] placeholder-[#555555] transition-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!form.subject || !form.description || sending}
              className="terminal-btn"
            >
              {sending ? (
                <>[<span className="green-chevron">&gt;</span> <span className="animate-pulse">Sending...</span>]</>
              ) : (
                <>[<span className="green-chevron">&gt;</span> Submit Report]</>
              )}
            </button>
          </div>
        </form>

        {/* Terminal footer */}
        <div className="border-t border-[#333333] pt-6">
          <p className="font-mono text-[10px] text-[#555555]">
            <span className="text-[#444444]">$</span> Your report helps us make KRUMB.DEV better.
          </p>
        </div>
      </div>
    </div>
  )
}
