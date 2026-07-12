'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

interface CurlRequest {
  method: string
  url: string
  headers: Record<string, string>
  body: string | null
}

function parseCurl(cmd: string): CurlRequest | null {
  const tokens = tokenize(cmd)
  if (!tokens.length) return null

  let method = 'GET'
  let url = ''
  const headers: Record<string, string> = {}
  let body: string | null = null
  let i = 1

  while (i < tokens.length) {
    const t = tokens[i]
    if (t === '-X' || t === '--request') {
      method = (tokens[i + 1] || 'GET').toUpperCase()
      i += 2
    } else if (t === '-H' || t === '--header') {
      const h = tokens[i + 1] || ''
      const sep = h.indexOf(':')
      if (sep > 0) {
        headers[h.slice(0, sep).trim()] = h.slice(sep + 1).trim()
      }
      i += 2
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
      body = tokens[i + 1] || ''
      if (method === 'GET') method = 'POST'
      i += 2
    } else if (t === '--data-urlencode') {
      const raw = tokens[i + 1] || ''
      body = body ? body + '&' + raw : raw
      if (method === 'GET') method = 'POST'
      i += 2
    } else if (t.startsWith('-') || t.startsWith('--')) {
      const flag = t.replace(/^--/, '').replace(/^-/, '')
      const takesValue = ['connect-timeout', 'max-time', 'retry', 'retry-delay', 'retry-max-time', 'proxy', 'cacert', 'cert', 'key', 'user', 'user-agent', 'output', 'cookie', 'referer', 'resolve']
      if (takesValue.includes(flag) && tokens[i + 1] && !tokens[i + 1].startsWith('-')) {
        i += 2
      } else {
        i += 1
      }
    } else if (!url && !t.startsWith('-')) {
      url = t
      i += 1
    } else {
      i += 1
    }
  }

  if (!url) return null
  return { method, url, headers, body }
}

function tokenize(cmd: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false

  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i]
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle; continue
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble; continue
    }
    if (ch === '\\' && (inSingle || inDouble)) {
      current += cmd[i + 1] || ''; i++; continue
    }
    if (/\s/.test(ch) && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = '' }
      continue
    }
    current += ch
  }
  if (current) tokens.push(current)
  return tokens
}

function genFetch(req: CurlRequest): string {
  const lines: string[] = []
  lines.push(`fetch("${req.url}", {`)
  lines.push(`  method: "${req.method}",`)
  if (Object.keys(req.headers).length) {
    lines.push(`  headers: {`)
    for (const [k, v] of Object.entries(req.headers)) {
      lines.push(`    "${k}": "${v}",`)
    }
    lines.push(`  },`)
  }
  if (req.body) {
    const bodyStr = tryParseJsonBody(req.body)
    lines.push(`  body: ${bodyStr},`)
  }
  lines.push(`})`)
  lines.push(`  .then(res => res.json())`)
  lines.push(`  .then(data => console.log(data))`)
  lines.push(`  .catch(err => console.error(err));`)
  return lines.join('\n')
}

function genAxios(req: CurlRequest): string {
  const lines: string[] = []
  lines.push(`const response = await axios({`)
  lines.push(`  method: "${req.method.toLowerCase()}",`)
  lines.push(`  url: "${req.url}",`)
  if (Object.keys(req.headers).length) {
    lines.push(`  headers: {`)
    for (const [k, v] of Object.entries(req.headers)) {
      lines.push(`    "${k}": "${v}",`)
    }
    lines.push(`  },`)
  }
  if (req.body) {
    const bodyStr = tryParseJsonBody(req.body)
    lines.push(`  data: ${bodyStr},`)
  }
  lines.push(`});`)
  lines.push(`console.log(response.data);`)
  return lines.join('\n')
}

function genPython(req: CurlRequest): string {
  const lines: string[] = []
  lines.push(`import requests`)
  lines.push(``)
  const url = req.url
  if (Object.keys(req.headers).length) {
    lines.push(`headers = {`)
    for (const [k, v] of Object.entries(req.headers)) {
      lines.push(`    "${k}": "${v}",`)
    }
    lines.push(`}`)
  }
  lines.push(``)
  const hArg = Object.keys(req.headers).length ? ', headers=headers' : ''
  const pyBody = req.body
  let bodyArg = ''
  if (pyBody) {
    const parsed = tryParseJsonBody(pyBody)
    if (parsed.startsWith('{') || parsed.startsWith('[')) {
      bodyArg = `, json=${parsed}`
    } else {
      bodyArg = `, data=${parsed}`
    }
  }
  lines.push(`response = requests.${req.method.toLowerCase()}("${url}"${hArg}${bodyArg})`)
  lines.push(`print(response.json())`)
  return lines.join('\n')
}

function genGo(req: CurlRequest): string {
  const lines: string[] = []
  lines.push(`package main`)
  lines.push(``)
  lines.push(`import (`)
  lines.push(`  "bytes"`)
  lines.push(`  "encoding/json"`)
  lines.push(`  "fmt"`)
  lines.push(`  "io"`)
  lines.push(`  "net/http"`)
  lines.push(`)`)
  lines.push(``)
  lines.push(`func main() {`)
  lines.push(`  url := "${req.url}"`)
  let bodyVar = 'nil'
  if (req.body) {
    const bodyStr = tryParseJsonBody(req.body)
    if (bodyStr.startsWith('{') || bodyStr.startsWith('[')) {
      lines.push(`  body := ${bodyStr}`)
      lines.push(`  jsonData, _ := json.Marshal(body)`)
      bodyVar = 'bytes.NewBuffer(jsonData)'
    } else {
      lines.push(`  bodyStr := ${bodyStr}`)
      bodyVar = 'bytes.NewBufferString(bodyStr)'
    }
  }
  lines.push(`  req, _ := http.NewRequest("${req.method}", url, ${bodyVar})`)
  for (const [k, v] of Object.entries(req.headers)) {
    lines.push(`  req.Header.Set("${k}", "${v}")`)
  }
  lines.push(`  client := &http.Client{}`)
  lines.push(`  resp, err := client.Do(req)`)
  lines.push(`  if err != nil {`)
  lines.push(`    fmt.Println("Error:", err)`)
  lines.push(`    return`)
  lines.push(`  }`)
  lines.push(`  defer resp.Body.Close()`)
  lines.push(`  body, _ := io.ReadAll(resp.Body)`)
  lines.push(`  fmt.Println(string(body))`)
  lines.push(`}`)
  return lines.join('\n')
}

function tryParseJsonBody(body: string): string {
  try {
    const parsed = JSON.parse(body)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return JSON.stringify(body)
  }
}

const LANGUAGES = [
  { id: 'fetch', label: 'Fetch (JS)', gen: genFetch },
  { id: 'axios', label: 'Axios (JS)', gen: genAxios },
  { id: 'python', label: 'Python (requests)', gen: genPython },
  { id: 'go', label: 'Go (net/http)', gen: genGo },
] as const

const DEFAULT_CURL = `curl -X POST https://api.example.com/v1/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk_test_123" \\
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'`

const faq = [
  {
    question: 'What cURL options does the converter support?',
    answer: 'The converter handles -X/--request (HTTP method), -H/--header (request headers), -d/--data/--data-raw/--data-binary (request body), and --data-urlencode. Common flags like --connect-timeout, --max-time, --retry, and --proxy are also parsed. Unknown flags are safely ignored.'
  },
  {
    question: 'Can I convert GraphQL queries from cURL?',
    answer: 'Yes. If your cURL command includes a JSON body with "query" and "variables" fields, the converter will parse and preserve the JSON structure in the output for all target languages.'
  },
  {
    question: 'Which HTTP methods are supported?',
    answer: 'All standard HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, and CONNECT. If no -X flag is present, the converter defaults to GET -- or POST if a -d/--data flag is found.'
  },
  {
    question: 'Does the converter handle cookies from cURL?',
    answer: 'The converter does not currently translate --cookie or -b flags into cookie-specific code. If your cURL command uses cookies, the header-based approach (adding Cookie: name=value as a -H flag) is supported.'
  },
  {
    question: 'Can I convert cURL commands with file uploads?',
    answer: 'File uploads using the -F/--form flag are not currently supported. The converter focuses on JSON and URL-encoded request bodies.'
  }
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">cURL to Code Converter</h2>
    <p className="text-[#888888] font-mono"><strong>What It Is.</strong> Convert any cURL command into native code for Fetch API, Axios, Python requests, or Go net/http. Paste a cURL command from your terminal, API docs, or browser dev tools and get production-ready code in your target language.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p className="text-[#888888] font-mono">The converter tokenizes the cURL command by parsing quoted strings, escaped characters, and whitespace-delimited arguments. It then identifies flag-value pairs: -X sets the HTTP method, -H populates the headers object, and -d captures the request body.</p>
  </div>
)

function CurlCopyButton({ text }: { text: string }) {
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

export default function CurlToCodePage() {
  const [curlInput, setCurlInput] = useState(DEFAULT_CURL)
  const [lang, setLang] = useState<string>('fetch')

  const parsed = useMemo(() => parseCurl(curlInput), [curlInput])
  const code = useMemo(() => {
    if (!parsed) return '// Could not parse cURL command.\n// Make sure it starts with "curl" and follows standard syntax.'
    const gen = LANGUAGES.find(l => l.id === lang)
    return gen ? gen.gen(parsed) : ''
  }, [parsed, lang])

  return (
    <ToolLayout
      title="cURL to Code Converter"
      description="Convert cURL commands to Fetch, Axios, Python, and Go code instantly. Free online cURL converter for developers."
      toolSlug="curl-to-code"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-5 font-mono">
        {/* Input */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-1.5 uppercase tracking-wider">Paste cURL command</label>
          <textarea
            value={curlInput}
            onChange={e => setCurlInput(e.target.value)}
            rows={5}
            className="w-full px-3 py-2.5 text-xs font-mono bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] outline-none focus:border-2 focus:border-[#00FF41] transition-none resize-y"
            placeholder="curl https://api.example.com/endpoint ..."
            spellCheck={false}
          />
          {!parsed && curlInput.trim() && (
            <p className="mt-1.5 text-xs font-mono text-[#ff4444]">Could not parse this cURL command. Check the syntax.</p>
          )}
        </div>

        {/* Language tabs */}
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`group relative px-3 py-1.5 border text-[10px] uppercase tracking-wider transition-none cursor-pointer overflow-hidden min-h-[32px] ${
                lang === l.id
                  ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                  : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">Generated Code</label>
            <CurlCopyButton text={code} />
          </div>
          <pre className="w-full overflow-x-auto border border-[#F9F9F9] bg-[#000000] text-[#00FF41] p-4 text-xs font-mono leading-relaxed max-h-80 overflow-y-auto">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
