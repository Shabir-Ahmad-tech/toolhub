'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5 } from 'uuid'

const NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const

type NamespaceType = keyof typeof NAMESPACES | 'Custom'

const isValidUuid = (str: string) => {
  const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  return regex.test(str)
}

const formatLabels = {
  newline: 'Newline',
  comma: 'Comma-separated',
  quotes: 'Quoted List',
  json: 'JSON Array',
}

const uuidFaq = [
  {
    question: 'What is the difference between UUID v1, v3, v4, and v5?',
    answer: 'UUID v1 is time-based and includes the MAC address. UUID v4 is random and most commonly used. UUID v3 and v5 are name-based (MD5 and SHA-1 respectively) - they generate the same UUID for the same input name, making them deterministic.'
  },
  {
    question: 'Are generated UUIDs truly unique?',
    answer: 'UUID v4 (random) has a negligible collision probability (1 in 2^122). UUID v1 includes timestamp and MAC address for guaranteed uniqueness. UUID v3/v5 are deterministic - the same name always produces the same UUID within a namespace.'
  },
  {
    question: 'Do my inputs get sent to a server when generating UUIDs?',
    answer: 'No. All UUID generation happens client-side using the uuid library. Your input names, namespaces, and generated UUIDs never leave your browser.'
  },
  {
    question: 'When should I use UUID v3 vs v5 for name-based generation?',
    answer: 'UUID v3 uses MD5 hashing and UUID v5 uses SHA-1 hashing. v5 is recommended over v3 because SHA-1 is more secure than MD5 for most purposes. Both produce the same UUID for the same namespace and name combination.'
  },
  {
    question: 'Can I use UUIDs as database primary keys?',
    answer: 'Yes, but be aware that UUID v1 and v4 can impact B-tree index performance compared to auto-increment integers, especially on large tables. UUID v7 is emerging as a better alternative for database indexing.'
  }
]

const uuidSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Generate UUIDs for Developers and Databases</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p className="text-[#888888] font-mono">A UUID (Universally Unique Identifier) is a 128-bit identifier standardized by RFC 4122. This tool generates v1 (time-based), v4 (random), and v3/v5 (name-based) UUIDs.</p>
  </div>
)

function UuidCopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="terminal-btn text-[10px]">
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
    </button>
  )
}

export default function UuidGeneratorClient() {
  const PRO_LIMIT = false
  const FREE_MAX_COUNT = 10
  const PRO_MAX_COUNT = 1000
  const maxAllowed = PRO_LIMIT ? PRO_MAX_COUNT : FREE_MAX_COUNT

  const [version, setVersion] = useState<'v1' | 'v3' | 'v4' | 'v5'>('v4')
  const [count, setCount] = useState<number>(5)
  const [namespaceType, setNamespaceType] = useState<NamespaceType>('DNS')
  const [customNamespace, setCustomNamespace] = useState<string>('')
  const [nameInput, setNameInput] = useState<string>('')
  const [separator, setSeparator] = useState<'newline' | 'comma' | 'quotes' | 'json'>('newline')
  const [uuids, setUuids] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [namespaceError, setNamespaceError] = useState<string | null>(null)
  const [viewTab, setViewTab] = useState<'list' | 'raw'>('list')

  const handleGenerate = () => {
    if (version === 'v3' || version === 'v5') {
      if (namespaceType === 'Custom') {
        const ns = customNamespace.trim()
        if (!ns) { setNamespaceError('Namespace UUID cannot be empty'); return }
        if (!isValidUuid(ns)) { setNamespaceError('Please enter a valid UUID format'); return }
      }
    }

    setGenerating(true)
    setTimeout(() => {
      const list: string[] = []
      const names = nameInput.split('\n').filter(n => n.trim() !== '')
      let nsUuid = ''
      if (version === 'v3' || version === 'v5') {
        nsUuid = namespaceType === 'Custom' ? customNamespace.trim() : NAMESPACES[namespaceType]
      }
      for (let i = 0; i < count; i++) {
        try {
          if (version === 'v1') list.push(uuidv1())
          else if (version === 'v4') list.push(uuidv4())
          else if (version === 'v3') {
            const currentName = names.length > 0 ? (i < names.length ? names[i] : `${names[0]}-${i}`) : `name-${i}`
            list.push(uuidv3(currentName, nsUuid))
          } else if (version === 'v5') {
            const currentName = names.length > 0 ? (i < names.length ? names[i] : `${names[0]}-${i}`) : `name-${i}`
            list.push(uuidv5(currentName, nsUuid))
          }
        } catch (err: any) {
          list.push(`Error: ${err?.message || err}`)
        }
      }
      setUuids(list)
      setGenerating(false)
    }, 150)
  }

  const getFormattedOutput = (list: string[], format: typeof separator) => {
    if (list.length === 0) return ''
    switch (format) {
      case 'comma': return list.join(', ')
      case 'quotes': return list.map(u => `"${u}"`).join(', ')
      case 'json': return JSON.stringify(list, null, 2)
      default: return list.join('\n')
    }
  }

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate random, time-based, or name-based UUIDs (v1, v3, v4, v5) online."
      toolSlug="uuid-generator"
      faq={uuidFaq}
      seoContent={uuidSeo}
    >
      <div className="space-y-6 font-mono">
        <div className="border border-[#F9F9F9] p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#F9F9F9] mb-1 uppercase tracking-wider">UUID Version</label>
              <select
                value={version}
                onChange={(e) => { setVersion(e.target.value as any); setNamespaceError(null) }}
                className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none"
              >
                <option value="v4">Version 4 (Random)</option>
                <option value="v1">Version 1 (Time-based)</option>
                <option value="v3">Version 3 (MD5 Name-based)</option>
                <option value="v5">Version 5 (SHA-1 Name-based)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#F9F9F9] mb-1 uppercase tracking-wider">Number of UUIDs</label>
              <input
                type="number"
                value={count}
                onChange={(e) => { const val = Number(e.target.value); setCount(Math.min(maxAllowed, Math.max(1, val))) }}
                min={1} max={maxAllowed}
                className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#F9F9F9] mb-1 uppercase tracking-wider">Output Format</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value as any)}
                className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none"
              >
                <option value="newline">Newline</option>
                <option value="comma">Comma (,)</option>
                <option value="quotes">Quotes (", ")</option>
                <option value="json">JSON Array ([...])</option>
              </select>
            </div>
          </div>

          {(version === 'v3' || version === 'v5') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#333333] pt-4">
              <div>
                <label className="block text-xs font-mono text-[#F9F9F9] mb-1 uppercase tracking-wider">Namespace</label>
                <select
                  value={namespaceType}
                  onChange={(e) => { setNamespaceType(e.target.value as NamespaceType); setNamespaceError(null) }}
                  className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none"
                >
                  <option value="DNS">DNS</option>
                  <option value="URL">URL</option>
                  <option value="OID">OID</option>
                  <option value="X500">X500</option>
                  <option value="Custom">Custom Namespace UUID</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#F9F9F9] mb-1 uppercase tracking-wider">Name Input</label>
                <textarea
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={namespaceType === 'DNS' ? 'example.com' : namespaceType === 'URL' ? 'https://example.com' : 'input-name'}
                  rows={1}
                  className="w-full px-4 py-2.5 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none min-h-[44px]"
                />
              </div>
            </div>
          )}

          {(version === 'v3' || version === 'v5') && namespaceType === 'Custom' && (
            <div className="border-t border-[#333333] pt-4">
              <label className="block text-xs font-mono text-[#F9F9F9] mb-1 uppercase tracking-wider">Custom Namespace UUID</label>
              <input
                type="text"
                value={customNamespace}
                onChange={(e) => {
                  const val = e.target.value
                  setCustomNamespace(val)
                  if (val.trim() === '') setNamespaceError('Namespace UUID cannot be empty')
                  else if (!isValidUuid(val.trim())) setNamespaceError('Please enter a valid UUID format')
                  else setNamespaceError(null)
                }}
                placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                className={`w-full px-4 py-3 bg-[#000000] border text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 transition-none ${namespaceError ? 'border-[#ff4444]' : 'border-[#F9F9F9] focus:border-[#00FF41]'}`}
              />
              {namespaceError && <p className="text-xs text-[#ff4444] mt-1">{namespaceError}</p>}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#333333]">
            <span className="text-[10px] font-mono text-[#555555]">
              {!PRO_LIMIT && `Bulk limit is ${FREE_MAX_COUNT} (Free) / ${PRO_MAX_COUNT} (Pro).`}
            </span>
            <button
              onClick={handleGenerate}
              disabled={generating || (namespaceType === 'Custom' && !!namespaceError && (version === 'v3' || version === 'v5'))}
              className="terminal-btn disabled:opacity-40 disabled:cursor-not-allowed"
            >
              [<span className="green-chevron">&gt;</span> Generate UUIDs]
            </button>
          </div>
        </div>

        {uuids.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-[#333333] p-4">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">UUIDs Generated</p>
                <p className="text-lg font-mono font-bold text-[#F9F9F9]">{uuids.length}</p>
              </div>
              <div className="border border-[#333333] p-4">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Version</p>
                <p className="text-lg font-mono font-bold text-[#F9F9F9]">{version.toUpperCase()}</p>
              </div>
              <div className="border border-[#333333] p-4">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Format</p>
                <p className="text-lg font-mono font-bold text-[#F9F9F9]">{formatLabels[separator]}</p>
              </div>
            </div>

            <div className="border border-[#F9F9F9] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333]">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewTab('list')}
                    className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-none cursor-pointer ${
                      viewTab === 'list' ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]' : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewTab('raw')}
                    className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-none cursor-pointer ${
                      viewTab === 'raw' ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]' : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
                    }`}
                  >
                    Raw / Formatted
                  </button>
                </div>
                <UuidCopyBtn text={getFormattedOutput(uuids, separator)} />
              </div>

              <div className="p-4">
                {viewTab === 'list' ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {uuids.map((uuid, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 border border-[#333333] hover:border-[#F9F9F9] transition-none group">
                        <span className="font-mono text-sm text-[#F9F9F9]">{uuid}</span>
                        <UuidCopyBtn text={uuid} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={getFormattedOutput(uuids, separator)}
                    rows={Math.min(15, Math.max(5, count))}
                    className="w-full p-3 font-mono text-sm text-[#F9F9F9] bg-[#000000] border border-[#333333] outline-none resize-y"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
