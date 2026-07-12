'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

// ─── Type definitions ────────────────────────────────────────────────
interface IbanFormat {
  length: number
  bank: { start: number; length: number }
  branch?: { start: number; length: number }
  labelBank: string
  labelBranch: string
  labelAccount: string
}

interface ParsedIban {
  country: string
  countryName: string
  checkDigits: string
  bank?: string
  branch?: string
  account?: string
}

interface ParsedSwift {
  bankCode: string
  country: string
  countryName: string
  locationCode: string
  branchCode?: string
}

// ─── Country names ───────────────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  AD: 'Andorra', AE: 'United Arab Emirates', AL: 'Albania',
  AT: 'Austria', AZ: 'Azerbaijan', BA: 'Bosnia and Herzegovina',
  BE: 'Belgium', BF: 'Burkina Faso', BG: 'Bulgaria',
  BH: 'Bahrain', BI: 'Burundi', BJ: 'Benin',
  BR: 'Brazil', BY: 'Belarus', CH: 'Switzerland',
  CI: "Côte d'Ivoire", CM: 'Cameroon', CR: 'Costa Rica',
  CV: 'Cape Verde', CY: 'Cyprus', CZ: 'Czech Republic',
  DE: 'Germany', DJ: 'Djibouti', DK: 'Denmark',
  DO: 'Dominican Republic', DZ: 'Algeria', EE: 'Estonia',
  EG: 'Egypt', ES: 'Spain', FI: 'Finland',
  FO: 'Faroe Islands', FR: 'France', GA: 'Gabon',
  GB: 'United Kingdom', GE: 'Georgia', GI: 'Gibraltar',
  GL: 'Greenland', GR: 'Greece', GT: 'Guatemala',
  HR: 'Croatia', HU: 'Hungary', IE: 'Ireland',
  IL: 'Israel', IQ: 'Iraq', IS: 'Iceland',
  IT: 'Italy', JO: 'Jordan', KW: 'Kuwait',
  KZ: 'Kazakhstan', LB: 'Lebanon', LI: 'Liechtenstein',
  LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia',
  LY: 'Libya', MC: 'Monaco', MD: 'Moldova',
  ME: 'Montenegro', MK: 'North Macedonia', MR: 'Mauritania',
  MT: 'Malta', MU: 'Mauritius', MW: 'Malawi',
  MZ: 'Mozambique', NE: 'Niger', NG: 'Nigeria',
  NL: 'Netherlands', NO: 'Norway', OM: 'Oman',
  PL: 'Poland', PS: 'Palestine', PT: 'Portugal',
  QA: 'Qatar', RO: 'Romania', RS: 'Serbia',
  SA: 'Saudi Arabia', SC: 'Seychelles', SD: 'Sudan',
  SE: 'Sweden', SI: 'Slovenia', SK: 'Slovakia',
  SM: 'San Marino', SN: 'Senegal', ST: 'São Tomé and Príncipe',
  SV: 'El Salvador', SZ: 'Eswatini', TD: 'Chad',
  TG: 'Togo', TL: 'Timor-Leste', TN: 'Tunisia',
  TR: 'Türkiye', UA: 'Ukraine', VA: 'Vatican City',
  VG: 'Virgin Islands (British)', XK: 'Kosovo',
  ZA: 'South Africa',
}

// ─── IBAN format data for supported countries ───────────────────────
const IBAN_FORMATS: Record<string, IbanFormat> = {
  GB: {
    length: 22,
    bank: { start: 4, length: 4 },
    branch: { start: 8, length: 6 },
    labelBank: 'Bank Code',
    labelBranch: 'Sort Code',
    labelAccount: 'Account Number',
  },
  DE: {
    length: 22,
    bank: { start: 4, length: 8 },
    branch: { start: 12, length: 10 },
    labelBank: 'Bank Code (BLZ)',
    labelBranch: 'Account Number',
    labelAccount: '',
  },
  FR: {
    length: 27,
    bank: { start: 4, length: 5 },
    branch: { start: 9, length: 5 },
    labelBank: 'Bank Code',
    labelBranch: 'Branch Code',
    labelAccount: 'Account Number',
  },
  ES: {
    length: 24,
    bank: { start: 4, length: 4 },
    branch: { start: 8, length: 4 },
    labelBank: 'Bank Code',
    labelBranch: 'Office Code',
    labelAccount: 'Account Number',
  },
  IT: {
    length: 27,
    bank: { start: 4, length: 5 },
    branch: { start: 9, length: 5 },
    labelBank: 'Bank Code (CIN)',
    labelBranch: 'Branch Code (CAB)',
    labelAccount: 'Account Number',
  },
  NL: {
    length: 18,
    bank: { start: 4, length: 4 },
    labelBank: 'Bank Code',
    labelBranch: '',
    labelAccount: 'Account Number',
  },
}

// Common IBAN lengths for length-checking unsupported countries
const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16,
  BF: 27, BG: 22, BH: 22, BI: 16, BJ: 28, BR: 29, BY: 28,
  CH: 21, CI: 28, CM: 27, CR: 22, CV: 25, CY: 28, CZ: 24,
  DE: 22, DJ: 27, DK: 18, DO: 28, DZ: 24, EE: 20, EG: 27,
  ES: 24, FI: 18, FO: 18, FR: 27, GA: 27, GB: 22, GE: 22,
  GI: 23, GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22,
  IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20,
  LB: 28, LI: 21, LT: 20, LU: 20, LV: 21, LY: 25, MC: 27,
  MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, MW: 28,
  MZ: 25, NE: 28, NG: 28, NL: 18, NO: 15, OM: 23, PL: 28,
  PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SC: 31,
  SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SN: 28, ST: 25,
  SV: 28, SZ: 28, TD: 27, TG: 28, TL: 23, TN: 24, TR: 26,
  UA: 29, VA: 22, VG: 24, XK: 20, ZA: 24,
}

// Preset example IBANs (all pass mod-97)
const IBAN_PRESETS = [
  { label: 'GB (UK)', value: 'GB82 WEST 1234 5698 7654 32' },
  { label: 'DE (Germany)', value: 'DE89 3704 0044 0532 0130 00' },
  { label: 'FR (France)', value: 'FR14 2004 1010 0505 0001 3M02 606' },
  { label: 'ES (Spain)', value: 'ES91 2100 0418 4502 0005 1332' },
  { label: 'IT (Italy)', value: 'IT40 S054 2811 1010 0000 0123 456' },
  { label: 'NL (Netherlands)', value: 'NL91 ABNA 0417 1643 00' },
] as const

// SWIFT presets
const SWIFT_PRESETS = [
  { label: 'Bank of America', value: 'BOFAUS3N' },
  { label: 'JPMorgan London', value: 'CHASGB2L' },
  { label: 'Deutsche Bank', value: 'DEUTDEFF' },
  { label: 'Barclays London', value: 'BARCGB22' },
  { label: 'HSBC London', value: 'HBUKGB4B' },
  { label: 'Santander Spain', value: 'BSCHESMM' },
] as const

// ─── Validation helpers ─────────────────────────────────────────────

/** Clean an IBAN string: remove non-alphanumeric, uppercase */
function cleanIban(raw: string): string {
  return raw.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

/** Format IBAN with spaces every 4 characters */
function formatIban(raw: string): string {
  const cleaned = cleanIban(raw)
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Mod-97 checksum using digit-by-digit modular arithmetic.
 * Handles arbitrarily long numbers without BigInt.
 */
function mod97Check(digitString: string): boolean {
  let remainder = 0
  for (let i = 0; i < digitString.length; i++) {
    const d = digitString.charCodeAt(i) - 48 // '0' = 48
    remainder = (remainder * 10 + d) % 97
  }
  return remainder === 1
}

/**
 * Validate a cleaned IBAN string structurally and with mod-97.
 */
function validateIban(cleaned: string): { valid: boolean; error?: string } {
  if (!cleaned) return { valid: false, error: 'No IBAN entered.' }
  if (cleaned.length < 5) return { valid: false, error: 'IBAN is too short (minimum 5 characters).' }
  if (cleaned.length > 34) return { valid: false, error: 'IBAN is too long (maximum 34 characters).' }
  if (!/^[A-Z]{2}\d{2}/.test(cleaned)) return { valid: false, error: 'IBAN must start with a 2-letter country code followed by 2 check digits.' }
  if (!/^[A-Z0-9]+$/.test(cleaned)) return { valid: false, error: 'IBAN contains invalid characters. Only letters and digits allowed.' }

  const country = cleaned.substring(0, 2)
  const expectedLen = IBAN_LENGTHS[country]
  if (expectedLen && cleaned.length !== expectedLen) {
    return { valid: false, error: `${country} IBANs are ${expectedLen} characters long, got ${cleaned.length}.` }
  }

  // Mod-97: move first 4 chars to end, convert letters to digits
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4)
  const digits = rearranged
    .split('')
    .map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c))
    .join('')

  if (!mod97Check(digits)) {
    return { valid: false, error: 'Checksum failed (mod-97). The IBAN is not mathematically valid.' }
  }

  return { valid: true }
}

/** Parse an IBAN string into its components */
function parseIban(cleaned: string): ParsedIban | null {
  if (cleaned.length < 4) return null
  const country = cleaned.substring(0, 2)
  const checkDigits = cleaned.substring(2, 4)
  const countryName = COUNTRY_NAMES[country] || 'Unknown'

  const fmt = IBAN_FORMATS[country]
  if (!fmt) {
    return { country, countryName, checkDigits }
  }

  const bankPart = cleaned.substring(fmt.bank.start, fmt.bank.start + fmt.bank.length)
  if (fmt.branch) {
    const branchPart = cleaned.substring(fmt.branch.start, fmt.branch.start + fmt.branch.length)
    const branchEnd = fmt.branch.start + fmt.branch.length
    const accountPart = cleaned.substring(branchEnd)
    return { country, countryName, checkDigits, bank: bankPart, branch: branchPart, account: accountPart }
  }
  // No branch — the remainder after bank is the account
  const bankEnd = fmt.bank.start + fmt.bank.length
  const accountPart = cleaned.substring(bankEnd)
  return { country, countryName, checkDigits, bank: bankPart, account: accountPart }
}

/** Validate a SWIFT/BIC code */
function validateSwift(raw: string): { valid: boolean; error?: string; parsed?: ParsedSwift } {
  const cleaned = raw.replace(/\s/g, '').toUpperCase()
  if (!cleaned) return { valid: false, error: 'No SWIFT/BIC code entered.' }

  if (cleaned.length !== 8 && cleaned.length !== 11) {
    return { valid: false, error: 'SWIFT/BIC must be 8 or 11 characters.' }
  }

  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[A-Z0-9]{0,3}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid format: 4-letter bank code, 2-letter country, 2 alphanumeric location, optional 3 alphanumeric branch.' }
  }

  const bankCode = cleaned.substring(0, 4)
  const country = cleaned.substring(4, 6)
  const locationCode = cleaned.substring(6, 8)
  const branchCode = cleaned.length === 11 ? cleaned.substring(8, 11) : undefined
  const countryName = COUNTRY_NAMES[country] || 'Unknown'

  return {
    valid: true,
    parsed: { bankCode, country, countryName, locationCode, branchCode },
  }
}

// ─── FAQ & SEO ──────────────────────────────────────────────────────
const ibanFaq = [
  {
    question: 'What is an IBAN and why do I need to validate it?',
    answer:
      'IBAN stands for International Bank Account Number. It is a standardized format for bank account numbers used across national borders, primarily in Europe and surrounding regions. Validating an IBAN ensures it has the correct length for its country and passes the mod-97 checksum, preventing failed international transfers or payment delays due to typos.',
  },
  {
    question: 'How does the mod-97 IBAN checksum work?',
    answer:
      'The mod-97 algorithm moves the first four characters (country code and check digits) to the end of the IBAN, converts all letters to numbers (A=10 through Z=35), and computes the remainder when divided by 97. A valid IBAN produces a remainder of 1. This mathematical check catches common data-entry errors like transposed digits or mistyped characters.',
  },
  {
    question: 'What is the difference between SWIFT, BIC, and IBAN?',
    answer:
      'SWIFT (Society for Worldwide Interbank Financial Telecommunication) and BIC (Bank Identifier Code) are the same thing -- an 8 or 11 character code that identifies a specific bank or branch globally. An IBAN identifies an individual bank account, not just the bank. For an international transfer you typically need both: the recipient\'s IBAN for the account and the SWIFT/BIC for the bank routing.',
  },
  {
    question: 'Can I use this tool for any country\'s IBAN?',
    answer:
      'Yes. The validator checks structural rules for countries we have length data on (80+ countries), and runs the universal mod-97 checksum on every IBAN regardless of country. Even if we don\'t have specific format data for parsing, the mathematical validity check always works. You can paste any IBAN from any country and it will verify the checksum.',
  },
  {
    question: 'Is my data safe when using this validator?',
    answer:
      'Yes. Everything runs client-side in your browser using JavaScript. No IBAN numbers or SWIFT codes are sent to any server. The page works offline after the initial load. Your financial data never leaves your device, making this safe for testing both live and test account numbers.',
  },
]

const ibanSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">
      Validate IBAN Numbers and SWIFT/BIC Codes Instantly
    </h2>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      The IBAN &amp; SWIFT Validator checks International Bank Account Numbers for structural
      correctness and mathematical validity using the ISO 7064 mod-97 checksum algorithm.
      It also parses SWIFT/BIC codes to reveal bank, country, location, and branch identifiers.
      All processing happens client-side for maximum privacy.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      Why Validate IBANs Before a Transfer?
    </h3>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      An invalid IBAN can delay international payments by days or cause funds to be rejected
      by the receiving bank. The mod-97 checksum catches over 98% of common typographical errors
      including swapped digits, missing characters, and incorrect country codes. Developers
      integrating payment APIs, finance teams processing payroll across borders, and anyone
      managing cross-currency transfers benefit from pre-validation before submission.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">
      Understanding SWIFT/BIC Code Structure
    </h3>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      A SWIFT/BIC code is composed of a 4-letter bank identifier (e.g., BOFA for Bank of America),
      a 2-letter country code (US for the United States), a 2-character location code (3N for New York),
      and an optional 3-character branch code. The branch code defaults to XXX (head office) when
      omitted. Knowing how to decode these lets you verify that a SWIFT code matches the expected
      bank and country before initiating a transfer.
    </p>
  </div>
)

// ─── Reusable UI bits ───────────────────────────────────────────────

function StatusIndicator({ valid }: { valid: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase ${
        valid ? 'text-[#00FF41]' : 'text-[#ff4444]'
      }`}
    >
      <span
        className={`inline-block w-2 h-2 ${valid ? 'bg-[#00FF41]' : 'bg-[#ff4444]'}`}
      />
      {valid ? 'Valid' : 'Invalid'}
    </span>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-[#1a1a1a] py-2">
      <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs font-mono text-[#F9F9F9] font-bold break-all text-right max-w-[70%]">
        {value}
      </span>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────
export default function IbanValidatorClient() {
  const [tab, setTab] = useState<'iban' | 'swift'>('iban')

  // IBAN state
  const [ibanRaw, setIbanRaw] = useState('')
  const [ibanResult, setIbanResult] = useState<{
    valid: boolean
    error?: string
    parsed?: ParsedIban
  } | null>(null)

  // SWIFT state
  const [swiftRaw, setSwiftRaw] = useState('')
  const [swiftResult, setSwiftResult] = useState<{
    valid: boolean
    error?: string
    parsed?: ParsedSwift
  } | null>(null)

  const ibanInputRef = useRef<HTMLInputElement>(null)
  const swiftInputRef = useRef<HTMLInputElement>(null)

  // ── IBAN handlers ──
  const handleIbanChange = useCallback((value: string) => {
    const formatted = formatIban(value)
    setIbanRaw(formatted)
  }, [])

  const handleIbanValidate = useCallback(() => {
    const cleaned = cleanIban(ibanRaw)
    const result = validateIban(cleaned)
    if (result.valid) {
      const parsed = parseIban(cleaned)
      setIbanResult({ valid: true, parsed: parsed ?? undefined })
    } else {
      setIbanResult({ valid: false, error: result.error })
    }
  }, [ibanRaw])

  const handleIbanPreset = useCallback((value: string) => {
    setIbanRaw(value)
    // Auto-validate on preset selection
    const cleaned = cleanIban(value)
    const result = validateIban(cleaned)
    if (result.valid) {
      const parsed = parseIban(cleaned)
      setIbanResult({ valid: true, parsed: parsed ?? undefined })
    } else {
      setIbanResult({ valid: false, error: result.error })
    }
  }, [])

  // ── SWIFT handlers ──
  const handleSwiftChange = useCallback((value: string) => {
    setSwiftRaw(value.toUpperCase())
    setSwiftResult(null)
  }, [])

  const handleSwiftValidate = useCallback(() => {
    const result = validateSwift(swiftRaw)
    setSwiftResult(result)
  }, [swiftRaw])

  const handleSwiftPreset = useCallback((value: string) => {
    setSwiftRaw(value)
    const result = validateSwift(value)
    setSwiftResult(result)
  }, [])

  // Keyboard shortcut
  const handleIbanKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleIbanValidate()
    },
    [handleIbanValidate]
  )

  const handleSwiftKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSwiftValidate()
    },
    [handleSwiftValidate]
  )

  // Derived: show account field for parsed IBAN (only when not consumed by branch)
  const ibanAccountField = useMemo(() => {
    if (!ibanResult?.valid || !ibanResult?.parsed) return null
    const p = ibanResult.parsed
    const country = p.country
    const fmt = IBAN_FORMATS[country]
    if (!fmt || !p.account) return null
    if (fmt.branch && !fmt.labelAccount) return null // branch IS the account (DE)
    return { label: fmt.branch && fmt.labelAccount ? fmt.labelAccount : 'Account Number', value: p.account }
  }, [ibanResult])

  const clearIban = useCallback(() => {
    setIbanRaw('')
    setIbanResult(null)
    ibanInputRef.current?.focus()
  }, [])

  const clearSwift = useCallback(() => {
    setSwiftRaw('')
    setSwiftResult(null)
    swiftInputRef.current?.focus()
  }, [])

  return (
    <ToolLayout
      title="IBAN & SWIFT Validator"
      description="Validate and parse IBAN numbers and SWIFT/BIC codes. Check IBAN structure, country, and checksum for 80+ countries."
      toolSlug="iban-validator"
      categorySlug="developer-tools"
      faq={ibanFaq}
      seoContent={ibanSeo}
    >
      <div className="space-y-6">
        {/* ── Tab selector ── */}
        <div className="flex border-b border-[#333333]">
          <button
            onClick={() => setTab('iban')}
            className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-none cursor-pointer min-h-[44px] ${
              tab === 'iban'
                ? 'text-[#F9F9F9] border-b-2 border-[#00FF41]'
                : 'text-[#666666] hover:text-[#F9F9F9]'
            }`}
          >
            IBAN Validator
          </button>
          <button
            onClick={() => setTab('swift')}
            className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-none cursor-pointer min-h-[44px] ${
              tab === 'swift'
                ? 'text-[#F9F9F9] border-b-2 border-[#00FF41]'
                : 'text-[#666666] hover:text-[#F9F9F9]'
            }`}
          >
            SWIFT / BIC Validator
          </button>
        </div>

        {/* ── IBAN Tab ── */}
        {tab === 'iban' && (
          <div className="space-y-5">
            {/* Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#F9F9F9] mb-2 uppercase tracking-wider">
                Enter IBAN
              </label>
              <div className="flex gap-2">
                <input
                  ref={ibanInputRef}
                  type="text"
                  value={ibanRaw}
                  onChange={(e) => handleIbanChange(e.target.value)}
                  onKeyDown={handleIbanKeyDown}
                  placeholder="e.g. GB82 WEST 1234 5698 7654 32"
                  className="flex-1 px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-2 focus:border-[#00FF41] transition-none placeholder-[#555555]"
                  autoComplete="off"
                  spellCheck={false}
                />
                {ibanRaw && (
                  <button
                    onClick={clearIban}
                    className="px-3 text-xs font-mono text-[#666666] hover:text-[#ff4444] transition-none cursor-pointer border border-[#333333] hover:border-[#ff4444]"
                  >
                    X
                  </button>
                )}
              </div>
              <p className="text-[10px] font-mono text-[#555555] mt-1">
                Auto-formatted with spaces. IBAN is case-insensitive.
              </p>
            </div>

            {/* Validate button */}
            <button
              onClick={handleIbanValidate}
              className="terminal-btn w-full justify-center"
            >
              [<span className="green-chevron">&gt;</span> Validate IBAN]
            </button>

            {/* Preset examples */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#888888] mb-2 uppercase tracking-wider">
                Try an example
              </label>
              <div className="flex flex-wrap gap-2">
                {IBAN_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleIbanPreset(p.value)}
                    className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#000000] border border-[#333333] text-[#888888] hover:border-[#F9F9F9] hover:text-[#F9F9F9] cursor-pointer transition-none min-h-[44px]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── IBAN Result ── */}
            {ibanResult && (
              <div className="border border-[#333333] bg-[#000000]">
                {/* Status bar */}
                <div
                  className={`px-4 py-2 border-b flex items-center gap-3 ${
                    ibanResult.valid
                      ? 'border-[#00FF41] bg-[#00FF41]/5'
                      : 'border-[#ff4444] bg-[#ff4444]/5'
                  }`}
                >
                  <StatusIndicator valid={ibanResult.valid} />
                  {ibanResult.error && (
                    <span className="text-xs font-mono text-[#ff4444]">
                      {ibanResult.error}
                    </span>
                  )}
                </div>

                {/* Parsed fields */}
                {ibanResult.valid && ibanResult.parsed && (
                  <div className="p-4 space-y-0">
                    <p className="text-[10px] font-mono font-bold text-[#888888] mb-3 uppercase tracking-wider">
                      Parsed IBAN Details
                    </p>
                    <FieldRow label="Country" value={ibanResult.parsed.countryName} />
                    <FieldRow label="Country Code" value={ibanResult.parsed.country} />
                    <FieldRow label="Check Digits" value={ibanResult.parsed.checkDigits} />
                    {ibanResult.parsed.bank && (
                      <FieldRow
                        label={
                          IBAN_FORMATS[ibanResult.parsed.country]?.labelBank || 'Bank Code'
                        }
                        value={ibanResult.parsed.bank}
                      />
                    )}
                    {ibanResult.parsed.branch && (
                      <FieldRow
                        label={
                          IBAN_FORMATS[ibanResult.parsed.country]?.labelBranch || 'Branch'
                        }
                        value={ibanResult.parsed.branch}
                      />
                    )}
                    {ibanAccountField && (
                      <FieldRow label={ibanAccountField.label} value={ibanAccountField.value} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SWIFT Tab ── */}
        {tab === 'swift' && (
          <div className="space-y-5">
            {/* Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#F9F9F9] mb-2 uppercase tracking-wider">
                Enter SWIFT / BIC Code
              </label>
              <div className="flex gap-2">
                <input
                  ref={swiftInputRef}
                  type="text"
                  value={swiftRaw}
                  onChange={(e) => handleSwiftChange(e.target.value)}
                  onKeyDown={handleSwiftKeyDown}
                  placeholder="e.g. BOFAUS3N"
                  className="flex-1 px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm uppercase outline-none focus:border-2 focus:border-[#00FF41] transition-none placeholder:normal-case placeholder-[#555555]"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={11}
                />
                {swiftRaw && (
                  <button
                    onClick={clearSwift}
                    className="px-3 text-xs font-mono text-[#666666] hover:text-[#ff4444] transition-none cursor-pointer border border-[#333333] hover:border-[#ff4444]"
                  >
                    X
                  </button>
                )}
              </div>
              <p className="text-[10px] font-mono text-[#555555] mt-1">
                8 characters for head office, 11 for a specific branch. Auto-capitalized.
              </p>
            </div>

            {/* Validate button */}
            <button
              onClick={handleSwiftValidate}
              className="terminal-btn w-full justify-center"
            >
              [<span className="green-chevron">&gt;</span> Validate SWIFT/BIC]
            </button>

            {/* Preset examples */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#888888] mb-2 uppercase tracking-wider">
                Try an example
              </label>
              <div className="flex flex-wrap gap-2">
                {SWIFT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSwiftPreset(p.value)}
                    className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#000000] border border-[#333333] text-[#888888] hover:border-[#F9F9F9] hover:text-[#F9F9F9] cursor-pointer transition-none min-h-[44px]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SWIFT Result ── */}
            {swiftResult && (
              <div className="border border-[#333333] bg-[#000000]">
                {/* Status bar */}
                <div
                  className={`px-4 py-2 border-b flex items-center gap-3 ${
                    swiftResult.valid
                      ? 'border-[#00FF41] bg-[#00FF41]/5'
                      : 'border-[#ff4444] bg-[#ff4444]/5'
                  }`}
                >
                  <StatusIndicator valid={swiftResult.valid} />
                  {swiftResult.error && (
                    <span className="text-xs font-mono text-[#ff4444]">
                      {swiftResult.error}
                    </span>
                  )}
                </div>

                {/* Parsed fields */}
                {swiftResult.valid && swiftResult.parsed && (
                  <div className="p-4 space-y-0">
                    <p className="text-[10px] font-mono font-bold text-[#888888] mb-3 uppercase tracking-wider">
                      Parsed SWIFT / BIC Details
                    </p>
                    <FieldRow label="Bank Code" value={swiftResult.parsed.bankCode} />
                    <FieldRow label="Country" value={swiftResult.parsed.countryName} />
                    <FieldRow label="Country Code" value={swiftResult.parsed.country} />
                    <FieldRow label="Location Code" value={swiftResult.parsed.locationCode} />
                    {swiftResult.parsed.branchCode && (
                      <FieldRow label="Branch Code" value={swiftResult.parsed.branchCode} />
                    )}
                    {!swiftResult.parsed.branchCode && (
                      <FieldRow label="Branch" value="XXX (Head Office)" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
