import type { Metadata } from 'next'
import DnsSslCheckerClient from './_client'

export const metadata: Metadata = {
  title: 'DNS Lookup & SSL Checker',
  description: 'Lookup DNS records (A, AAAA, CNAME, MX, NS, TXT, SOA) and check SSL certificate information for any domain. Free online network diagnostics tool.',
  openGraph: {
    title: 'DNS Lookup & SSL Checker | krumb.dev',
    description: 'Lookup DNS records and check SSL certificate validity for any domain. Educational tool with explanations for each DNS record type.',
    type: 'website',
  }
}

export default function Page() {
  return <DnsSslCheckerClient />
}
