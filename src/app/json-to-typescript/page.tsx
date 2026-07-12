import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JSON to TypeScript Interface Generator',
  description: 'Convert JSON objects into TypeScript interfaces instantly. Paste JSON and get typed interfaces, enums, and nested type definitions.',
}

export { default } from './_client'
