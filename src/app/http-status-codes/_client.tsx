'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'

interface StatusCode {
  code: number
  label: string
  description: string
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx'
}

const STATUS_CODES: StatusCode[] = [
  // 1xx — Informational
  { code: 100, label: 'Continue', description: 'The initial part of a request has been received and the client should continue.', category: '1xx' },
  { code: 101, label: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.', category: '1xx' },
  { code: 102, label: 'Processing', description: 'The server has received and is processing the request, but no response is available yet (WebDAV).', category: '1xx' },
  { code: 103, label: 'Early Hints', description: 'The server is sending preliminary headers so the client can begin preloading resources before the final response.', category: '1xx' },

  // 2xx — Successful
  { code: 200, label: 'OK', description: 'Standard success response. The request has succeeded and the response body contains the result.', category: '2xx' },
  { code: 201, label: 'Created', description: 'The request succeeded and a new resource was created, typically after a POST or PUT request.', category: '2xx' },
  { code: 202, label: 'Accepted', description: 'The request has been accepted for processing but is not yet completed. Used for async operations.', category: '2xx' },
  { code: 203, label: 'Non-Authoritative Information', description: 'The returned metadata is from a third-party source, not the origin server.', category: '2xx' },
  { code: 204, label: 'No Content', description: 'The request succeeded but there is no content to return. Common for DELETE responses.', category: '2xx' },
  { code: 205, label: 'Reset Content', description: 'The request succeeded and the client should reset the document view that sent the request.', category: '2xx' },
  { code: 206, label: 'Partial Content', description: 'The server is delivering only part of a resource, as requested via a Range header. Used for streaming and resumable downloads.', category: '2xx' },
  { code: 207, label: 'Multi-Status', description: 'Provides status for multiple independent operations in XML format (WebDAV).', category: '2xx' },
  { code: 208, label: 'Already Reported', description: 'The members of a DAV binding have already been enumerated in an earlier part of the response (WebDAV).', category: '2xx' },
  { code: 226, label: 'IM Used', description: 'The server has fulfilled a GET request using instance-manipulations (Delta Encoding).', category: '2xx' },

  // 3xx — Redirection
  { code: 300, label: 'Multiple Choices', description: 'The request has more than one possible response, and the client should choose one.', category: '3xx' },
  { code: 301, label: 'Moved Permanently', description: 'The resource has been permanently moved to a new URL. All future requests should use the new URL.', category: '3xx' },
  { code: 302, label: 'Found', description: 'The resource is temporarily located at a different URL. The client should continue using the original URL for future requests.', category: '3xx' },
  { code: 303, label: 'See Other', description: 'The response can be found at another URL using a GET method. Used after POST/PUT to redirect to a result page.', category: '3xx' },
  { code: 304, label: 'Not Modified', description: 'The resource has not been modified since the last request. The client can use its cached version.', category: '3xx' },
  { code: 305, label: 'Use Proxy', description: 'The requested resource must be accessed through the proxy specified in the Location header (deprecated).', category: '3xx' },
  { code: 307, label: 'Temporary Redirect', description: 'The resource is temporarily at a different URL. The client should reuse the same HTTP method for the redirect.', category: '3xx' },
  { code: 308, label: 'Permanent Redirect', description: 'The resource has been permanently moved, and the client should use the same HTTP method for future requests.', category: '3xx' },

  // 4xx — Client errors
  { code: 400, label: 'Bad Request', description: 'The server cannot process the request due to malformed syntax, invalid parameters, or a malformed request body.', category: '4xx' },
  { code: 401, label: 'Unauthorized', description: 'Authentication is required and has either failed or not been provided. The client must authenticate to get the requested response.', category: '4xx' },
  { code: 402, label: 'Payment Required', description: 'Reserved for future use. Originally designed for digital payment systems, now used by some APIs for rate-limiting.', category: '4xx' },
  { code: 403, label: 'Forbidden', description: 'The server understood the request but refuses to authorize it. Unlike 401, authentication will not help.', category: '4xx' },
  { code: 404, label: 'Not Found', description: 'The server could not find the requested resource. The URL is either invalid or the resource has been removed.', category: '4xx' },
  { code: 405, label: 'Method Not Allowed', description: 'The HTTP method used is not allowed for the requested resource. The Allow header lists permitted methods.', category: '4xx' },
  { code: 406, label: 'Not Acceptable', description: 'The server cannot produce a response matching the Accept headers sent by the client.', category: '4xx' },
  { code: 407, label: 'Proxy Authentication Required', description: 'The client must first authenticate with a proxy server before the request can proceed.', category: '4xx' },
  { code: 408, label: 'Request Timeout', description: 'The server timed out waiting for the client to send the complete request.', category: '4xx' },
  { code: 409, label: 'Conflict', description: 'The request conflicts with the current state of the server. Common in PUT conflicts or versioning issues.', category: '4xx' },
  { code: 410, label: 'Gone', description: 'The requested resource has been permanently removed with no forwarding address.', category: '4xx' },
  { code: 411, label: 'Length Required', description: 'The request did not specify a Content-Length header, which is required by the server.', category: '4xx' },
  { code: 412, label: 'Precondition Failed', description: 'One or more conditional request headers (e.g., If-Match) evaluated to false by the server.', category: '4xx' },
  { code: 413, label: 'Payload Too Large', description: 'The request body is larger than the server is willing or able to process.', category: '4xx' },
  { code: 414, label: 'URI Too Long', description: 'The request URI is longer than the server can interpret. Common with excessively long query strings.', category: '4xx' },
  { code: 415, label: 'Unsupported Media Type', description: 'The request body format is not supported by the server. The Content-Type header is invalid or unsupported.', category: '4xx' },
  { code: 416, label: 'Range Not Satisfiable', description: 'The Range header specified a range that cannot be satisfied by the server.', category: '4xx' },
  { code: 417, label: 'Expectation Failed', description: 'The server cannot meet the requirements of the Expect request header.', category: '4xx' },
  { code: 418, label: "I'm a Teapot", description: 'April Fools joke from RFC 2324. Some APIs use it to reject automated requests or as an Easter egg.', category: '4xx' },
  { code: 421, label: 'Misdirected Request', description: 'The request was directed at a server that cannot produce a response for the intended target.', category: '4xx' },
  { code: 422, label: 'Unprocessable Entity', description: 'The request body contains well-formed syntax but semantically incorrect data. Common in REST APIs for validation errors.', category: '4xx' },
  { code: 423, label: 'Locked', description: 'The resource being accessed is locked (WebDAV).', category: '4xx' },
  { code: 424, label: 'Failed Dependency', description: 'The request failed because a previous request that this one depends on failed (WebDAV).', category: '4xx' },
  { code: 425, label: 'Too Early', description: 'The server is unwilling to risk processing a request that might be replayed (Early Data).', category: '4xx' },
  { code: 426, label: 'Upgrade Required', description: 'The client should switch to a different protocol as specified in the Upgrade header.', category: '4xx' },
  { code: 428, label: 'Precondition Required', description: 'The server requires the request to be conditional (e.g., using If-Match) to prevent lost updates.', category: '4xx' },
  { code: 429, label: 'Too Many Requests', description: 'The client has exceeded the rate limit and should back off. The Retry-After header indicates when to retry.', category: '4xx' },
  { code: 431, label: 'Request Header Fields Too Large', description: 'The request headers are too large for the server to process. Reduce header size and retry.', category: '4xx' },
  { code: 451, label: 'Unavailable For Legal Reasons', description: 'The resource cannot be served due to legal restrictions, such as copyright or government censorship.', category: '4xx' },

  // 5xx — Server errors
  { code: 500, label: 'Internal Server Error', description: 'A generic server error when no more specific error message is appropriate. The server encountered an unexpected condition.', category: '5xx' },
  { code: 501, label: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.', category: '5xx' },
  { code: 502, label: 'Bad Gateway', description: 'The server, acting as a gateway, received an invalid response from an upstream server.', category: '5xx' },
  { code: 503, label: 'Service Unavailable', description: 'The server is temporarily unavailable, typically due to maintenance or overload. The Retry-After header may indicate when to retry.', category: '5xx' },
  { code: 504, label: 'Gateway Timeout', description: 'The server, acting as a gateway, did not receive a timely response from an upstream server.', category: '5xx' },
  { code: 505, label: 'HTTP Version Not Supported', description: 'The HTTP version used in the request is not supported by the server.', category: '5xx' },
  { code: 506, label: 'Variant Also Negotiates', description: 'Transparent content negotiation for the request results in a circular reference.', category: '5xx' },
  { code: 507, label: 'Insufficient Storage', description: 'The server is unable to store the representation needed to complete the request (WebDAV).', category: '5xx' },
  { code: 508, label: 'Loop Detected', description: 'The server detected an infinite loop while processing the request (WebDAV).', category: '5xx' },
  { code: 510, label: 'Not Extended', description: 'Further extensions to the request are required for the server to fulfill it.', category: '5xx' },
  { code: 511, label: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access, often used by captive portals.', category: '5xx' },
]

const CATEGORIES = [
  { key: 'all' as const, label: 'All Codes', count: STATUS_CODES.length },
  { key: '1xx' as const, label: '1xx Info', count: STATUS_CODES.filter(s => s.category === '1xx').length },
  { key: '2xx' as const, label: '2xx Success', count: STATUS_CODES.filter(s => s.category === '2xx').length },
  { key: '3xx' as const, label: '3xx Redirect', count: STATUS_CODES.filter(s => s.category === '3xx').length },
  { key: '4xx' as const, label: '4xx Client Error', count: STATUS_CODES.filter(s => s.category === '4xx').length },
  { key: '5xx' as const, label: '5xx Server Error', count: STATUS_CODES.filter(s => s.category === '5xx').length },
]

const CATEGORY_COLORS: Record<string, string> = {
  all: 'text-[#F9F9F9]',
  '1xx': 'text-blue-400',
  '2xx': 'text-green-400',
  '3xx': 'text-yellow-400',
  '4xx': 'text-orange-400',
  '5xx': 'text-red-400',
}

export default function HttpStatusCodes() {
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return STATUS_CODES.filter(s => {
      if (activeCategory !== 'all' && s.category !== activeCategory) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          String(s.code).includes(q) ||
          s.label.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [activeCategory, search])

  const copyCode = async (code: number, label: string) => {
    try {
      await navigator.clipboard.writeText(String(code))
      toast(`Copied ${code} ${label}`, 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = String(code)
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast(`Copied ${code} ${label}`, 'success')
    }
  }

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What are HTTP status codes?</strong> HTTP status codes are three-digit
        responses from a server indicating the result of a client&apos;s request. They are standardized by the Internet
        Engineering Task Force (IETF) and are an essential part of every web request. Developers encounter them
        daily while debugging APIs, configuring servers, and building web applications.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Why use this reference?</strong> Instead of searching the web every time
        you encounter an unfamiliar status code, this reference provides instant lookups with clear descriptions
        for all 60+ standard HTTP status codes. Filter by category — informational (1xx), success (2xx),
        redirection (3xx), client error (4xx), or server error (5xx) — or search by code number or keyword.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Which status codes matter most?</strong> For most developers, the most
        frequently encountered codes are 200 (OK), 201 (Created), 204 (No Content), 301 (Moved Permanently), 304
        (Not Modified), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 429 (Too Many
        Requests), and 500 (Internal Server Error). Understanding these eleven codes covers the vast majority of
        HTTP interactions you will debug.
      </p>
      <p>
        Use the search box above to find any status code instantly, or browse by category using the filter tabs.
        Click any code to copy it to your clipboard for use in documentation, error handling, or configuration.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'What is the most common HTTP status code?',
      answer: '200 OK is the most common HTTP status code, used when a request succeeds. In terms of errors, 404 Not Found and 500 Internal Server Error are the most frequently encountered by users and developers alike.',
    },
    {
      question: 'What is the difference between 401 Unauthorized and 403 Forbidden?',
      answer: '401 Unauthorized means the client must authenticate itself to get the requested response (no credentials or invalid credentials). 403 Forbidden means the client is authenticated but does not have permission to access the resource. With 403, authentication will not help — the client simply lacks authorization.',
    },
    {
      question: 'When should I use 422 Unprocessable Entity vs 400 Bad Request?',
      answer: 'Use 400 Bad Request for malformed syntax (invalid JSON, wrong data types). Use 422 Unprocessable Entity when the syntax is correct but the content is semantically invalid (e.g., a required field is missing, an email format is invalid, or a business rule is violated). 422 is more specific and widely used in REST APIs.',
    },
    {
      question: 'What does 429 Too Many Requests mean and how should I handle it?',
      answer: '429 Too Many Requests indicates rate limiting. The server has temporarily blocked the client for exceeding the allowed number of requests within a time window. Clients should respect the Retry-After header (in seconds) and implement exponential backoff. For API consumers, track your request count and add delays between requests to avoid triggering rate limits.',
    },
    {
      question: 'What is the difference between 301 and 308 permanent redirects?',
      answer: '301 Moved Permanently may change the HTTP method from POST/PUT to GET when following the redirect. 308 Permanent Redirect preserves the original HTTP method and body. For this reason, 308 is preferred for API endpoints that receive non-GET requests, while 301 is commonly used for web pages.',
    },
  ]

  return (
    <ToolLayout
      title="HTTP Status Codes Reference"
      description="Complete reference of all standard HTTP status codes. Browse, search, and copy status codes organized by category. Includes descriptions for 1xx informational, 2xx success, 3xx redirection, 4xx client error, and 5xx server error codes."
      toolSlug="http-status-codes"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      {/* Search + Category Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] font-mono text-xs select-none">
            &gt;
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code, name, or description..."
            className="w-full bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-xs md:text-sm pl-7 pr-3 py-2.5 rounded focus:outline-none focus:border-[#00FF41]/50 placeholder:text-[#555555]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1.5 text-[10px] md:text-xs font-mono rounded border transition-colors ${
                activeCategory === cat.key
                  ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]'
                  : 'bg-[#0A0A0A] border-[#333333] text-[#888888] hover:border-[#555555]'
              }`}
            >
              <span className={activeCategory === cat.key ? 'text-[#00FF41]' : CATEGORY_COLORS[cat.key]}>
                [&gt;
              </span>{' '}
              {cat.label}
              <span className="text-[#555555] ml-1">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-[10px] font-mono text-[#555555]">
          Showing {filtered.length} of {STATUS_CODES.length} status codes
        </p>
      </div>

      {/* Status Codes Table */}
      <div className="space-y-1">
        {filtered.map(sc => (
          <button
            key={sc.code}
            onClick={() => copyCode(sc.code, sc.label)}
            className="w-full text-left group flex items-start gap-3 p-2.5 rounded hover:bg-[#111111] transition-colors border border-transparent hover:border-[#333333]"
          >
            {/* Code — color-coded by category */}
            <span className={`font-mono text-xs md:text-sm font-bold min-w-[3rem] shrink-0 ${CATEGORY_COLORS[sc.category]}`}>
              {sc.code}
            </span>
            {/* Details */}
            <div className="flex-1 min-w-0">
              <span className="font-mono text-xs md:text-sm text-[#F9F9F9] font-semibold">
                {sc.label}
              </span>
              <p className="text-[10px] md:text-xs font-mono text-[#666666] mt-0.5 leading-relaxed line-clamp-2">
                {sc.description}
              </p>
            </div>
            {/* Copy hint */}
            <span className="text-[10px] font-mono text-[#444444] group-hover:text-[#00FF41]/60 transition-colors shrink-0 mt-0.5 select-none">
              [copy]
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-[#555555] font-mono text-xs py-8">
            No status codes match your search.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}
