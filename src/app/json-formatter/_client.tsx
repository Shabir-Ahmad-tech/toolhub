'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import {
  Copy,
  Download,
  Check,
  Trash2,
  Clock,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Play,
  Info,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { TerminalButton } from '@/components/ui/TerminalButton'

const jsonFaq = [
  {
    question: 'What is JSON and why format it?',
    answer: 'JSON (JavaScript Object Notation) is a lightweight data interchange format. Formatting makes JSON human-readable by adding proper indentation, which is essential for debugging, code reviews, and understanding nested structures.'
  },
  {
    question: 'What is JSON Schema validation?',
    answer: 'JSON Schema defines the structure and constraints of JSON data. It validates that JSON conforms to expected types, required properties, and value ranges. This tool validates against Draft 07/2020-12 schemas to ensure data integrity before processing.'
  },
  {
    question: 'Why am I seeing a JSON syntax error?',
    answer: 'Common JSON errors include trailing commas after the last property, using single quotes instead of double quotes, forgetting to quote property names, or having mismatched brackets. The formatter highlights the exact line and column where the error occurs.'
  },
  {
    question: 'What is the difference between JSON Schema Draft 07 and 2020-12?',
    answer: 'Draft 2020-12 introduced several changes: <code>$defs</code> replaces <code>definitions</code>, <code>prefixItems</code> replaces <code>items</code> tuple validation, <code>unevaluatedProperties</code> was added, and the meta-schema URI changed to <code>https://json-schema.org/draft/2020-12/schema</code>. This tool supports both drafts.'
  },
  {
    question: 'Does the schema validator support <code>$ref</code> and external references?',
    answer: 'The built-in validator handles inline validation rules — type checks, required properties, pattern matching, enumerations, and numeric bounds. For <code>$ref</code> resolution across multiple schema files, you would need a full schema registry, which is available in the Pro tier.'
  },
  {
    question: 'How do I use the Tree View?',
    answer: 'Switch to the Tree View tab and paste your JSON. The tree renders every node as a collapsible row. Click on <code>▶</code> to expand nested objects and arrays. Hover over any node and click <code>[> Copy Path]</code> to copy its JSON path (e.g. <code>$.users[0].name</code>).'
  },
  {
    question: 'How does the Compare mode work?',
    answer: 'Paste two JSON documents into the left and right textareas, then click <code>[> Compare]</code>. The tool parses both documents and highlights every difference using a line-level diff. Added lines appear in green, removed lines in red, and unchanged lines in the default colour.'
  }
]

const jsonSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">JSON Formatter &amp; Schema Validator</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      This tool formats, minifies, and validates JSON documents, with a separate schema validation mode that checks JSON payloads against JSON Schema Draft 07 and 2020-12 definitions. Developers use it for debugging API responses, validating configuration files, ensuring data integrity before processing, and catching structural errors that would otherwise surface at runtime.
    </p>
    <h3 className="text-sm font-mono font-bold text-[#00FF41]">How It Works</h3>
    <p>
      The formatter uses <code className="text-[#00FF41] font-mono text-xs">JSON.parse()</code> to validate syntax, then <code className="text-[#00FF41] font-mono text-xs">JSON.stringify(parsed, null, indent)</code> to produce prettified output. Minification uses the same approach with no whitespace.
    </p>
    <h3 className="text-sm font-mono font-bold text-[#00FF41]">Worked Example</h3>
    <p>
      <strong>Input (unformatted):</strong> <code className="text-[#00FF41] font-mono text-xs">{`{"name":"John","age":30,"city":"New York"}`}</code>. <strong>Format output (2-space indent):</strong>
    </p>
    <pre className="p-3 bg-[#1a1a1a] text-[#00FF41] text-xs font-mono overflow-x-auto border border-[#333333]">
{`{
  "name": "John",
  "age": 30,
  "city": "New York"
}`}</pre>
    <p>
      <strong>Schema validation example:</strong> The validator checks the JSON payload against the schema definition, returning any validation errors found.
    </p>
    <h3 className="text-sm font-mono font-bold text-[#00FF41]">Common Mistakes</h3>
    <ul className="pl-5 space-y-1 text-xs text-[#888888] list-disc">
      <li><strong>Trailing commas.</strong> JSON does not allow a comma after the last property.</li>
      <li><strong>Unquoted or single-quoted keys.</strong> JSON requires double-quoted property names.</li>
      <li><strong>Mixing JSON Schema drafts.</strong> Draft 2020-12 moved tuple validation from <code>items</code> to <code>prefixItems</code>.</li>
    </ul>
  </div>
)

// Hardcoded PRO_LIMIT for gating
const PRO_LIMIT = false
const FREE_HISTORY_LIMIT = 1

interface HistoryItem {
  id: string
  timestamp: string
  type: 'formatter' | 'schema'
  inputSnippet: string
  fullInput: string
  fullSchema?: string
}

// Validator templates
const TEMPLATES = [
  {
    name: 'Simple User Profile',
    payload: JSON.stringify({
      "name": "Jane Doe",
      "age": 28,
      "email": "jane.doe@example.com",
      "role": "admin",
      "tags": ["developer", "writer"]
    }, null, 2),
    schema: JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "User Profile",
      "type": "object",
      "required": ["name", "email", "age"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 2
        },
        "age": {
          "type": "integer",
          "minimum": 18,
          "maximum": 120
        },
        "email": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        "role": {
          "type": "string",
          "enum": ["admin", "user", "guest"]
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1
        }
      }
    }, null, 2)
  },
  {
    name: 'Product Catalog Item',
    payload: JSON.stringify({
      "id": 1024,
      "title": "Wireless Charging Pad",
      "price": 29.99,
      "stock": 150,
      "tags": ["electronics", "charger", "gadget"],
      "dimensions": {
        "length": 10.5,
        "width": 10.5,
        "height": 1.2
      }
    }, null, 2),
    schema: JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "Product Catalog Item",
      "type": "object",
      "required": ["id", "title", "price", "tags"],
      "properties": {
        "id": {
          "type": "integer"
        },
        "title": {
          "type": "string",
          "maxLength": 100
        },
        "price": {
          "type": "number",
          "minimum": 0.01
        },
        "stock": {
          "type": "integer",
          "minimum": 0
        },
        "tags": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "string"
          }
        },
        "dimensions": {
          "type": "object",
          "required": ["length", "width", "height"],
          "properties": {
            "length": { "type": "number", "minimum": 0 },
            "width": { "type": "number", "minimum": 0 },
            "height": { "type": "number", "minimum": 0 }
          }
        }
      }
    }, null, 2)
  },
  {
    name: 'Invalid Example (To Test Errors)',
    payload: JSON.stringify({
      "name": "J",
      "age": 15,
      "email": "not-an-email",
      "role": "super-user",
      "tags": []
    }, null, 2),
    schema: JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "User Profile",
      "type": "object",
      "required": ["name", "email", "age"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 2
        },
        "age": {
          "type": "integer",
          "minimum": 18,
          "maximum": 120
        },
        "email": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        "role": {
          "type": "string",
          "enum": ["admin", "user", "guest"]
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1
        }
      }
    }, null, 2)
  }
]

const SAMPLE_JSON = `{
  "name": "John Doe",
  "age": 30,
  "email": "john.doe@example.com",
  "isActive": true,
  "roles": ["admin", "developer"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipcode": "10001"
  }
}`

// ---- Helpers ---------------------------------------------------------------

/** Find the 1-based line number of a key path in a formatted JSON string. */
function findLineNumber(jsonStr: string, path: string): number | null {
  if (!path) return null
  // Get the last key segment (e.g. "name" from "$.user.name" or "users" from "$.users[0]")
  const lastSegment = path.replace(/\$\.?/, '').replace(/\[\d+\]/g, '').split('.').pop()
  if (!lastSegment) return null

  const lines = jsonStr.split('\n')
  // Search for the key at the start of an indented line:  "lastSegment":
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    // Match a JSON key: "key":
    if (trimmed.startsWith(`"${lastSegment}"`)) {
      return i + 1
    }
  }
  return null
}

/** Compute structural stats from a parsed JSON value. */
function computeStats(obj: any): { bytes: number; lines: number; depth: number; keys: number } | null {
  try {
    const formatted = JSON.stringify(obj, null, 2)
    const bytes = new TextEncoder().encode(formatted).length
    const lines = formatted.split('\n').length

    let maxDepth = 0
    let keyCount = 0

    function walk(val: any, depth: number) {
      maxDepth = Math.max(maxDepth, depth)
      if (val !== null && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (let i = 0; i < val.length; i++) {
            walk(val[i], depth + 1)
          }
        } else {
          for (const key in val) {
            if (Object.prototype.hasOwnProperty.call(val, key)) {
              keyCount++
              walk(val[key], depth + 1)
            }
          }
        }
      }
    }

    walk(obj, 1)
    return { bytes, lines, depth: maxDepth, keys: keyCount }
  } catch {
    return null
  }
}

// ---- Tree Node Component ---------------------------------------------------

function JsonTreeNode({ name, value, path, depth }: {
  name: string
  value: any
  path: string
  depth: number
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const [copied, setCopied] = useState(false)
  const [copiedPath, setCopiedPath] = useState(false)

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value)
  const isArray = Array.isArray(value)
  const isLeaf = !isObject && !isArray

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(path).catch(() => {})
    setCopiedPath(true)
    setTimeout(() => setCopiedPath(false), 1500)
  }

  const handleToggle = () => {
    setExpanded((prev) => !prev)
  }

  const getValueDisplay = (): string => {
    if (value === null) return 'null'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'number') return String(value)
    return ''
  }

  const getValueColor = (): string => {
    if (value === null) return '#888888'
    if (typeof value === 'string') return '#00FF41'
    if (typeof value === 'boolean') return '#FFD700'
    if (typeof value === 'number') return '#FF8C00'
    return '#F9F9F9'
  }

  if (isLeaf) {
    return (
      <div
        className="group flex items-center gap-1.5 py-0.5 hover:bg-[#1a1a1a] cursor-default"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <span className="text-[#00FF41] font-mono text-xs">{name}:</span>
        <span className="font-mono text-xs break-all" style={{ color: getValueColor() }}>
          {getValueDisplay()}
        </span>
        {copiedPath ? (
          <span className="ml-2 text-[10px] font-mono text-[#F9F9F9] px-1.5 py-0.5">Copied!</span>
        ) : (
          <button
            onClick={handleCopyPath}
            className="opacity-0 group-hover:opacity-100 ml-1 text-[10px] font-mono text-[#00FF41] border border-[#333333] px-1.5 py-0.5 transition-none cursor-pointer"
          >
            [<span className="green-chevron">&gt;</span> Copy Path]
          </button>
        )}
      </div>
    )
  }

  const entries = isObject ? Object.entries(value) : value.map((v: any, i: number) => [String(i), v])
  const isEmpty = entries.length === 0
  const openBracket = isArray ? '[' : '{'
  const closeBracket = isArray ? ']' : '}'
  const count = entries.length

  return (
    <div>
      <div
        className="group flex items-center gap-1.5 py-0.5 hover:bg-[#1a1a1a] cursor-pointer select-none"
        style={{ paddingLeft: `${depth * 20}px` }}
        onClick={handleToggle}
      >
        <span className="text-[#555555] font-mono text-xs shrink-0 w-3">
          {isEmpty ? '' : (expanded ? '▼' : '▶')}
        </span>
        <span className="text-[#00FF41] font-mono text-xs">{name}:</span>
        {isEmpty ? (
          <span className="text-[#888888] font-mono text-xs">{openBracket}{closeBracket}</span>
        ) : !expanded ? (
          <span className="text-[#888888] font-mono text-xs">
            {openBracket} {count} {count === 1 ? 'item' : 'items'} {closeBracket}
          </span>
        ) : (
          <span className="text-[#888888] font-mono text-xs">{openBracket}</span>
        )}
        {copiedPath ? (
          <span className="ml-2 text-[10px] font-mono text-[#F9F9F9] px-1.5 py-0.5">Copied!</span>
        ) : (
          <button
            onClick={handleCopyPath}
            className="opacity-0 group-hover:opacity-100 ml-1 text-[10px] font-mono text-[#00FF41] border border-[#333333] px-1.5 py-0.5 transition-none cursor-pointer"
          >
            [<span className="green-chevron">&gt;</span> Copy Path]
          </button>
        )}
      </div>
      {expanded && !isEmpty && (
        <div>
          {entries.map(([key, val]: [string, any]) => {
            const childName = isArray ? `[${key}]` : key
            const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`
            return (
              <JsonTreeNode
                key={childPath}
                name={childName}
                value={val}
                path={childPath}
                depth={depth + 1}
              />
            )
          })}
          <div
            className="text-[#555555] font-mono text-xs py-0.5"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {closeBracket}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- LCS Diff Algorithm ----------------------------------------------------

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineA: number | null
  lineB: number | null
}

function computeDiff(linesA: string[], linesB: string[]): DiffLine[] {
  const m = linesA.length
  const n = linesB.length

  // LCS table (optimized: only keep two rows)
  let prevRow = Array(n + 1).fill(0)
  const dpRows: number[][] = [prevRow.slice()]
  for (let i = 1; i <= m; i++) {
    const currRow = [0]
    for (let j = 1; j <= n; j++) {
      currRow[j] = linesA[i - 1] === linesB[j - 1]
        ? prevRow[j - 1] + 1
        : Math.max(prevRow[j], currRow[j - 1])
    }
    dpRows.push(currRow)
    prevRow = currRow
  }

  // Backtrack
  const result: DiffLine[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.unshift({ type: 'unchanged', content: linesA[i - 1], lineA: i, lineB: j })
      i--; j--
    } else if (j > 0 && (i === 0 || (dpRows[i]?.[j - 1] ?? 0) >= (dpRows[i - 1]?.[j] ?? 0))) {
      result.unshift({ type: 'added', content: linesB[j - 1], lineA: null, lineB: j })
      j--
    } else {
      result.unshift({ type: 'removed', content: linesA[i - 1], lineA: i, lineB: null })
      i--
    }
  }

  return result
}

// ---- Tab type --------------------------------------------------------------

type TabId = 'formatter' | 'tree' | 'compare' | 'schema'

// ---- Main Component --------------------------------------------------------

export default function JsonFormatterClient() {
  const [activeTab, setActiveTab] = useState<TabId>('formatter')

  // Formatter state
  const [input, setInput] = useState<string>('{"name": "John","age": 30,"city": "New York"}')
  const [beautifiedOutput, setBeautifiedOutput] = useState<string>('')
  const [minifiedOutput, setMinifiedOutput] = useState<string>('')
  const [displayMode, setDisplayMode] = useState<'beautified' | 'minified'>('beautified')
  const [error, setError] = useState<string>('')
  const [indent, setIndent] = useState<number>(2)
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)
  const [stats, setStats] = useState<{ bytes: number; lines: number; depth: number; keys: number } | null>(null)

  // Schema state
  const [schemaPayload, setSchemaPayload] = useState<string>(TEMPLATES[0].payload)
  const [schemaJson, setSchemaJson] = useState<string>(TEMPLATES[0].schema)
  const [schemaErrors, setSchemaErrors] = useState<string[]>([])
  const [schemaValid, setSchemaValid] = useState<boolean | null>(null)
  const [validationRun, setValidationRun] = useState<boolean>(false)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [copiedSchema, setCopiedSchema] = useState(false)

  // Tree View state
  const [treeInput, setTreeInput] = useState<string>('')
  const [treeParsed, setTreeParsed] = useState<any>(null)
  const [treeError, setTreeError] = useState<string>('')
  const [treeStats, setTreeStats] = useState<{ bytes: number; lines: number; depth: number; keys: number } | null>(null)

  // Compare state
  const [compareLeft, setCompareLeft] = useState<string>('')
  const [compareRight, setCompareRight] = useState<string>('')
  const [diffResult, setDiffResult] = useState<DiffLine[] | null>(null)
  const [diffError, setDiffError] = useState<string>('')
  const [diffRun, setDiffRun] = useState(false)

  // Common UI state
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showProUpgrade, setShowProUpgrade] = useState(false)

  // Root-level "Copied!" flag for tree view
  const [treeCopied, setTreeCopied] = useState(false)
  const [copiedTreeInput, setCopiedTreeInput] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('json_formatter_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  const addHistoryItem = (type: 'formatter' | 'schema', fullInput: string, fullSchema?: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      inputSnippet: fullInput.length > 50 ? fullInput.trim().slice(0, 50) + '...' : fullInput.trim(),
      fullInput,
      fullSchema
    }

    setHistory((prev) => {
      let updated = [newItem, ...prev]
      if (!PRO_LIMIT) {
        updated = updated.slice(0, FREE_HISTORY_LIMIT)
      } else {
        updated = updated.slice(0, 20)
      }
      localStorage.setItem('json_formatter_history', JSON.stringify(updated))
      return updated
    })
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('json_formatter_history')
  }

  const loadHistoryItem = (item: HistoryItem) => {
    if (item.type === 'formatter') {
      setActiveTab('formatter')
      setInput(item.fullInput)
      setBeautifiedOutput('')
      setMinifiedOutput('')
      setError('')
    } else {
      setActiveTab('schema')
      setSchemaPayload(item.fullInput)
      if (item.fullSchema) {
        setSchemaJson(item.fullSchema)
      }
      setValidationRun(false)
      setSchemaValid(null)
      setSchemaErrors([])
    }
  }

  // ---- Formatter handlers --------------------------------------------------

  const getDisplayOutput = useCallback(() => {
    return displayMode === 'beautified' ? beautifiedOutput : minifiedOutput
  }, [displayMode, beautifiedOutput, minifiedOutput])

  const formatOrMinify = (toMinify: boolean) => {
    try {
      const parsed = JSON.parse(input)
      const beautified = JSON.stringify(parsed, null, indent)
      const minified = JSON.stringify(parsed)
      setBeautifiedOutput(beautified)
      setMinifiedOutput(minified)
      setDisplayMode(toMinify ? 'minified' : 'beautified')
      setError('')
      setStats(computeStats(parsed))
      addHistoryItem('formatter', input)
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message)
      setBeautifiedOutput('')
      setMinifiedOutput('')
      setStats(null)
    }
  }

  const handleFormat = () => formatOrMinify(false)
  const handleMinify = () => formatOrMinify(true)

  const handleValidateJSON = () => {
    try {
      const parsed = JSON.parse(input)
      setError('')
      setBeautifiedOutput('✓ Valid JSON')
      setMinifiedOutput('✓ Valid JSON')
      setDisplayMode('beautified')
      setStats(computeStats(parsed))
      addHistoryItem('formatter', input)
    } catch (e) {
      setError('✗ Invalid JSON: ' + (e as Error).message)
      setBeautifiedOutput('')
      setMinifiedOutput('')
      setStats(null)
    }
  }

  /** Format-on-paste: auto-detect JSON paste and format immediately. */
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    const trimmed = pastedText.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        e.preventDefault()
        const formatted = JSON.stringify(parsed, null, indent)
        setInput(formatted)
        setError('')
      } catch {
        // Not valid JSON — let the normal paste through
      }
    }
  }

  const loadSampleFormatter = () => {
    setInput(SAMPLE_JSON)
    setBeautifiedOutput('')
    setMinifiedOutput('')
    setError('')
    setStats(null)
  }

  const handleCopyInput = () => {
    navigator.clipboard.writeText(input)
    setCopiedInput(true)
    setTimeout(() => setCopiedInput(false), 2000)
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(getDisplayOutput())
    setCopiedOutput(true)
    setTimeout(() => setCopiedOutput(false), 2000)
  }

  const triggerDownload = (content: string, filename: string) => {
    if (!PRO_LIMIT) {
      setShowProUpgrade(true)
      return
    }
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---- Schema handlers -----------------------------------------------------

  const handleValidateSchema = () => {
    setValidationRun(true)
    let parsedPayload: any
    let parsedSchema: any

    try {
      parsedPayload = JSON.parse(schemaPayload)
    } catch (e) {
      setSchemaErrors([`Invalid Payload JSON: ${(e as Error).message}`])
      setSchemaValid(false)
      return
    }

    try {
      parsedSchema = JSON.parse(schemaJson)
    } catch (e) {
      setSchemaErrors([`Invalid Schema JSON: ${(e as Error).message}`])
      setSchemaValid(false)
      return
    }

    const errors = validateJsonSchema(parsedPayload, parsedSchema)
    setSchemaErrors(errors)
    setSchemaValid(errors.length === 0)
    addHistoryItem('schema', schemaPayload, schemaJson)
  }

  const loadTemplate = (idx: number) => {
    if (idx < 0 || idx >= TEMPLATES.length) return
    setSchemaPayload(TEMPLATES[idx].payload)
    setSchemaJson(TEMPLATES[idx].schema)
    setValidationRun(false)
    setSchemaValid(null)
    setSchemaErrors([])
  }

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(schemaPayload)
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaJson)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2000)
  }

  // ---- Tree View handlers --------------------------------------------------

  const handleTreeParse = () => {
    if (!treeInput.trim()) {
      setTreeError('Paste some JSON first.')
      setTreeParsed(null)
      setTreeStats(null)
      return
    }
    try {
      const parsed = JSON.parse(treeInput)
      setTreeParsed(parsed)
      setTreeError('')
      setTreeStats(computeStats(parsed))
    } catch (e) {
      setTreeError('Invalid JSON: ' + (e as Error).message)
      setTreeParsed(null)
      setTreeStats(null)
    }
  }

  const handleTreePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    const trimmed = pastedText.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        e.preventDefault()
        const formatted = JSON.stringify(parsed, null, 2)
        setTreeInput(formatted)
        setTreeError('')
        setTreeParsed(parsed)
        setTreeStats(computeStats(parsed))
      } catch {
        // Let normal paste through
      }
    }
  }

  const loadTreeSample = () => {
    setTreeInput(SAMPLE_JSON)
    setTreeError('')
    try {
      const parsed = JSON.parse(SAMPLE_JSON)
      setTreeParsed(parsed)
      setTreeStats(computeStats(parsed))
    } catch {
      // Should not happen
    }
  }

  const handleClearTree = () => {
    setTreeInput('')
    setTreeParsed(null)
    setTreeError('')
    setTreeStats(null)
  }

  const handleCopyTreeInput = () => {
    navigator.clipboard.writeText(treeInput)
    setCopiedTreeInput(true)
    setTimeout(() => setCopiedTreeInput(false), 2000)
  }

  // ---- Compare handlers ----------------------------------------------------

  const handleCompare = () => {
    setDiffRun(true)
    setDiffError('')
    setDiffResult(null)

    const trimmedA = compareLeft.trim()
    const trimmedB = compareRight.trim()

    if (!trimmedA && !trimmedB) {
      setDiffError('Paste JSON into at least one of the textareas.')
      return
    }

    let parsedA: any, parsedB: any
    try {
      parsedA = parsedA !== undefined ? JSON.parse(trimmedA || '{}') : undefined
    } catch {
      setDiffError('Left JSON is invalid: ' + (() => {
        try { JSON.parse(trimmedA); return '' } catch (e) { return (e as Error).message }
      })())
      return
    }

    try {
      parsedB = JSON.parse(trimmedB || '{}')
    } catch (e) {
      setDiffError('Right JSON is invalid: ' + (e as Error).message)
      return
    }

    // Normalise to sorted-key output so whitespace differences are ignored
    const normalize = (val: any): any => {
      if (val === null || typeof val !== 'object') return val
      if (Array.isArray(val)) return val.map(normalize)
      return Object.keys(val).sort().reduce((acc: any, k) => {
        acc[k] = normalize(val[k])
        return acc
      }, {} as any)
    }

    const normA = normalize(trimmedA ? parsedA : {})
    const normB = normalize(parsedB)

    const strA = JSON.stringify(normA, null, 2)
    const strB = JSON.stringify(normB, null, 2)

    const linesA = strA.split('\n')
    const linesB = strB.split('\n')

    const diff = computeDiff(linesA, linesB)
    setDiffResult(diff)
  }

  const loadCompareSample = () => {
    const left = JSON.stringify({ name: 'Alice', age: 25, city: 'NY', role: 'admin' }, null, 2)
    const right = JSON.stringify({ name: 'Alice', age: 30, city: 'New York', role: 'user', active: true }, null, 2)
    setCompareLeft(left)
    setCompareRight(right)
    setDiffRun(false)
    setDiffResult(null)
    setDiffError('')
  }

  const handleCopyDiff = () => {
    if (!diffResult) return
    const text = diffResult.map((d) => {
      const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '
      return `${prefix} ${d.content}`
    }).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedOutput(true)
    setTimeout(() => setCopiedOutput(false), 2000)
  }

  // ---- Raw schema validation function (kept from original) -----------------

  // ---- Render helpers ------------------------------------------------------

  const tabButton = (tab: TabId, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 transition-none ${
        activeTab === tab
          ? 'border-[#00FF41] text-[#00FF41]'
          : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  const formatCount = diffResult
    ? diffResult.filter((d) => d.type !== 'unchanged').length
    : null

  const displayOutput = getDisplayOutput()

  return (
    <ToolLayout
      title="JSON Formatter & Schema Validator"
      description="Format, lint, minify JSON data, and validate your JSON payloads against Draft 07/2020-12 JSON Schema definitions client-side."
      toolSlug="json-formatter"
      faq={jsonFaq}
      seoContent={jsonSeo}
    >
      <div className="space-y-6">
        {/* Navigation Tabs — terminal style */}
        <div className="flex border-b border-[#333333] overflow-x-auto">
          {tabButton('formatter', 'Format', <FileCode size={16} />)}
          {tabButton('tree', 'Tree View', <FileCode size={16} />)}
          {tabButton('compare', 'Compare', <RefreshCw size={16} />)}
          {tabButton('schema', 'Schema Validator', <CheckCircle size={16} />)}
        </div>

        {/* Pro Alert — terminal style */}
        {showProUpgrade && (
          <div className="p-4 border border-[#333333] flex items-start gap-3">
            <Sparkles className="text-[#00FF41] shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <h4 className="font-mono text-xs font-bold text-[#F9F9F9]">Unlock Export Features</h4>
              <p className="text-[11px] font-mono text-[#888888] mt-0.5">
                Downloading validation reports and output files directly is a Pro feature. Use the Copy button to copy text for free.
              </p>
            </div>
            <button
              onClick={() => setShowProUpgrade(false)}
              className="terminal-btn text-[10px]"
            >
              [<span className="green-chevron">&gt;</span> Dismiss]
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* Tab 1: Formatter                                                   */}
        {/* ================================================================ */}
        {activeTab === 'formatter' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">Input JSON</label>
                <div className="flex gap-3">
                  <TerminalButton onClick={loadSampleFormatter}>
                    [<span className="green-chevron">&gt;</span> Load Sample]
                  </TerminalButton>
                  <TerminalButton onClick={handleCopyInput}>
                    [<span className="green-chevron">&gt;</span> {copiedInput ? 'Copied' : 'Copy'}]
                  </TerminalButton>
                  <TerminalButton onClick={() => setInput('')}>
                    [<span className="green-chevron">&gt;</span> Clear]
                  </TerminalButton>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                rows={10}
                placeholder="Paste your JSON content here..."
                className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">Tab Indent:</label>
                <select
                  value={indent}
                  onChange={(e) => setIndent(Number(e.target.value))}
                  className="px-2.5 py-1.5 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <TerminalButton onClick={handleFormat}>
                  [<span className="green-chevron">&gt;</span> Format]
                </TerminalButton>
                <TerminalButton onClick={handleMinify}>
                  [<span className="green-chevron">&gt;</span> Minify]
                </TerminalButton>
                <TerminalButton onClick={handleValidateJSON}>
                  [<span className="green-chevron">&gt;</span> Validate]
                </TerminalButton>
              </div>
            </div>

            {error && (
              <div className="p-3.5 border border-[#FF4444] text-[#FF4444] font-mono text-xs flex items-start gap-2.5">
                <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                <span className="whitespace-pre-wrap">{error}</span>
              </div>
            )}

            {(beautifiedOutput || minifiedOutput) && !error && (
              <div className="space-y-2">
                {/* Output mode tabs — Beautified / Minified */}
                <div className="flex items-center gap-6 border-b border-[#333333]">
                  <button
                    onClick={() => setDisplayMode('beautified')}
                    className={`pb-1.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-none ${
                      displayMode === 'beautified'
                        ? 'border-[#00FF41] text-[#00FF41]'
                        : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
                    }`}
                  >
                    Beautified
                  </button>
                  <button
                    onClick={() => setDisplayMode('minified')}
                    className={`pb-1.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-none ${
                      displayMode === 'minified'
                        ? 'border-[#00FF41] text-[#00FF41]'
                        : 'border-transparent text-[#555555] hover:text-[#F9F9F9]'
                    }`}
                  >
                    Minified
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                    Output Result
                  </label>
                  <div className="flex gap-2">
                    <TerminalButton onClick={handleCopyOutput}>
                      [<span className="green-chevron">&gt;</span> {copiedOutput ? 'Copied!' : 'Copy Result'}]
                    </TerminalButton>
                    <TerminalButton onClick={() => triggerDownload(displayOutput, 'formatted.json')}>
                      [<span className="green-chevron">&gt;</span> Download]
                    </TerminalButton>
                  </div>
                </div>
                <textarea
                  value={displayOutput}
                  readOnly
                  rows={10}
                  className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#00FF41] font-mono text-sm outline-none resize-none"
                />
                {/* Stats bar */}
                {stats && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 px-4 py-2 border border-[#333333] text-[11px] font-mono text-[#555555]">
                    <span>Bytes: <span className="text-[#F9F9F9]">{stats.bytes.toLocaleString()}</span></span>
                    <span>Lines: <span className="text-[#F9F9F9]">{stats.lines.toLocaleString()}</span></span>
                    <span>Depth: <span className="text-[#F9F9F9]">{stats.depth}</span></span>
                    <span>Keys: <span className="text-[#F9F9F9]">{stats.keys.toLocaleString()}</span></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* Tab 2: Tree View                                                    */}
        {/* ================================================================ */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                  JSON Input
                </label>
                <div className="flex gap-3">
                  <TerminalButton onClick={loadTreeSample}>
                    [<span className="green-chevron">&gt;</span> Load Sample]
                  </TerminalButton>
                  <TerminalButton onClick={handleCopyTreeInput}>
                    [<span className="green-chevron">&gt;</span> {copiedTreeInput ? 'Copied' : 'Copy'}]
                  </TerminalButton>
                  <TerminalButton onClick={handleClearTree}>
                    [<span className="green-chevron">&gt;</span> Clear]
                  </TerminalButton>
                </div>
              </div>
              <textarea
                value={treeInput}
                onChange={(e) => {
                  setTreeInput(e.target.value)
                  setTreeError('')
                }}
                onPaste={handleTreePaste}
                rows={8}
                placeholder="Paste JSON here to explore as a tree..."
                className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
              />
            </div>

            <div className="flex justify-end">
              <TerminalButton onClick={handleTreeParse}>
                [<span className="green-chevron">&gt;</span> Build Tree]
              </TerminalButton>
            </div>

            {treeError && (
              <div className="p-3.5 border border-[#FF4444] text-[#FF4444] font-mono text-xs flex items-start gap-2.5">
                <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                <span className="whitespace-pre-wrap">{treeError}</span>
              </div>
            )}

            {treeParsed && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                    Tree Explorer <span className="text-[#555555]">(hover for copy-path)</span>
                  </label>
                </div>
                <div className="p-4 border border-[#F9F9F9] bg-[#000000] max-h-[500px] overflow-y-auto">
                  {(() => {
                    if (treeParsed === null) return <span className="text-[#888888] font-mono text-xs">null</span>
                    const t = typeof treeParsed
                    if (t !== 'object' || treeParsed === null) {
                      let display = String(treeParsed)
                      if (t === 'string') display = `"${display}"`
                      const color = treeParsed === null ? '#888888' : t === 'string' ? '#00FF41' : t === 'boolean' ? '#FFD700' : '#FF8C00'
                      return (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <span className="text-[#00FF41] font-mono text-xs">$:</span>
                          <span className="font-mono text-xs" style={{ color }}>{display}</span>
                        </div>
                      )
                    }
                    return <JsonTreeNode name="$" value={treeParsed} path="$" depth={0} />
                  })()}
                </div>
                {/* Tree stats bar */}
                {treeStats && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 px-4 py-2 border border-[#333333] text-[11px] font-mono text-[#555555]">
                    <span>Bytes: <span className="text-[#F9F9F9]">{treeStats.bytes.toLocaleString()}</span></span>
                    <span>Lines: <span className="text-[#F9F9F9]">{treeStats.lines.toLocaleString()}</span></span>
                    <span>Depth: <span className="text-[#F9F9F9]">{treeStats.depth}</span></span>
                    <span>Keys: <span className="text-[#F9F9F9]">{treeStats.keys.toLocaleString()}</span></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* Tab 3: Compare                                                      */}
        {/* ================================================================ */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 border border-[#333333] p-3">
              <span className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">
                JSON Diff / Compare
              </span>
              <div className="flex gap-2">
                <TerminalButton onClick={loadCompareSample}>
                  [<span className="green-chevron">&gt;</span> Load Sample]
                </TerminalButton>
                <TerminalButton onClick={() => { setCompareLeft(''); setCompareRight(''); setDiffRun(false); setDiffResult(null); setDiffError('') }}>
                  [<span className="green-chevron">&gt;</span> Clear]
                </TerminalButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#F9F9F9] uppercase tracking-wider mb-1.5">
                  JSON A
                </label>
                <textarea
                  value={compareLeft}
                  onChange={(e) => { setCompareLeft(e.target.value); setDiffRun(false) }}
                  rows={10}
                  placeholder="Paste first JSON..."
                  className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#F9F9F9] uppercase tracking-wider mb-1.5">
                  JSON B
                </label>
                <textarea
                  value={compareRight}
                  onChange={(e) => { setCompareRight(e.target.value); setDiffRun(false) }}
                  rows={10}
                  placeholder="Paste second JSON..."
                  className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <TerminalButton onClick={handleCompare}>
                [<span className="green-chevron">&gt;</span> Compare]
              </TerminalButton>
            </div>

            {diffError && (
              <div className="p-3.5 border border-[#FF4444] text-[#FF4444] font-mono text-xs flex items-start gap-2.5">
                <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                <span className="whitespace-pre-wrap">{diffError}</span>
              </div>
            )}

            {diffRun && diffResult && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                    Diff Result
                    {formatCount !== null && (
                      <span className="text-[#555555] font-normal lowercase ml-2">
                        ({formatCount} {formatCount === 1 ? 'difference' : 'differences'} found)
                      </span>
                    )}
                  </label>
                  <TerminalButton onClick={handleCopyDiff}>
                    [<span className="green-chevron">&gt;</span> Copy Diff]
                  </TerminalButton>
                </div>

                {formatCount === 0 ? (
                  <div className="p-4 border border-[#00FF41] flex items-center gap-3">
                    <CheckCircle className="text-[#00FF41] shrink-0" size={18} />
                    <span className="font-mono text-xs text-[#00FF41]">No differences found &mdash; the JSON documents are identical.</span>
                  </div>
                ) : (
                  <div className="border border-[#F9F9F9] max-h-[500px] overflow-y-auto font-mono text-xs">
                    {diffResult.map((line, idx) => {
                      let bg = 'bg-[#000000]'
                      let textColor = '#F9F9F9'
                      let prefix = ' '
                      let prefixColor = '#555555'

                      if (line.type === 'added') {
                        bg = 'bg-[#0a2a0a]'
                        textColor = '#00FF41'
                        prefix = '+'
                        prefixColor = '#00FF41'
                      } else if (line.type === 'removed') {
                        bg = 'bg-[#2a0a0a]'
                        textColor = '#FF4444'
                        prefix = '-'
                        prefixColor = '#FF4444'
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex items-stretch ${bg}`}
                        >
                          <span className="text-[#555555] w-12 shrink-0 text-right pr-2 py-0.5 select-none border-r border-[#333333]">
                            {line.type === 'added' ? '' : line.lineA ?? ''}
                          </span>
                          <span className="text-[#555555] w-12 shrink-0 text-right pr-2 py-0.5 select-none border-r border-[#333333]">
                            {line.type === 'removed' ? '' : line.lineB ?? ''}
                          </span>
                          <span className="w-5 shrink-0 text-center py-0.5" style={{ color: prefixColor }}>{prefix}</span>
                          <span className="flex-1 py-0.5 pr-2 whitespace-pre" style={{ color: textColor }}>{line.content}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* Tab 4: Schema Validator                                              */}
        {/* ================================================================ */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 border border-[#333333] p-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">Template:</span>
                <select
                  onChange={(e) => loadTemplate(Number(e.target.value))}
                  defaultValue={0}
                  className="px-2.5 py-1.5 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs focus:outline-none"
                >
                  {TEMPLATES.map((tmpl, idx) => (
                    <option key={idx} value={idx}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <TerminalButton
                onClick={() => {
                  setSchemaPayload('')
                  setSchemaJson('')
                  setValidationRun(false)
                  setSchemaValid(null)
                  setSchemaErrors([])
                }}
              >
                [<span className="green-chevron">&gt;</span> Clear Inputs]
              </TerminalButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payload side */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                    JSON Payload (Data)
                  </label>
                  <TerminalButton onClick={handleCopyPayload}>
                    [<span className="green-chevron">&gt;</span> {copiedPayload ? 'Copied' : 'Copy'}]
                  </TerminalButton>
                </div>
                <textarea
                  value={schemaPayload}
                  onChange={(e) => setSchemaPayload(e.target.value)}
                  rows={12}
                  placeholder="Paste JSON document to validate..."
                  className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
                />
              </div>

              {/* Schema side */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                    JSON Schema (Draft 07/2020-12)
                  </label>
                  <TerminalButton onClick={handleCopySchema}>
                    [<span className="green-chevron">&gt;</span> {copiedSchema ? 'Copied' : 'Copy'}]
                  </TerminalButton>
                </div>
                <textarea
                  value={schemaJson}
                  onChange={(e) => setSchemaJson(e.target.value)}
                  rows={12}
                  placeholder="Paste JSON Schema definition..."
                  className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm placeholder-[#555555] outline-none focus:border-[#00FF41] transition-none resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <TerminalButton onClick={handleValidateSchema}>
                [<span className="green-chevron">&gt;</span> Validate Against Schema]
              </TerminalButton>
            </div>

            {/* Validation Outcome Panel — terminal style */}
            {validationRun && (
              <div className="mt-4">
                {schemaValid === true ? (
                  <div className="p-4 border border-[#00FF41] flex items-start gap-3">
                    <CheckCircle className="text-[#00FF41] shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-mono text-xs font-bold text-[#00FF41]">[ VALIDATION SUCCEEDED ]</h4>
                      <p className="text-[11px] font-mono text-[#888888] mt-1">
                        The JSON payload matches the provided schema without any errors.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-[#FF4444] space-y-2">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-[#FF4444] shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-mono text-xs font-bold text-[#FF4444]">
                          [ VALIDATION FAILED ] &mdash; {schemaErrors.length} {schemaErrors.length === 1 ? 'error' : 'errors'}
                        </h4>
                        <p className="text-[11px] font-mono text-[#888888] mt-0.5">
                          Correct the following errors:
                        </p>
                      </div>
                    </div>
                    <ul className="pl-6 list-disc text-xs font-mono text-[#FF4444] space-y-1">
                      {schemaErrors.map((err, idx) => {
                        // Try to extract the property path from the error and find its line number
                        const pathMatch = err.match(/^Property '([^']+)'/)
                        const path = pathMatch ? pathMatch[1] : null
                        const formattedPayload = (() => {
                          try { return JSON.stringify(JSON.parse(schemaPayload), null, 2) } catch { return schemaPayload }
                        })()
                        const lineNum = path ? findLineNumber(formattedPayload, path) : null
                        return (
                          <li key={idx} className="break-all">
                            {lineNum !== null && (
                              <span className="text-[#888888] mr-1">Line {lineNum}:</span>
                            )}
                            {err}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History section */}
        <div className="border-t border-[#333333] pt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} />
              Recent Actions
            </h3>
            {history.length > 0 && (
              <TerminalButton onClick={handleClearHistory}>
                [<span className="green-chevron">&gt;</span> Clear]
              </TerminalButton>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs font-mono text-[#555555]">No recent actions yet.</p>
          ) : (
            <div className="space-y-2">
              <div className="divide-y divide-[#1a1a1a] border border-[#333333]">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 text-xs font-mono hover:bg-[#1a1a1a] transition-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        item.type === 'formatter'
                          ? 'text-[#00FF41] border border-[#00FF41]'
                          : 'text-[#F9F9F9] border border-[#F9F9F9]'
                      }`}>
                        {item.type === 'formatter' ? 'Format' : 'Schema'}
                      </span>
                      <span className="text-[#888888] truncate max-w-[200px] md:max-w-md">
                        {item.inputSnippet}
                      </span>
                      <span className="text-[#555555] shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <TerminalButton onClick={() => loadHistoryItem(item)}>
                      [<span className="green-chevron">&gt;</span> Reload]
                    </TerminalButton>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-1.5 p-3 border border-[#333333] text-[11px] font-mono text-[#555555]">
                <Info size={12} className="shrink-0 mt-0.5 text-[#00FF41]" />
                <span>
                  {!PRO_LIMIT
                    ? "Showing 1 recent history item (Free Limit)."
                    : "Showing up to 20 past activities (Pro active)."
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

// Basic Schema Validator in Pure TypeScript
export function validateJsonSchema(payload: any, schema: any, path: string = ''): string[] {
  const errors: string[] = []

  if (schema === true) return []
  if (schema === false) {
    return [`Value at ${path || 'root'} is not allowed (schema is false)`]
  }
  if (typeof schema !== 'object' || schema === null) {
    return []
  }

  // Type validation
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type]
    let matched = false

    for (const t of types) {
      if (t === 'null' && payload === null) matched = true
      else if (t === 'string' && typeof payload === 'string') matched = true
      else if (t === 'number' && typeof payload === 'number') matched = true
      else if (t === 'integer' && typeof payload === 'number' && Number.isInteger(payload)) matched = true
      else if (t === 'boolean' && typeof payload === 'boolean') matched = true
      else if (t === 'object' && typeof payload === 'object' && payload !== null && !Array.isArray(payload)) matched = true
      else if (t === 'array' && Array.isArray(payload)) matched = true
    }

    if (!matched) {
      const displayPath = path || 'root'
      const expectedTypes = types.join(' or ')
      let actualType: string = typeof payload
      if (payload === null) actualType = 'null'
      else if (Array.isArray(payload)) actualType = 'array'

      errors.push(`Property '${displayPath}' must be of type ${expectedTypes} (found ${actualType})`)
      return errors
    }
  }

  // Enum validation
  if (Array.isArray(schema.enum)) {
    const matched = schema.enum.some((val: any) => {
      return JSON.stringify(val) === JSON.stringify(payload)
    })
    if (!matched) {
      const displayPath = path || 'root'
      const allowed = schema.enum.map((v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ')
      errors.push(`Property '${displayPath}' must be one of the allowed values: [${allowed}]`)
    }
  }

  // Object checks
  if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
    // required
    if (Array.isArray(schema.required)) {
      for (const reqKey of schema.required) {
        if (!(reqKey in payload)) {
          const displayPath = path ? `${path}.${reqKey}` : reqKey
          errors.push(`Property '${displayPath}' is required`)
        }
      }
    }

    // properties
    if (schema.properties && typeof schema.properties === 'object') {
      for (const key in schema.properties) {
        if (key in payload) {
          const propSchema = schema.properties[key]
          const subErrors = validateJsonSchema(payload[key], propSchema, path ? `${path}.${key}` : key)
          errors.push(...subErrors)
        }
      }
    }
  }

  // Array checks
  if (Array.isArray(payload)) {
    // minItems
    if (typeof schema.minItems === 'number' && payload.length < schema.minItems) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must have at least ${schema.minItems} items (found ${payload.length})`)
    }
    // maxItems
    if (typeof schema.maxItems === 'number' && payload.length > schema.maxItems) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must have at most ${schema.maxItems} items (found ${payload.length})`)
    }

    // items
    if (schema.items !== undefined) {
      if (typeof schema.items === 'object' && schema.items !== null) {
        if (Array.isArray(schema.items)) {
          for (let i = 0; i < schema.items.length; i++) {
            if (i < payload.length) {
              const subErrors = validateJsonSchema(payload[i], schema.items[i], path ? `${path}[${i}]` : `[${i}]`)
              errors.push(...subErrors)
            }
          }
        } else {
          for (let i = 0; i < payload.length; i++) {
            const subErrors = validateJsonSchema(payload[i], schema.items, path ? `${path}[${i}]` : `[${i}]`)
            errors.push(...subErrors)
          }
        }
      }
    }

    // prefixItems
    if (Array.isArray(schema.prefixItems)) {
      for (let i = 0; i < schema.prefixItems.length; i++) {
        if (i < payload.length) {
          const subErrors = validateJsonSchema(payload[i], schema.prefixItems[i], path ? `${path}[${i}]` : `[${i}]`)
          errors.push(...subErrors)
        }
      }
      if (schema.items !== undefined && typeof schema.items === 'object' && schema.items !== null && !Array.isArray(schema.items)) {
        for (let i = schema.prefixItems.length; i < payload.length; i++) {
          const subErrors = validateJsonSchema(payload[i], schema.items, path ? `${path}[${i}]` : `[${i}]`)
          errors.push(...subErrors)
        }
      }
    }
  }

  // Number checks
  if (typeof payload === 'number') {
    // minimum
    if (typeof schema.minimum === 'number' && payload < schema.minimum) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must be at least ${schema.minimum} (value: ${payload})`)
    }
    // maximum
    if (typeof schema.maximum === 'number' && payload > schema.maximum) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must be at most ${schema.maximum} (value: ${payload})`)
    }
    // exclusiveMinimum
    if (typeof schema.exclusiveMinimum === 'number' && payload <= schema.exclusiveMinimum) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must be strictly greater than ${schema.exclusiveMinimum} (value: ${payload})`)
    }
    // exclusiveMaximum
    if (typeof schema.exclusiveMaximum === 'number' && payload >= schema.exclusiveMaximum) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must be strictly less than ${schema.exclusiveMaximum} (value: ${payload})`)
    }
  }

  // String checks
  if (typeof payload === 'string') {
    // minLength
    if (typeof schema.minLength === 'number' && payload.length < schema.minLength) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must be at least ${schema.minLength} characters (length: ${payload.length})`)
    }
    // maxLength
    if (typeof schema.maxLength === 'number' && payload.length > schema.maxLength) {
      const displayPath = path || 'root'
      errors.push(`Property '${displayPath}' must be at most ${schema.maxLength} characters (length: ${payload.length})`)
    }
    // pattern
    if (typeof schema.pattern === 'string') {
      try {
        const regex = new RegExp(schema.pattern)
        if (!regex.test(payload)) {
          const displayPath = path || 'root'
          errors.push(`Property '${displayPath}' must match pattern: ${schema.pattern}`)
        }
      } catch (e) {
        // Ignore invalid regex
      }
    }
  }

  return errors
}
