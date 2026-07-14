'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, AlertCircle, Sparkles, Code, Search } from 'lucide-react'

interface PatternResult {
  pattern: string
  flags: string
  label: string
  matches: string[]
  error: string
}

// ─── Pattern Detection Strategies ────────────────────────────

const PATTERN_STRATEGIES: Array<{
  name: string
  detect: (targets: string[]) => string | null
  label: string
}> = [
  {
    name: 'Email',
    label: 'Email Address Pattern',
    detect: (targets) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (targets.every(t => emailRegex.test(t))) {
        // Generate a pattern that fits all targets
        return '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
      }
      return null
    },
  },
  {
    name: 'URL',
    label: 'URL Pattern',
    detect: (targets) => {
      const urlRegex = /^https?:\/\/[^\s]+$/
      if (targets.every(t => urlRegex.test(t))) {
        return 'https?:\\/\\/[^\\s]+'
      }
      return null
    },
  },
  {
    name: 'IPv4',
    label: 'IPv4 Address Pattern',
    detect: (targets) => {
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
      if (targets.every(t => ipRegex.test(t))) {
        return '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'
      }
      return null
    },
  },
  {
    name: 'Date (YYYY-MM-DD)',
    label: 'Date Pattern (YYYY-MM-DD)',
    detect: (targets) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (targets.every(t => dateRegex.test(t))) {
        return '\\d{4}-\\d{2}-\\d{2}'
      }
      return null
    },
  },
  {
    name: 'Phone (US)',
    label: 'US Phone Pattern',
    detect: (targets) => {
      const phoneRegex = /^[\d\s\-\(\)\+]{7,}$/
      if (targets.every(t => /^\d{10}$/.test(t.replace(/[\s\-\(\)]/g, '')))) {
        return '\\+?1?\\s*\\(?\\d{3}\\)?[-\\s.]?\\d{3}[-\\s.]?\\d{4}'
      }
      return null
    },
  },
  {
    name: 'Hex Color',
    label: 'Hex Color Pattern',
    detect: (targets) => {
      const hexRegex = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/
      if (targets.every(t => hexRegex.test(t))) {
        return '#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?'
      }
      return null
    },
  },
  {
    name: 'UUID',
    label: 'UUID Pattern',
    detect: (targets) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (targets.every(t => uuidRegex.test(t))) {
        return '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
      }
      return null
    },
  },
  {
    name: 'Numbers Only',
    label: 'Digits Pattern',
    detect: (targets) => {
      if (targets.every(t => /^\d+$/.test(t))) {
        const lengths = [...new Set(targets.map(t => t.length))]
        if (lengths.length === 1) return `\\d{${lengths[0]}}`
        const minL = Math.min(...lengths)
        const maxL = Math.max(...lengths)
        if (maxL === minL) return `\\d{${minL}}`
        return `\\d{${minL},${maxL}}`
      }
      return null
    },
  },
  {
    name: 'Uppercase Words',
    label: 'Uppercase Words Pattern',
    detect: (targets) => {
      if (targets.every(t => /^[A-Z]+$/.test(t))) {
        return '[A-Z]+'
      }
      return null
    },
  },
  {
    name: 'Lowercase Words',
    label: 'Lowercase Words Pattern',
    detect: (targets) => {
      if (targets.every(t => /^[a-z]+$/.test(t))) {
        return '[a-z]+'
      }
      return null
    },
  },
  {
    name: 'Alphanumeric',
    label: 'Alphanumeric Pattern',
    detect: (targets) => {
      if (targets.every(t => /^[a-zA-Z0-9]+$/.test(t))) {
        return '[a-zA-Z0-9]+'
      }
      return null
    },
  },
]

function escapeRegexLiteral(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildGeneralizedPattern(targets: string[]): string {
  if (targets.length === 0) return ''

  // For a single target, escape it as a literal
  if (targets.length === 1) {
    return escapeRegexLiteral(targets[0])
  }

  // Check if targets share a common prefix and suffix
  const shortest = [...targets].sort((a, b) => a.length - b.length)[0]

  let prefixLen = 0
  for (let i = 0; i < shortest.length; i++) {
    if (targets.every(t => t[i] === shortest[i])) prefixLen++
    else break
  }

  let suffixLen = 0
  for (let i = 1; i <= shortest.length; i++) {
    if (targets.every(t => t[t.length - i] === shortest[shortest.length - i])) suffixLen++
    else break
  }

  // Extract the varying middle parts
  const commonPrefix = shortest.slice(0, prefixLen)
  const commonSuffix = suffixLen > 0 ? shortest.slice(shortest.length - suffixLen) : ''
  const middleParts = targets.map(t => t.slice(prefixLen, t.length - (suffixLen > 0 ? suffixLen : 0)))

  // If all middle parts are digits
  if (middleParts.every(p => /^\d+$/.test(p))) {
    const escapedPrefix = escapeRegexLiteral(commonPrefix)
    const escapedSuffix = escapeRegexLiteral(commonSuffix)
    const lengths = middleParts.map(p => p.length)
    const minL = Math.min(...lengths)
    const maxL = Math.max(...lengths)
    const quantifier = minL === maxL ? `{${minL}}` : `{${minL},${maxL}}`
    return `${escapedPrefix}\\d${quantifier}${escapedSuffix}`
  }

  // If all middle parts are alphanumeric
  if (middleParts.every(p => /^[a-zA-Z0-9]+$/.test(p))) {
    const escapedPrefix = escapeRegexLiteral(commonPrefix)
    const escapedSuffix = escapeRegexLiteral(commonSuffix)
    return `${escapedPrefix}[a-zA-Z0-9]+${escapedSuffix}`
  }

  // If all middle parts look like words (letters only)
  if (middleParts.every(p => /^[a-zA-Z]+$/.test(p))) {
    const escapedPrefix = escapeRegexLiteral(commonPrefix)
    const escapedSuffix = escapeRegexLiteral(commonSuffix)
    return `${escapedPrefix}[a-zA-Z]+${escapedSuffix}`
  }

  // If the middle parts vary in length significantly, use .+
  if (new Set(middleParts.map(p => p.length)).size > 1) {
    const escapedPrefix = escapeRegexLiteral(commonPrefix)
    const escapedSuffix = escapeRegexLiteral(commonSuffix)
    return `${escapedPrefix}.+${escapedSuffix}`
  }

  // For same-length varying parts that don't fit categories, try alternation
  if (middleParts.length <= 5) {
    const escapedPrefix = escapeRegexLiteral(commonPrefix)
    const escapedSuffix = escapeRegexLiteral(commonSuffix)
    const alt = middleParts.map(p => escapeRegexLiteral(p)).join('|')
    return `${escapedPrefix}(?:${alt})${escapedSuffix}`
  }

  return escapeRegexLiteral(targets[0])
}

function generatePattern(targets: string[], flags: string): PatternResult {
  if (targets.length === 0 || (targets.length === 1 && targets[0] === '')) {
    return { pattern: '', flags: 'g', label: '', matches: [], error: 'Enter at least one target string to match.' }
  }

  // Try known patterns first
  for (const strategy of PATTERN_STRATEGIES) {
    const pattern = strategy.detect(targets)
    if (pattern) {
      return { pattern, flags: 'g', label: strategy.label, matches: targets, error: '' }
    }
  }

  // Fall back to generalized pattern
  const pattern = buildGeneralizedPattern(targets)
  return {
    pattern,
    flags: 'g',
    label: pattern.includes('|') ? 'Alternation Pattern' : 'Generalized Pattern',
    matches: targets,
    error: '',
  }
}

function testPattern(pattern: string, flags: string, testText: string): { matches: string[]; error: string; count: number } {
  if (!pattern) return { matches: [], error: '', count: 0 }
  try {
    const cleanFlags = flags.includes('g') ? flags : flags + 'g'
    const regex = new RegExp(pattern, cleanFlags)
    const matches = [...testText.matchAll(regex)].map(m => m[0]).filter((v, i, a) => a.indexOf(v) === i)
    return { matches, error: '', count: matches.length }
  } catch (e) {
    return { matches: [], error: (e as Error).message, count: 0 }
  }
}

const EXAMPLES = [
  {
    text: 'Contact support@example.com, john@test.org, or admin@company.co',
    targets: 'support@example.com\njohn@test.org\nadmin@company.co',
    label: 'Extract emails',
  },
  {
    text: 'Server IPs: 192.168.1.1, 10.0.0.5, 172.16.0.10',
    targets: '192.168.1.1\n10.0.0.5\n172.16.0.10',
    label: 'Extract IPs',
  },
  {
    text: 'Colors: #FF5733, #00FF41, #3498DB, #fff',
    targets: '#FF5733\n#00FF41\n#3498DB\n#fff',
    label: 'Extract hex colors',
  },
  {
    text: 'User IDs: USR-001, USR-042, USR-999',
    targets: 'USR-001\nUSR-042\nUSR-999',
    label: 'USR-XXX pattern',
  },
  {
    text: 'Events: 2026-07-10, 2026-08-15, 2027-01-01',
    targets: '2026-07-10\n2026-08-15\n2027-01-01',
    label: 'Extract dates',
  },
  {
    text: 'Orders: INV-1001, INV-1002, INV-1003, INV-2001',
    targets: 'INV-1001\nINV-1002\nINV-2001',
    label: 'Invoice pattern',
  },
]

const faq = [
  {
    question: 'How does the regex generator work?',
    answer: 'The tool analyzes the target strings you provide and tries multiple strategies to build a regex pattern that matches them. First, it checks if all targets match known patterns (email, URL, IP, phone, date, hex color, UUID, numbers, etc.). If a known pattern fits, it uses that. Otherwise, it analyzes common prefixes, suffixes, and character types (digits, letters, alphanumeric) to build a generalized pattern using quantifiers and alternation.',
  },
  {
    question: 'What if the generated regex does not match my text correctly?',
    answer: 'The generated pattern is a best-effort heuristic — it may not always capture every edge case. You can copy the pattern into our Regex Tester tool to refine it manually. Common adjustments include narrowing character classes ([a-z] instead of [a-zA-Z]), adjusting quantifiers ({2,4} instead of +), or adding anchors (^ and $) for exact string matching.',
  },
  {
    question: 'Can I generate a regex for text that has no obvious pattern?',
    answer: 'If your target strings vary arbitrarily with no shared structure (prefix, suffix, or character type), the tool falls back to escaping them as literals or building an alternation of all targets. For better results, provide more examples that show the underlying pattern. If the strings really are random, regex may not be the right tool — consider pattern matching with string methods instead.',
  },
  {
    question: 'How are the target strings matched against the test text?',
    answer: 'The tool uses the JavaScript RegExp engine to test the generated pattern against your test text with global flag (g). It shows which parts of the test text match the pattern, and lists the match count. This allows you to iteratively refine your target examples and see if the generated pattern captures everything you want.',
  },
  {
    question: 'Does this tool support regex flags?',
    answer: 'The generator produces patterns with the global (g) flag by default. You can change flags in the test panel. Common flags include i (case-insensitive), m (multiline), and s (dotAll). The flags only affect how the pattern is tested against the sample text — they do not affect the generation itself.',
  },
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Regex Generator &mdash; Create Patterns from Examples</h2>
    <p className="text-[#888888] font-mono"><strong>A regular expression generator</strong> creates a regex pattern from example text and target matches. Instead of learning regex syntax from scratch, provide the strings you want to match, and the tool infers the pattern automatically using multiple detection strategies and generalization algorithms.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How Pattern Detection Works</h3>
    <p className="text-[#888888] font-mono">The generator runs a series of detectors in priority order: email addresses, URLs, IPv4 addresses, dates, phone numbers, hex colors, UUIDs, and pure digit/letter patterns. If a detector confirms that all target strings match its criteria, it returns the appropriate regex. If no detector matches, the fallback algorithm finds common prefixes and suffixes, isolates the varying segment, and builds a character-class generalization with appropriate quantifiers.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Iterative Workflow</h3>
    <p className="text-[#888888] font-mono">The typical workflow is: (1) paste sample text into the test area, (2) enter the strings you want to match (one per line), (3) click Generate to see the pattern and test it against the text. If matches are over- or under-inclusive, adjust your target examples and regenerate. Once satisfied, copy the pattern to use in your code, or open it in the Regex Tester tool for further refinement.</p>
  </div>
)

export default function RegexGeneratorPage() {
  const [targetText, setTargetText] = useState('support@example.com\njohn@test.org')
  const [testText, setTestText] = useState('Contact support@example.com, john@test.org, or admin@company.co for help.')
  const [flags, setFlags] = useState('g')
  const [result, setResult] = useState<PatternResult | null>(null)
  const [testResult, setTestResult] = useState<{ matches: string[]; error: string; count: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const targetArray = useMemo(() =>
    targetText.split('\n').map(s => s.trim()).filter(Boolean),
    [targetText]
  )

  const handleGenerate = () => {
    const pattern = generatePattern(targetArray, flags)
    setResult(pattern)
    setTestResult(null)
  }

  const handleTest = () => {
    if (!result?.pattern) return
    const test = testPattern(result.pattern, flags, testText)
    setTestResult(test)
  }

  // Auto-test when result changes
  useMemo(() => {
    if (result?.pattern && testText) {
      const test = testPattern(result.pattern, flags, testText)
      setTestResult(test)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Regex Generator"
      description="Generate regular expression patterns from example text and target matches. Input sample text, specify what to match, and get a working regex pattern instantly."
      toolSlug="regex-generator"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-6 font-mono">

        {/* Examples */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Quick Examples</label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => { setTestText(ex.text); setTargetText(ex.targets) }}
                className="terminal-btn text-[10px]"
              >
                [<span className="green-chevron">&gt;</span> {ex.label}]
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Targets */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
                [ Target Strings (one per line) ]
              </label>
              <textarea
                value={targetText}
                onChange={e => setTargetText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
                placeholder="Enter the strings you want to match..."
              />
            </div>

            <button
              onClick={handleGenerate}
              className="terminal-btn w-full justify-center"
            >
              [<span className="green-chevron">&gt;</span> GENERATE PATTERN]
            </button>

            {result && (
              <div className="border border-[#00FF41] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Generated Pattern</span>
                  <button onClick={() => copy(result.pattern)} className="terminal-btn text-[10px]">
                    [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
                  </button>
                </div>
                <div className="px-4 py-3 border border-[#333333] bg-[#000000]">
                  <code className="text-base font-mono font-bold text-[#00FF41] break-all">{result.pattern || '(empty)'}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">Type:</span>
                  <span className="text-[10px] font-mono text-[#F9F9F9] border border-[#333333] px-2 py-0.5">{result.label}</span>
                  <span className="text-[10px] font-mono text-[#555555]">Target count: {result.matches.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Test */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
                [ Test / Sample Text ]
              </label>
              <textarea
                value={testText}
                onChange={e => setTestText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
                placeholder="Paste sample text to test the regex against..."
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">Flags</label>
                <input
                  type="text"
                  value={flags}
                  onChange={e => setFlags(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#333333] font-mono text-xs text-[#F9F9F9] bg-[#000000] outline-none focus:border-[#00FF41]"
                  placeholder="g, i, m"
                />
              </div>
              <button
                onClick={handleTest}
                disabled={!result?.pattern}
                className="terminal-btn mt-5"
              >
                [<span className="green-chevron">&gt;</span> TEST]
              </button>
            </div>

            {testResult && (
              <div className="space-y-3">
                {testResult.error ? (
                  <div className="p-3 border border-[#FF4444]/30 bg-[#0a0a0a] flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-[#FF4444] shrink-0 mt-0.5" />
                    <span className="text-xs font-mono text-[#FF4444]">{testResult.error}</span>
                  </div>
                ) : (
                  <>
                    <div className="border border-[#333333] p-3">
                      <label className="block text-[10px] font-mono text-[#555555] uppercase tracking-wider mb-2">
                        Pattern Matches
                      </label>
                      <div className="min-h-[40px] p-3 border border-[#1a1a1a] bg-[#000000] text-xs font-mono text-[#888888] max-h-[150px] overflow-y-auto">
                        {testResult.count > 0 ? (
                          testResult.matches.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 py-1 border-b border-[#1a1a1a] last:border-b-0">
                              <span className="text-[10px] text-[#555555] font-mono w-6">#{i + 1}</span>
                              <span className="text-[#00FF41] font-semibold break-all">{m}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[#555555]">No matches found. Try adjusting the pattern or test text.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 border border-[#00FF41]/20 bg-[#0a0a0a]">
                        <p className="text-[10px] font-mono text-[#00FF41] uppercase">Matches</p>
                        <p className="text-lg font-bold text-[#00FF41] font-mono">{testResult.count}</p>
                      </div>

                      <div className="flex-1 h-2 bg-[#1a1a1a] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#00FF41] transition-all duration-300"
                          style={{
                            width: `${targetArray.length > 0 ? Math.min(100, (testResult.count / targetArray.length) * 100) : 0}%`,
                            opacity: testResult.count >= targetArray.length ? 1 : 0.5,
                          }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-[#555555]">
                        {targetArray.length > 0
                          ? `${Math.min(testResult.count, targetArray.length)}/${targetArray.length} targets`
                          : ''}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* How it works summary */}
        {!result && (
          <div className="border border-dashed border-[#333333] p-6 text-center">
            <Sparkles className="h-6 w-6 text-[#fbbf24] mx-auto mb-3" />
            <p className="text-xs font-mono text-[#555555] max-w-md mx-auto leading-relaxed">
              Enter the strings you want to match (one per line), paste sample text below, then click &quot;GENERATE PATTERN&quot;.
              The tool will detect common patterns like emails, URLs, IPs, dates, and more.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
