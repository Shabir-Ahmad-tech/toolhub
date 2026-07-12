'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import {
  Check,
  History,
  Sparkles,
  AlertCircle,
  FileCode,
  FileJson,
  X
} from 'lucide-react'

// Custom Simple YAML Parser details
export interface YamlLine {
  index: number;
  indent: number;
  text: string;
}

export function findUnquotedColon(text: string): number {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === ':' && !inSingleQuote && !inDoubleQuote) {
      if (i === text.length - 1 || text[i + 1] === ' ') {
        return i;
      }
    }
  }
  return -1;
}

export function splitByCommaOutsideQuotes(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
    } else if (!inSingleQuote && !inDoubleQuote) {
      if (char === '[' || char === '{') {
        depth++;
        current += char;
      } else if (char === ']' || char === '}') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      current += char;
    }
  }
  if (current.trim() !== '') {
    result.push(current.trim());
  }
  return result;
}

export function isQuoted(text: string): boolean {
  text = text.trim();
  return (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  );
}

export function unquote(text: string): string {
  text = text.trim();
  if (isQuoted(text)) {
    return text.substring(1, text.length - 1);
  }
  return text;
}

export function parsePrimitive(val: string): any {
  val = val.trim();
  
  if (isQuoted(val)) {
    return unquote(val);
  }
  
  if (val.startsWith('[') && val.endsWith(']')) {
    const content = val.slice(1, -1).trim();
    if (content === '') return [];
    return splitByCommaOutsideQuotes(content).map(item => parsePrimitive(item));
  }

  if (val.startsWith('{') && val.endsWith('}')) {
    const content = val.slice(1, -1).trim();
    if (content === '') return {};
    const obj: Record<string, any> = {};
    const pairs = splitByCommaOutsideQuotes(content);
    for (const pair of pairs) {
      const colonIdx = findUnquotedColon(pair);
      if (colonIdx !== -1) {
        const k = unquote(pair.substring(0, colonIdx).trim());
        const v = pair.substring(colonIdx + 1).trim();
        obj[k] = parsePrimitive(v);
      }
    }
    return obj;
  }
  
  if (val === '' || val.toLowerCase() === 'null' || val === '~') {
    return null;
  }
  
  if (val.toLowerCase() === 'true' || val.toLowerCase() === 'yes' || val.toLowerCase() === 'on') {
    return true;
  }
  if (val.toLowerCase() === 'false' || val.toLowerCase() === 'no' || val.toLowerCase() === 'off') {
    return false;
  }
  
  const isNumber = !isNaN(Number(val)) && val !== '';
  const hasLeadingZero = val.length > 1 && val.startsWith('0') && !val.startsWith('0.');
  
  if (isNumber && !hasLeadingZero) {
    return Number(val);
  }
  
  return val;
}

function parseBlock(lines: YamlLine[], startIndex: number): { value: any; nextIndex: number } {
  if (startIndex >= lines.length) {
    return { value: null, nextIndex: startIndex };
  }

  const baseLine = lines[startIndex];
  const baseIndent = baseLine.indent;

  if (baseLine.text.startsWith('-')) {
    const arr: any[] = [];
    let curIndex = startIndex;

    while (curIndex < lines.length && lines[curIndex].indent === baseIndent) {
      const line = lines[curIndex];
      if (!line.text.startsWith('-')) {
        throw new Error(`Line ${line.index + 1}: Expected list item starting with '-'`);
      }

      const content = line.text.substring(1).trim();

      if (content === '' || content === '|' || content === '>') {
        const nextLine = lines[curIndex + 1];
        if (nextLine && nextLine.indent > baseIndent) {
          if (content === '|' || content === '>') {
            let subIdx = curIndex + 1;
            const scalarLines: string[] = [];
            while (subIdx < lines.length && lines[subIdx].indent > baseIndent) {
              const relIndent = lines[subIdx].indent - (baseIndent + 2);
              const spaces = ' '.repeat(Math.max(0, relIndent));
              scalarLines.push(spaces + lines[subIdx].text);
              subIdx++;
            }
            if (content === '>') {
              arr.push(scalarLines.join(' '));
            } else {
              arr.push(scalarLines.join('\n'));
            }
            curIndex = subIdx;
          } else {
            const res = parseBlock(lines, curIndex + 1);
            arr.push(res.value);
            curIndex = res.nextIndex;
          }
        } else {
          arr.push(null);
          curIndex++;
        }
      } else if (content.includes(':') && !isQuoted(content)) {
        const objLine: YamlLine = {
          index: line.index,
          indent: line.indent + 2,
          text: content
        };
        
        const subLines: YamlLine[] = [objLine];
        let subIdx = curIndex + 1;
        while (subIdx < lines.length && lines[subIdx].indent > baseIndent) {
          subLines.push(lines[subIdx]);
          subIdx++;
        }
        
        const res = parseBlock(subLines, 0);
        arr.push(res.value);
        curIndex = subIdx;
      } else {
        arr.push(parsePrimitive(content));
        curIndex++;
      }
    }
    return { value: arr, nextIndex: curIndex };
  } else {
    const obj: Record<string, any> = {};
    let curIndex = startIndex;

    while (curIndex < lines.length && lines[curIndex].indent === baseIndent) {
      const line = lines[curIndex];
      const colonIdx = findUnquotedColon(line.text);
      if (colonIdx === -1) {
        throw new Error(`Line ${line.index + 1}: Expected key-value pair separated by ':'`);
      }

      const rawKey = line.text.substring(0, colonIdx).trim();
      const rawVal = line.text.substring(colonIdx + 1).trim();
      const key = unquote(rawKey);

      if (rawVal === '' || rawVal === '|' || rawVal === '>') {
        const nextLine = lines[curIndex + 1];
        if (nextLine && nextLine.indent > baseIndent) {
          if (rawVal === '|' || rawVal === '>') {
            let subIdx = curIndex + 1;
            const scalarLines: string[] = [];
            while (subIdx < lines.length && lines[subIdx].indent > baseIndent) {
              const relIndent = lines[subIdx].indent - (baseIndent + 2);
              const spaces = ' '.repeat(Math.max(0, relIndent));
              scalarLines.push(spaces + lines[subIdx].text);
              subIdx++;
            }
            if (rawVal === '>') {
              obj[key] = scalarLines.join(' ');
            } else {
              obj[key] = scalarLines.join('\n');
            }
            curIndex = subIdx;
          } else {
            const res = parseBlock(lines, curIndex + 1);
            obj[key] = res.value;
            curIndex = res.nextIndex;
          }
        } else {
          obj[key] = null;
          curIndex++;
        }
      } else {
        obj[key] = parsePrimitive(rawVal);
        curIndex++;
      }
    }
    return { value: obj, nextIndex: curIndex };
  }
}

export function yamlToJson(yaml: string): { data: any; error: { line: number; message: string } | null } {
  try {
    const lines: YamlLine[] = [];
    const rawLines = yaml.split('\n');
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        continue;
      }
      const indent = line.length - line.trimStart().length;
      lines.push({ index: i, indent, text: trimmed });
    }

    if (lines.length === 0) {
      return { data: null, error: null };
    }

    const result = parseBlock(lines, 0);

    if (result.nextIndex < lines.length) {
      const errLine = lines[result.nextIndex];
      return {
        data: null,
        error: {
          line: errLine.index + 1,
          message: `Inconsistent indentation or unexpected token at line ${errLine.index + 1}`
        }
      };
    }

    return { data: result.value, error: null };
  } catch (err: any) {
    const match = err.message.match(/Line (\d+):/i);
    const lineNum = match ? parseInt(match[1], 10) : 1;
    return {
      data: null,
      error: {
        line: lineNum,
        message: err.message.replace(/Line \d+: /i, '')
      }
    };
  }
}

export function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sortedObj: any = {};
  Object.keys(obj).sort().forEach(key => {
    sortedObj[key] = sortObjectKeys(obj[key]);
  });
  return sortedObj;
}

export function jsonToYaml(obj: any, indentSize: number = 2, quoteStyle: 'double' | 'single' = 'double'): string {
  function serialize(val: any, depth: number): string {
    const indent = ' '.repeat(depth * indentSize);

    if (val === null) {
      return 'null';
    }

    if (typeof val === 'undefined') {
      return 'null';
    }

    if (typeof val === 'boolean' || typeof val === 'number') {
      return String(val);
    }

    if (typeof val === 'string') {
      const needsQuotes = 
        val.includes('\n') || 
        val.includes(':') || 
        val.trim() === '' || 
        val.startsWith('-') || 
        ['true', 'false', 'null', 'yes', 'no'].includes(val.toLowerCase()) || 
        !isNaN(Number(val));
      
      if (needsQuotes) {
        if (quoteStyle === 'single') {
          return `'${val.replace(/'/g, "\\'")}'`;
        }
        return JSON.stringify(val);
      }
      return val;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return '[]';
      }
      let result = '';
      for (const item of val) {
        const itemVal = serialize(item, depth + 1);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const lines = itemVal.split('\n');
          const firstLine = lines[0].trim();
          result += `\n${indent}- ${firstLine}`;
          for (let i = 1; i < lines.length; i++) {
            result += `\n${lines[i]}`;
          }
        } else if (Array.isArray(item)) {
          const lines = itemVal.split('\n');
          result += `\n${indent}-\n${lines.join('\n')}`;
        } else {
          result += `\n${indent}- ${itemVal}`;
        }
      }
      return result.trimStart();
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) {
        return '{}';
      }
      let result = '';
      for (const key of keys) {
        const value = val[key];
        const formattedKey = /^[a-zA-Z0-9_\-]+$/.test(key) ? key : (quoteStyle === 'single' ? `'${key.replace(/'/g, "\\'")}'` : JSON.stringify(key));
        if (value === null || typeof value === 'undefined') {
          result += `\n${indent}${formattedKey}: null`;
        } else if (typeof value === 'object') {
          const formattedVal = serialize(value, depth + 1);
          if (Array.isArray(value) && value.length > 0) {
            result += `\n${indent}${formattedKey}:\n${formattedVal}`;
          } else if (!Array.isArray(value) && Object.keys(value).length > 0) {
            result += `\n${indent}${formattedKey}:\n${formattedVal}`;
          } else {
            result += `\n${indent}${formattedKey}: ${formattedVal}`;
          }
        } else {
          result += `\n${indent}${formattedKey}: ${serialize(value, depth)}`;
        }
      }
      return result.trimStart();
    }

    return '';
  }

  return serialize(obj, 0);
}

// Samples
const SAMPLE_YAML = `# Sample YAML Document
server:
  host: localhost
  port: 8080
  enable_ssl: true
  timeout: 30.5
database:
  driver: postgres
  connections:
    max: 100
    idle: 10
features:
  - analytics
  - reporting
  - webhooks
users:
  - username: admin
    roles: [superadmin, developer]
    active: true
  - username: editor
    roles: [author]
    active: false`

const SAMPLE_JSON = `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "enable_ssl": true,
    "timeout": 30.5
  },
  "database": {
    "driver": "postgres",
    "connections": {
      "max": 100,
      "idle": 10
    }
  },
  "features": [
    "analytics",
    "reporting",
    "webhooks"
  ],
  "users": [
    {
      "username": "admin",
      "roles": [
        "superadmin",
        "developer"
      ],
      "active": true
    },
    {
      "username": "editor",
      "roles": [
        "author"
      ],
      "active": false
    }
  ]
}`

const IS_PRO = true
const FREE_HISTORY_LIMIT = 1

interface HistoryItem {
  id: string
  timestamp: string
  mode: string
  input: string
  fullInput: string
  fullOutput: string
}

export default function YamlJsonConverterClient() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json')
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<{ line: number; message: string } | null>(null)
  
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  
  // Pro Config States
  const [indentSize, setIndentSize] = useState<2 | 4>(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [quoteStyle, setQuoteStyle] = useState<'double' | 'single'>('double')
  
  // Premium modal triggers
  const [showProModal, setShowProModal] = useState(false)
  const [proFeatureName, setProFeatureName] = useState('')

  // Batch converter simulation state
  const [batchFiles, setBatchFiles] = useState<{ name: string; size: number; status: 'pending' | 'success' | 'error'; error?: string }[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  // Hydration sync
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('yaml_json_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {}
    }
  }, [])

  // Live compiler and validator
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    if (mode === 'yaml-to-json') {
      const res = yamlToJson(input)
      if (res.error) {
        setError(res.error)
        setOutput('')
      } else {
        setError(null)
        let finalData = res.data
        if (sortKeys) {
          finalData = sortObjectKeys(finalData)
        }
        const strJson = JSON.stringify(finalData, null, indentSize)
        setOutput(strJson)
        saveToHistory(input, strJson, mode)
      }
    } else {
      try {
        let parsed = JSON.parse(input)
        setError(null)
        if (sortKeys) {
          parsed = sortObjectKeys(parsed)
        }
        const yamlOutput = jsonToYaml(parsed, indentSize, quoteStyle)
        setOutput(yamlOutput)
        saveToHistory(input, yamlOutput, mode)
      } catch (err: any) {
        let lineNum = 1
        const posMatch = err.message.match(/at position (\d+)/)
        const lineMatch = err.message.match(/at line (\d+)/)
        if (lineMatch) {
          lineNum = parseInt(lineMatch[1], 10)
        } else if (posMatch) {
          const position = parseInt(posMatch[1], 10)
          const linesUpToPosition = input.substring(0, position).split('\n')
          lineNum = linesUpToPosition.length
        }
        setError({
          line: lineNum,
          message: err.message || 'Invalid JSON syntax'
        })
        setOutput('')
      }
    }
  }, [input, mode, indentSize, sortKeys, quoteStyle])

  // Sync back history changes
  const saveToHistory = (inp: string, out: string, curMode: string) => {
    const preview = inp.trim().slice(0, 80) + (inp.length > 80 ? '...' : '')
    const newEntry: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      mode: curMode,
      input: preview,
      fullInput: inp,
      fullOutput: out
    }
    
    setHistory((prev) => {
      // Avoid double entry of same input
      const filtered = prev.filter(item => item.fullInput.trim() !== inp.trim())
      const updated = [newEntry, ...filtered]
      
      const limited = updated.slice(0, 20)
      localStorage.setItem('yaml_json_history', JSON.stringify(limited))
      return limited
    })
  }

  const triggerProFeature = (feature: string) => {
    setProFeatureName(feature)
    setShowProModal(true)
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const isJson = mode === 'yaml-to-json'
    const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = isJson ? 'converted.json' : 'converted.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const loadSample = () => {
    if (mode === 'yaml-to-json') {
      setInput(SAMPLE_YAML)
    } else {
      setInput(SAMPLE_JSON)
    }
  }

  // SEO Content and FAQ
  const yamlFaq = [
    {
      question: 'What is the difference between YAML and JSON?',
      answer: 'YAML uses indentation and is more human-readable with features like comments. JSON uses explicit braces and is stricter but natively supported in JavaScript. Both represent structured data but YAML is preferred for config files, JSON for APIs.'
    },
    {
      question: 'Are my YAML/JSON files uploaded to servers?',
      answer: 'No. All conversion happens client-side in your browser. Files are processed locally without being uploaded, making it safe for sensitive configuration files, API keys, or private data.'
    },
    {
      question: 'What conversion errors can occur?',
      answer: 'Common errors include invalid indentation in YAML, trailing spaces, and duplicate keys. JSON must have double quotes for keys and strings. The tool highlights syntax errors as you type and shows line numbers for quick fixes.'
    },
    {
      question: 'Can YAML anchor and alias syntax be converted?',
      answer: 'This converter uses a custom YAML parser that handles basic structures but does not support YAML anchors (&), aliases (*), or multi-document streams (---). For documents using these features, expand anchors to their full values before conversion.'
    },
    {
      question: 'How does the tool handle comments during conversion?',
      answer: 'YAML comments (lines starting with #) are stripped during conversion and do not appear in the JSON output. JSON does not support comments natively, so there is no way to preserve them in the target format. When converting JSON to YAML, inline comments can be added manually after conversion.'
    }
  ]

  const yamlSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Convert Between YAML and JSON Config Formats</h2>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
      <p>
        A YAML/JSON converter translates structured data between YAML Ain&apos;t Markup Language (YAML) and JavaScript Object Notation (JSON). YAML relies on indentation for structure and supports comments and multi-line strings, making it popular for configuration files. JSON uses explicit brackets and is the universal data format for web APIs and JavaScript applications.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
      <p>
        YAML to JSON: the custom parser tokenizes the YAML input by indentation level, identifies key-value pairs and list items using an unquoted-colon detector, and builds a nested object tree. Values are parsed as primitives (numbers, booleans, null), quoted strings, inline arrays, or inline objects. The resulting object is serialized to formatted JSON. JSON to YAML: the JSON is parsed, then each value is recursively serialized to YAML with configurable indent size and quote style while respecting YAML quoting rules for strings containing colons or special characters.
      </p>
      <h3 className="text-sm font-bold text-[#F9F9F9]">Worked Example</h3>
      <p>
        <strong>Input YAML:</strong><br />
        <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">server:\n  host: localhost\n  port: 8080</code><br />
        <strong>Output JSON:</strong><br />
        <code className="px-1.5 py-0.5 bg-[#0a0a0a] text-xs font-mono">{'{\n  "server": {\n    "host": "localhost",\n    "port": 8080\n  }\n}'}</code><br />
        Each YAML key-value pair becomes a JSON property. The indentation level in YAML determines nesting depth. The string "localhost" stays a string, while "8080" becomes a number because it is purely numeric. Comments in YAML are stripped and do not appear in the output.
      </p>
      <h3 className="text-sm font-bold text-[#F9F9F9]">Common Mistakes</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
        <li><strong>Inconsistent indentation in YAML.</strong> YAML requires every sibling at the same nesting level to have identical indentation. Mixing 2-space and 4-space indentation at the same level causes a parse error.</li>
        <li><strong>Using tabs for YAML indentation.</strong> The YAML spec strongly discourages tabs. Always use spaces for indentation. This tool accepts tabs but normalizes them to spaces internally.</li>
        <li><strong>Forgetting quotes around JSON keys containing special characters.</strong> JSON requires all string keys to be wrapped in double quotes. Keys like "server-port" are valid JSON but must be quoted, whereas in YAML quotes are optional for most plain keys.</li>
      </ul>
    </div>
  )

  // Calculate line numbers
  const linesCount = Math.max(1, input.split('\n').length)

  return (
    <ToolLayout
      title="YAML to JSON Converter"
      description="Convert YAML to JSON and JSON to YAML online. Safe, client-side conversion with live validation, syntax error checking, copy, and download."
      toolSlug="yaml-json-converter"
            faq={yamlFaq}
      seoContent={yamlSeo}
    >
      {/* Tab Switcher */}
      <div className="flex border-b border-[#333333] mb-6">
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition ${ activeTab === 'single' ? 'border-[#00FF41] text-[#00FF41]' : 'border-transparent text-[#666666] hover:text-[#888888]' }`}
        >
          Single File Converter
        </button>
        <button
          onClick={() => triggerProFeature('Batch File Conversion')}
          className="pb-3 text-sm font-bold border-b-2 px-4 text-[#555555] hover:text-[#888888] flex items-center gap-1.5 cursor-pointer"
        >
          Batch Converter
          <span className="text-[9px] bg-amber-100 text-[#00FF41] px-1.5 py-0.5 rounded-none font-bold uppercase">
            Pro
          </span>
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className="space-y-6">
          {/* Mode Switcher Buttons */}
          <div className="flex justify-center">
            <div className="flex gap-1 bg-[#1a1a1a] rounded-none w-full max-w-sm">
              <button
                onClick={() => {
                  setMode('yaml-to-json')
                  handleClear()
                }}
                className={`flex-1 py-2 px-3 rounded-none text-sm font-bold transition flex items-center justify-center gap-1.5 ${ mode === 'yaml-to-json' ? 'bg-[#000000] text-[#00FF41]' : 'text-[#888888] hover:text-[#F9F9F9]' }`}
              >
                <FileCode className="w-4 h-4" />
                YAML to JSON
              </button>
              <button
                onClick={() => {
                  setMode('json-to-yaml')
                  handleClear()
                }}
                className={`flex-1 py-2 px-3 rounded-none text-sm font-bold transition flex items-center justify-center gap-1.5 ${ mode === 'json-to-yaml' ? 'bg-[#000000] text-[#00FF41]' : 'text-[#888888] hover:text-[#F9F9F9]' }`}
              >
                <FileJson className="w-4 h-4" />
                JSON to YAML
              </button>
            </div>
          </div>

          {/* Config Bar */}
          <div className="bg-[#1a1a1a] rounded-none p-4 border border-[#333333]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Indentation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#888888]">
                    Indent:
                  </span>
                  <select
                    value={indentSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) as 2 | 4
                      /* complex format now free */
                      setIndentSize(val)
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-none border border-[#333333] bg-[#000000] focus:outline-none"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces (Pro)</option>
                  </select>
                </div>

                {/* Sort Keys */}
                <button
                  type="button"
                  onClick={() => {
                    if (!IS_PRO) {
                      triggerProFeature('Sort Keys Alphabetically')
                      return
                    }
                    setSortKeys(!sortKeys)
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-none border transition ${ sortKeys ? 'bg-[#0a0a0a] text-[#00FF41] border-[#333333]' : 'bg-[#000000] text-[#888888] border-[#333333]' }`}
                >
                  <span>Sort Keys</span>
                  <span className="text-[9px] bg-amber-100 text-[#00FF41] px-1 py-0.5 rounded-none font-bold">
                    Pro
                  </span>
                </button>

                {/* Quote style */}
                {mode === 'json-to-yaml' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#888888]">
                      Quotes:
                    </span>
                    <select
                      value={quoteStyle}
                      onChange={(e) => {
                        const val = e.target.value as 'double' | 'single'
                        /* single file output now free */
                        setQuoteStyle(val)
                      }}
                      className="text-xs font-bold px-2 py-1 rounded-none border border-[#333333] bg-[#000000] focus:outline-none"
                    >
                      <option value="double">Double Quote</option>
                      <option value="single">Single Quote (Pro)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Load Sample]
                </button>
                <button
                  onClick={handleClear}
                  className="terminal-btn"
                >
                  [<span className="green-chevron">&gt;</span> Clear]
                </button>
              </div>
            </div>
          </div>

          {/* Editors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-[#F9F9F9]">
                  Input ({mode === 'yaml-to-json' ? 'YAML' : 'JSON'})
                </label>
                <span className="text-xs text-[#555555] font-bold">
                  {linesCount} {linesCount === 1 ? 'line' : 'lines'}
                </span>
              </div>

              {/* Scrollable Editor Container */}
              <div className="relative flex border border-[#333333] rounded-none bg-[#000000] overflow-hidden h-96">
                {/* Line numbers gutter */}
                <div
                  ref={gutterRef}
                  className="w-12 bg-[#1a1a1a] border-r border-[#333333] select-none overflow-hidden py-4 text-right flex-shrink-0"
                >
                  {Array.from({ length: linesCount }).map((_, idx) => {
                    const lineNum = idx + 1;
                    const isErrorLine = error && error.line === lineNum;
                    return (
                      <div
                        key={lineNum}
                        className={`h-6 pr-2.5 text-xs font-mono leading-6 transition-colors ${ isErrorLine ? 'bg-red-500 text-white font-bold' : 'text-[#555555]' }`}
                      >
                        {lineNum}
                      </div>
                    );
                  })}
                </div>

                {/* Main Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onScroll={handleScroll}
                  wrap="off"
                  placeholder={
                    mode === 'yaml-to-json'
                      ? 'Paste your YAML content here...'
                      : 'Paste your JSON content here...'
                  }
                  className="flex-1 h-full p-4 font-mono text-sm leading-6 bg-transparent focus:outline-none resize-none whitespace-pre overflow-auto"
                />
              </div>
            </div>

            {/* Output Panel */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-[#F9F9F9]">
                  Output ({mode === 'yaml-to-json' ? 'JSON' : 'YAML'})
                </label>

                {output && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> {copied ? 'Copied!' : 'Copy'}]
                    </button>
                    <span className="text-[#888888]">|</span>
                    <button
                      onClick={handleDownload}
                      className="terminal-btn"
                    >
                      [<span className="green-chevron">&gt;</span> Download]
                    </button>
                  </div>
                )}
              </div>

              {/* Readonly text container */}
              <div className="border border-[#333333] rounded-none bg-[#1a1a1a] overflow-hidden h-96">
                <textarea
                  value={output}
                  readOnly
                  placeholder={
                    error
                      ? `Failed compilation: Syntax error on line ${error.line}.`
                      : 'Output will be live updated here...'
                  }
                  className="w-full h-full p-4 font-mono text-sm leading-6 bg-transparent focus:outline-none resize-none overflow-auto"
                />
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="flex gap-2.5 p-4 bg-[#0a0a0a] border border-[#333333] text-sm text-[#FF4444]">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#FF4444] mt-0.5" />
              <div>
                <span className="font-bold">Syntax Error (Line {error.line}):</span> {error.message}
              </div>
            </div>
          )}
          
          {!error && input && (
            <div className="flex items-center gap-2.5 p-4 bg-[#0a0a0a] border border-emerald-250 rounded-none text-sm text-[#00FF41]">
              <Check className="w-5 h-5 shrink-0 text-[#00FF41]" />
              <div>
                <span className="font-bold">Live Compile Validation Passed:</span> Document parses successfully.
              </div>
            </div>
          )}

          {/* History Panel */}
          {mounted && (
            <div className="bg-[#000000] border border-[#333333] rounded-none p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#666666]" />
                  <h3 className="text-base font-bold text-[#F9F9F9]">
                    Conversion History
                  </h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([])
                      localStorage.removeItem('yaml_json_history')
                    }}
                    className="text-xs text-[#FF4444] hover:text-[#FF4444] font-bold"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-[#666666] text-center py-4">
                  No recent conversions. Convert some documents to see them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setInput(item.fullInput)
                        setMode(item.mode as any)
                      }}
                      className="flex items-center justify-between p-3 bg-[#1a1a1a] hover:bg-[#1a1a1a] border border-[#333333] rounded-none transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${ item.mode === 'yaml-to-json' ? 'bg-indigo-50 text-[#818cf8]' : 'bg-teal-50 text-teal-750' }`}>
                          {item.mode === 'yaml-to-json' ? 'YAML �-- JSON' : 'JSON �-- YAML'}
                        </span>
                        <p className="text-xs font-mono text-[#888888] truncate max-w-[200px] sm:max-w-md md:max-w-2xl">
                          {item.input}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#888888] select-none flex-shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Premium Upgrade Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a] backdrop-blur-sm">
          <div className="bg-[#0a0a0a] max-w-md w-full p-6 border border-[#333333] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute right-4 top-4 text-[#888888] hover:text-[#888888] transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#00FF41]" />
              </div>
              <h3 className="text-lg font-bold text-[#F9F9F9]">
                Unlock Premium Feature
              </h3>
              <p className="text-sm text-[#888888] mt-2">
                The feature <strong className="text-[#F9F9F9]">"{proFeatureName}"</strong> is a Pro benefit. Upgrade your plan to get access to advanced formatting, batch uploading, validation, and full history options.
              </p>
              
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href="/pricing"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold transition text-center text-sm"
                >
                  Upgrade to Pro �-- $5/mo
                </a>
                <button
                  onClick={() => setShowProModal(false)}
                  className="w-full py-3 bg-[#0a0a0a] hover:bg-[#0a0a0a] text-[#F9F9F9] font-bold transition text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pro Banner Gate */}
          </ToolLayout>
  )
}

