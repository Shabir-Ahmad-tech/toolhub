import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

const features = [
  '50+ free tools and calculators',
  'No signup required',
  'Instant calculations',
  'Share on WhatsApp',
  'Mobile-friendly',
  '100% free to use'
]

export function CTASection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Need More Power?
          </h2>
          <p className="text-blue-100 mb-6">
            Upgrade to Pro and unlock unlimited access, history saving, export to CSV/PDF, and more premium features.
          </p>
          <ul className="space-y-2 mb-6">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-blue-300" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition"
          >
            See Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="hidden md:block">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-3xl font-bold mb-2">$5<small className="text-lg font-normal text-blue-200">/mo</small></p>
            <p className="text-blue-100 text-sm">Unlock all premium features. Cancel anytime.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-blue-300" />
                Save calculation history
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-blue-300" />
                Export to CSV & PDF
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-blue-300" />
                Unlimited invoices
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-blue-300" />
                Priority support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}