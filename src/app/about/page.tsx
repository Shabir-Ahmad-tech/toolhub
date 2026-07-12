import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About KRUMB.DEV — Private, Local-First Online Utilities',
  description: 'Learn about KRUMB.DEV: the private-by-design utility portal built for developers. Fully local browser execution, zero file uploads.',
  alternates: {
    canonical: './'
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">

      {/* Terminal-styled about header */}
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 space-y-10">

        {/* Page header — terminal style */}
        <div className="space-y-4 border-b border-[#333333] pb-6">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F9F9F9] leading-none tracking-tight">
            <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> ABOUT
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
            <span className="text-[#555555]">#</span> The local-first, zero-upload tool suite built for privacy-conscious developers.
          </p>
        </div>

        {/* Main content — terminal-styled sections */}
        <div className="space-y-10 font-mono text-xs md:text-sm text-[#888888] leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">01</span>
              WHY KRUMB.DEV
            </h2>
            <p>
              Most online utility websites are bloated, slow, and packed with intrusive advertisements.
              Worse, they require you to upload your files and sensitive data to remote servers just to
              perform simple operations like formatting JSON or decoding a JWT.
            </p>
            <p>
              KRUMB.DEV was created as a privacy-respecting alternative built specifically for developers.
              Every tool runs entirely in your browser with zero server uploads.
            </p>
          </section>

          {/* Section 2 — highlighted */}
          <section className="space-y-3 border-l-2 border-[#00FF41] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">02</span>
              LOCAL-FIRST PRIVACY
            </h2>
            <div className="space-y-3 text-[#888888]">
              <p>
                <span className="text-[#00FF41]">&gt;</span> Your data belongs to you. Every tool runs{' '}
                <strong className="text-[#F9F9F9]">entirely in your web browser</strong> using client-side JavaScript.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> When you format code, decode tokens, or generate
                cryptographic keys, the processing happens locally on your machine.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> No file or input data is ever transmitted, processed,
                or stored on our servers.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">03</span>
              SIMPLE. TRANSPARENT. SAFE.
            </h2>
            <p>
              KRUMB.DEV does not require registration or account sign-up to access any tool.
              We maintain a zero-bloat environment to ensure fast page loads.
            </p>
            <p>
              Whether you are formatting JSON, decoding tokens, testing regex, or converting between data formats,
              everything stays on your machine.
            </p>
          </section>

          {/* Section 4 — tools list */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">04</span>
              AVAILABLE TOOLS (21)
            </h2>
            <p>
              <span className="text-[#555555]">developer-tools/</span> JSON Formatter, JWT Decoder, Base64 Encoder,
              Regex Tester, Code Formatter, Diff Checker, URL Encoder, Hash Generator, Password Generator,
              UUID Generator, QR Code Generator, QR Code Decoder, HTML Playground, Markdown Editor,
              JSON/CSV Converter, YAML/JSON Converter, Binary Converter, Hex/RGB Converter,
              API Response Validator, Unix Timestamp Converter, Webhook Tester.
            </p>
          </section>

        </div>

        {/* Bottom CTA — terminal-style */}
        <div className="border-t border-[#333333] pt-8">
          <Link
            href="/privacy"
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> Read Privacy Policy]
          </Link>
        </div>
      </div>
    </div>
  )
}
