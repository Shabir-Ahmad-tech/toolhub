'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

// ── Types ──────────────────────────────────────────

interface DnsRecord {
  value: string
  ttl?: string
  priority?: number
}

interface DnsSection {
  type: string
  label: string
  explanation: string
  records: DnsRecord[]
}

interface SslInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  daysRemaining: number
  signatureAlgorithm: string
  protocol: string
  sans: string[]
  chain: string[]
}

// ── Simulated DNS for krumb.dev ────────────────────

const KRUMB_DNS: DnsSection[] = [
  {
    type: 'A',
    label: 'A Records',
    explanation:
      'A (Address) records map a domain name to an IPv4 address. When you type krumb.dev into your browser, DNS resolves the A record to find the server\'s IPv4 address. Most websites on the modern web use at least one A record pointing to their hosting provider\'s load balancer or CDN edge.',
    records: [
      { value: '76.76.21.21', ttl: '14400' },
      { value: '76.76.21.22', ttl: '14400' },
    ],
  },
  {
    type: 'AAAA',
    label: 'AAAA Records',
    explanation:
      'AAAA (Quad-A) records map a domain name to an IPv6 address. IPv6 is the successor to IPv4 and provides a vastly larger address space. If a domain has both A and AAAA records, browsers will prefer IPv6 when the client network supports it.',
    records: [{ value: '2606:4700:20::681a:89b', ttl: '14400' }],
  },
  {
    type: 'CNAME',
    label: 'CNAME Records',
    explanation:
      'CNAME (Canonical Name) records alias one domain to another. When a CNAME exists, DNS queries for the source domain return the target domain\'s records instead. CNAMEs cannot coexist with other record types at the same domain root (apex).',
    records: [],
    // No CNAME at apex — show a note instead
  },
  {
    type: 'MX',
    label: 'MX Records',
    explanation:
      'MX (Mail Exchange) records specify the mail servers responsible for receiving email on behalf of the domain. Each MX record has a priority value — lower numbers are tried first. If the highest-priority server is unreachable, the next one is used.',
    records: [
      { value: 'aspmx.l.google.com', priority: 1, ttl: '3600' },
      { value: 'alt1.aspmx.l.google.com', priority: 5, ttl: '3600' },
      { value: 'alt2.aspmx.l.google.com', priority: 10, ttl: '3600' },
    ],
  },
  {
    type: 'NS',
    label: 'NS Records',
    explanation:
      'NS (Name Server) records delegate a domain to authoritative DNS servers. These servers hold the official DNS records for the domain. NS records are critical — without them, no one can find your domain\'s other DNS records.',
    records: [
      { value: 'ns1.vercel-dns.com', ttl: '86400' },
      { value: 'ns2.vercel-dns.com', ttl: '86400' },
    ],
  },
  {
    type: 'TXT',
    label: 'TXT Records',
    explanation:
      'TXT (Text) records store arbitrary text data associated with a domain. They are commonly used for email authentication (SPF, DKIM, DMARC), domain ownership verification (Google Search Console), and security policies. Each TXT record is a quoted string.',
    records: [
      { value: 'google-site-verification=exampleVerificationString', ttl: '3600' },
      { value: 'v=spf1 include:_spf.google.com ~all', ttl: '3600' },
    ],
  },
  {
    type: 'SOA',
    label: 'SOA Record',
    explanation:
      'SOA (Start of Authority) records contain administrative information about the domain zone: the primary name server, the hostmaster email, and timing values for zone transfers and caching. Every domain must have exactly one SOA record at its zone apex.',
    records: [
      { value: 'Primary NS: ns1.vercel-dns.com', ttl: '86400' },
      { value: 'Hostmaster: hostmaster.vercel.com', ttl: '86400' },
      { value: 'Serial: 2026031501 | Refresh: 3600 | Retry: 600 | Expire: 86400 | Min TTL: 300', ttl: '' },
    ],
  },
]

const KRUMB_SSL: SslInfo = {
  subject: 'CN = krumb.dev',
  issuer: 'R3, Let\'s Encrypt',
  validFrom: '2026-05-15 00:00:00 UTC',
  validTo: '2026-08-13 23:59:59 UTC',
  daysRemaining: 32,
  signatureAlgorithm: 'SHA-256 with RSA',
  protocol: 'TLS 1.3',
  sans: ['krumb.dev', 'www.krumb.dev'],
  chain: ['krumb.dev (leaf)', 'R3 (intermediate — Let\'s Encrypt)', 'ISRG Root X1 (root)'],
}

// ── Educational explanations per record type (for custom domains) ──

const DNS_RECORD_TYPES: Omit<DnsSection, 'records'>[] = [
  {
    type: 'A',
    label: 'A Records',
    explanation:
      'A (Address) records map a domain name to an IPv4 address. The most fundamental DNS record type. Without an A record, a domain cannot be reached by IPv4 clients. Example query output: "krumb.dev A → 76.76.21.21" with a TTL of 14400 seconds (4 hours).',
  },
  {
    type: 'AAAA',
    label: 'AAAA Records',
    explanation:
      'AAAA (Quad-A) records map a domain name to an IPv6 address. As IPv6 adoption grows, more domains serve AAAA records alongside A records. Example query output: "krumb.dev AAAA → 2606:4700:20::681a:89b".',
  },
  {
    type: 'CNAME',
    label: 'CNAME Records',
    explanation:
      'CNAME (Canonical Name) records alias one domain to another. Often used to point "www.krumb.dev" to "krumb.dev" so both serve the same content. CNAMEs cannot be used at the domain root (apex) alongside other record types per DNS standards.',
  },
  {
    type: 'MX',
    label: 'MX Records',
    explanation:
      'MX (Mail Exchange) records define the mail servers for a domain. Priority values determine failover order — lower numbers are preferred. Example: priority 1 → aspmx.l.google.com is the primary mail handler; priority 10 → alt2.aspmx.l.google.com is a backup.',
  },
  {
    type: 'NS',
    label: 'NS Records',
    explanation:
      'NS (Name Server) records specify which authoritative DNS servers host the domain\'s zone file. Changing NS records effectively transfers domain management to a different DNS provider. Most domains have at least two NS records for redundancy.',
  },
  {
    type: 'TXT',
    label: 'TXT Records',
    explanation:
      'TXT (Text) records hold arbitrary text, commonly used for email security (SPF, DKIM, DMARC) and domain ownership verification. SPF records list authorized mail servers. DKIM records contain public keys for email signing. DMARC policies tell receivers how to handle unauthenticated email.',
  },
  {
    type: 'SOA',
    label: 'SOA Record',
    explanation:
      'SOA (Start of Authority) records contain the primary name server, the responsible party\'s email (formatted as hostmaster.domain.com), and zone-wide timing values: Refresh (how often slaves check for updates), Retry (delay after failed transfer), Expire (when slave stops serving the zone), and Minimum TTL (negative caching).',
  },
]

// ── Simulated SSL template ─────────────────────────

const SSL_TEMPLATE: SslInfo = {
  subject: 'CN = [domain]',
  issuer: 'Certificate Authority Name',
  validFrom: 'YYYY-MM-DD HH:MM:SS UTC',
  validTo: 'YYYY-MM-DD HH:MM:SS UTC',
  daysRemaining: 0,
  signatureAlgorithm: 'SHA-256 with RSA',
  protocol: 'TLS 1.3',
  sans: ['[domain]', 'www.[domain]'],
  chain: ['[domain] (leaf)', 'Intermediate CA', 'Root CA'],
}

// ── Helpers ────────────────────────────────────────

function getSimulatedDns(domain: string): DnsSection[] {
  if (domain === 'krumb.dev') return KRUMB_DNS

  return DNS_RECORD_TYPES.map((t) => {
    const placeholder: DnsRecord =
      t.type === 'MX'
        ? { value: `mail.${domain} (priority 10)`, ttl: '3600' }
        : t.type === 'SOA'
          ? {
              value: `Primary NS: ns1.${domain} | Serial: YYYYMMDDNN | Refresh: 3600 | Retry: 600 | Expire: 86400 | Min TTL: 300`,
              ttl: '86400',
            }
          : t.type === 'CNAME'
            ? { value: 'No CNAME record at apex — CNAME can only be set on subdomains', ttl: '' }
            : { value: `No ${t.type} record found (simulated)`, ttl: '' }

    return {
      ...t,
      records: [placeholder],
    }
  })
}

function getSimulatedSsl(domain: string): SslInfo {
  if (domain === 'krumb.dev') return KRUMB_SSL
  return {
    ...SSL_TEMPLATE,
    subject: `CN = ${domain}`,
    sans: [domain, `www.${domain}`],
    daysRemaining: 90,
  }
}

function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    d.trim()
  )
}

// ── Copy component ─────────────────────────────────

function CopyButton({ text, label = 'COPY' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="terminal-btn shrink-0">
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : label}]
    </button>
  )
}

// ── Main component ─────────────────────────────────

const dnsFaq = [
  {
    question: 'What is a DNS lookup and why would I need one?',
    answer: 'A DNS lookup queries the Domain Name System to find records associated with a domain name. Developers use DNS lookups to verify DNS propagation after changing hosting or email providers, to troubleshoot connectivity issues, to inspect SPF and DKIM records for email deliverability, and to confirm SSL certificate issuance. This tool simulates those lookups for educational purposes.',
  },
  {
    question: 'What is the difference between A and AAAA records?',
    answer: 'A records map a domain to an IPv4 address (e.g., 76.76.21.21) while AAAA records map to an IPv6 address (e.g., 2606:4700:20::681a:89b). Both serve the same purpose — directing traffic to a server — but they use different IP address formats. IPv6 was introduced to solve IPv4 address exhaustion, and most modern hosting providers support both.',
  },
  {
    question: 'What information does an SSL certificate reveal?',
    answer: 'An SSL/TLS certificate reveals the certificate subject (domain it was issued for), the issuer (Certificate Authority that signed it), the validity period (not-before and not-after dates), the Subject Alternative Names (SANs — additional domains covered), the signature algorithm used, and the certificate chain linking it back to a trusted root. Checking these details helps diagnose expired certificates, misconfigured domains, or untrusted issuers.',
  },
  {
    question: 'Why can\'t this tool perform real DNS lookups?',
    answer: 'Real DNS and SSL checks require server-side network access. Web browsers restrict cross-origin DNS and HTTPS requests for security reasons (CORS policy). A real DNS/SSL checker requires a backend proxy server that performs the lookup and returns the results. This educational version simulates realistic DNS and certificate data so you can learn how these technologies work.',
  },
  {
    question: 'What are the most common DNS record types I should know?',
    answer: 'The most common DNS record types are: A (IPv4 address), AAAA (IPv6 address), CNAME (domain aliasing), MX (mail server routing), NS (authoritative name servers), TXT (arbitrary text for verification and email security), and SOA (zone administration). Together these records form the complete DNS configuration for any domain. Understanding them is essential for web development, DevOps, and site reliability engineering.',
  },
]

const dnsSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">
      DNS Lookup & SSL Certificate Checker
    </h2>
    <p className="text-[#888888] font-mono">
      DNS record lookup and SSL certificate inspection are essential diagnostics
      for anyone managing websites, APIs, or email infrastructure. Understanding
      what DNS records your domain publishes — A, AAAA, CNAME, MX, NS, TXT, and
      SOA — helps you troubleshoot propagation delays, configure email
      authentication, and verify that your domain resolves correctly worldwide.
      SSL certificate information tells you whether your TLS certificates are
      valid, trusted, and configured to cover the right domain names.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      Understanding DNS Record Types
    </h3>
    <p className="text-[#888888] font-mono">
      Every domain on the internet relies on DNS records to tell clients how to
      reach it. A records point to IPv4 addresses. AAAA records handle IPv6.
      MX records route email. CNAME records alias subdomains. NS records
      delegate authority. TXT records store verification tokens and email
      security policies. The SOA record contains zone-wide administrative
      metadata. This tool helps you explore each record type interactively,
      with explanations of what each one does and how it appears in a real DNS
      zone file.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      SSL Certificate Verification for Developers
    </h3>
    <p className="text-[#888888] font-mono">
      SSL/TLS certificates are the backbone of secure web communications. By
      inspecting a certificate you can verify its issuer (the Certificate
      Authority), its validity period, the subject domain, and the Subject
      Alternative Names (SANs) it covers. Checking these details is critical
      before a certificate expires — expired certificates cause browser
      warnings and service disruptions. This tool simulates certificate
      inspection to help developers understand what information is available
      and how to interpret it.
    </p>
  </div>
)

export default function DnsSslCheckerPage() {
  const [domain, setDomain] = useState('krumb.dev')
  const [inputValue, setInputValue] = useState('krumb.dev')
  const [activeTab, setActiveTab] = useState<'dns' | 'ssl'>('dns')
  const [dnsResults, setDnsResults] = useState<DnsSection[]>(getSimulatedDns('krumb.dev'))
  const [sslResult, setSslResult] = useState<SslInfo>(getSimulatedSsl('krumb.dev'))
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dnsCopied, setDnsCopied] = useState<Record<string, boolean>>({})
  const [sslCopied, setSslCopied] = useState<Record<string, boolean>>({})

  const handleLookup = async () => {
    const d = inputValue.trim().toLowerCase()
    if (!d) {
      setError('Enter a domain name')
      return
    }
    if (!isValidDomain(d)) {
      setError('Invalid domain format (e.g., example.com)')
      return
    }
    setError('')
    setDomain(d)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/dns-ssl-lookup?domain=${encodeURIComponent(d)}`)
      if (!res.ok) {
        throw new Error('Failed to perform live lookup')
      }
      const data = await res.json()
      if (data.dns) setDnsResults(data.dns)
      if (data.ssl) setSslResult(data.ssl)
    } catch (err: any) {
      console.warn('Falling back to simulated data due to lookup error:', err)
      setDnsResults(getSimulatedDns(d))
      setSslResult(getSimulatedSsl(d))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup()
  }

  const copyDnsValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setDnsCopied((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => setDnsCopied((prev) => ({ ...prev, [key]: false })), 2000)
  }

  const copySslField = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setSslCopied((prev) => ({ ...prev, [field]: true }))
    setTimeout(() => setSslCopied((prev) => ({ ...prev, [field]: false })), 2000)
  }

  const isKrumb = domain === 'krumb.dev'
  const isCustom = !isKrumb

  return (
    <ToolLayout
      title="DNS Lookup & SSL Checker"
      description="Lookup DNS records (A, AAAA, CNAME, MX, NS, TXT, SOA) and check SSL certificate information for any domain. Free online network diagnostics."
      toolSlug="dns-ssl-checker"
      categorySlug="developer-tools"
      faq={dnsFaq}
      seoContent={dnsSeo}
    >
      <div className="space-y-6 font-mono">
        {/* ===== Tabs ===== */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('dns')}
            className={`terminal-btn ${activeTab === 'dns' ? 'text-[#00FF41]' : ''}`}
          >
            {activeTab === 'dns' ? (
              <>[<span className="green-chevron">&gt;</span> DNS Lookup]</>
            ) : (
              <>[DNS Lookup]</>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ssl')}
            className={`terminal-btn ${activeTab === 'ssl' ? 'text-[#00FF41]' : ''}`}
          >
            {activeTab === 'ssl' ? (
              <>[<span className="green-chevron">&gt;</span> SSL Checker]</>
            ) : (
              <>[SSL Checker]</>
            )}
          </button>
        </div>

        {/* ===== Domain Input ===== */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">
            Domain
          </label>
          <div className="flex gap-2 items-start">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (error) setError('')
              }}
              onKeyDown={handleKeyDown}
              className={`flex-1 px-4 py-3 bg-[#000000] border text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 transition-none ${
                error ? 'border-[#ff4444] focus:border-[#ff4444]' : 'border-[#F9F9F9] focus:border-[#00FF41]'
              }`}
              placeholder="example.com"
              autoComplete="off"
              spellCheck={false}
            />
            <button onClick={handleLookup} disabled={isLoading} className="terminal-btn py-3 text-sm">
              [<span className="green-chevron">&gt;</span> {isLoading ? 'Looking up...' : 'Lookup'}]
            </button>
          </div>
          {error && (
            <p className="text-xs font-mono text-[#ff4444] mt-1">{error}</p>
          )}
        </div>

        {/* ===== Disclaimer ===== */}
        <div className="border border-[#333333] p-3">
          <p className="text-[10px] font-mono text-[#888888] leading-relaxed">
            <span className="text-[#00FF41]">*</span> Note: Real DNS/SSL checks are performed
            live via our server-side resolver, with simulated fallback if resolution fails.
            For production diagnostics, use <span className="text-[#F9F9F9]">dig</span>,{' '}
            <span className="text-[#F9F9F9]">nslookup</span>, or{' '}
            <span className="text-[#F9F9F9]">openssl s_client</span> from your terminal.
          </p>
        </div>

        {/* ===== DNS TAB ===== */}
        {activeTab === 'dns' && (
          <div className="space-y-6">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
              DNS Records for <span className="text-[#F9F9F9]">{domain}</span>
            </p>

            {dnsResults.map((section) => (
              <div key={section.type} className="border border-[#333333] divide-y divide-[#333333]">
                {/* Section header */}
                <div className="px-4 py-2 flex items-center justify-between bg-[#0a0a0a]">
                  <span className="text-xs font-mono font-bold text-[#00FF41] uppercase tracking-wider">
                    {section.label}
                  </span>
                  {section.records.length > 0 && section.records[0].value && !section.records[0].value.startsWith('No ') && (
                    <CopyButton text={section.records.map(r => r.value).join('\n')} label="COPY ALL" />
                  )}
                </div>

                {/* Records */}
                {section.records.length > 0 && section.records[0].value ? (
                  <div className="divide-y divide-[#1a1a1a]">
                    {section.records.map((rec, idx) => {
                      const key = `${section.type}-${idx}`
                      const isPlaceholder = rec.value.startsWith('No ') || rec.value.includes('simulated')
                      return (
                        <div key={key} className="px-4 py-3 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {rec.priority !== undefined && !isPlaceholder && (
                              <span className="text-[10px] font-mono text-[#888888] mr-2">
                                [PRIORITY {rec.priority}]
                              </span>
                            )}
                            <span className={`text-xs font-mono break-all ${isPlaceholder ? 'text-[#888888] italic' : 'text-[#F9F9F9]'}`}>
                              {rec.value}
                            </span>
                            {rec.ttl && !isPlaceholder && (
                              <span className="text-[10px] font-mono text-[#555555] block mt-0.5">
                                TTL: {rec.ttl}s
                              </span>
                            )}
                          </div>
                          {!isPlaceholder && (
                            <button
                              onClick={() => copyDnsValue(key, rec.value)}
                              className="terminal-btn shrink-0"
                            >
                              [<span className="green-chevron">&gt;</span>{' '}
                              {dnsCopied[key] ? 'COPIED' : 'COPY'}]
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : section.type === 'CNAME' && isKrumb ? (
                  <div className="px-4 py-3">
                    <span className="text-xs font-mono text-[#888888] italic">
                      No CNAME record at apex — CNAME can only be set on subdomains.
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-3">
                    <span className="text-xs font-mono text-[#888888] italic">
                      No records found for this type.
                    </span>
                  </div>
                )}

                {/* Explanation — collapsible */}
                <details className="group">
                  <summary className="px-4 py-2 text-[10px] font-mono text-[#555555] uppercase tracking-wider cursor-pointer hover:text-[#888888] transition-none select-none">
                    [<span className="text-[#00FF41] group-open:rotate-90 inline-block transition-none">+</span>] Explain{' '}
                    {section.type} Records
                  </summary>
                  <div className="px-4 py-3 border-t border-[#1a1a1a]">
                    <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                      {section.explanation}
                    </p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* ===== SSL TAB ===== */}
        {activeTab === 'ssl' && (
          <div className="space-y-6">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
              SSL / TLS Certificate for <span className="text-[#F9F9F9]">{domain}</span>
            </p>

            {/* Certificate fields */}
            <div className="border border-[#333333] divide-y divide-[#333333]">
              {/* Subject */}
              <div className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Subject</p>
                  <p className="text-xs font-mono text-[#F9F9F9] break-all">{sslResult.subject}</p>
                </div>
                <button
                  onClick={() => copySslField('subject', sslResult.subject)}
                  className="terminal-btn shrink-0"
                >
                  [<span className="green-chevron">&gt;</span>{' '}
                  {sslCopied['subject'] ? 'COPIED' : 'COPY'}]
                </button>
              </div>

              {/* Issuer */}
              <div className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Issuer</p>
                  <p className="text-xs font-mono text-[#F9F9F9] break-all">{sslResult.issuer}</p>
                </div>
                <button
                  onClick={() => copySslField('issuer', sslResult.issuer)}
                  className="terminal-btn shrink-0"
                >
                  [<span className="green-chevron">&gt;</span>{' '}
                  {sslCopied['issuer'] ? 'COPIED' : 'COPY'}]
                </button>
              </div>

              {/* Valid From */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Valid From</p>
                <p className="text-xs font-mono text-[#F9F9F9]">{sslResult.validFrom}</p>
              </div>

              {/* Valid To */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Valid To</p>
                <p className="text-xs font-mono text-[#F9F9F9]">{sslResult.validTo}</p>
              </div>

              {/* Days Remaining */}
              {isKrumb && (
                <div className="px-4 py-3">
                  <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Days Remaining</p>
                  <p className={`text-xs font-mono font-bold ${sslResult.daysRemaining <= 30 ? 'text-[#ff4444]' : 'text-[#00FF41]'}`}>
                    {sslResult.daysRemaining} days
                  </p>
                </div>
              )}

              {/* Signature Algorithm */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Signature Algorithm</p>
                <p className="text-xs font-mono text-[#F9F9F9]">{sslResult.signatureAlgorithm}</p>
              </div>

              {/* Protocol */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-0.5">Protocol</p>
                <p className="text-xs font-mono text-[#F9F9F9]">{sslResult.protocol}</p>
              </div>

              {/* SANs */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-2">
                  Subject Alternative Names (SANs)
                </p>
                <div className="space-y-1">
                  {sslResult.sans.map((san, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[#00FF41] text-[10px]">&gt;</span>
                      <span className="text-xs font-mono text-[#F9F9F9]">{san}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Chain */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-2">
                  Certificate Chain
                </p>
                <div className="space-y-1">
                  {sslResult.chain.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[#00FF41] text-[10px]">{idx === sslResult.chain.length - 1 ? '└' : '├'}</span>
                      <span className="text-xs font-mono text-[#F9F9F9]">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy all SSL info */}
              <div className="px-4 py-3">
                <CopyButton
                  text={[
                    `Subject: ${sslResult.subject}`,
                    `Issuer: ${sslResult.issuer}`,
                    `Valid From: ${sslResult.validFrom}`,
                    `Valid To: ${sslResult.validTo}`,
                    `Days Remaining: ${sslResult.daysRemaining}`,
                    `Signature: ${sslResult.signatureAlgorithm}`,
                    `Protocol: ${sslResult.protocol}`,
                    `SANs: ${sslResult.sans.join(', ')}`,
                  ].join('\n')}
                  label="COPY ALL"
                />
              </div>
            </div>

            {/* Certificate info explanation */}
            <details className="group border border-[#333333]">
              <summary className="px-4 py-2 text-[10px] font-mono text-[#555555] uppercase tracking-wider cursor-pointer hover:text-[#888888] transition-none select-none">
                [<span className="text-[#00FF41] group-open:rotate-90 inline-block transition-none">+</span>] Explain SSL Certificate Fields
              </summary>
              <div className="px-4 py-3 border-t border-[#1a1a1a] space-y-3">
                <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                  <span className="text-[#F9F9F9]">Subject:</span> The domain name the certificate was issued to. Modern certificates use the CN (Common Name) field.
                </p>
                <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                  <span className="text-[#F9F9F9]">Issuer:</span> The Certificate Authority that signed the certificate. Browsers trust certificates signed by known CAs in their root store.
                </p>
                <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                  <span className="text-[#F9F9F9]">Validity Period:</span> The time window during which the certificate is considered valid. Browsers show warnings if the current date is outside this range.
                </p>
                <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                  <span className="text-[#F9F9F9]">SANs:</span> Subject Alternative Names list additional domains covered by the same certificate. A single cert may cover multiple domains and subdomains.
                </p>
                <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                  <span className="text-[#F9F9F9]">Certificate Chain:</span> The chain of trust from the leaf certificate through intermediate CAs to a trusted root CA stored in your browser/OS.
                </p>
              </div>
            </details>

            {/* Educational note for custom domains */}
            {isCustom && (
              <div className="border border-[#333333] p-4">
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-2">
                  How SSL Checking Works
                </p>
                <p className="text-[11px] font-mono text-[#888888] leading-relaxed">
                  To perform a real SSL check for <span className="text-[#F9F9F9]">{domain}</span>,
                  a server-side tool (like <span className="text-[#F9F9F9]">openssl s_client</span> or
                  an API-based checker) connects to <span className="text-[#F9F9F9]">{domain}</span>
                  on port 443, initiates a TLS handshake, and captures the certificate the server
                  presents. The certificate is then decoded to display the fields shown above.
                  Results vary depending on the server configuration, CDN, and load balancer
                  in front of the origin.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
