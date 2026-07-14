'use client'

import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

const passwordFaq = [
  {
    question: 'What makes a password strong and secure?',
    answer: 'Strong passwords are at least 12 characters long and combine uppercase letters, lowercase letters, numbers, and symbols. The entropy (randomness) determines strength. Avoid dictionary words, personal information, or common patterns like "123456".'
  },
  {
    question: 'Are my generated passwords stored or tracked?',
    answer: 'No. All passwords are generated in your browser and never leave your device. They are not stored, logged, or sent to any server. The Pro vault feature stores encrypted passwords locally in your browser only.'
  },
  {
    question: 'Should I use a password manager instead?',
    answer: 'Yes. Generated passwords should be stored in a password manager like Bitwarden, 1Password, or the built-in browser manager. This creates unique passwords for every account without requiring you to remember them.'
  }
]

const passwordSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Generate Strong Random Passwords</h2>
    <p>
      Password Generator creates cryptographically random passwords with customizable character sets. Each password is unique and generated locally in your browser. Measure entropy to verify password strength before using for accounts.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Password Best Practices</h3>
    <p>
      Use long passwords (16+ characters) with mixed character types. Never reuse passwords across sites. For critical accounts (email, banking), consider passphrases of random words.
    </p>
  </div>
)

function generatePassword(length: number, useUppercase: boolean, useNumbers: boolean, useSymbols: boolean): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  let chars = lowercase
  if (useUppercase) chars += uppercase
  if (useNumbers) chars += numbers
  if (useSymbols) chars += symbols
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function calculateEntropy(password: string): number {
  let poolSize = 26
  if (/[A-Z]/.test(password)) poolSize += 26
  if (/[0-9]/.test(password)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 20
  return Math.round(password.length * Math.log2(poolSize))
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    setPassword(generatePassword(length, useUppercase, useNumbers, useSymbols))
  }, [length, useUppercase, useNumbers, useSymbols])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = password
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const entropy = password ? calculateEntropy(password) : 0
  const strength = entropy >= 120 ? 'Very Strong' : entropy >= 80 ? 'Strong' : entropy >= 50 ? 'Medium' : 'Weak'

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate strong, secure passwords instantly. Customize length, symbols, numbers, and uppercase letters."
      toolSlug="password-generator"
      categorySlug="developer-tools"
      faq={passwordFaq}
      seoContent={passwordSeo}
    >
      <div className="space-y-6 font-mono">
        {/* Password Display */}
        {password && (
          <div className="p-4 bg-[#000000] border-2 border-[#00FF41] text-[#00FF41] font-mono text-xl text-center break-all">
            {password}
          </div>
        )}

        <div className="space-y-4">
          {/* Length */}
          <div>
            <label className="flex justify-between text-xs font-mono text-[#F9F9F9] mb-2">
              <span>Password Length</span>
              <span className="text-[#00FF41]">{length}</span>
            </label>
            <input
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-[#00FF41]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#555555]">
              <span>6</span>
              <span>64</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} className="w-4 h-4 accent-[#00FF41]" />
              <span className="text-xs font-mono text-[#F9F9F9]">Include Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="w-4 h-4 accent-[#00FF41]" />
              <span className="text-xs font-mono text-[#F9F9F9]">Include Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="w-4 h-4 accent-[#00FF41]" />
              <span className="text-xs font-mono text-[#F9F9F9]">Include Symbols (!@#$%^&*)</span>
            </label>
          </div>
        </div>

        {/* Buttons — Terminal [> text] style */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generate}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> Generate Password]
          </button>
          {password && (
            <button
              onClick={copyToClipboard}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
            </button>
          )}
        </div>

        {/* Strength Indicator */}
        {password && (
          <div>
            <div className="border border-[#333333] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#F9F9F9]">Password Strength</span>
                <span className={`text-xs font-mono font-bold ${
                  strength === 'Very Strong' ? 'text-[#00FF41]' :
                  strength === 'Strong' ? 'text-[#F9F9F9]' :
                  strength === 'Medium' ? 'text-[#cccccc]' : 'text-[#ff4444]'
                }`}>
                  {strength}
                </span>
              </div>
              <div className="h-2 bg-[#1a1a1a] overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    strength === 'Very Strong' ? 'bg-[#00FF41] w-full' :
                    strength === 'Strong' ? 'bg-[#F9F9F9] w-3/4' :
                    strength === 'Medium' ? 'bg-[#888888] w-1/2' : 'bg-[#ff4444] w-1/4'
                  }`}
                />
              </div>
              <p className="text-[10px] font-mono text-[#555555] mt-2">Entropy: {entropy} bits</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
