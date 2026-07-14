import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Code Playground -- Multi-Language Online Editor with Live Execution',
  description: 'Free online code editor supporting 25+ languages. JS, TS, Python, and HTML run live in your browser. Syntax highlighting and auto-save. No signup required.',
  openGraph: {
    title: 'Code Playground -- Multi-Language Online Editor with Live Execution',
    description: 'Free online code editor supporting 25+ languages with live execution for JS/TS/Python/HTML.',
    type: 'website',
  },
}

export { default } from './_client'