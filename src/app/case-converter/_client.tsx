'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'

interface CaseOption {
  key: string
  label: string
  description: string
  convert: (text: string) => string
}

const CASE_OPTIONS: CaseOption[] = [
  {
    key: 'camel',
    label: 'camelCase',
    description: 'myVariableName',
    convert: t => {
      const words = extractWords(t)
      if (words.length === 0) return ''
      return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    },
  },
  {
    key: 'pascal',
    label: 'PascalCase',
    description: 'MyVariableName',
    convert: t => extractWords(t).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
  },
  {
    key: 'snake',
    label: 'snake_case',
    description: 'my_variable_name',
    convert: t => extractWords(t).map(w => w.toLowerCase()).join('_'),
  },
  {
    key: 'kebab',
    label: 'kebab-case',
    description: 'my-variable-name',
    convert: t => extractWords(t).map(w => w.toLowerCase()).join('-'),
  },
  {
    key: 'upper',
    label: 'UPPER_CASE',
    description: 'MY_VARIABLE_NAME',
    convert: t => extractWords(t).map(w => w.toUpperCase()).join('_'),
  },
  {
    key: 'lower',
    label: 'lower_case',
    description: 'my_variable_name',
    convert: t => extractWords(t).map(w => w.toLowerCase()).join('_'),
  },
  {
    key: 'title',
    label: 'Title Case',
    description: 'My Variable Name',
    convert: t => extractWords(t).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  },
  {
    key: 'dot',
    label: 'dot.case',
    description: 'my.variable.name',
    convert: t => extractWords(t).map(w => w.toLowerCase()).join('.'),
  },
  {
    key: 'constant',
    label: 'CONSTANT_CASE',
    description: 'MY_VARIABLE_NAME',
    convert: t => extractWords(t).map(w => w.toUpperCase()).join('_'),
  },
  {
    key: 'path',
    label: 'path/case',
    description: 'my/variable/name',
    convert: t => extractWords(t).map(w => w.toLowerCase()).join('/'),
  },
]

function extractWords(text: string): string[] {
  // Split on: camelCase boundaries, underscores, hyphens, spaces, dots, slashes
  const cleaned = text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase boundaries
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // consecutive caps before lowercase
    .replace(/[_\-\s.\/\\]+/g, ' ') // separators to spaces
    .trim()
  if (!cleaned) return []
  return cleaned.split(/\s+/).filter(Boolean)
}

const SAMPLE_TEXTS = [
  'helloWorldExample',
  'my-variable-name',
  'user_first_name',
  'ProductListComponent',
  'CONFIG_SETTINGS_VALUE',
  'convert this text',
]

export default function CaseConverter() {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [activeCase, setActiveCase] = useState('camel')

  const result = useMemo(() => {
    if (!input.trim()) return ''
    const option = CASE_OPTIONS.find(o => o.key === activeCase)
    if (!option) return ''
    return option.convert(input)
  }, [input, activeCase])

  const copyResult = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast('Copied!', 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = result
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast('Copied!', 'success')
    }
  }, [result, toast])

  const loadSample = (text: string) => {
    setInput(text)
  }

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What is a Case Converter?</strong> A case converter transforms text
        between different naming conventions used in programming. Developers frequently need to convert between
        styles like camelCase (JavaScript variables), snake_case (Python, database columns), kebab-case
        (CSS classes, URLs), and PascalCase (React components, C# classes).
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Why do naming conventions matter?</strong> Consistent naming
        conventions improve code readability and maintainability. Most programming languages have established
        conventions — camelCase for JavaScript/TypeScript variables, snake_case for Python and Ruby,
        PascalCase for class names in many languages. Converting between them is a common task when
        migrating code between languages or following different style guides.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">How it works.</strong> Type or paste text in any format — camelCase,
        snake_case, kebab-case, or plain words — and select your target case. The converter intelligently
        detects word boundaries by looking at capital letters, underscores, hyphens, and spaces. Results
        update instantly as you type.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'When should I use camelCase vs snake_case?',
      answer: 'camelCase is standard in JavaScript, TypeScript, and Java for variable and function names. snake_case is standard in Python, Ruby, PHP (mostly), and database column names. PascalCase is used for class names across many languages including TypeScript, C#, and Java. kebab-case is used in CSS class names, HTML attributes, and URLs.',
    },
    {
      question: 'Can I convert entire code files?',
      answer: 'This tool works best for individual identifiers and variable names. Converting entire code files requires understanding language syntax and scope. However, you can convert one identifier at a time or use the tool alongside find-replace in your editor.',
    },
    {
      question: 'Does it handle acronyms correctly?',
      answer: 'The converter does its best with common patterns. For example, "parseJSONData" becomes "parse_json_data" in snake_case. However, ambiguous acronyms like "XMLParser" could become "x_m_l_parser" rather than "xml_parser" depending on context. Reviewing the output for acronym-heavy input is recommended.',
    },
    {
      question: 'What is CONSTANT_CASE used for?',
      answer: 'CONSTANT_CASE (also called SCREAMING_SNAKE_CASE) is used for constants and environment variables in many languages. Examples include API_KEY, MAX_RETRY_COUNT, NODE_ENV. It is the standard convention for global constants in JavaScript, Python, and Go.',
    },
    {
      question: 'Does this tool work with non-English text?',
      answer: 'Yes, the converter works with any Unicode text. It splits on word boundaries detected by capital letters, underscores, hyphens, spaces, dots, and slashes. Non-English characters are preserved as-is through the conversion.',
    },
  ]

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between camelCase, snake_case, kebab-case, PascalCase, UPPER_CASE, Title Case, and more. Free online developer case converter with instant results."
      toolSlug="case-converter"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; input</span>
            <div className="flex gap-2 flex-wrap">
              {SAMPLE_TEXTS.map(t => (
                <button
                  key={t}
                  onClick={() => loadSample(t)}
                  className="text-[9px] md:text-[10px] font-mono text-[#555555] hover:text-[#00FF41]/60 transition-colors"
                >
                  [&gt; {t}]
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste text to convert..."
            rows={3}
            className="w-full bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-xs md:text-sm p-3 rounded focus:outline-none focus:border-[#00FF41]/50 placeholder:text-[#555555] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Case options grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
          {CASE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setActiveCase(opt.key)}
              className={`text-left p-2 rounded border font-mono transition-colors ${
                activeCase === opt.key
                  ? 'bg-[#00FF41]/10 border-[#00FF41]/40'
                  : 'bg-[#0A0A0A] border-[#333333] hover:border-[#555555]'
              }`}
            >
              <div className="text-[10px] md:text-xs text-[#F9F9F9] font-semibold">{opt.label}</div>
              <div className="text-[8px] md:text-[9px] text-[#555555] mt-0.5 break-all">{opt.description}</div>
            </button>
          ))}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; output</span>
            <button
              onClick={copyResult}
              disabled={!result}
              className="terminal-btn text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="green-chevron">&gt;</span> Copy
            </button>
          </div>
          <pre className="bg-[#0A0A0A] border border-[#00FF41]/20 text-[#F9F9F9] font-mono text-xs md:text-sm p-3 rounded overflow-x-auto min-h-[2.5rem]">
            {result || <span className="text-[#555555]">Result will appear here...</span>}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
