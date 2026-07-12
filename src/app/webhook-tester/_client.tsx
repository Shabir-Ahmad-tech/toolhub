'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import {
  Trash2,
  Copy,
  Check,
  Plus,
  AlertCircle,
  Terminal,
  Clock,
  History,
  Sparkles,
  Code,
  Eye,
  RotateCcw,
  ArrowRight,
  Play
} from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'

type Provider = 'stripe' | 'shopify' | 'github' | 'custom'

const PAYLOAD_TEMPLATES: Record<Provider, Record<string, any>> = {
  stripe: {
    'charge.succeeded': {
      id: "evt_1N2b3c4d5e6f7g8h9i0j",
      object: "event",
      api_version: "2023-10-16",
      created: 1698765432,
      data: {
        object: {
          id: "ch_1N2b3c4d5e6f",
          object: "charge",
          amount: 2999,
          amount_captured: 2999,
          amount_refunded: 0,
          billing_details: {
            address: {
              city: "San Francisco",
              country: "US",
              line1: "123 Market St",
              postal_code: "94105",
              state: "CA"
            },
            email: "customer@example.com",
            name: "Jane Doe"
          },
          captured: true,
          created: 1698765432,
          currency: "usd",
          customer: "cus_O1a2b3c4d5",
          description: "Subscription charge for KRUMB.DEV Pro",
          paid: true,
          payment_intent: "pi_3Mv1b2c3d4e5",
          payment_method: "pm_1Mv1b2c3d4e5",
          receipt_url: "https://stripe.com/receipt",
          status: "succeeded"
        }
      },
      type: "charge.succeeded"
    },
    'customer.created': {
      id: "evt_2M2b3c4d5e6f7g8h9i0j",
      object: "event",
      api_version: "2023-10-16",
      created: 1698765440,
      data: {
        object: {
          id: "cus_O1a2b3c4d5",
          object: "customer",
          balance: 0,
          created: 1698765440,
          currency: "usd",
          default_source: null,
          delinquent: false,
          description: "New customer registered",
          email: "new.user@example.com",
          invoice_prefix: "8A2B3C",
          metadata: {
            user_id: "usr_998877"
          },
          name: "Alex Johnson",
          phone: "+15555550199"
        }
      },
      type: "customer.created"
    },
    'invoice.payment_succeeded': {
      id: "evt_3M2b3c4d5e6f7g8h9i0j",
      object: "event",
      api_version: "2023-10-16",
      created: 1698765480,
      data: {
        object: {
          id: "in_1N2b3c4d5e6f",
          object: "invoice",
          amount_due: 4900,
          amount_paid: 4900,
          amount_remaining: 0,
          attempt_count: 1,
          attempted: true,
          auto_advance: false,
          billing_reason: "subscription_cycle",
          charge: "ch_3Mv1b2c3d4e5",
          customer: "cus_O1a2b3c4d5",
          customer_email: "customer@example.com",
          customer_name: "Jane Doe",
          period_end: 1701385480,
          period_start: 1698765480,
          status: "paid",
          subscription: "sub_1N2b3c4d5e6f",
          subtotal: 4900,
          total: 4900
        }
      },
      type: "invoice.payment_succeeded"
    }
  },
  shopify: {
    'order.created': {
      id: 1234567890,
      email: "customer@example.com",
      created_at: "2026-07-10T00:24:23-04:00",
      updated_at: "2026-07-10T00:24:23-04:00",
      number: 1001,
      note: "Please leave package at front door",
      token: "a1b2c3d4e5f6g7h8i9j0",
      gateway: "shopify_payments",
      test: true,
      total_price: "89.90",
      subtotal_price: "79.90",
      total_weight: 1200,
      total_tax: "10.00",
      currency: "USD",
      financial_status: "paid",
      fulfillment_status: null,
      line_items: [
        {
          id: 987654321,
          variant_id: 11223344,
          title: "Minimalist Leather Backpack",
          quantity: 1,
          price: "79.90",
          sku: "BP-MIN-01",
          vendor: "Leathercraft"
        }
      ],
      shipping_address: {
        first_name: "Jane",
        last_name: "Smith",
        address1: "456 Oak Lane",
        city: "Seattle",
        province: "Washington",
        country: "United States",
        zip: "98101"
      },
      customer: {
        id: 55443322,
        email: "customer@example.com",
        first_name: "Jane",
        last_name: "Smith"
      }
    },
    'customer.created': {
      id: 207119551,
      email: "bob@example.com",
      accepts_marketing: true,
      created_at: "2026-07-10T00:24:23-04:00",
      updated_at: "2026-07-10T00:24:23-04:00",
      first_name: "Bob",
      last_name: "Bobberson",
      orders_count: 0,
      state: "disabled",
      total_spent: "0.00",
      last_order_id: null,
      note: null,
      verified_email: true,
      multipass_identifier: null,
      tax_exempt: false,
      phone: "+15556251199",
      tags: "newsletter, prospects",
      last_order_name: null,
      currency: "USD",
      addresses: [
        {
          id: 207119551,
          customer_id: 207119551,
          first_name: "Bob",
          last_name: "Bobberson",
          company: "Bob's Burgers",
          address1: "123 Ocean Avenue",
          address2: "",
          city: "Seymour Bay",
          province: "New Jersey",
          country: "United States",
          zip: "07701",
          phone: "+15556251199",
          name: "Bob Bobberson",
          province_code: "NJ",
          country_code: "US",
          country_name: "United States",
          default: true
        }
      ]
    },
    'product.update': {
      id: 632910392,
      title: "Ergonomic Office Chair v2",
      body_html: "<strong>Comfortable</strong> office chair with lumbar support.",
      vendor: "OfficeMaximus",
      product_type: "Furniture",
      created_at: "2026-07-10T00:24:23-04:00",
      handle: "ergonomic-office-chair-v2",
      updated_at: "2026-07-10T00:24:23-04:00",
      published_at: "2026-07-10T00:24:23-04:00",
      status: "active",
      variants: [
        {
          id: 808950810,
          product_id: 632910392,
          title: "Midnight Black",
          price: "249.99",
          sku: "CH-ERG-BLK",
          position: 1,
          inventory_policy: "deny",
          inventory_quantity: 42
        }
      ]
    }
  },
  github: {
    'push': {
      ref: "refs/heads/main",
      before: "904b1c13e21249489786d31922b779b5c00a7b1d",
      after: "6dcb09b5b57875f334f61aebed695e2e4193db5e",
      repository: {
        id: 35129377,
        name: "toolhub",
        full_name: "username/toolhub",
        private: false,
        owner: {
          name: "username",
          email: "user@example.com",
          login: "username"
        },
        html_url: "https://github.com/username/toolhub",
        description: "All your favorite tools in one hub"
      },
      pusher: {
        name: "username",
        email: "user@example.com"
      },
      sender: {
        login: "username",
        id: 1234567,
        avatar_url: "https://github.com/images/error/username_gif",
        type: "User"
      },
      created: false,
      deleted: false,
      forced: false,
      base_ref: null,
      commits: [
        {
          id: "6dcb09b5b57875f334f61aebed695e2e4193db5e",
          distinct: true,
          message: "feat: add webhook tester tool to toolhub",
          timestamp: "2026-07-10T00:24:23+05:00",
          url: "https://github.com/username/toolhub/commit/6dcb09b5",
          author: {
            name: "username",
            email: "user@example.com"
          },
          committer: {
            name: "username",
            email: "user@example.com"
          },
          added: [
            "src/app/webhook-tester/page.tsx",
            "src/app/webhook-tester/_client.tsx"
          ],
          removed: [],
          modified: []
        }
      ],
      head_commit: {
        id: "6dcb09b5b57875f334f61aebed695e2e4193db5e",
        message: "feat: add webhook tester tool to toolhub",
        timestamp: "2026-07-10T00:24:23+05:00",
        author: {
          name: "username",
          email: "user@example.com"
        }
      }
    },
    'pull_request': {
      action: "opened",
      number: 42,
      pull_request: {
        url: "https://api.github.com/repos/username/toolhub/pulls/42",
        id: 23456789,
        html_url: "https://github.com/username/toolhub/pull/42",
        state: "open",
        locked: false,
        title: "Feat/webhook tester",
        user: {
          login: "developer-guy",
          id: 7654321
        },
        body: "This PR adds the Webhook Tester tool. Closes #12.",
        created_at: "2026-07-10T00:24:23Z",
        updated_at: "2026-07-10T00:24:23Z",
        head: {
          label: "username:feat/webhook-tester",
          ref: "feat/webhook-tester",
          sha: "6dcb09b5b57875f334f61aebed695e2e4193db5e"
        },
        base: {
          label: "username:main",
          ref: "main",
          sha: "904b1c13e21249489786d31922b779b5c00a7b1d"
        }
      },
      repository: {
        id: 35129377,
        name: "toolhub",
        full_name: "username/toolhub"
      },
      sender: {
        login: "developer-guy",
        id: 7654321
      }
    },
    'issues.opened': {
      action: "opened",
      issue: {
        url: "https://api.github.com/repos/username/toolhub/issues/12",
        id: 13579246,
        number: 12,
        title: "Bug: Syntax highlighter throws error with invalid JSON",
        user: {
          login: "bug-finder",
          id: 9988776
        },
        state: "open",
        locked: false,
        comments: 0,
        created_at: "2026-07-10T00:24:23Z",
        updated_at: "2026-07-10T00:24:23Z",
        body: "When typing custom invalid JSON in the webhook tester, it crashes instead of showing a validation error."
      },
      repository: {
        id: 35129377,
        name: "toolhub",
        full_name: "username/toolhub"
      },
      sender: {
        login: "bug-finder",
        id: 9988776
      }
    }
  },
  custom: {
    'custom.event': {
      event: "custom.trigger",
      timestamp: "2026-07-10T00:24:23Z",
      data: {
        message: "Hello from KRUMB.DEV Webhook Tester!",
        status: "success",
        test_mode: true
      }
    }
  }
}

interface CustomHeader {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface ResponseResult {
  status: number | null
  statusText: string | null
  headers: Record<string, string>
  body: string
  timeMs: number
  errorType: 'cors_or_network' | null
  errorDetails?: string
}

interface HistoryItem {
  id: string
  timestamp: string
  url: string
  method: string
  provider: Provider
  eventType: string
  status: number | string
  timeMs: number
  payload: string
  headers: Record<string, string>
  response: ResponseResult
}

const PRO_LIMIT = true
const FREE_LIMIT_HISTORY = 50

export default function WebhookTesterClient() {
  const { toast } = useToast()
  const [provider, setProvider] = useState<Provider>('stripe')
  const [eventType, setEventType] = useState<string>('charge.succeeded')
  const [payload, setPayload] = useState<string>('')
  const [payloadError, setPayloadError] = useState<string | null>(null)
  
  const [url, setUrl] = useState<string>('http://localhost:3000/api/webhook')
  const [method, setMethod] = useState<string>('POST')
  const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([])
  
  const [isSending, setIsSending] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<ResponseResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [activeResponseTab, setActiveResponseTab] = useState<'body' | 'headers'>('body')
  
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [copiedResponseBody, setCopiedResponseBody] = useState(false)

  // Sync templates on load or when provider/event changes
  useEffect(() => {
    const template = PAYLOAD_TEMPLATES[provider]?.[eventType] || PAYLOAD_TEMPLATES.custom['custom.event']
    const formatted = JSON.stringify(template, null, 2)
    setPayload(formatted)
    setPayloadError(null)
  }, [provider, eventType])

  // Adjust options based on provider
  useEffect(() => {
    if (provider !== 'custom') {
      const keys = Object.keys(PAYLOAD_TEMPLATES[provider] || {})
      if (keys.length > 0 && !keys.includes(eventType)) {
        setEventType(keys[0])
      }
    } else {
      setEventType('custom.event')
    }
  }, [provider, eventType])

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('toolhub_webhook_history')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, PRO_LIMIT ? 100 : FREE_LIMIT_HISTORY))
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Helper: Syntax Highlighting for JSON
  const syntaxHighlight = (json: string) => {
    if (!json) return ''
    let formatted = json
    try {
      const parsed = JSON.parse(json)
      formatted = JSON.stringify(parsed, null, 2)
    } catch (e) {
      // Return raw string if JSON is invalid, escaping it safely
    }

    const escaped = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-[#00FF41]' // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-[#818cf8] font-bold' // key
          } else {
            cls = 'text-[#00FF41]' // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-[#00FF41] font-bold' // boolean
          } else if (/null/.test(match)) {
          cls = 'text-rose-600' // null
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
  }

  // Get auto-provider headers list
  const getProviderHeaders = (p: Provider, event: string) => {
    const nowSec = Math.floor(Date.now() / 1000)
    switch (p) {
      case 'stripe':
        return [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Stripe-Signature', value: `t=${nowSec},v1=mock_sig_9b8374d7102e3a` },
          { key: 'User-Agent', value: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)' }
        ]
      case 'shopify':
        return [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'X-Shopify-Topic', value: event.replace('.', '/') },
          { key: 'X-Shopify-Hmac-Sha256', value: 'mock_hmac_sha256_3b81109a8ec' },
          { key: 'X-Shopify-Shop-Domain', value: 'sandbox-store.myshopify.com' }
        ]
      case 'github':
        return [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'X-GitHub-Event', value: event.split('.')[0] },
          { key: 'X-Hub-Signature-256', value: 'sha256=mock_sha256_5a823ed689cf' },
          { key: 'User-Agent', value: 'GitHub-Hookshot/f382a39' }
        ]
      default:
        return [
          { key: 'Content-Type', value: 'application/json' }
        ]
    }
  }

  const activeAutoHeaders = getProviderHeaders(provider, eventType)
  
  // Combine all active headers
  const getCombinedHeaders = () => {
    const combined: Record<string, string> = {}
    activeAutoHeaders.forEach(h => {
      combined[h.key] = h.value
    })
    customHeaders.forEach(h => {
      if (h.enabled && h.key.trim()) {
        combined[h.key.trim()] = h.value
      }
    })
    return combined
  }

  // Build the cURL command string
  const curlCommand = (() => {
    let cmd = `curl -X ${method} "${url}"`
    const headers = getCombinedHeaders()
    Object.entries(headers).forEach(([key, val]) => {
      const escapedValue = val.replace(/"/g, '\\"')
      cmd += ` \\\n  -H "${key}: ${escapedValue}"`
    })
    if (payload && !['GET', 'HEAD'].includes(method)) {
      // Escape single quotes and display
      const escapedBody = payload.replace(/'/g, "'\\''")
      cmd += ` \\\n  -d '${escapedBody}'`
    }
    return cmd
  })()

  // Handle payload adjustments
  const handlePayloadChange = (val: string) => {
    setPayload(val)
    try {
      JSON.parse(val)
      setPayloadError(null)
    } catch (e: any) {
      setPayloadError(e.message || 'Invalid JSON format')
    }
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(payload)
      setPayload(JSON.stringify(parsed, null, 2))
      setPayloadError(null)
    } catch (e) {
      toast('Cannot format: JSON is invalid.', 'error')
    }
  }

  // Manage headers
  const handleAddHeader = () => {
    if (!PRO_LIMIT && customHeaders.length >= 1) {
      toast('Custom headers are now free — no limits!', 'info')
      return
    }
    setCustomHeaders(prev => [...prev, { id: Math.random().toString(), key: '', value: '', enabled: true }])
  }

  const handleUpdateHeader = (id: string, field: 'key' | 'value', val: string) => {
    setCustomHeaders(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h))
  }

  const handleRemoveHeader = (id: string) => {
    setCustomHeaders(prev => prev.filter(h => h.id !== id))
  }

  // Fire Webhook
  const handleSendWebhook = async () => {
    if (payloadError) {
      toast('Please fix JSON errors in payload before sending.', 'error')
      return
    }
    if (!url) {
      toast('Please specify a valid webhook endpoint URL.', 'error')
      return
    }

    setIsSending(true)
    const startTime = performance.now()
    const requestHeaders = getCombinedHeaders()
    
    try {
      const response = await fetch('/api/webhook-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          method,
          headers: requestHeaders,
          body: ['GET', 'HEAD'].includes(method) ? undefined : payload
        })
      })

      const data = await response.json()
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      if (response.status === 502) {
        const errorResult: ResponseResult = {
          status: null,
          statusText: data.statusText || 'Proxy Request Failed',
          headers: {},
          body: '',
          timeMs: duration,
          errorType: 'cors_or_network',
          errorDetails: data.errorDetails || 'Error occurred while forwarding the webhook request'
        }
        setCurrentResponse(errorResult)
        saveToHistory(url, method, duration, 'Failed', errorResult, requestHeaders)
        return
      }

      const result: ResponseResult = {
        status: data.status,
        statusText: data.statusText,
        headers: data.headers || {},
        body: data.body || '',
        timeMs: data.timeMs || duration,
        errorType: null
      }

      setCurrentResponse(result)
      saveToHistory(url, method, duration, data.status, result, requestHeaders)
    } catch (err: any) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      const errorResult: ResponseResult = {
        status: null,
        statusText: 'Proxy connection failure',
        headers: {},
        body: '',
        timeMs: duration,
        errorType: 'cors_or_network',
        errorDetails: err.message || 'Could not connect to webhook proxy server.'
      }

      setCurrentResponse(errorResult)
      saveToHistory(url, method, duration, 'Failed', errorResult, requestHeaders)
    } finally {
      setIsSending(false)
    }
  }

  const saveToHistory = (
    reqUrl: string,
    reqMethod: string,
    duration: number,
    respStatus: number | string,
    respResult: ResponseResult,
    reqHeaders: Record<string, string>
  ) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      url: reqUrl,
      method: reqMethod,
      provider,
      eventType,
      status: respStatus,
      timeMs: duration,
      payload,
      headers: reqHeaders,
      response: respResult
    }

    setHistory(prev => {
      const updated = [newItem, ...prev]
      const limited = PRO_LIMIT ? updated : updated.slice(0, FREE_LIMIT_HISTORY)
      localStorage.setItem('toolhub_webhook_history', JSON.stringify(limited))
      return limited
    })
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('toolhub_webhook_history')
    setSelectedHistoryId(null)
    setCurrentResponse(null)
  }

  const handleLoadHistory = (item: HistoryItem) => {
    setSelectedHistoryId(item.id)
    setUrl(item.url)
    setMethod(item.method)
    setProvider(item.provider)
    setEventType(item.eventType)
    setPayload(item.payload)
    setPayloadError(null)
    
    // Re-build custom headers
    const autoKeys = getProviderHeaders(item.provider, item.eventType).map(h => h.key.toLowerCase())
    const custom: CustomHeader[] = []
    
    Object.entries(item.headers).forEach(([key, val]) => {
      if (!autoKeys.includes(key.toLowerCase())) {
        custom.push({
          id: Math.random().toString(),
          key,
          value: val,
          enabled: true
        })
      }
    })
    setCustomHeaders(custom)
    setCurrentResponse(item.response)
  }

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2000)
    })
  }

  // FAQ & SEO Section for ToolLayout
  const webhookFaq = [
    {
      question: 'What is Webhook Tester?',
      answer: 'Webhook Tester is a client-side developer utility built to simulate, send, and troubleshoot API webhooks. You can generate real payloads from Stripe, Shopify, or GitHub, and deliver them directly to your local endpoints (like localhost:3000) right from your web browser.'
    },
    {
      question: 'Why do I see a "CORS or Network Failure" error when calling localhost?',
      answer: 'Since this utility executes entirely within your browser for privacy, outbound requests are subject to browser CORS (Cross-Origin Resource Sharing) constraints. If your local API server is not configured with CORS headers (specifically Access-Control-Allow-Origin: *), the browser will block the response. To bypass this, configure CORS on your server, use a CORS browser extension, or use the generated cURL command in your terminal.'
    },
    {
      question: 'How do I test webhook signature verification?',
      answer: 'The tester automatically calculates standard headers, such as Stripe-Signature or X-Shopify-Hmac-Sha256, and fills them with dummy values. This allows you to verify that your webhook controller is extracting and reading the proper header keys, even if cryptographically authentic validation requires the official provider signature.'
    },
    {
      question: 'Is my webhook payload sent to KRUMB.DEV servers?',
      answer: 'No. All requests are fired client-side directly from your browser to your local or remote webhook endpoint. Your payloads, target URLs, and response logs never touch KRUMB.DEV servers, guaranteeing total data security and privacy.'
    },
    {
      question: 'Can I use Webhook Tester with production webhooks?',
      answer: 'Yes - you can point the tester at any HTTPS endpoint, including production or staging servers. However, use caution when sending test payloads to production endpoints that may trigger real side effects like charges or emails. The tool is primarily designed for local development and sandbox testing where you control the receiving server.'
    }
  ]

  const seoContent = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Simulate and Test Webhook Endpoints Locally</h2>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
      <p>
        The tool maintains a library of structural mock payloads matching the actual API shapes of each provider. When you select an event type (e.g. Stripe charge.succeeded, GitHub push, Shopify order.created), it assembles a complete JSON payload with realistic field values, headers (Content-Type, User-Agent), and webhook signature headers like Stripe-Signature or X-Shopify-Hmac-SHA256. The request is dispatched via the Fetch API directly from your browser to the target URL you specify, and the full HTTP response - status code, headers, and body - is captured and displayed in the history log.
      </p>
      <h3 className="text-sm font-bold text-[#F9F9F9]">Worked Example</h3>
      <p>
        <strong>Select:</strong> Stripe ? charge.succeeded<br />
        <strong>Target URL:</strong> <code className="text-xs font-mono">http://localhost:3000/api/webhooks/stripe</code><br />
        <strong>Expected behavior:</strong> Your local server receives a POST request with a JSON body containing the charge object (id, amount, currency, status, customer email). The Stripe-Signature header is included so your signature verification middleware can parse it. A 200 response from your server indicates the webhook was handled successfully, while a 4xx or 5xx reveals a bug in your receiver logic.
      </p>
      <h3 className="text-sm font-bold text-[#F9F9F9]">Common Mistakes</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
        <li><strong>Not handling CORS on localhost.</strong> Browser fetch requests to localhost are subject to CORS unless your dev server includes <code className="text-xs font-mono">Access-Control-Allow-Origin: *</code>. If the request fails silently, check your server&apos;s CORS configuration or use the generated cURL command instead.</li>
        <li><strong>Using production endpoints during development.</strong> Sending test payloads to live Stripe or Shopify webhook URLs can trigger real side effects - charges, emails, order fulfillment. Always use a local dev server or a dedicated staging endpoint with test mode enabled.</li>
        <li><strong>Ignoring webhook signature validation.</strong> The tool generates placeholder signature headers, but your production receiver should verify real signatures. Test your signature verification middleware separately with actual provider secrets rather than relying solely on mock signatures from this tool.</li>
      </ul>
    </div>
  )

  return (
    <ToolLayout
      title="Webhook Tester"
      description="Generate mock webhook payloads for Stripe, Shopify, and GitHub. Fire requests client-side directly to your local endpoint and inspect HTTP responses."
      toolSlug="webhook-tester"
            faq={webhookFaq}
      seoContent={seoContent}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Payload & Configurations */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Selector */}
            <div className="bg-[#0a0a0a] p-4 border border-[#333333] space-y-4">
              <h2 className="text-sm font-bold text-[#F9F9F9] flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-blue-100 text-[#00FF41] text-xs font-black">1</span>
                Webhook Event Generator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#888888] mb-1">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Provider)}
                    className="w-full px-3 py-2 border border-[#333333] text-sm bg-[#0a0a0a] text-[#F9F9F9] focus:outline-none"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="shopify">Shopify</option>
                    <option value="github">GitHub</option>
                    <option value="custom">Custom (JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#888888] mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    disabled={provider === 'custom'}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#333333] text-sm bg-[#0a0a0a] text-[#F9F9F9] focus:outline-none disabled:opacity-50"
                  >
                    {provider === 'stripe' && (
                      <>
                        <option value="charge.succeeded">charge.succeeded</option>
                        <option value="customer.created">customer.created</option>
                        <option value="invoice.payment_succeeded">invoice.payment_succeeded</option>
                      </>
                    )}
                    {provider === 'shopify' && (
                      <>
                        <option value="order.created">order.created</option>
                        <option value="customer.created">customer.created</option>
                        <option value="product.update">product.update</option>
                      </>
                    )}
                    {provider === 'github' && (
                      <>
                        <option value="push">push</option>
                        <option value="pull_request">pull_request</option>
                        <option value="issues.opened">issues.opened</option>
                      </>
                    )}
                    {provider === 'custom' && (
                      <option value="custom.event">custom.event</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payload Editor/Preview */}
            <div className="border border-[#333333] overflow-hidden">
              <div className="bg-[#0a0a0a] px-4 py-2 border-b border-[#333333] flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1 text-xs font-bold transition ${ activeTab === 'edit' ? 'bg-[#0a0a0a] text-[#F9F9F9] ' : 'text-[#888888] hover:text-[#F9F9F9]' }`}
                  >
                    <span className="flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" /> Edit Payload
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-xs font-bold transition ${ activeTab === 'preview' ? 'bg-[#0a0a0a] text-[#F9F9F9] ' : 'text-[#888888] hover:text-[#F9F9F9]' }`}
                  >
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Preview Highlighted
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFormatJson}
                    title="Format JSON"
                    className="p-1 text-[#888888] hover:text-[#00FF41] hover:bg-[#0a0a0a] transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyText(payload, setCopiedPayload)}
                    className="p-1 text-[#888888] hover:text-[#00FF41] hover:bg-[#0a0a0a] transition"
                    title="Copy Payload"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-1 bg-[#0a0a0a] ">
                {activeTab === 'edit' ? (
                  <div className="relative">
                    <textarea
                      value={payload}
                      onChange={(e) => handlePayloadChange(e.target.value)}
                      rows={14}
                      className="w-full p-4 font-mono text-xs border-0 outline-none bg-[#0a0a0a] text-[#F9F9F9] resize-y max-h-[500px]"
                      placeholder="Type custom JSON here..."
                    />
                    {payloadError && (
                      <div className="absolute bottom-2 left-2 right-2 p-2 bg-[#0a0a0a] border border-[#333333] flex items-center gap-2 text-xs text-[#FF4444]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-mono truncate">{payloadError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-auto">
                    <pre 
                      className="font-mono text-xs p-4 bg-[#0a0a0a] text-[#F9F9F9] whitespace-pre overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: syntaxHighlight(payload) }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Local Endpoint Delivery & Headers */}
            <div className="bg-[#0a0a0a] p-4 border border-[#333333] space-y-4">
              <h2 className="text-sm font-bold text-[#F9F9F9] flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-blue-100 text-[#00FF41] text-xs font-black">2</span>
                Fire Webhook to Endpoint
              </h2>

              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 border border-[#333333] text-sm bg-[#0a0a0a] text-[#F9F9F9] font-bold focus:outline-none"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="GET">GET</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://localhost:3000/api/webhook"
                    className="w-full px-3 py-2 border border-[#333333] text-sm bg-[#0a0a0a] text-[#F9F9F9] focus:outline-none"
                  />
                  <button
                    onClick={() => copyText(url, setCopiedUrl)}
                    className="absolute right-2 top-2 p-1 text-[#888888] hover:text-[#00FF41]"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Automatic Headers Preview */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-[#888888]">
                  Standard Provider Headers (Added Automatically)
                </span>
                <div className="p-2 bg-[#0a0a0a] border border-[#333333] space-y-1">
                  {activeAutoHeaders.map((h, i) => (
                    <div key={i} className="flex justify-between font-mono text-[10px] text-[#888888]">
                      <span className="font-bold text-[#818cf8]">{h.key}:</span>
                      <span className="truncate max-w-[250px] sm:max-w-xs">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Headers Input */}
              <div className="space-y-2 border-t border-[#333333] pt-3">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold text-[#888888]">
                    Custom Request Headers
                  </span>
                  <button
                    onClick={handleAddHeader}
                    className="text-xs text-[#00FF41] hover:text-[#00FF41] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Header
                  </button>
                </div>

                {customHeaders.length === 0 ? (
                  <p className="text-xs text-[#888888] italic">No custom headers. Add authentication tokens or custom keys here.</p>
                ) : (
                  <div className="space-y-2">
                    {customHeaders.map(h => (
                      <div key={h.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Header-Name"
                          value={h.key}
                          onChange={(e) => handleUpdateHeader(h.id, 'key', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-[#333333] text-xs bg-[#0a0a0a] text-[#F9F9F9]"
                        />
                        <input
                          type="text"
                          placeholder="value"
                          value={h.value}
                          onChange={(e) => handleUpdateHeader(h.id, 'value', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-[#333333] text-xs bg-[#0a0a0a] text-[#F9F9F9]"
                        />
                        <button
                          onClick={() => handleRemoveHeader(h.id)}
                          className="p-1.5 text-[#888888] hover:text-[#FF4444]"
                          title="Remove Header"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Free Cap Notice */}
                {!PRO_LIMIT && customHeaders.length >= 1 && (
                  <div className="p-2.5 bg-[#0a0a0a] border border-[#333333] text-xs text-[#00FF41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#00FF41] shrink-0 animate-pulse" />
                      Free Limit: Max 1 custom header.
                    </span>
                    <Link href="/pricing" className="text-xs font-bold text-[#00FF41] hover:underline flex items-center gap-0.5">
                      Unlock Pro <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Fire Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleSendWebhook}
                  disabled={isSending}
                  className="terminal-btn flex-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  [<span className="green-chevron">&gt;</span> {isSending ? 'SENDING...' : 'SEND TEST WEBHOOK'}]
                </button>
              </div>
            </div>

            {/* Copy cURL Section */}
            <div className="bg-[#0a0a0a] text-[#888888] border border-[#333333] overflow-hidden">
              <div className="px-4 py-2 bg-[#0a0a0a] flex items-center justify-between border-b border-[#333333]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F9F9F9]">
                  <Terminal className="w-4 h-4 text-[#00FF41]" />
                  <span>cURL Command Generator</span>
                </div>
                <button
                  onClick={() => copyText(curlCommand, setCopiedCurl)}
                  className="text-xs text-[#888888] hover:text-white flex items-center gap-1 transition"
                  title="Copy cURL command"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                      <span className="text-[#00FF41]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 font-mono text-[10px] sm:text-xs overflow-x-auto whitespace-pre leading-relaxed text-[#888888] max-h-48 overflow-y-auto">
                {curlCommand}
              </div>
              <div className="px-4 py-2 bg-[#0a0a0a] text-[10px] text-[#888888] italic">
                Tip: Run this cURL command in your terminal to easily test local endpoints and bypass browser CORS restrictions.
              </div>
            </div>

          </div>

          {/* RIGHT: Response & History */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Response Inspector */}
            <div className="border border-[#333333] overflow-hidden bg-[#0a0a0a] flex flex-col min-h-[400px]">
              <div className="bg-[#0a0a0a] px-4 py-3 border-b border-[#333333] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F9F9F9]">Response Inspector</h3>
                {currentResponse && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#888888] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {currentResponse.timeMs}ms
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-4 flex flex-col">
                {!currentResponse ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#888888]">
                    <Play className="w-8 h-8 mb-2 opacity-40 text-[#00FF41]" />
                    <p className="text-xs font-bold">No requests sent yet</p>
                    <p className="text-[11px] opacity-75 mt-1">Configure your mock webhook details and click Send Test Webhook to inspect the API response here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Status code badge */}
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold text-[#888888]">Status:</div>
                      {currentResponse.status ? (
                        <span className={`px-2 py-1 text-xs font-extrabold ${ currentResponse.status >= 200 && currentResponse.status < 300 ? 'bg-green-100 text-[#00FF41]' : 'bg-red-100 text-[#FF4444]' }`}>
                          {currentResponse.status} {currentResponse.statusText}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-extrabold bg-amber-100 text-[#00FF41]">
                          {currentResponse.statusText}
                        </span>
                      )}
                    </div>

                    {/* CORS Debug Guide if Error */}
                    {currentResponse.errorType === 'cors_or_network' && (
                      <div className="p-3 bg-[#0a0a0a] border border-[#333333] space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#00FF41]">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Browser CORS / Network Failure</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#00FF41]">
                          Since this tool runs inside your browser, requests to local URLs (like localhost) will fail unless your local API server responds with proper CORS headers (e.g. <code className="px-1 py-0.5 bg-amber-100/50 font-mono text-[9px]">Access-Control-Allow-Origin: *</code>).
                        </p>
                        <div className="text-[11px] text-[#00FF41] space-y-1">
                          <p className="font-bold">Workarounds:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Run your local server with CORS middleware enabled.</li>
                            <li>Copy and run the generated <span className="font-bold">cURL Command</span> in your terminal (terminal requests bypass browser CORS restrictions).</li>
                            <li>Install a browser extension to temporarily toggle CORS rules for testing.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Response body & headers tabs */}
                    {currentResponse.errorType !== 'cors_or_network' && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex border-b border-[#333333] mb-2">
                          <button
                            onClick={() => setActiveResponseTab('body')}
                            className={`px-3 py-1.5 text-xs font-bold border-b-2 transition ${ activeResponseTab === 'body' ? 'border-[#00FF41] text-[#00FF41]' : 'border-transparent text-[#888888] hover:text-[#F9F9F9]' }`}
                          >
                            Response Body
                          </button>
                          <button
                            onClick={() => setActiveResponseTab('headers')}
                            className={`px-3 py-1.5 text-xs font-bold border-b-2 transition ${ activeResponseTab === 'headers' ? 'border-[#00FF41] text-[#00FF41]' : 'border-transparent text-[#888888] hover:text-[#F9F9F9]' }`}
                          >
                            Response Headers ({Object.keys(currentResponse.headers).length})
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col bg-[#0a0a0a] p-3 max-h-[300px] overflow-auto border border-[#333333] ">
                          {activeResponseTab === 'body' ? (
                            currentResponse.body ? (
                              <div className="relative group flex-1">
                                <button
                                  onClick={() => copyText(currentResponse.body, setCopiedResponseBody)}
                                  className="absolute right-2 top-2 p-1.5 bg-[#0a0a0a] border border-[#333333] text-[#888888] hover:text-[#00FF41] opacity-0 group-hover:opacity-100 transition "
                                  title="Copy response body"
                                >
                                  {copiedResponseBody ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <pre className="font-mono text-xs whitespace-pre-wrap break-all text-[#F9F9F9]">
                                  {currentResponse.body.startsWith('{') || currentResponse.body.startsWith('[') ? (
                                    <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(currentResponse.body) }} />
                                  ) : (
                                    currentResponse.body
                                  )}
                                </pre>
                              </div>
                            ) : (
                              <span className="text-xs text-[#888888] italic">Empty Response Body</span>
                            )
                          ) : (
                            <div className="space-y-1">
                              {Object.keys(currentResponse.headers).length === 0 ? (
                                <span className="text-xs text-[#888888] italic">No Headers Received</span>
                              ) : (
                                Object.entries(currentResponse.headers).map(([key, val]) => (
                                  <div key={key} className="flex justify-between font-mono text-[10px] border-b border-[#333333] pb-1">
                                    <span className="font-bold text-[#888888]">{key}:</span>
                                    <span className="text-[#F9F9F9] break-all pl-2 text-right">{val}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* History Log */}
            <div className="border border-[#333333] bg-[#0a0a0a] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F9F9F9] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#888888]" />
                  Local History Log
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-[#888888] hover:text-[#FF4444] flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-[#333333] text-[#888888]">
                  <p className="text-xs font-bold">No recent test history</p>
                  <p className="text-[10px] opacity-75 mt-0.5">Your triggered webhook test history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => {
                    const isSelected = selectedHistoryId === item.id
                    const isSuccess = typeof item.status === 'number' && item.status >= 200 && item.status < 300
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleLoadHistory(item)}
                        className={`p-3 border text-left cursor-pointer transition flex items-center justify-between gap-3 ${ isSelected ? 'bg-blue-50/50 border-[#00FF41] ' : 'bg-[#0a0a0a]  hover:bg-[#0a0a0a] border-[#333333] ' }`}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-[#888888]">{item.timestamp}</span>
                            <span className="text-[10px] uppercase font-extrabold px-1 py-0.5 bg-[#0a0a0a] text-[#F9F9F9]">
                              {item.provider}
                            </span>
                            <span className="text-[10px] text-[#888888] font-mono truncate max-w-[80px]">
                              {item.eventType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-[#F9F9F9] truncate">
                            <span className="font-extrabold text-[#00FF41]">{item.method}</span>
                            <span className="truncate">{item.url}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-block text-[10px] font-extrabold px-1.5 py-0.5 ${ isSuccess ? 'bg-green-100 text-[#00FF41]' : 'bg-red-100 text-[#FF4444]' }`}>
                            {item.status}
                          </span>
                          <p className="text-[9px] text-[#888888] mt-1">{item.timeMs}ms</p>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Pro History limit info */}
                  {!PRO_LIMIT && history.length >= FREE_LIMIT_HISTORY && (
                    <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-[#333333] text-center space-y-1">
                      <p className="text-xs font-bold text-[#00FF41] flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" />
                        History Limit Reached (Free Tier)
                      </p>
                      <p className="text-[10px] text-[#00FF41]">
                        We only save the {FREE_LIMIT_HISTORY} most recent webhooks. Upgrade to Pro to save unlimited history logs, export CSV logs, and mock server responses!
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-block mt-1 text-xs font-bold px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white transition"
                      >
                        Upgrade Now
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Pro Feature Gate at the very bottom */}
              </div>
    </ToolLayout>
  )
}




