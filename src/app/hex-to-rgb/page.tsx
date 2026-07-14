import type { Metadata } from 'next'
export { default } from './_client'

export const metadata: Metadata = {
  title: 'Hex to RGB Converter',
  description: 'Convert hex color codes to RGB, HSL, and OKLCH values. Free online color converter with color picker, palette swatches, and contrast checker for developers.',
  openGraph: {
    title: 'Hex to RGB Converter',
    description: 'Convert hex color codes to RGB, HSL, and OKLCH values. Free color converter with palette swatches and contrast checker for developers.',
  },
}
