'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, MapPin, Globe, Activity, Wifi, Shield } from 'lucide-react'

interface IPData {
  ip: string
  city: string
  region: string
  country: string
  countryCode: string
  lat: number
  lon: number
  isp: string
  org: string
  as: string
  timezone: string
  zip: string
  query: string
  status: string
  message?: string
}

const faq = [
  {
    question: 'What is my IP address and why should I care?',
    answer: 'Your public IP address uniquely identifies your device on the internet. Websites, services, and trackers use your IP to determine your approximate location, your internet service provider (ISP), and sometimes even your device type. Knowing your IP helps you troubleshoot network issues, check for VPN leaks, and understand what data websites can see about you.',
  },
  {
    question: 'Can someone find my exact location from my IP?',
    answer: 'No — IP geolocation can typically pinpoint your city and region, but not your exact street address. The accuracy varies by ISP and region; some ISPs provide neighborhood-level accuracy, while others may show a city or regional hub. If you need true location privacy, use a VPN or proxy that masks your real IP.',
  },
  {
    question: 'What is an ISP and why does it matter?',
    answer: 'ISP stands for Internet Service Provider — the company that provides your internet connection (e.g., Comcast, Verizon, AT&T, or a local provider). Knowing your ISP helps diagnose connection issues, understand bandwidth limitations, and identify who is routing your traffic. Some ISPs also affect your ping/latency to certain game servers or cloud regions.',
  },
  {
    question: 'Why does my IP change sometimes?',
    answer: 'Most residential ISPs assign dynamic IPs that change periodically (every 24 hours to every few weeks). You get a new IP when your modem/router reconnects, the DHCP lease expires, or your ISP rebalances its pool. Static IPs are usually only available on business plans or if you specifically request one (often for an extra fee).',
  },
  {
    question: 'How does IP geolocation work?',
    answer: 'IP geolocation uses databases maintained by telecoms, ISPs, and third-party data aggregators like MaxMind or IP2Location. These databases map IP address ranges to geographic locations based on ISP registration data, routing information, and latency triangulation. The databases are updated regularly but are never 100% precise — especially for mobile or satellite connections.',
  },
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">IP Address Lookup &mdash; Instant Geolocation Tool</h2>
    <p className="text-[#888888] font-mono"><strong>Your public IP address</strong> is the unique identifier the internet uses to route data to your device. This tool looks up your current public IP and displays detailed geolocation and network information, all processed entirely client-side through public APIs.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What Information Is Revealed?</h3>
    <p className="text-[#888888] font-mono">When you use this IP lookup tool, you will see: your public IPv4 address, the city and region associated with your IP range, your internet service provider (ISP) and organization, the ASN (autonomous system number), approximate latitude and longitude coordinates, timezone, and country code. None of this data is stored or transmitted beyond the immediate lookup request.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Privacy &amp; Security</h3>
    <p className="text-[#888888] font-mono">This tool uses the ip-api.com API which respects a fair-use policy. No API keys, no signups, no server-side storage. Your IP address is only sent to the lookup API and is not logged or cached on our servers. If you are using a VPN or proxy, the tool will show the VPN exit node&apos;s IP instead of your home connection.</p>
  </div>
)

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[#1a1a1a] last:border-b-0">
      <span className="text-xs font-mono text-[#666666] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono text-[#F9F9F9] text-right max-w-[60%] break-all">{value}</span>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="terminal-btn text-xs">
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : label}]
    </button>
  )
}

export default function IPAddressLookupPage() {
  const [data, setData] = useState<IPData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customIP, setCustomIP] = useState('')

  const lookupIP = async (ip?: string) => {
    setLoading(true)
    setError('')
    try {
      let targetIP = ip
      if (!targetIP) {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        if (!ipRes.ok) throw new Error('Failed to get your public IP')
        const ipData = await ipRes.json()
        targetIP = ipData.ip
      }

      const geoRes = await fetch(`https://ipwho.is/${targetIP}?fields=ip,success,type,continent,continent_code,country,country_code,region,city,latitude,longitude,postal,connection,timezone`)
      const geoData = await geoRes.json()

      if (!geoData.success) {
        setError('Failed to look up this IP address. It may be a private or reserved range.')
        setLoading(false)
        return
      }

      setData({
        ip: geoData.ip || targetIP,
        city: geoData.city || '',
        region: geoData.region || '',
        country: geoData.country || '',
        countryCode: geoData.country_code || '',
        lat: geoData.latitude || 0,
        lon: geoData.longitude || 0,
        isp: geoData.connection?.isp || geoData.connection?.org || '',
        org: geoData.connection?.org || '',
        as: geoData.connection?.asn ? `AS${geoData.connection.asn}` : '',
        timezone: geoData.timezone?.id || '',
        zip: geoData.postal || '',
        query: geoData.ip || targetIP,
        status: geoData.success ? 'success' : 'fail',
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch IP data. Check your internet connection and try again.'
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <ToolLayout
      title="IP Address Lookup"
      description="Find your public IP address, ISP, city, region, country, coordinates, and timezone. Free online IP lookup tool with geolocation data."
      toolSlug="ip-address-lookup"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-6 font-mono">

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => lookupIP()}
            disabled={loading}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> {loading ? 'LOOKING UP...' : 'LOOKUP MY IP'}]
          </button>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customIP}
              onChange={e => setCustomIP(e.target.value)}
              placeholder="Enter IP address..."
              className="px-3 py-2.5 text-xs font-mono bg-[#000000] border border-[#333333] text-[#F9F9F9] outline-none focus:border-[#00FF41] w-44"
            />
            <button
              onClick={() => customIP.trim() && lookupIP(customIP.trim())}
              disabled={loading || !customIP.trim()}
              className="terminal-btn text-xs"
            >
              [<span className="green-chevron">&gt;</span> LOOKUP]
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-[#FF4444]/30 bg-[#0a0a0a]">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#FF4444] shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-[#FF4444]">{error}</p>
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="border border-dashed border-[#333333] p-8 text-center">
            <Globe className="h-8 w-8 text-[#555555] mx-auto mb-3" />
            <p className="text-xs font-mono text-[#555555]">Click &quot;LOOKUP MY IP&quot; to see your public IP and location details.</p>
          </div>
        )}

        {loading && (
          <div className="border border-[#333333] p-8 text-center">
            <Activity className="h-6 w-6 text-[#00FF41] mx-auto mb-3 animate-pulse" />
            <p className="text-xs font-mono text-[#00FF41]">Looking up IP information...</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* IP Address Hero */}
            <div className="border border-[#00FF41] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Your IP Address</span>
                <CopyButton text={data.ip} label="COPY IP" />
              </div>
              <p className="text-2xl font-bold font-mono text-[#00FF41] tracking-wider break-all">{data.ip}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location Info */}
              <div className="border border-[#333333] p-4">
                <div className="flex items-center gap-2 mb-3 border-b border-[#1a1a1a] pb-2">
                  <MapPin className="h-4 w-4 text-[#60a5fa]" />
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Location</span>
                </div>
                <div className="divide-y divide-[#1a1a1a]">
                  {data.city && <InfoRow label="City" value={data.city} />}
                  {data.region && <InfoRow label="Region" value={data.region} />}
                  {data.country && <InfoRow label="Country" value={`${data.country} (${data.countryCode})`} />}
                  {data.zip && <InfoRow label="Postal Code" value={data.zip} />}
                  {data.lat !== 0 && <InfoRow label="Coordinates" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />}
                  {data.timezone && <InfoRow label="Timezone" value={data.timezone} />}
                </div>
              </div>

              {/* Network Info */}
              <div className="border border-[#333333] p-4">
                <div className="flex items-center gap-2 mb-3 border-b border-[#1a1a1a] pb-2">
                  <Wifi className="h-4 w-4 text-[#34d399]" />
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Network</span>
                </div>
                <div className="divide-y divide-[#1a1a1a]">
                  {data.isp && <InfoRow label="ISP" value={data.isp} />}
                  {data.org && data.org !== data.isp && <InfoRow label="Organization" value={data.org} />}
                  {data.as && <InfoRow label="ASN" value={data.as} />}
                  <InfoRow label="IP Version" value="IPv4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
