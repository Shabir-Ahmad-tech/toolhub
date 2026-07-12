'use client'

import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, AlertTriangle, Trash2, Code2, FileCode } from 'lucide-react'

const faq = [
  {
    question: 'What is JSON to TypeScript interface generation?',
    answer: 'This tool converts JSON objects into TypeScript type definitions. Instead of manually writing interfaces or type aliases for API responses, configuration files, or database records, you paste the JSON and the tool generates strongly-typed definitions with proper TypeScript types — string, number, boolean, arrays, nested objects, and nullable fields — saving time and eliminating manual errors.'
  },
  {
    question: 'How does the tool handle nested objects in JSON?',
    answer: 'Nested JSON objects are converted into separate TypeScript interfaces or type aliases with PascalCase names derived from their property keys. For example, a <code>profile</code> property containing an object becomes a dedicated <code>Profile</code> interface, and the parent references it by name. This keeps the generated types modular and readable, mirroring how you would write them by hand.'
  },
  {
    question: 'What happens with arrays — does it detect element types?',
    answer: 'The tool inspects every element in an array and determines the common type. Homogeneous arrays like <code>[1, 2, 3]</code> produce <code>number[]</code>. Arrays of objects with identical shape generate a single interface with <code>Array&lt;InterfaceName&gt;</code>. Mixed-type arrays produce union types like <code>(string | number)[]</code>. Empty arrays default to <code>unknown[]</code>.'
  },
  {
    question: 'What is the difference between <code>interface</code> and <code>type</code> output?',
    answer: 'TypeScript <code>interface</code> declarations are extensible (they can be augmented via declaration merging) and are the conventional choice for object shapes in many codebases. Type aliases with <code>type</code> cannot be reopened but can represent union types, tuples, and primitives. This tool lets you choose either style. When the root value is an array or a primitive, a <code>type</code> alias is used regardless because only <code>type</code> can represent non-object shapes directly.'
  },
  {
    question: 'Does the tool handle <code>null</code> values and optional fields?',
    answer: 'Yes. When the "Detect Optional Fields" option is enabled, any property whose value is <code>null</code> gets a <code>?</code> marker in the generated type (e.g., <code>middleName?: string</code>). The "Strict Mode" option sets the type of <code>null</code> values to the literal <code>null</code> type rather than <code>any</code>, producing more precise type definitions for rigorous codebases.'
  }
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">JSON to TypeScript Interface Generator</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      This tool converts arbitrary JSON documents into TypeScript type definitions — interfaces or type aliases —
      with proper type inference for strings, numbers, booleans, arrays, nested objects, and nullable fields.
      Developers use it to generate type definitions from API responses, configuration files, database records,
      or any structured data source, eliminating the repetitive and error-prone process of writing types by hand.
      The output is ready to paste directly into a <code className="text-[#00FF41] font-mono text-xs">.ts</code> file.
    </p>
    <h3 className="text-sm font-mono font-bold text-[#00FF41]">How It Works</h3>
    <p>
      The tool parses input JSON with <code className="text-[#00FF41] font-mono text-xs">JSON.parse()</code>, then walks the resulting
      JavaScript value tree recursively. For each object, it builds a fingerprint from its sorted property keys
      and their inferred TypeScript types — using <code className="text-[#00FF41] font-mono text-xs">typeof</code> for primitives,
      recursive descent for nested objects, and element-type analysis for arrays. Each unique object shape is
      emitted exactly once as a named interface or type alias (with PascalCase naming), and duplicate shapes
      share a single definition. Arrays are collapsed to the union of their element types, and the tool
      optionally marks <code className="text-[#00FF41] font-mono text-xs">null</code> values as optional properties with
      a <code className="text-[#00FF41] font-mono text-xs">?</code> modifier.
    </p>
    <h3 className="text-sm font-mono font-bold text-[#00FF41]">Worked Example</h3>
    <p>
      <strong>Input JSON:</strong>
    </p>
    <pre className="p-3 bg-[#1a1a1a] text-[#00FF41] text-xs font-mono overflow-x-auto border border-[#333333]">
{`{
  "id": 1,
  "name": "ToolHub API",
  "version": "2.0.0",
  "active": true,
  "endpoints": ["health", "users"],
  "config": {
    "maxRetries": 3,
    "timeout": 5000
  },
  "maintainers": [
    { "id": 101, "login": "dev1", "role": "admin" },
    { "id": 102, "login": "dev2", "role": "contributor" }
  ]
}`}</pre>
    <p>
      <strong>Generated TypeScript (interface mode):</strong>
    </p>
    <pre className="p-3 bg-[#1a1a1a] text-[#00FF41] text-xs font-mono overflow-x-auto border border-[#333333]">
{`interface Config {
  maxRetries: number;
  timeout: number;
}

interface Maintainer {
  id: number;
  login: string;
  role: string;
}

interface RootObject {
  id: number;
  name: string;
  version: string;
  active: boolean;
  endpoints: string[];
  config: Config;
  maintainers: Maintainer[];
}`}</pre>
    <p>
      The tool automatically split nested objects into separate <code className="text-[#00FF41] font-mono text-xs">Config</code> and
      <code className="text-[#00FF41] font-mono text-xs">Maintainer</code> interfaces, detected <code className="text-[#00FF41] font-mono text-xs">endpoints</code> as
      <code className="text-[#00FF41] font-mono text-xs">string[]</code>, and deduplicated the
      <code className="text-[#00FF41] font-mono text-xs">Maintainer</code> shape across both array elements.
    </p>
    <h3 className="text-sm font-mono font-bold text-[#00FF41]">Common Mistakes</h3>
    <ul className="pl-5 space-y-1 text-xs text-[#888888] list-disc">
      <li><strong>Invalid JSON input.</strong> The input must be valid JSON — trailing commas, single-quoted keys, or unquoted property names will cause a parse error.</li>
      <li><strong>Overly permissive <code>any</code> types.</strong> Without strict mode, mixed-type arrays and null values fall back to <code>any</code>. Enable strict mode and optional-field detection for more precise output.</li>
      <li><strong>Assuming singular naming.</strong> The tool derives interface names from property keys. A property named <code>items</code> produces an <code>Item</code> element type, but non-standard names may yield unexpected PascalCase results.</li>
    </ul>
  </div>
)

// ---------------------------------------------------------------------------
// Conversion logic
// ---------------------------------------------------------------------------

interface TransformOptions {
  rootName: string
  keyword: 'interface' | 'type'
  strictMode: boolean
  detectOptional: boolean
}

/**
 * Convert a JSON string to TypeScript type definitions.
 * Returns the generated code string, or an error message on failure.
 */
function jsonToTypescript(jsonStr: string, opts: TransformOptions): { code: string; error?: string } {
  let data: unknown

  try {
    data = JSON.parse(jsonStr)
  } catch (e) {
    return { code: '', error: (e as Error).message }
  }

  const outputParts: string[] = []
  const fingerprintRegistry = new Map<string, string>() // fingerprint -> type name
  const usedNames = new Set<string>()

  // ---- helpers ----------------------------------------------------------

  function uniqueName(base: string): string {
    const candidate = base || 'Anonymous'
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate)
      return candidate
    }
    let n = 1
    while (usedNames.has(`${candidate}${n}`)) {
      n++
    }
    usedNames.add(`${candidate}${n}`)
    return `${candidate}${n}`
  }

  function pascalCase(str: string): string {
    const clean = str
      .replace(/[-_ \.]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^[a-z]/g, (c) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9_$]/g, '')
    if (/^[0-9]/.test(clean)) return '_' + clean
    return clean || 'Anonymous'
  }

  function singularize(str: string): string {
    if (str.endsWith('ies') && str.length > 3) return str.slice(0, -3) + 'y'
    if (str.endsWith('ses') && str.length > 3) return str.slice(0, -2)
    if (str.endsWith('s') && !str.endsWith('ss') && str.length > 2) return str.slice(0, -1)
    return str
  }

  function needsQuotes(key: string): boolean {
    return /^[0-9]/.test(key) || /[^a-zA-Z0-9_$]/.test(key)
  }

  function formatPropKey(key: string): string {
    return needsQuotes(key) ? `'${key}'` : key
  }

  // ---- core type detection ----------------------------------------------

  function detectType(value: unknown, hint: string): string {
    // null / undefined
    if (value === null || value === undefined) {
      return opts.strictMode ? 'null' : 'any'
    }

    // primitives
    switch (typeof value) {
      case 'string':
        return 'string'
      case 'number':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'bigint':
        return 'bigint'
    }

    // array
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]'
      const elementTypes = new Set<string>()
      const elementHint = singularize(hint || 'item')
      for (const item of value) {
        elementTypes.add(detectType(item, elementHint))
      }
      const cleaned = Array.from(elementTypes).filter((t) => t !== 'undefined')
      if (cleaned.length === 0) return 'unknown[]'
      if (cleaned.length === 1) return `${cleaned[0]}[]`
      return `(${cleaned.join(' | ')})[]`
    }

    // object
    if (typeof value === 'object' && value !== null) {
      return defineType(value as Record<string, unknown>, hint || 'Anonymous')
    }

    return 'any'
  }

  function defineType(obj: Record<string, unknown>, name: string): string {
    const keys = Object.keys(obj)

    // Empty object
    if (keys.length === 0) return 'Record<string, unknown>'

    // First pass: detect types for all property values (side effect: generates sub-types)
    const props: Array<{ key: string; type: string }> = []
    for (const key of keys) {
      const value = obj[key]
      const tpe = detectType(value, pascalCase(key))
      props.push({ key, type: tpe })
    }

    // Build fingerprint from sorted key:type pairs
    const fingerprint = JSON.stringify(
      [...props]
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((p) => `${p.key}:${p.type}`)
    )

    // Deduplicate — same fingerprint gets same type name
    const existing = fingerprintRegistry.get(fingerprint)
    if (existing) return existing

    const typeName = uniqueName(pascalCase(name) || 'Anonymous')
    fingerprintRegistry.set(fingerprint, typeName)

    // Build property lines (keep original insertion order)
    const propertyLines: string[] = []
    for (const { key, type } of props) {
      const value = obj[key]
      const optional = opts.detectOptional && (value === null || value === undefined)
      const propKey = formatPropKey(key)
      propertyLines.push(`  ${propKey}${optional ? '?' : ''}: ${type};`)
    }

    const body = propertyLines.join('\n')

    if (opts.keyword === 'type') {
      outputParts.push(`type ${typeName} = {\n${body}\n};`)
    } else {
      outputParts.push(`interface ${typeName} {\n${body}\n}`)
    }

    return typeName
  }

  // ---- root dispatch ----------------------------------------------------

  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    defineType(data as Record<string, unknown>, opts.rootName)
  } else if (Array.isArray(data)) {
    // Root-level array — generate element type(s) and wrap with a type alias
    const elementHint = singularize(opts.rootName || 'RootObject')
    // Avoid naming collision between the element type and the root alias
    const elementName =
      elementHint && elementHint !== (opts.rootName || 'RootObject')
        ? elementHint
        : (opts.rootName || 'RootObject') + 'Element'
    const elementType = detectType(data, elementName)
    const rootAlias = uniqueName(opts.rootName || 'RootObject')
    outputParts.unshift(`type ${rootAlias} = ${elementType};`)
  } else {
    // Root-level primitive
    const tsType = detectType(data, opts.rootName)
    outputParts.push(`type ${opts.rootName || 'RootObject'} = ${tsType};`)
  }

  return { code: outputParts.join('\n\n') }
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_JSON = JSON.stringify(
  {
    id: 1,
    name: 'ToolHub API',
    version: '2.0.0',
    active: true,
    endpoints: ['health', 'users', 'projects'],
    config: {
      maxRetries: 3,
      timeout: 5000,
      debugMode: false
    },
    maintainers: [
      { id: 101, login: 'dev1', role: 'admin' },
      { id: 102, login: 'dev2', role: 'contributor' }
    ],
    metadata: null
  },
  null,
  2
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function JsonToTypescriptClient() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [rootName, setRootName] = useState('RootObject')
  const [keyword, setKeyword] = useState<'interface' | 'type'>('interface')
  const [strictMode, setStrictMode] = useState(false)
  const [detectOptional, setDetectOptional] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(() => {
    setError('')
    const result = jsonToTypescript(input, {
      rootName: rootName.trim() || 'RootObject',
      keyword,
      strictMode,
      detectOptional
    })
    if (result.error) {
      setError(result.error)
      setOutput('')
    } else {
      setOutput(result.code)
    }
  }, [input, rootName, keyword, strictMode, detectOptional])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
  }, [])

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON)
    setOutput('')
    setError('')
  }, [])

  return (
    <ToolLayout
      title="JSON to TypeScript Interface Generator"
      description="Convert JSON objects into TypeScript interfaces instantly. Paste JSON and get typed interfaces, enums, and nested type definitions."
      toolSlug="json-to-typescript"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-6">
        {/* Input section */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-mono text-[#F9F9F9] uppercase tracking-wider flex items-center gap-2">
              <FileCode size={14} />
              Input JSON
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLoadSample}
                className="terminal-btn text-[10px]"
              >
                [<span className="green-chevron">&gt;</span> Load Sample]
              </button>
              <button
                onClick={handleClear}
                className="terminal-btn text-[10px]"
              >
                [<span className="green-chevron">&gt;</span> Clear]
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError('')
            }}
            rows={12}
            placeholder='Paste your JSON here, e.g. { "name": "Hello", "count": 42 }'
            spellCheck={false}
            className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
          />
        </div>

        {/* Options section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-[#333333]">
          {/* Root name */}
          <div>
            <label className="block text-[10px] font-mono text-[#555555] uppercase tracking-wider mb-1">
              Root Name
            </label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="RootObject"
              className="w-full px-3 py-2 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-xs outline-none focus:border-[#00FF41] transition-none placeholder-[#555555]"
            />
          </div>

          {/* Keyword toggle */}
          <div>
            <label className="block text-[10px] font-mono text-[#555555] uppercase tracking-wider mb-1">
              Output Style
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setKeyword('interface')}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-none ${
                  keyword === 'interface'
                    ? 'bg-[#F9F9F9] text-[#000000]'
                    : 'bg-[#000000] text-[#555555] border border-[#333333] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
                }`}
              >
                Interface
              </button>
              <button
                onClick={() => setKeyword('type')}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-none ${
                  keyword === 'type'
                    ? 'bg-[#F9F9F9] text-[#000000]'
                    : 'bg-[#000000] text-[#555555] border border-[#333333] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
                }`}
              >
                Type
              </button>
            </div>
          </div>

          {/* Strict mode toggle */}
          <div>
            <label className="block text-[10px] font-mono text-[#555555] uppercase tracking-wider mb-1">
              Strict Mode
            </label>
            <button
              onClick={() => setStrictMode((p) => !p)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-none min-w-[56px] ${
                strictMode
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'bg-[#000000] text-[#555555] border border-[#333333] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
              }`}
            >
              {strictMode ? 'ON' : 'OFF'}
            </button>
            <p className="text-[9px] font-mono text-[#555555] mt-0.5 leading-tight">
              Replace <code className="text-[#888888]">any</code> with precise types
            </p>
          </div>

          {/* Optional fields toggle */}
          <div>
            <label className="block text-[10px] font-mono text-[#555555] uppercase tracking-wider mb-1">
              Optional Fields
            </label>
            <button
              onClick={() => setDetectOptional((p) => !p)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-none min-w-[56px] ${
                detectOptional
                  ? 'bg-[#F9F9F9] text-[#000000]'
                  : 'bg-[#000000] text-[#555555] border border-[#333333] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
              }`}
            >
              {detectOptional ? 'ON' : 'OFF'}
            </button>
            <p className="text-[9px] font-mono text-[#555555] mt-0.5 leading-tight">
              <code className="text-[#888888]">null</code> values get <code className="text-[#888888]">?</code>
            </p>
          </div>
        </div>

        {/* Generate button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> Generate]
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3.5 border border-[#FF4444] text-[#FF4444] font-mono text-xs flex items-start gap-2.5">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            <span className="whitespace-pre-wrap">Invalid JSON: {error}</span>
          </div>
        )}

        {/* Output section */}
        {output && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider flex items-center gap-2">
                <Code2 size={14} />
                TypeScript Definitions
              </label>
              <button
                onClick={handleCopy}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span>{' '}
                {copied ? (
                  <span className="inline-flex items-center gap-1">
                    <Check size={12} /> Copied!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Copy size={12} /> Copy
                  </span>
                )}
                ]
              </button>
            </div>
            <pre className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#00FF41] font-mono text-sm outline-none overflow-x-auto min-h-[200px] max-h-[600px] overflow-y-auto leading-relaxed">
              <code>{output || ''}</code>
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
