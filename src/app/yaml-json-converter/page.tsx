import type { Metadata } from 'next'
import YamlJsonConverterClient from './_client'

export const metadata: Metadata = {
  title: 'YAML to JSON Converter â�--�-- Free Online Tool',
  description: 'Convert YAML to JSON and JSON to YAML online. Safe, client-side conversion with live error highlighting, copy, and download. No signup required.',
  openGraph: {
    title: 'YAML to JSON Converter â�--�-- Free Online Tool',
    description: 'Convert YAML to JSON and JSON to YAML online. Safe, client-side conversion with live error highlighting.',
    type: 'website',
  }
}

export default function Page() {
  return <YamlJsonConverterClient />
}



