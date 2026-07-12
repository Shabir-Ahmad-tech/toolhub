import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UUID Generator — Free Online Tool',
  description: 'Generate UUIDs (v1, v3, v4, v5) online. Support custom namespaces and names, bulk generation, and multiple formats (Newline, Comma, Quotes, JSON).',
  openGraph: {
    title: 'UUID Generator — Free Online Tool',
    description: 'Generate UUIDs (v1, v3, v4, v5) online. Support custom namespaces and names, bulk generation, and multiple formats (Newline, Comma, Quotes, JSON).',
    type: 'website',
  },
}

export { default } from './_client'