import type { Metadata } from 'next'
import HashGeneratorClient from './_client'

export const metadata: Metadata = {
  title: 'Hash Generator â�--�-- Free MD5, SHA-1, SHA-256, SHA-512 & HMAC Tool',
  description: 'Generate MD5, SHA-1, SHA-256, SHA-512, and HMAC hashes from text. Supports batch hashing for multiple lines. Free, secure, client-side execution.',
  openGraph: {
    title: 'Hash Generator â�--�-- Free MD5, SHA-1, SHA-256, SHA-512 & HMAC Tool',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512, and HMAC hashes from text. Supports batch hashing for multiple lines.',
    type: 'website',
  }
}

export default function HashGeneratorPage() {
  return <HashGeneratorClient />
}



