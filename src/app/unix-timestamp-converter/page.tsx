import type { Metadata } from 'next'
import UnixTimestampClient from './_client'

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter -- Epoch Time to Date',
  description: 'Convert Unix timestamps (epoch time) to human-readable dates instantly. Free online tool supporting seconds, milliseconds, and UTC date-time formats.',
  openGraph: {
    title: 'Unix Timestamp Converter -- Epoch Time to Date',
    description: 'Convert Unix timestamps to date/time strings and back. Support for seconds, milliseconds, and UTC formats.',
    type: 'website',
  }
}

export default function Page() {
  return <UnixTimestampClient />
}


