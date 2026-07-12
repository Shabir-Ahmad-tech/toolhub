import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'KRUMB.DEV Terms of Service — free online developer tools used at your own risk. No warranties, no data collection.',
  alternates: {
    canonical: './'
  }
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 space-y-10">
        <div className="space-y-4 border-b border-[#333333] pb-6">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F9F9F9] leading-none tracking-tight">
            <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888]">
            <span className="text-[#555555]">#</span> Last updated: July 2026
          </p>
        </div>

        <div className="space-y-10 font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">01</span>
              USE AT YOUR OWN RISK
            </h2>
          <p>
            KRUMB.DEV provides free online developer tools for informational and utility purposes. All tools are provided &quot;as is&quot; without any warranty, express or implied. By using this site, you agree that the creators are not liable for any damages or losses resulting from the use of these tools.
          </p>
        </section>

        <section className="space-y-3 border-l-2 border-[#333333] pl-5">
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
            <span className="text-[#00FF41] font-mono text-sm">02</span>
            NO GUARANTEES
          </h2>
          <p>
            While we strive for accuracy, the output from these tools should not be relied upon for critical decisions without independent verification. KRUMB.DEV may be unavailable at times due to maintenance, updates, or factors beyond our control.
          </p>
        </section>

        <section className="space-y-3 border-l-2 border-[#333333] pl-5">
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
            <span className="text-[#00FF41] font-mono text-sm">03</span>
            ACCEPTABLE USE
          </h2>
          <p>
            You agree not to use KRUMB.DEV for any unlawful purpose or in any way that could damage, disable, or impair the service. This includes automated scraping, denial-of-service attacks, or any activity that disrupts the experience for other users.
          </p>
        </section>

        <section className="space-y-3 border-l-2 border-[#333333] pl-5">
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
            <span className="text-[#00FF41] font-mono text-sm">04</span>
            CHANGES
          </h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>

      {/* Terminal footer */}
      <div className="border-t border-[#333333] pt-6">
        <p className="font-mono text-[10px] text-[#555555]">
          <span className="text-[#444444]">$</span> EOF — End of terms of service
        </p>
      </div>
    </div>
  </div>
  )
}
