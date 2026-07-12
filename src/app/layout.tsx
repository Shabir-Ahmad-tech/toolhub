import type { Metadata } from "next"
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Footer } from "@/components/layout/Footer"
import { CommandPalette } from "@/components/ui/CommandPalette"
import { TopBar } from "@/components/layout/TopBar"
import { ToastProvider } from "@/components/ui/Toast"
import { ScrollToTop } from "@/components/ui/ScrollToTop"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-tools",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://krumb.dev"),
  title: {
    default: "KRUMB.DEV — Free Online Developer Tools",
    template: "%s — KRUMB.DEV",
  },
  description:
    "Free online developer tools. No signup required. Instant results. A comprehensive suite of tools for developers including formatters, validators, encoders, and generators.",
  keywords: [
    "developer tools", "online formatter", "JSON formatter", "JWT decoder",
    "regex tester", "code formatter", "base64 encoder", "URL encoder",
    "password generator", "UUID generator", "hash generator",
  ],
  openGraph: {
    title: "KRUMB.DEV — Free Online Developer Tools",
    description:
      "Free online developer tools. No signup required. Instant results.",
    type: "website",
    siteName: "KRUMB.DEV",
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#000000] dark:bg-[#000000] text-[#F9F9F9] font-sans"
        suppressHydrationWarning
      >
        {/* CRT ambient overlays — fixed, pointer-events: none */}
        <div className="crt-grid" aria-hidden="true" />
        <div className="crt-scanlines" aria-hidden="true" />
        <div className="crt-noise" aria-hidden="true" />
        <div className="crt-vignette" aria-hidden="true" />

        <ToastProvider>
          <main className="flex-1 relative z-10">
            <TopBar />
            {children}
          </main>

          <Footer />
          <CommandPalette />
          <ScrollToTop />
        </ToastProvider>
      </body>
    </html>
  )
}
