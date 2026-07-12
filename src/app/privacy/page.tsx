import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — KRUMB.DEV',
  description: 'KRUMB.DEV Privacy Policy — how we handle your data. All tools run client-side; no data is uploaded to servers.',
  alternates: {
    canonical: './'
  }
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">

      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 space-y-10">

        {/* Page header — terminal style */}
        <div className="space-y-4 border-b border-[#333333] pb-6">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F9F9F9] leading-none tracking-tight">
            <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> PRIVACY POLICY
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888]">
            <span className="text-[#555555]">#</span> Last updated: July 2026
          </p>
        </div>

        {/* Main content */}
        <div className="space-y-10 font-mono text-xs md:text-sm text-[#888888] leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">01</span>
              DATA PROCESSING
            </h2>
            <p>
              KRUMB.DEV processes all tool data entirely in your browser. When you format code, decode tokens,
              generate passwords, or use any tool on this site, your input data never leaves your device.
            </p>
            <p>
              This is by design. Every tool runs client-side using JavaScript in your browser.
              There are no data collection endpoints, analytics tracking that captures input data,
              or server-side processing pipelines.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">02</span>
              WHAT WE COLLECT
            </h2>
            <div className="space-y-3">
              <p>
                <span className="text-[#00FF41]">&gt;</span> We do <strong className="text-[#F9F9F9]">not</strong> collect any personal data from tool usage.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> We do not use cookies for tracking, advertising, or analytics that identify you.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> We do not have user accounts — nothing to sign up for.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> Standard server logs (IP, browser agent, page visited) are retained
                for operational purposes only, anonymized, and kept for no more than 30 days.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">03</span>
              COOKIES &amp; ADVERTISING
            </h2>
            <p>
              KRUMB.DEV uses minimal cookies solely for site functionality and, in the future, to serve
              privacy-compliant advertisements via Google AdSense. These cookies help us analyze site traffic
              and show relevant ads while respecting your privacy.
            </p>
            <p>
              <strong className="text-[#F9F9F9]">Google AdSense</strong> may use cookies and web beacons to serve
              interest-based advertisements based on your visit to our site and other sites on the internet.
              You may opt out of personalised advertising by visiting{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00FF41] hover:underline">
                Google Ad Settings
              </a>.
            </p>
            <p className="mt-2">
              <span className="text-[#00FF41]">&gt;</span> A cookie consent banner will appear on your first visit.
              You can accept or decline non-essential cookies at any time.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">04</span>
              THIRD-PARTY SERVICES
            </h2>
            <div className="space-y-3">
              <p>
                <span className="text-[#00FF41]">&gt;</span> <strong className="text-[#F9F9F9]">Google AdSense</strong> — serves
                advertisements on this site. AdSense may use cookies to serve personalised ads based on your browsing history.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> We do not embed third-party trackers, analytics scripts, or
                social media pixels beyond standard AdSense advertising.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> No third party has access to your tool input data
                (it never leaves your browser).
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">05</span>
              YOUR CHOICES
            </h2>
            <div className="space-y-3">
              <p>
                <span className="text-[#00FF41]">&gt;</span> You can disable cookies in your browser settings.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> You can opt out of personalised ads at{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00FF41] hover:underline">
                  ads settings
                </a>.
              </p>
              <p>
                <span className="text-[#00FF41]">&gt;</span> Your tool usage data is never collected, stored, or shared
                regardless of your cookie choices.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">06</span>
              CHANGES TO THIS POLICY
            </h2>
            <p>
              If this policy changes, we will update the date at the top of this page.
              Since we collect no personal data, there is nothing to notify you about —
              but we believe in transparency.
            </p>
          </section>

        </div>

        {/* Terminal footer */}
        <div className="border-t border-[#333333] pt-6">
          <p className="font-mono text-[10px] text-[#555555]">
            <span className="text-[#444444]">$</span> EOF — End of privacy policy
          </p>
        </div>
      </div>
    </div>
  )
}
