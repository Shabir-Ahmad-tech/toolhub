'use client'

import { useState, useMemo, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/ui/CopyButton'
import { StatCard } from '@/components/ui/StatCard'
import { 
  Terminal, 
  Search, 
  Trash2, 
  History, 
  Code, 
  Layers, 
  FileCode, 
  AlertCircle, 
  Info, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2
} from 'lucide-react'

// hardcoded false until auth is wired up
const PRO_LIMIT = false 
const FREE_LIMIT_HISTORY = 1

interface HeaderItem {
  key: string
  value: string
  explanation?: string
}

interface ParsedResult {
  statusCode: number | null
  statusText: string
  headers: HeaderItem[]
  bodyText: string
  jsonValid: boolean
  jsonError: string | null
  jsonFormatted: string
  jsonHighlightHtml: string
  syntaxErrorDetail: {
    line: number
    column: number
    snippet: string
    pointer: string
  } | null
}

interface HistoryItem {
  id: string
  timestamp: number
  statusCode: number | null
  statusText: string
  payloadSizeKB: string
  charCount: number
  rawInput: string
}

const HEADER_DICTIONARY: Record<string, string> = {
  'content-type': 'Specifies the media type of the resource body (e.g. application/json; charset=utf-8).',
  'content-length': 'The size of the response body in bytes.',
  'cache-control': 'Directives for caching mechanisms in browsers and proxy caches (e.g., max-age=3600, public).',
  'set-cookie': 'Sends cookies from the server to the client browser to store session info.',
  'authorization': 'Credentials for authenticating the client with the server.',
  'server': 'Information about the server software handling the request (e.g., nginx/1.24.0, Cloudflare).',
  'date': 'The date and time at which the response message was originated.',
  'connection': 'Controls whether the network connection stays open after the transaction finishes.',
  'access-control-allow-origin': 'Specifies which origins are allowed to access the resource for CORS requests.',
  'access-control-allow-headers': 'Indicates which HTTP headers can be used during the actual request.',
  'access-control-allow-methods': 'Specifies the methods allowed when accessing the resource.',
  'etag': 'A unique identifier for a specific version of a resource, used for cache validation.',
  'last-modified': 'The date and time at which the resource was last modified.',
  'location': 'Used in redirects or when a new resource has been created (status 201).',
  'strict-transport-security': 'Forces secure (HTTPS) connections to the server.',
  'x-frame-options': 'Indicates whether the browser should render the page in a frame or iframe.',
  'x-content-type-options': 'Prevents MIME-type sniffing by forcing the browser to adhere to the content-type.',
  'content-encoding': 'The compression algorithm used for the payload (e.g., gzip, br).',
  'transfer-encoding': 'The form of encoding used to safely transfer the payload (e.g., chunked).',
  'vary': 'Determines how to match request headers to decide whether a cached response is valid.',
  'x-powered-by': 'Specifies the technology stack powering the server (e.g., Next.js, Express).',
  'x-request-id': 'A unique identifier for the request, helpful for tracing and debugging server logs.',
  'content-security-policy': 'Restricts resources (such as JavaScript, CSS, Images) that the browser is allowed to load.',
  'referrer-policy': 'Governs which referrer information is sent in requests.'
}

interface HTTPStatusDetail {
  name: string
  meaning: string
  causes: string
  fixes: string
}

const HTTP_STATUS_GUIDE: Record<number, HTTPStatusDetail> = {
  100: {
    name: 'Continue',
    meaning: 'The server has received the request headers and the client should proceed to send the request body.',
    causes: 'Typically sent when the client sends an "Expect: 100-continue" header before sending a large request body.',
    fixes: 'Continue sending the rest of the request body. If you are using standard REST tools, this is handled automatically.'
  },
  200: {
    name: 'OK',
    meaning: 'The request has succeeded. The information returned depends on the HTTP method used.',
    causes: 'Standard successful request.',
    fixes: 'No fixes needed. Your API endpoint responded successfully.'
  },
  201: {
    name: 'Created',
    meaning: 'The request has been fulfilled and has resulted in one or more new resources being created.',
    causes: 'Successful creation of a resource (usually from a POST or PUT request).',
    fixes: 'No fixes needed. The response typically includes a "Location" header pointing to the new resource.'
  },
  202: {
    name: 'Accepted',
    meaning: 'The request has been accepted for processing, but the processing has not been completed.',
    causes: 'Asynchronous or long-running tasks where the server starts the job but won\'t finish it immediately.',
    fixes: 'Monitor the task status using a polling URL or wait for a webhook callback.'
  },
  204: {
    name: 'No Content',
    meaning: 'The server successfully processed the request, and is not returning any content in the response body.',
    causes: 'Usually returned for successful DELETE requests or PUT updates where returning the resource is unnecessary.',
    fixes: 'No fixes needed. Note that the client should not expect a response body.'
  },
  301: {
    name: 'Moved Permanently',
    meaning: 'The requested resource has been assigned a new permanent URI and any future references should use this URI.',
    causes: 'Canonical domain changes (HTTP to HTTPS, non-www to www) or resource URL path restructuring.',
    fixes: 'Check the "Location" header in the response and update your client API requests to target the new URL.'
  },
  302: {
    name: 'Found (Temporary Redirect)',
    meaning: 'The requested resource resides temporarily under a different URI.',
    causes: 'Temporary redirection, authentication redirection (e.g. redirecting to login page).',
    fixes: 'Follow the URL in the "Location" header. Client code should continue using the original URL for future requests.'
  },
  304: {
    name: 'Not Modified',
    meaning: 'The resource has not been modified since the last request. The client can use its cached version.',
    causes: 'Conditional requests using "If-None-Match" (ETag) or "If-Modified-Since" headers.',
    fixes: 'No fixes needed. The browser/client should load the resource from cache instead of downloading it again.'
  },
  400: {
    name: 'Bad Request',
    meaning: 'The server cannot or will not process the request due to something that is perceived to be a client error.',
    causes: 'Malformed request syntax, invalid request message framing, or deceptive request routing.',
    fixes: 'Check the syntax of the request payload (e.g., malformed JSON), verify URL query parameters, and check HTTP headers.'
  },
  401: {
    name: 'Unauthorized',
    meaning: 'The request has not been applied because it lacks valid authentication credentials for the target resource.',
    causes: 'Missing Authorization header, invalid or expired JWT token, or incorrect API keys.',
    fixes: 'Provide a valid authentication token. Check if the token is expired, check key spelling, and make sure the token is prefixed with "Bearer " if required.'
  },
  403: {
    name: 'Forbidden',
    meaning: 'The server understood the request but refuses to authorize it.',
    causes: 'The authenticated user lacks permissions (wrong scope/roles), IP block, or CORS policy failure.',
    fixes: 'Verify that the user account has the required access control scopes. Check backend server ACLs, IP whitelist policies, and CORS configuration.'
  },
  404: {
    name: 'Not Found',
    meaning: 'The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.',
    causes: 'Typo in URL path, resource deleted from database, or API route not registered.',
    fixes: 'Check for typos in the endpoint path. Verify that the resource ID exists in the database. Check API router files to ensure the route is registered.'
  },
  405: {
    name: 'Method Not Allowed',
    meaning: 'The method received in the request-line is known by the origin server but not supported by the target resource.',
    causes: 'Making a POST request to an endpoint that only accepts GET, or vice versa.',
    fixes: 'Check the "Allow" header in the response to see which methods are supported. Change the client request method (GET, POST, PUT, DELETE) to match the API requirements.'
  },
  408: {
    name: 'Request Timeout',
    meaning: 'The server did not receive a complete request message within the time that it was prepared to wait.',
    causes: 'Slow client network connection or network issues between client and server.',
    fixes: 'Retry the request. If the network is stable, check server configuration settings for connection timeout thresholds.'
  },
  409: {
    name: 'Conflict',
    meaning: 'The request could not be completed due to a conflict with the current state of the target resource.',
    causes: 'Attempting to create a user with an email address that already exists, or edit collisions in collaborative editing.',
    fixes: 'Resolve the conflict before retrying. Check database unique constraints. Fetch the latest state of the resource, merge changes, and retry.'
  },
  413: {
    name: 'Payload Too Large',
    meaning: 'The server is refusing to process a request because the request payload is larger than the server is willing or able to process.',
    causes: 'Uploading a large file (e.g. 50MB image) when the server or proxy limit is lower (e.g. 2MB).',
    fixes: 'Compress files before uploading. Increase body size limits in proxy servers (e.g. "client_max_body_size" in Nginx) and server frameworks (e.g. body-parser).'
  },
  415: {
    name: 'Unsupported Media Type',
    meaning: 'The origin server is refusing to service the request because the payload is in a format not supported by this method.',
    causes: 'Sending XML body to an API that only accepts JSON, or uploading an incorrect file format.',
    fixes: 'Check the request "Content-Type" header. Ensure it is set to "application/json" (or the supported MIME type). Verify request formatting matches the accepted schema.'
  },
  422: {
    name: 'Unprocessable Entity',
    meaning: 'The server understands the content type of the request payload, but was unable to process the contained instructions.',
    causes: 'Request parameters failed validation checks (e.g., missing required fields, email not formatted correctly, values out of bounds).',
    fixes: 'Inspect the response body for field validation details. Correct the fields that failed validation in the client request payload.'
  },
  429: {
    name: 'Too Many Requests',
    meaning: 'The user has sent too many requests in a given amount of time ("rate limiting").',
    causes: 'Exceeding API call rate limits set by the server (e.g., max 100 requests per minute).',
    fixes: 'Implement exponential backoff and rate-limit handling in client code. Inspect the "Retry-After" response header to see how long to wait before making the next request.'
  },
  500: {
    name: 'Internal Server Error',
    meaning: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    causes: 'Null pointer exceptions, database connection errors, uncaught code crashes, or server bugs.',
    fixes: 'Check server-side logs. Look at stack traces to isolate the crash line. Add robust try/catch exception handling in your server code.'
  },
  501: {
    name: 'Not Implemented',
    meaning: 'The server does not support the functionality required to fulfill the request.',
    causes: 'API route is planned but the code has not been deployed, or unsupported HTTP methods.',
    fixes: 'Ensure the endpoint is deployed. Check your request method. Check if the feature is supported by the server version.'
  },
  502: {
    name: 'Bad Gateway',
    meaning: 'The server, while acting as a gateway or proxy, received an invalid response from the upstream server.',
    causes: 'Upstream application process (Node, Python, PHP, etc.) is dead, crashed, or misconfigured reverse proxy.',
    fixes: 'Verify that the backend application process is running. Inspect web server (Nginx/Apache) error logs. Check internal port configurations.'
  },
  503: {
    name: 'Service Unavailable',
    meaning: 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server.',
    causes: 'Server is temporarily overloaded, database migrations are running, or server is down for scheduled maintenance.',
    fixes: 'Wait a few minutes and retry. Implement server load balancing or scaling. Check cloud provider health status pages.'
  },
  504: {
    name: 'Gateway Timeout',
    meaning: 'The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.',
    causes: 'Upstream server took too long to respond. Long-running queries, heavy calculations, or deadlocks.',
    fixes: 'Optimize slow SQL queries. Run long-running tasks asynchronously using queues. Increase the timeout limits in Nginx/Gateway and load balancers.'
  }
}

const EXAMPLES = {
  success: `HTTP/2 200 OK
content-type: application/json; charset=utf-8
content-length: 228
cache-control: public, max-age=86400
server: nginx/1.24.0
x-powered-by: Next.js
access-control-allow-origin: *

{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_9281a",
      "name": "Alex Riviera",
      "email": "alex@toolhub.dev",
      "role": "Lead Architect"
    },
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}`,

  validationError: `HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json
Content-Length: 260
Connection: keep-alive
X-Request-ID: req_88ac2189ff

{
  "error": "validation_failed",
  "message": "The request body failed to pass validation constraints.",
  "errors": [
    {
      "field": "email",
      "reason": "Must be a valid email address."
    },
    {
      "field": "age",
      "reason": "Value must be greater than or equal to 18"
    }
  ]
}`,

  serverError: `HTTP/1.1 500 Internal Server Error
Content-Type: application/json
Content-Length: 94
Connection: close
Server: Apache/2.4.41 (Ubuntu)

{
  "error": "internal_error",
  "message": "NullPointerException: Attempt to invoke method on a null object reference"
}`,

  badJson: `HTTP/2 200 OK
content-type: application/json

{
  "id": 101,
  "title": "API Response Validator",
  "features": [
    "header parsing",
    "json formatting"
  ]
  "isActive": true
}`
}

// Regex-based syntax highlighter for JSON
function highlightJson(json: string): string {
  if (!json) return ''
  let escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g

  return escaped.replace(regex, (match) => {
    let cls = 'text-amber-600 font-semibold'
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-blue-600 font-semibold'
      } else {
        cls = 'text-emerald-600'
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-purple-600 font-semibold'
    } else if (/null/.test(match)) {
      cls = 'text-pink-600 font-semibold'
    }
    return `<span class="${cls}">${match}</span>`
  })
}

function generateTypeScript(obj: any, interfaceName = 'ApiResponse'): string {
  if (obj === null) return `type ${interfaceName} = null;`
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `type ${interfaceName} = any[];`
    const firstItemType = typeof obj[0]
    if (firstItemType === 'object' && obj[0] !== null) {
      const subInterfaceName = interfaceName.endsWith('s') ? interfaceName.slice(0, -1) : `${interfaceName}Item`
      return `${generateTypeScript(obj[0], subInterfaceName)}\n\ntype ${interfaceName} = ${subInterfaceName}[];`
    }
    return `type ${interfaceName} = ${firstItemType}[];`
  }
  if (typeof obj === 'object') {
    let result = `interface ${interfaceName} {\n`
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      let typeStr: string = typeof val
      if (val === null) {
        typeStr = 'any'
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          typeStr = 'any[]'
        } else {
          const itemType = typeof val[0]
          if (itemType === 'object' && val[0] !== null) {
            const nestedName = key.charAt(0).toUpperCase() + key.slice(1).replace(/s$/, '') + 'Type'
            result = `${generateTypeScript(val[0], nestedName)}\n\n` + result
            typeStr = `${nestedName}[]`
          } else {
            typeStr = `${itemType}[]`
          }
        }
      } else if (typeStr === 'object') {
        const nestedName = key.charAt(0).toUpperCase() + key.slice(1) + 'Type'
        result = `${generateTypeScript(val, nestedName)}\n\n` + result
        typeStr = nestedName
      }
      result += `  ${key}: ${typeStr};\n`
    }
    result += `}`
    return result
  }
  return `type ${interfaceName} = ${typeof obj};`
}

function generateJsonSchema(obj: any, title = 'ApiResponse'): string {
  const schema = generateSchemaObj(obj)
  schema['$schema'] = 'http://json-schema.org/draft-07/schema#'
  schema['title'] = title
  return JSON.stringify(schema, null, 2)
}

function generateSchemaObj(val: any): any {
  if (val === null) {
    return { type: 'null' }
  }
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return { type: 'array', items: {} }
    }
    return {
      type: 'array',
      items: generateSchemaObj(val[0])
    }
  }
  if (typeof val === 'object') {
    const properties: Record<string, any> = {}
    const required: string[] = []
    for (const key of Object.keys(val)) {
      properties[key] = generateSchemaObj(val[key])
      required.push(key)
    }
    return {
      type: 'object',
      properties,
      required
    }
  }
  if (typeof val === 'string') return { type: 'string' }
  if (typeof val === 'number') return { type: 'number' }
  if (typeof val === 'boolean') return { type: 'boolean' }
  return {}
}

function getStatusDetails(code: number) {
  if (HTTP_STATUS_GUIDE[code]) {
    return HTTP_STATUS_GUIDE[code]
  }
  
  if (code >= 100 && code < 200) {
    return {
      name: `Informational (${code})`,
      meaning: 'Informational status code indicating the request was received and the process is continuing.',
      causes: 'Temporary response from the server.',
      fixes: 'No action required by the client.'
    }
  } else if (code >= 200 && code < 300) {
    return {
      name: `Success (${code})`,
      meaning: 'Successful status code indicating the action was successfully received, understood, and accepted.',
      causes: 'The request completed without errors.',
      fixes: 'No fixes needed.'
    }
  } else if (code >= 300 && code < 400) {
    return {
      name: `Redirection (${code})`,
      meaning: 'Redirection status code indicating that further action needs to be taken by the user agent in order to fulfill the request.',
      causes: 'Resource has moved or caching directive redirects request.',
      fixes: 'Follow the redirect URL located in the "Location" header.'
    }
  } else if (code >= 400 && code < 500) {
    return {
      name: `Client Error (${code})`,
      meaning: 'Client error status code indicating that the request contains bad syntax or cannot be fulfilled.',
      causes: 'Request payload mismatch, authentication error, or missing resource.',
      fixes: 'Verify the request parameters, headers, URL path, and authentication tokens.'
    }
  } else if (code >= 500 && code < 600) {
    return {
      name: `Server Error (${code})`,
      meaning: 'Server error status code indicating that the server failed to fulfill an apparently valid request.',
      causes: 'Unexpected server-side code crash or service outage.',
      fixes: 'Check server-side logs and server resource metrics.'
    }
  }
  
  return null
}

function getStatusColor(code: number): 'green' | 'blue' | 'amber' | 'red' | 'slate' {
  if (code >= 200 && code < 300) return 'green'
  if (code >= 300 && code < 400) return 'blue'
  if (code >= 400 && code < 500) return 'amber'
  if (code >= 500 && code < 600) return 'red'
  return 'slate'
}

function parseResponse(raw: string): ParsedResult {
  const result: ParsedResult = {
    statusCode: null,
    statusText: '',
    headers: [],
    bodyText: '',
    jsonValid: false,
    jsonError: null,
    jsonFormatted: '',
    jsonHighlightHtml: '',
    syntaxErrorDetail: null
  }

  if (!raw.trim()) return result

  let headersText = ''
  let bodyText = ''

  // Smart Divider
  // First look for JSON start character { or [
  const jsonStart = raw.search(/[\{\[]/)
  if (jsonStart !== -1) {
    const beforeJson = raw.substring(0, jsonStart).trim()
    // Verify if the part before looks like headers or starts with HTTP/ or has a colon
    if (beforeJson.includes(':') || beforeJson.startsWith('HTTP/')) {
      headersText = beforeJson
      bodyText = raw.substring(jsonStart).trim()
    } else {
      bodyText = raw.trim()
    }
  } else {
    // If no JSON character is found, split by double newline
    const doubleNewlineIdx = raw.search(/\r?\n\r?\n/)
    if (doubleNewlineIdx !== -1) {
      headersText = raw.substring(0, doubleNewlineIdx).trim()
      bodyText = raw.substring(doubleNewlineIdx).trim()
    } else {
      // Check if it's all headers or all body
      const lines = raw.split('\n')
      const hasColons = lines.every(l => !l.trim() || l.includes(':') || l.startsWith('HTTP/'))
      if (hasColons) {
        headersText = raw.trim()
      } else {
        bodyText = raw.trim()
      }
    }
  }

  // Parse Status Line & Headers
  if (headersText) {
    const lines = headersText.split(/\r?\n/)
    
    // Check first line for HTTP status
    const firstLine = lines[0].trim()
    const statusLineRegex = /^HTTP\/(?:\d(?:\.\d)?)\s+(\d{3})(?:\s+(.*))?$/i
    const statusMatch = firstLine.match(statusLineRegex)

    let headerStartIndex = 0
    if (statusMatch) {
      result.statusCode = parseInt(statusMatch[1], 10)
      result.statusText = statusMatch[2] || ''
      headerStartIndex = 1
    } else {
      const simpleStatusRegex = /^\s*(\d{3})\s*(.*)$/
      const simpleMatch = firstLine.match(simpleStatusRegex)
      if (simpleMatch) {
        const potentialCode = parseInt(simpleMatch[1], 10)
        if (potentialCode >= 100 && potentialCode < 600) {
          result.statusCode = potentialCode
          result.statusText = simpleMatch[2] || ''
          headerStartIndex = 1
        }
      }
    }

    // Parse Key-Value Headers
    for (let i = headerStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const colonIdx = line.indexOf(':')
      if (colonIdx !== -1) {
        const rawKey = line.substring(0, colonIdx).trim()
        const value = line.substring(colonIdx + 1).trim()
        
        // Casing normalization: standard header casing
        const normalizedKey = rawKey.split('-').map(part => {
          if (part.toLowerCase() === 'id') return 'ID'
          if (part.toLowerCase() === 'ip') return 'IP'
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        }).join('-')

        const lowerKey = rawKey.toLowerCase()
        const explanation = HEADER_DICTIONARY[lowerKey] || ''

        result.headers.push({ key: normalizedKey, value, explanation })
      }
    }
  }

  // Parse Body
  result.bodyText = bodyText
  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText)
      result.jsonValid = true
      result.jsonFormatted = JSON.stringify(parsed, null, 2)
      result.jsonHighlightHtml = highlightJson(result.jsonFormatted)
    } catch (e: any) {
      result.jsonValid = false
      result.jsonError = e.message

      // Extract error position
      const posMatch = e.message.match(/position\s+(\d+)/i)
      const position = posMatch ? parseInt(posMatch[1], 10) : -1
      
      const lineColMatch = e.message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
      let errorLine = -1
      let errorCol = -1

      if (lineColMatch) {
        errorLine = parseInt(lineColMatch[1], 10)
        errorCol = parseInt(lineColMatch[2], 10)
      } else if (position !== -1) {
        let currentPos = 0
        const lines = bodyText.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const lineLen = lines[i].length + 1 // +1 for \n
          if (currentPos + lineLen > position) {
            errorLine = i + 1
            errorCol = position - currentPos + 1
            break
          }
          currentPos += lineLen
        }
      }

      if (errorLine !== -1) {
        const lines = bodyText.split('\n')
        const offendingLine = lines[errorLine - 1] || ''
        
        let indicator = ''
        for (let i = 0; i < errorCol - 1; i++) {
          indicator += offendingLine[i] === '\t' ? '\t' : ' '
        }
        indicator += '^'

        result.syntaxErrorDetail = {
          line: errorLine,
          column: errorCol,
          snippet: offendingLine,
          pointer: indicator
        }
      }
    }
  }

  return result
}

export default function ApiResponseValidatorClient() {
  const [rawInput, setRawInput] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'status' | 'codegen' | 'history'>('body')
  const [statusCodeInput, setStatusCodeInput] = useState<string>('')
  const [headerSearch, setHeaderSearch] = useState<string>('')
  const [sortHeaders, setSortHeaders] = useState<boolean>(false)
  const [codegenSubTab, setCodegenSubTab] = useState<'typescript' | 'schema'>('typescript')
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Parse result memoized based on input
  const parsedResult = useMemo(() => parseResponse(rawInput), [rawInput])

  // Sync status code input when parsed from headers
  useEffect(() => {
    if (parsedResult.statusCode !== null) {
      setStatusCodeInput(parsedResult.statusCode.toString())
    }
  }, [parsedResult.statusCode])

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolhub-api-validator-history')
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Calculate size metrics
  const stats = useMemo(() => {
    try {
      const encoder = new TextEncoder()
      const headerBytes = parsedResult.headers.map(h => `${h.key}: ${h.value}`).join('\n').length
      const bodyBytes = encoder.encode(parsedResult.bodyText).length
      const totalBytes = encoder.encode(rawInput).length
      
      return {
        headerSizeKB: (headerBytes / 1024).toFixed(3),
        bodySizeKB: (bodyBytes / 1024).toFixed(3),
        totalSizeKB: (totalBytes / 1024).toFixed(3),
        headerCharCount: rawInput.length - parsedResult.bodyText.length,
        bodyCharCount: parsedResult.bodyText.length,
        totalCharCount: rawInput.length
      }
    } catch {
      return {
        headerSizeKB: '0.000',
        bodySizeKB: '0.000',
        totalSizeKB: '0.000',
        headerCharCount: 0,
        bodyCharCount: 0,
        totalCharCount: 0
      }
    }
  }, [rawInput, parsedResult])

  // Load examples
  const loadExample = (key: keyof typeof EXAMPLES) => {
    const example = EXAMPLES[key]
    setRawInput(example)
    // reset tab
    setActiveTab('body')
  }

  // Handle manual formatting of the input textarea
  const formatInputText = () => {
    if (parsedResult.jsonValid && parsedResult.jsonFormatted) {
      // Rebuild raw input with formatted JSON body
      let headersPart = ''
      const jsonStart = rawInput.search(/[\{\[]/)
      if (jsonStart !== -1) {
        headersPart = rawInput.substring(0, jsonStart).trim()
      } else {
        const doubleNewlineIdx = rawInput.search(/\r?\n\r?\n/)
        if (doubleNewlineIdx !== -1) {
          headersPart = rawInput.substring(0, doubleNewlineIdx).trim()
        }
      }

      const formatted = headersPart 
        ? `${headersPart}\n\n${parsedResult.jsonFormatted}`
        : parsedResult.jsonFormatted
      
      setRawInput(formatted)

      // Save to history
      saveToHistoryItem(formatted)
    }
  }

  const saveToHistoryItem = (inputToSave: string) => {
    try {
      const parsed = parseResponse(inputToSave)
      const encoder = new TextEncoder()
      const totalBytes = encoder.encode(inputToSave).length
      const sizeKB = (totalBytes / 1024).toFixed(2)

      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        statusCode: parsed.statusCode,
        statusText: parsed.statusText,
        payloadSizeKB: sizeKB,
        charCount: inputToSave.length,
        rawInput: inputToSave
      }

      // Add to state and limit based on pro
      let updatedHistory = [newItem, ...history]
      const limit = PRO_LIMIT ? 50 : FREE_LIMIT_HISTORY
      updatedHistory = updatedHistory.slice(0, limit)

      setHistory(updatedHistory)
      localStorage.setItem('toolhub-api-validator-history', JSON.stringify(updatedHistory))
    } catch (e) {
      // ignore
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('toolhub-api-validator-history')
  }

  // Filter headers
  const filteredHeaders = useMemo(() => {
    let list = [...parsedResult.headers]
    if (headerSearch.trim()) {
      const q = headerSearch.toLowerCase()
      list = list.filter(h => h.key.toLowerCase().includes(q) || h.value.toLowerCase().includes(q))
    }
    if (sortHeaders) {
      list.sort((a, b) => a.key.localeCompare(b.key))
    }
    return list
  }, [parsedResult.headers, headerSearch, sortHeaders])

  // Get status details for guide
  const codeNum = parseInt(statusCodeInput, 10)
  const statusDetails = isNaN(codeNum) ? null : getStatusDetails(codeNum)
  const statusColor = isNaN(codeNum) ? 'slate' : getStatusColor(codeNum)

  const statusContainerStyles = {
    green: 'border-green-200 bg-green-50/30 text-green-900',
    blue: 'border-blue-200 bg-blue-50/30 text-blue-900',
    amber: 'border-amber-200 bg-amber-50/30 text-amber-900',
    red: 'border-red-200 bg-red-50/30 text-red-900',
    slate: 'border-[#333333] bg-[#1a1a1a]/30 text-slate-800'
  }[statusColor]

  const statusTextBadgeColor = {
    green: 'bg-green-600 text-white',
    blue: 'bg-blue-600 text-white',
    amber: 'bg-amber-600 text-white',
    red: 'bg-red-600 text-white',
    slate: 'bg-slate-600 text-white'
  }[statusColor]

  const COMMON_CODES = [200, 201, 204, 301, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504]

  const apiValidatorFaq = [
    {
      question: 'Does my API response data get uploaded to any servers?',
      answer: 'No, all response parsing, JSON formatting, validation, and schema generation happen 100% locally in your web browser. No data ever leaves your device.'
    },
    {
      question: 'Can I paste raw cURL output or terminal responses?',
      answer: 'Yes! The auto-parser is designed to split headers and JSON bodies dynamically. Just copy the entire raw output and paste it into the input area.'
    },
    {
      question: 'Why does it highlight a JSON syntax error?',
      answer: 'JSON (JavaScript Object Notation) has strict syntax rules. Common errors include using single quotes instead of double quotes, missing commas between elements, or trailing commas at the end of objects.'
    },
    {
      question: 'Can I generate TypeScript types from any JSON response?',
      answer: 'Yes. The codegen tab produces a TypeScript interface that matches the structure of the JSON response body. It handles nested objects, arrays, and primitive types automatically. Simply paste valid JSON and switch to the Types & Schema tab.'
    },
    {
      question: 'What HTTP status codes are covered by the guide?',
      answer: 'The status guide includes detailed entries for 24 common codes from 100 Continue through 504 Gateway Timeout, plus fallback descriptions for any unrecognized 1xx/2xx/3xx/4xx/5xx code. Each entry explains the meaning, common causes, and specific debugging steps.'
    }
  ]

  const apiValidatorSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">API Response Validator</h2>
      <h3 className="text-sm font-semibold text-[#888888]">What It Is</h3>
      <p>
        This tool parses raw HTTP responses - headers and JSON body - into structured, readable output and generates TypeScript interfaces and JSON schemas from the body. Developers use it during API integration, debugging third-party endpoints, and validating JSON syntax without installing curl, Postman, or any desktop tool. Everything runs client-side with no server uploads.
      </p>
      <h3 className="text-sm font-semibold text-[#888888]">How It Works</h3>
      <p>
        The parser uses a smart divider that scans for the first <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">[</code> or <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">{'{'}</code> character to split headers from JSON body. The status line is extracted via regex (<code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">HTTP/\d(?:\.\d)?\s+(\d{'{3}'})</code>) and header key-value pairs are parsed with index-of-colon. The JSON body goes through <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">JSON.parse()</code> for validation, then <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono font-bold text-indigo-600">JSON.stringify(parsed, null, 2)</code> for formatting. If parsing fails, the error position is extracted to compute line and column numbers for pinpointing the syntax issue.
      </p>
      <h3 className="text-sm font-semibold text-[#888888]">Worked Example</h3>
      <p>
        <strong>Input:</strong> Paste a raw 422 response:
      </p>
      <pre className="p-3 bg-slate-900 text-green-400 rounded-none text-xs font-mono overflow-x-auto">
{`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "validation_failed",
  "errors": [
    {"field": "email", "reason": "Must be a valid email address."}
  ]
}`}</pre>
      <p>
        <strong>Output:</strong> Status code 422 parsed with description "Unprocessable Entity." Headers table shows <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">Content-Type: application/json</code>. The JSON body is validated, pretty-printed, and displayed with syntax highlighting. Switch to the Status Guide tab to see causes (validation constraints failed) and fixes (inspect response body for field-level errors). The Types tab generates the TypeScript interface with <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">error: string</code> and <code className="px-1.5 py-0.5 rounded-none bg-[#1a1a1a] text-xs font-mono">errors: Array&lt;{'{'}field: string; reason: string{'}'}&gt;</code>.
      </p>
      <h3 className="text-sm font-semibold text-[#888888]">Common Mistakes</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
        <li><strong>Omitting the Content-Type header.</strong> Some APIs omit this header in error responses. The tool will still parse the body correctly, but you lose the context that the body is JSON rather than plain text.</li>
        <li><strong>Confusing 4xx and 5xx debugging steps.</strong> A 401 (Unauthorized) means your request lacks valid credentials - check the Authorization header. A 502 (Bad Gateway) means the server infrastructure is failing - check upstream services, not your request payload.</li>
        <li><strong>Pasting response body without headers.</strong> The tool handles body-only input, but without headers you lose status code detection and header-level metadata (e.g., caching directives, rate-limit headers).</li>
      </ul>
    </div>
  )

  return (
    <ToolLayout 
      title="API Response Validator" 
      description="Inspect HTTP response headers, pretty-format JSON payloads, validate JSON syntax errors, and explore HTTP status code guides." 
      toolSlug="api-response-validator"
            faq={apiValidatorFaq}
      seoContent={apiValidatorSeo}
    >
      <div className="space-y-6">
        
        {/* Quick Load Examples */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[#666666] font-semibold">Load Example:</span>
          <button
            onClick={() => loadExample('success')}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> 200 OK Response]
          </button>
          <button
            onClick={() => loadExample('validationError')}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> 422 ValidationError]
          </button>
          <button
            onClick={() => loadExample('serverError')}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> 500 Server Error]
          </button>
          <button
            onClick={() => loadExample('badJson')}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> Invalid JSON]
          </button>
        </div>

        {/* Input Textarea Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-[#888888]">
              Raw HTTP Response (Headers + JSON Body)
            </label>
            {rawInput && (
              <div className="flex gap-2">
                <button
                  onClick={formatInputText}
                  disabled={!parsedResult.jsonValid}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-none transition border ${
                    parsedResult.jsonValid
                      ? 'text-blue-600 border-blue-200 hover:bg-blue-50'
                      : 'text-[#555555] border-[#333333] cursor-not-allowed'
                  }`}
                  title={parsedResult.jsonValid ? 'Pretty format the JSON body inside raw input' : 'JSON must be valid to format input'}
                >
                  Format JSON Input
                </button>
                <button
                  onClick={() => setRawInput('')}
                  className="text-xs text-red-600 font-semibold px-2.5 py-1 rounded-none border border-red-200 hover:bg-red-50 transition"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <textarea 
            value={rawInput} 
            onChange={(e) => setRawInput(e.target.value)} 
            rows={8} 
            className="w-full px-4 py-3 border border-[#333333] rounded-none font-mono text-xs md:text-sm bg-[#000000] dark:text-slate-100 placeholder-[#555555]"
            placeholder="Paste raw API response here... (Headers first, followed by JSON body)"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard 
            label="HTTP Status Code" 
            value={parsedResult.statusCode ? `${parsedResult.statusCode} ${parsedResult.statusText}` : 'Not Detected'}
            color={parsedResult.statusCode ? getStatusColor(parsedResult.statusCode) : 'slate'} 
          />
          <StatCard 
            label="Body Payload Size" 
            value={`${stats.bodySizeKB} KB`} 
            color={parsedResult.jsonValid ? 'green' : parsedResult.bodyText ? 'red' : 'slate'} 
          />
          <StatCard 
            label="Character Count" 
            value={`${stats.totalCharCount.toLocaleString()} chars`} 
            color="indigo" 
          />
        </div>

        {/* Action Tabs */}
        <div className="border-b border-[#333333]">
          <nav className="flex flex-wrap -mb-px gap-1 select-none">
            <button
              onClick={() => setActiveTab('body')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs md:text-sm font-semibold transition ${
                activeTab === 'body'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#666666] hover:text-[#888888] hover:border-[#333333]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              JSON Body
              {rawInput && (
                <span className={`w-2 h-2 rounded-full ${parsedResult.jsonValid ? 'bg-green-500' : parsedResult.bodyText ? 'bg-red-500' : 'bg-slate-300'}`}></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs md:text-sm font-semibold transition ${
                activeTab === 'headers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#666666] hover:text-[#888888] hover:border-[#333333]'
              }`}
            >
              <Layers className="w-4 h-4" />
              Headers Table ({parsedResult.headers.length})
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs md:text-sm font-semibold transition ${
                activeTab === 'status'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#666666] hover:text-[#888888] hover:border-[#333333]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Status Guide
            </button>
            <button
              onClick={() => setActiveTab('codegen')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs md:text-sm font-semibold transition ${
                activeTab === 'codegen'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#666666] hover:text-[#888888] hover:border-[#333333]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Types &amp; Schema
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs md:text-sm font-semibold transition ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#666666] hover:text-[#888888] hover:border-[#333333]'
              }`}
            >
              <History className="w-4 h-4" />
              History ({history.length})
            </button>
          </nav>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          
          {/* 1. JSON Body Tab */}
          {activeTab === 'body' && (
            <div className="space-y-4">
              {(() => {
                if (!parsedResult.bodyText) {
                  return (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#333333] rounded-none text-[#555555] bg-[#1a1a1a]/50">
                      <Terminal className="w-8 h-8 mb-2 opacity-50 text-[#555555]" />
                      <p className="text-sm font-bold text-[#888888]">No JSON payload detected in response body.</p>
                      <p className="text-xs text-slate-450 mt-1 max-w-sm text-center">
                        Paste a raw API response with a JSON payload at the bottom of headers (e.g. starting with {"{"} or {"["}) to inspect.
                      </p>
                    </div>
                  )
                }

                if (parsedResult.jsonValid) {
                  const lines = parsedResult.jsonHighlightHtml.split('\n')
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-[#1a1a1a] p-2.5 px-4 rounded-none border border-[#333333]">
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1.5 select-none">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          Valid JSON Payload
                        </span>
                        <div className="flex gap-2">
                          <CopyButton text={parsedResult.jsonFormatted} label="Copy JSON" className="py-1.5 px-3 text-xs" />
                        </div>
                      </div>

                      <div className="flex font-mono text-xs md:text-sm overflow-x-auto bg-slate-950 text-slate-100 p-4 rounded-none border border-[#333333] leading-relaxed max-h-[500px]">
                        <div className="text-[#888888] select-none pr-4 text-right border-r border-[#333333] min-w-[2.5rem]">
                          {lines.map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        <div className="pl-4 flex-1 whitespace-pre">
                          {lines.map((line, i) => (
                            <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <p className="font-semibold text-sm">JSON Syntax Error</p>
                          <p className="text-xs leading-relaxed opacity-95 font-mono">{parsedResult.jsonError}</p>
                          <p className="text-[11px] font-medium text-red-700 dark:text-red-400 mt-1">
                            Suggestions: Check for missing commas, unquoted keys, trailing commas, or single quotes instead of double quotes.
                          </p>
                        </div>
                      </div>
                    </div>

                    {parsedResult.syntaxErrorDetail && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-405">
                          Error Location: Line {parsedResult.syntaxErrorDetail.line}, Column {parsedResult.syntaxErrorDetail.column}
                        </p>
                        <div className="font-mono text-xs md:text-sm bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-800 leading-relaxed overflow-x-auto">
                          <div className="text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded border border-red-900/40">
                            {parsedResult.syntaxErrorDetail.snippet}
                          </div>
                          <div className="text-yellow-500 font-bold px-2 whitespace-pre leading-none">
                            {parsedResult.syntaxErrorDetail.pointer}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Raw Body Text</label>
                      <textarea
                        value={parsedResult.bodyText}
                        readOnly
                        rows={6}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* 2. Headers Inspector Tab */}
          {activeTab === 'headers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Filter headers by key or value..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSortHeaders(!sortHeaders)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                      sortHeaders
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900'
                        : 'bg-white text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sortHeaders ? 'Sorted A-Z' : 'Sort Alphabetically'}
                  </button>
                  {parsedResult.headers.length > 0 && (
                    <CopyButton
                      text={parsedResult.headers.map(h => `${h.key}: ${h.value}`).join('\n')}
                      label="Copy All Headers"
                      className="py-2 px-3 text-xs"
                    />
                  )}
                </div>
              </div>

              {parsedResult.headers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/10">
                  <Info className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No response headers detected.</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                    Paste headers (e.g. key-value pairs formatted as Key: Value) at the top of your response to parse them.
                  </p>
                </div>
              ) : filteredHeaders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                  No headers match your search query: &quot;{headerSearch}&quot;
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
                      <tr>
                        <th className="px-4 py-3 w-1/3">Header Key</th>
                        <th className="px-4 py-3">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredHeaders.map((header, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3.5 align-top">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono select-all">
                              {header.key}
                            </div>
                            {header.explanation && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal italic select-none">
                                {header.explanation}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 align-top font-mono text-slate-600 dark:text-slate-300 break-all select-all">
                            {header.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. Status Code Guide Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="max-w-md space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HTTP Status Code Lookup
                  </label>
                  <input
                    type="text"
                    value={statusCodeInput}
                    onChange={(e) => setStatusCodeInput(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    placeholder="Enter status code (e.g. 403, 502)"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 select-none">
                    Enter any 3-digit HTTP status code to get meanings, common developer causes, and debugging recommendations.
                  </p>
                </div>
              </div>

              {/* Quick Click Common Codes */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 select-none">Common status codes:</p>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {COMMON_CODES.map((code) => {
                    const cColor = getStatusColor(code)
                    const badgeCls = {
                      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
                      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900',
                      amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900',
                      red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900',
                      slate: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }[cColor]

                    return (
                      <button
                        key={code}
                        onClick={() => setStatusCodeInput(code.toString())}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${badgeCls}`}
                      >
                        {code}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Code Guide Output */}
              {statusDetails ? (
                <div className={`p-5 rounded-2xl border transition-all duration-300 ${statusContainerStyles} space-y-4`}>
                  <div className="flex items-center gap-3 border-b pb-3 border-slate-200 dark:border-slate-800/80">
                    <span className={`px-3 py-1 font-mono text-sm font-extrabold rounded-lg ${statusTextBadgeColor} select-none`}>
                      {statusCodeInput}
                    </span>
                    <h3 className="text-base md:text-lg font-bold">
                      {statusDetails.name}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          What it means:
                        </h4>
                        <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed pl-3 border-l border-slate-200 dark:border-slate-800">
                          {statusDetails.meaning}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Common Causes:
                        </h4>
                        <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed pl-3 border-l border-slate-200 dark:border-slate-800">
                          {statusDetails.causes}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        How to Debug &amp; Fix:
                      </h4>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed pl-3 border-l border-slate-200 dark:border-slate-800">
                        {statusDetails.fixes}
                      </p>
                    </div>
                  </div>
                </div>
              ) : statusCodeInput ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                  No status code database definition matches &quot;{statusCodeInput}&quot;. Please enter a valid HTTP code (e.g. 200, 401, 502).
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl text-center text-slate-400 dark:text-slate-500 text-xs select-none">
                  Enter a status code above or choose from the list to display details.
                </div>
              )}
            </div>
          )}

          {/* 4. Codegen Types & Schema Tab */}
          {activeTab === 'codegen' && (
            <div className="space-y-4">
              {!parsedResult.jsonValid ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/10">
                  <Code className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Valid JSON Payload Required</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                    Enter a valid JSON response body in the raw input to generate TypeScript Interfaces or JSON Schemas automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Codegen Toggle Sub-Tabs */}
                  <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 max-w-xs select-none">
                    <button
                      onClick={() => setCodegenSubTab('typescript')}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition ${
                        codegenSubTab === 'typescript'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      TypeScript Type
                    </button>
                    <button
                      onClick={() => setCodegenSubTab('schema')}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition ${
                        codegenSubTab === 'schema'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      JSON Schema
                    </button>
                  </div>

                  {codegenSubTab === 'typescript' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 select-none">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                          Generated TypeScript Interfaces
                        </span>
                        <CopyButton
                          text={generateTypeScript(JSON.parse(parsedResult.bodyText), 'ApiResponse')}
                          label="Copy Types"
                          className="py-1.5 px-3 text-xs"
                        />
                      </div>
                      <pre className="font-mono text-xs md:text-sm bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-800 max-h-96 overflow-y-auto leading-relaxed select-all">
                        {generateTypeScript(JSON.parse(parsedResult.bodyText), 'ApiResponse')}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 select-none">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                          Generated Draft-07 JSON Schema
                        </span>
                        <CopyButton
                          text={generateJsonSchema(JSON.parse(parsedResult.bodyText), 'ApiResponse')}
                          label="Copy Schema"
                          className="py-1.5 px-3 text-xs"
                        />
                      </div>
                      <pre className="font-mono text-xs md:text-sm bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-800 max-h-96 overflow-y-auto leading-relaxed select-all">
                        {generateJsonSchema(JSON.parse(parsedResult.bodyText), 'ApiResponse')}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5. History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
                  Recent Runs (Free Limit: {FREE_LIMIT_HISTORY} validation)
                </p>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs font-bold text-red-650 hover:text-red-700 flex items-center gap-1 py-1 px-2.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/10 select-none">
                  <History className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No validations recorded.</p>
                  <p className="text-xs text-slate-450 mt-1 max-w-sm text-center">
                    Validations with JSON data or status codes are automatically recorded here for instant lookups.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-800 transition shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                            item.statusCode ? getStatusColor(item.statusCode) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.statusCode ? `${item.statusCode} ${item.statusText}` : 'Generic'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Size: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.payloadSizeKB} KB</span> &middot; {item.charCount.toLocaleString()} chars
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setRawInput(item.rawInput)
                          setActiveTab('body')
                        }}
                        className="w-full sm:w-auto px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400 text-xs font-bold rounded-lg transition border border-blue-100 dark:border-slate-700"
                      >
                        Restore Payload
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
          </ToolLayout>
  )
}



