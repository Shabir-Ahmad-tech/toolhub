import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Markdown Beautifier — Clean & Format Messy Markdown Online',
  description: 'Beautify and clean up messy markdown instantly. Fix tables, spacing, indentation, bold/italic, and code blocks. Free online markdown formatter.',
  openGraph: {
    title: 'Markdown Beautifier — Clean & Format Messy Markdown Online',
    description: 'Beautify and clean up messy markdown instantly. Fix tables, spacing, indentation, bold/italic, and code blocks.',
    type: 'website',
  },
}

export { default } from './_client'
