import type { Metadata } from 'next'
import JsonFormatterClient from './_client'

export const metadata: Metadata = {
  title: 'JSON Formatter & Schema Validator — Free Online Tool',
  description: 'Format, minify, and lint JSON data. Validate JSON payloads against Draft 07/2020-12 schemas client-side. Fast, safe, and free with no signup.',
  openGraph: {
    title: 'JSON Formatter & Schema Validator — Free Online Tool',
    description: 'Format, minify, and validate JSON payloads against Draft 07/2020-12 schemas client-side.',
    type: 'website',
  }
}

export default function Page() {
  return <JsonFormatterClient />
}