import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Base64 Encoder & Decoder — Free Online Tool',
  description: 'Encode and decode Base64 text and files online for free. Support for text, images, PDFs, and files up to 2MB. 100% secure client-side processing.',
  openGraph: {
    title: 'Base64 Encoder & Decoder — Free Online Tool',
    description: 'Encode and decode Base64 text and files online for free. Support for text, images, PDFs, and files up to 2MB. 100% secure client-side processing.',
    type: 'website',
  },
}

export { default } from './_client'