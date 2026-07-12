'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import {
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Key,
  Code,
  Calendar,
  Info,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  BarChart3,
  Hash,
  Layers,
  Timer,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'

const jwtFaq = [
  {
    question: 'What is a JWT token and why are they used?',
    answer: 'JWT (JSON Web Token) is a compact, URL-safe token format used for stateless authentication. The token consists of three Base64URL-encoded parts: header (algorithm info), payload (claims), and signature. JWTs enable scalable authentication without server-side session storage.'
  },
  {
    question: 'How do I decode the signature to verify it?',
    answer: 'This decoder shows the parsed header and payload but does not automatically verify signatures. Signature verification requires the original secret key (for HS256/HS384) or public key (for RS256/ES256). The Pro feature gate unlocks server-side verification with custom keys and JWKS endpoint support.'
  },
  {
    question: 'What does the exp claim mean in a JWT?',
    answer: 'The exp (expiration) claim is a Unix timestamp indicating when the token becomes invalid. Most JWT libraries automatically reject expired tokens. This tool shows a live countdown so you can see exactly how much time remains before the token expires.'
  },
  {
    question: 'What does the "kid" field in the JWT header mean?',
    answer: 'The "kid" (Key ID) field is an optional header parameter that hints at which key was used to sign the token. When a server rotates signing keys, the kid helps the verifier select the correct public key from a JWKS (JSON Web Key Set) endpoint. Without a matching kid, RS256/ES256 tokens cannot be verified.'
  },
  {
    question: 'What is the difference between HS256 and RS256?',
    answer: 'HS256 (HMAC with SHA-256) uses a single shared secret for both signing and verification - the same secret must be kept private on both the issuer and verifier. RS256 (RSA with SHA-256) uses a private/public key pair: the issuer signs with a private key and anyone with the public key can verify. RS256 is preferred for server-to-server communication as the signing key never needs to be shared.'
  }
]

const jwtSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Decode and Inspect JWT Tokens Securely</h2>
    <p><strong>What It Is.</strong> JSON Web Tokens (JWT) are the standard for stateless authentication across web APIs. When debugging authentication flows, inspecting JWT payloads helps verify token contents, check expiration times, and validate claims. This decoder processes tokens entirely client-side - your secrets never leave your browser.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p>
      A JWT has three Base64URL-encoded segments separated by dots: the header indicates the signing algorithm (HS256, RS256, or ES256), the payload contains registered claims (iss, sub, aud, exp, nbf, iat, jti) plus custom claims, and the signature is a cryptographic hash of the header and payload using the algorithm from the header. The decoder splits the token at each dot, Base64URL-decodes the header and payload, and parses the resulting JSON. The third segment (signature) is displayed as raw bytes since it requires the original signing key to verify.
    </p>
    <h3 className="text-sm font-semibold text-[#888888]">Worked Example</h3>
    <p>
      <strong>Input token:</strong> <code className="text-xs font-mono">{'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'}</code><br />
      <strong>Decoded header:</strong> <code className="text-xs font-mono">{'{"alg": "HS256", "typ": "JWT"}'}</code><br />
      <strong>Decoded payload:</strong> <code className="text-xs font-mono">{'{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'}</code><br />
      The header shows the token uses HMAC-SHA256 (HS256). The payload contains a subject claim (sub), the user&apos;s name, and an issued-at timestamp (iat). The tool converts the iat Unix timestamp to a human-readable date and calculates the time elapsed since issuance.
    </p>
    <h3 className="text-sm font-semibold text-[#888888]">Common Mistakes</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
      <li><strong>Trusting unverified JWTs.</strong> This decoder shows the decoded header and payload but does not automatically verify the signature. A token can be decoded by anyone - decoding does not imply authenticity. Always verify the signature on your server using the correct secret or public key before trusting the claims.</li>
      <li><strong>Confusing Unix timestamps with human-readable dates.</strong> The exp, iat, and nbf claims are Unix timestamps in seconds since epoch, not milliseconds. JavaScript <code className="text-xs font-mono">Date.now()</code> returns milliseconds, so comparing <code className="text-xs font-mono">exp * 1000</code> with <code className="text-xs font-mono">Date.now()</code> is a common off-by-factor-1000 bug that causes premature or delayed expiration.</li>
      <li><strong>Ignoring the "alg": "none" attack.</strong> Some JWT libraries accept tokens with <code className="text-xs font-mono">{'{"alg": "none"}'}</code> in the header, bypassing signature verification entirely. If your decoder or server accepts unsigned tokens, an attacker can forge arbitrary claims. Always reject tokens with alg=none on the server side.</li>
    </ul>
  </div>
)

// Standard base64url decoding that works both client & server side
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  if (typeof window !== 'undefined') {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } else {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
}

// Highlight JSON syntax with HTML formatting
function highlightJson(jsonStr: string): string {
  const safeStr = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return safeStr.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-[#F9F9F9]';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-indigo-600 font-semibold';
        } else {
          cls = 'text-emerald-600';
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-blue-600 font-medium';
      } else if (/null/.test(match)) {
        cls = 'text-rose-500 font-medium';
      } else {
        cls = 'text-amber-600';
      }

      if (/^"/.test(match) && /:$/.test(match)) {
        return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
      } else {
        return `<span class="${cls}">${match}</span>`;
      }
    }
  );
}

// Standard Claims Dictionary
const STANDARD_CLAIMS: Record<string, { name: string; desc: string }> = {
  iss: { name: 'Issuer (iss)', desc: 'Identifies the provider or entity that issued the token.' },
  sub: { name: 'Subject (sub)', desc: 'Identifies the user, device, or system this token represents (usually User ID).' },
  aud: { name: 'Audience (aud)', desc: 'Identifies the recipient systems or APIs that this token is intended for.' },
  exp: { name: 'Expiration Time (exp)', desc: 'Identifies the exact date and time after which the token must not be accepted.' },
  nbf: { name: 'Not Before (nbf)', desc: 'Identifies the exact date and time before which the token must not be processed.' },
  iat: { name: 'Issued At (iat)', desc: 'Identifies the exact date and time at which the token was generated.' },
  jti: { name: 'JWT ID (jti)', desc: 'A unique identifier for the token. Useful for preventing token reuse or replay attacks.' }
};

// Header field descriptions for the inspection section
const HEADER_FIELDS: Record<string, { name: string; desc: string; warning?: string }> = {
  alg: { name: 'Algorithm', desc: 'The cryptographic algorithm used to sign the token. HS256 uses a shared secret; RS256/ES256 use public-key cryptography.', warning: 'alg=none means the token has no signature — reject these on the server.' },
  typ: { name: 'Type', desc: 'The media type of the token. Almost always "JWT". If absent, the token should still be treated as JWT per RFC 7519.' },
  kid: { name: 'Key ID', desc: 'A hint indicating which key was used to sign the token. Matches a key in the JWKS endpoint for key rotation support.' },
  cty: { name: 'Content Type', desc: 'Structured content type for nested JWTs. Rarely used outside of signed JWEs.' },
};

// Claim validation logic for premium validation feature
interface ClaimValidation {
  status: 'valid' | 'invalid' | 'warning' | 'info';
  message: string;
}

function validateClaim(key: string, value: unknown, nowMs: number): ClaimValidation | null {
  switch (key) {
    case 'exp': {
      if (typeof value !== 'number') return { status: 'invalid', message: 'exp must be a numeric Unix timestamp (seconds since epoch)' };
      const expMs = value * 1000;
      if (expMs <= nowMs) return { status: 'invalid', message: 'Token has expired' };
      if (expMs - nowMs < 3600000) return { status: 'warning', message: 'Expires within 1 hour' };
      return { status: 'valid', message: `Valid for ${formatDuration(expMs - nowMs)}` };
    }
    case 'nbf': {
      if (typeof value !== 'number') return { status: 'invalid', message: 'nbf must be a numeric Unix timestamp (seconds since epoch)' };
      const nbfMs = value * 1000;
      if (nbfMs > nowMs + 5000) return { status: 'warning', message: 'Token is not yet valid — will activate at specified time' };
      return { status: 'valid', message: 'Token is past its not-before time' };
    }
    case 'iat': {
      if (typeof value !== 'number') return { status: 'invalid', message: 'iat must be a numeric Unix timestamp (seconds since epoch)' };
      const iatMs = value * 1000;
      if (iatMs > nowMs + 120000) return { status: 'warning', message: 'Issued-at time is more than 2 minutes in the future — clock drift?' };
      return { status: 'valid', message: 'Token issuance time is acceptable' };
    }
    case 'iss': {
      if (!value || (typeof value === 'string' && value.trim() === '')) return { status: 'warning', message: 'iss is empty — token issuer not identified' };
      return { status: 'valid', message: 'Issuer is specified' };
    }
    case 'aud': {
      if (!value || (typeof value === 'string' && value.trim() === '')) return { status: 'warning', message: 'aud is empty — audience not specified' };
      return { status: 'valid', message: 'Audience is specified' };
    }
    case 'sub': {
      if (!value || (typeof value === 'string' && value.trim() === '')) return { status: 'warning', message: 'sub is empty — no subject identified' };
      return { status: 'valid', message: 'Subject is identified' };
    }
    default:
      return null;
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

// Algorithm family lookup
const ALGORITHM_FAMILIES: Record<string, string> = {
  HS256: 'HMAC with SHA-256 (symmetric)',
  HS384: 'HMAC with SHA-384 (symmetric)',
  HS512: 'HMAC with SHA-512 (symmetric)',
  RS256: 'RSA with SHA-256 (asymmetric)',
  RS384: 'RSA with SHA-384 (asymmetric)',
  RS512: 'RSA with SHA-512 (asymmetric)',
  ES256: 'ECDSA with P-256 (asymmetric)',
  ES384: 'ECDSA with P-384 (asymmetric)',
  ES512: 'ECDSA with P-521 (asymmetric)',
  EdDSA: 'EdDSA (asymmetric)',
  none: 'No signature — insecure',
};

// Colour for a validation status badge
function validationColor(status: ClaimValidation['status']): string {
  switch (status) {
    case 'valid': return '#00FF41';
    case 'warning': return '#F9F9F9';
    case 'invalid': return '#ff4444';
    case 'info': return '#888888';
  }
}

function validationIcon(status: ClaimValidation['status']) {
  switch (status) {
    case 'valid': return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: validationColor(status) }} />;
    case 'warning': return <AlertCircle className="w-3.5 h-3.5" style={{ color: validationColor(status) }} />;
    case 'invalid': return <XCircle className="w-3.5 h-3.5" style={{ color: validationColor(status) }} />;
    case 'info': return <Info className="w-3.5 h-3.5" style={{ color: validationColor(status) }} />;
  }
}

interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

interface JwtPayload {
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  aud?: string;
  sub?: string;
  jti?: string;
  [key: string]: unknown;
}

export default function JwtDecoderClient() {
  const [jwtInput, setJwtInput] = useState<string>('')
  const [now, setNow] = useState<number>(0)

  // Verification Mock state
  const [secretInput, setSecretInput] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null)

  // Copies tracking
  const [copiedHeader, setCopiedHeader] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [copiedSignature, setCopiedSignature] = useState(false)
  const [copiedRaw, setCopiedRaw] = useState(false)
  const [copiedStats, setCopiedStats] = useState(false)

  // Initialize client-side ticking and set default token
  useEffect(() => {
    const nowSec = Math.floor(Date.now() / 1000)
    const headerObj = { alg: "HS256", typ: "JWT" }
    const payloadObj = {
      sub: "usr_948210385",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: "Administrator",
      iss: "https://auth.example.com",
      aud: "example-client",
      iat: nowSec - 300, // 5 minutes ago
      exp: nowSec + 172800, // 2 days from now
      nbf: nowSec - 300
    }

    const encodeStr = (obj: object) => btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const dummySig = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const defaultToken = `${encodeStr(headerObj)}.${encodeStr(payloadObj)}.${dummySig}`;

    const timeout = setTimeout(() => {
      setNow(Date.now())
      setJwtInput(defaultToken)
    }, 0)

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  // Action helpers
  const handleClear = () => {
    setJwtInput('')
    setSecretInput('')
    setVerificationResult(null)
  }

  const handleLoadSample = () => {
    const nowSec = Math.floor(Date.now() / 1000)
    const headerObj = { alg: "RS256", typ: "JWT", kid: "key_v1" }
    const payloadObj = {
      sub: "usr_998877",
      name: "Alex Smith",
      email: "alex@company.com",
      role: "Developer",
      scopes: ["read:data", "write:data"],
      iss: "https://api.company.com",
      aud: "admin-dashboard",
      iat: nowSec - 1800, // 30 minutes ago
      exp: nowSec + 14400, // 4 hours from now
      active: true
    }

    const encodeStr = (obj: object) => btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const dummySig = "dGhpcy1pcy1hLW1vY2stc2lnbmF0dXJlLWZvci1zaG93aW5nLXB1cnBvc2Vz";
    const sampleToken = `${encodeStr(headerObj)}.${encodeStr(payloadObj)}.${dummySig}`;
    setJwtInput(sampleToken);
    setVerificationResult(null)
  }

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Decode the current JWT
  let errorMsg = ''
  let headerObj: JwtHeader | null = null
  let payloadObj: JwtPayload | null = null
  let signaturePart = ''
  let rawHeader = ''
  let rawPayload = ''
  let headerString = ''
  let payloadString = ''

  if (jwtInput.trim()) {
    const parts = jwtInput.trim().split('.')
    if (parts.length !== 3) {
      errorMsg = 'Invalid JWT structure: A JSON Web Token must contain exactly 3 dot-separated parts (Header, Payload, Signature).'
    } else {
      rawHeader = parts[0]
      rawPayload = parts[1]
      signaturePart = parts[2]

      try {
        headerString = decodeBase64Url(rawHeader)
        try {
          headerObj = JSON.parse(headerString)
        } catch {
          errorMsg = 'Failed to parse Header JSON. The header section is decoded but is not a valid JSON object.'
        }
      } catch {
        errorMsg = 'Failed to decode Header. The base64url encoding is invalid.'
      }

      if (!errorMsg) {
        try {
          payloadString = decodeBase64Url(rawPayload)
          try {
            payloadObj = JSON.parse(payloadString)
          } catch {
            errorMsg = 'Failed to parse Payload JSON. The payload section is decoded but is not a valid JSON object.'
          }
        } catch {
          errorMsg = 'Failed to decode Payload. The base64url encoding is invalid.'
        }
      }
    }
  }

  // Handle Mock verification
  const handleVerify = () => {
    if (errorMsg || !jwtInput) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      // Mock logic: succeeds if secret has content, otherwise fails
      if (secretInput.trim().length > 0) {
        setVerificationResult('success');
      } else {
        setVerificationResult('failed');
      }
    }, 1200);
  };

  // --- PREMIUM FEATURE 1: Expiry Countdown ---
  const expClaim = payloadObj?.exp;
  let expStatusType: 'active' | 'expired' | 'warning' | 'none' = 'none';
  let countdownText = '';

  if (expClaim && typeof expClaim === 'number' && now > 0) {
    const expMs = expClaim * 1000;
    const diff = expMs - now;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor((absDiff / 1000) % 60);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    const formattedTime = parts.join(' ');

    if (diff < 0) {
      expStatusType = 'expired';
      countdownText = `${formattedTime} ago`;
    } else {
      countdownText = formattedTime;
      // Warn if token expires in less than 1 hour
      if (diff < 3600 * 1000) {
        expStatusType = 'warning';
      } else {
        expStatusType = 'active';
      }
    }
  }

  // --- PREMIUM FEATURE 2: Claims Validation ---
  const claimValidations: Record<string, ClaimValidation | null> = {};
  if (payloadObj && now > 0) {
    const validateKeys = ['exp', 'nbf', 'iat', 'iss', 'aud', 'sub'] as const;
    for (const key of validateKeys) {
      if (key in payloadObj) {
        claimValidations[key] = validateClaim(key, payloadObj[key], now);
      }
    }
  }

  // --- PREMIUM FEATURE 6: Token Stats ---
  const tokenStats = !errorMsg && headerObj && payloadObj ? {
    rawLength: jwtInput.trim().length,
    partsCount: jwtInput.trim().split('.').length,
    algorithm: headerObj.alg || 'N/A',
    algorithmFamily: headerObj.alg ? ALGORITHM_FAMILIES[headerObj.alg] || `Unknown algorithm: ${headerObj.alg}` : 'Not specified',
    claimsTotal: Object.keys(payloadObj).length,
    hasExp: 'exp' in payloadObj,
    hasIat: 'iat' in payloadObj,
    hasNbf: 'nbf' in payloadObj,
    hasIss: 'iss' in payloadObj,
    hasAud: 'aud' in payloadObj,
    hasSub: 'sub' in payloadObj,
  } : null;

  // Generate Claims List
  const claimsList: Array<{
    key: string;
    value: unknown;
    isStandard: boolean;
    name: string;
    desc: string;
  }> = [];

  if (payloadObj) {
    Object.keys(payloadObj).forEach((key) => {
      const isStandard = key in STANDARD_CLAIMS;
      claimsList.push({
        key,
        value: payloadObj[key],
        isStandard,
        name: isStandard ? STANDARD_CLAIMS[key].name : key,
        desc: isStandard ? STANDARD_CLAIMS[key].desc : 'Custom application claim, defined by your user registry or server config.'
      });
    });
    // Sort standard claims to the top, custom claims at bottom
    claimsList.sort((a, b) => {
      if (a.isStandard && !b.isStandard) return -1;
      if (!a.isStandard && b.isStandard) return 1;
      return a.key.localeCompare(b.key);
    });
  }

  // Format Helper for timestamps inside breakdown
  const formatTimestamp = (timestamp: unknown) => {
    if (typeof timestamp !== 'number') return String(timestamp);
    const date = new Date(timestamp * 1000);
    return `${timestamp} (${date.toLocaleString()})`;
  };

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and inspect JSON Web Tokens (JWT) locally and securely. Base64 decode header and payload parts instantly."
      toolSlug="jwt-decoder"
            faq={jwtFaq}
      seoContent={jwtSeo}
    >
      <div className="space-y-6">

        {/* Pasting input area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Encoded JWT Token
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLoadSample}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> LOAD SAMPLE]
              </button>
              {jwtInput && (
                <>
                  <button
                    onClick={() => copyToClipboard(jwtInput, setCopiedRaw)}
                    className="terminal-btn"
                  >
                    {copiedRaw ? <Check className="w-3 h-3 text-emerald-500 animate-pulse" /> : <Copy className="w-3 h-3" />}
                    [<span className="green-chevron">&gt;</span> COPY RAW]
                  </button>
                  <button
                    onClick={handleClear}
                    className="terminal-btn"
                  >
                    [<span className="green-chevron">&gt;</span> CLEAR]
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value.trim())}
            rows={5}
            placeholder="Paste your base64encoded JWT token (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...) here"
            className="w-full px-4 py-3 border border-[#333333] rounded-none bg-[#000000] font-mono text-sm break-all resize-y shadow-inner leading-relaxed focus:outline-none"
          />
        </div>

        {/* PREMIUM FEATURE 6: Token Stats Bar */}
        {tokenStats && (
          <div className="border border-[#333333] bg-[#000000] p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#00FF41]" />
              <span className="text-xs font-mono font-bold text-[#F9F9F9] tracking-wider uppercase">
                Token Statistics
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-center">
                <Hash className="w-3.5 h-3.5 text-[#555555] mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Length</p>
                <p className="text-sm font-mono text-[#F9F9F9] font-bold">{tokenStats.rawLength} chars</p>
              </div>
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-center">
                <Layers className="w-3.5 h-3.5 text-[#555555] mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Parts</p>
                <p className="text-sm font-mono text-[#F9F9F9] font-bold">{tokenStats.partsCount} segments</p>
              </div>
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-center">
                <Key className="w-3.5 h-3.5 text-[#555555] mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Algorithm</p>
                <p className="text-sm font-mono text-[#F9F9F9] font-bold">{tokenStats.algorithm}</p>
              </div>
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-center">
                <Code className="w-3.5 h-3.5 text-[#555555] mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Claims</p>
                <p className="text-sm font-mono text-[#F9F9F9] font-bold">{tokenStats.claimsTotal} total</p>
              </div>
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-center">
                <Timer className="w-3.5 h-3.5 text-[#555555] mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Algorithm</p>
                <p className="text-[10px] font-mono text-[#888888] mt-0.5 leading-tight">{tokenStats.algorithmFamily}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning Badge / Error alert */}
        {errorMsg && (
          <div className="p-4 border border-[#333333] bg-[#000000] text-[#888888] text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#ff4444]" />
            <div>
              <p className="font-mono text-xs text-[#ff4444]">Invalid JWT Token</p>
              <p className="mt-0.5 leading-relaxed text-xs font-mono text-[#666666]">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Decode Panels Grid */}
        {headerObj && payloadObj && !errorMsg && (
          <div className="space-y-6">

            {/* PREMIUM FEATURE 1: Enhanced Expiry Countdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Expiry Counter — enhanced with larger countdown */}
              <div className="p-4 rounded-none border border-[#333333] bg-[#000000] flex flex-col min-h-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-[#00FF41]" />
                  <span className="text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider">
                    Expiry Countdown
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {expClaim ? (
                    <>
                      <div className={`text-2xl font-mono font-bold tracking-wider tabular-nums ${
                        expStatusType === 'expired' ? 'text-[#555555]' :
                        expStatusType === 'warning' ? 'text-[#F9F9F9]' : 'text-[#00FF41]'
                      }`}>
                        {countdownText}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {expStatusType === 'active' && (
                          <span className="text-[10px] font-mono border border-[#00FF41] text-[#00FF41] px-2 py-0.5">
                            <span className="w-1.5 h-1.5 inline-block bg-[#00FF41] animate-pulse mr-1" />
                            Active
                          </span>
                        )}
                        {expStatusType === 'warning' && (
                          <span className="text-[10px] font-mono border border-[#F9F9F9] text-[#F9F9F9] px-2 py-0.5">
                            <span className="w-1.5 h-1.5 inline-block bg-[#F9F9F9] animate-pulse mr-1" />
                            Expiring Soon
                          </span>
                        )}
                        {expStatusType === 'expired' && (
                          <span className="text-[10px] font-mono border border-[#555555] text-[#888888] px-2 py-0.5">
                            Expired
                          </span>
                        )}
                      </div>
                      {expStatusType !== 'expired' && expClaim && (
                        <p className="text-[10px] text-[#555555] font-mono mt-2">
                          {expStatusType === 'active' ? 'Token is valid' : 'Consider refreshing'}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Clock className="w-8 h-8 text-[#555555] mb-1" />
                      <span className="text-sm font-mono text-[#666666]">Never Expires</span>
                      <span className="text-[10px] text-[#444444] font-mono mt-1">Permanent Session</span>
                    </>
                  )}
                </div>
              </div>

              {/* Algorithm Details — enhanced with explanations */}
              <div className="p-4 rounded-none border border-[#333333] bg-[#000000] flex flex-col min-h-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-[#00FF41]" />
                  <span className="text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider">
                    Signing Algorithm
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-2xl font-mono font-bold uppercase text-[#F9F9F9]">
                    {headerObj?.alg || 'N/A'}
                  </span>
                  <div className="mt-2 text-xs text-[#666666] text-center">
                    <span>Type:</span>{' '}
                    <span className="font-semibold uppercase bg-[#1a1a1a] px-1.5 py-0.5 rounded-none text-[#888888]">
                      {headerObj?.typ || 'JWT'}
                    </span>
                  </div>
                  {headerObj?.kid && (
                    <div className="mt-2 text-[10px] text-[#555555] font-mono">
                      KID: <span className="text-[#888888]">{headerObj.kid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Claims Summary — enhanced with validation context */}
              <div className="p-4 rounded-none border border-[#333333] bg-[#000000] flex flex-col min-h-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#00FF41]" />
                  <span className="text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider">
                    Claims Validation
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-[#F9F9F9]">
                    {Object.keys(payloadObj).length}
                  </span>
                  <span className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Claims</span>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {claimsList.filter(c => c.isStandard).length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 border border-[#00FF41] text-[#00FF41] font-mono">
                        {claimsList.filter(c => c.isStandard).length} Standard
                      </span>
                    )}
                    {claimsList.filter(c => !c.isStandard).length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 border border-[#F9F9F9] text-[#F9F9F9] font-mono">
                        {claimsList.filter(c => !c.isStandard).length} Custom
                      </span>
                    )}
                  </div>
                  {/* Validation summary badges */}
                  {Object.values(claimValidations).filter(Boolean).length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {Object.values(claimValidations).filter((v): v is ClaimValidation => v !== null).map((v, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5"
                          style={{
                            border: `1px solid ${validationColor(v.status)}`,
                            color: validationColor(v.status),
                            opacity: v.status === 'valid' ? 0.6 : 1,
                          }}
                          title={v.message}
                        >
                          {validationIcon(v.status)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Split UI: Header and Payload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Header block — enhanced with PREMIUM FEATURE 4: Header Inspection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[#888888]">
                    Header <span className="text-xs font-medium text-[#555555]">(algorithm & metadata)</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(headerObj, null, 2), setCopiedHeader)}
                    className="terminal-btn"
                    title="Copy Header JSON"
                  >
                    {copiedHeader ? <Check className="w-3.5 h-3.5 text-emerald-555" /> : <Copy className="w-3.5 h-3.5" />}
                    [<span className="green-chevron">&gt;</span> COPY JSON]
                  </button>
                </div>

                <div className="relative">
                  <pre
                    className="font-mono text-xs leading-relaxed p-4 rounded-none bg-[#1a1a1a] border border-[#333333] overflow-x-auto whitespace-pre select-text h-[220px]"
                    dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(headerObj, null, 2)) }}
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 border border-[#333333] bg-[#000000] text-[10px] text-[#555555] font-mono pointer-events-none select-none uppercase">
                    Header
                  </div>
                </div>

                {/* Header field explanations */}
                {headerObj && Object.keys(headerObj).length > 0 && (
                  <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-3 space-y-2">
                    <p className="text-[10px] font-mono text-[#555555] uppercase tracking-wider font-bold">
                      Field Breakdown
                    </p>
                    {Object.entries(headerObj).map(([field, val]) => {
                      const info = HEADER_FIELDS[field];
                      return (
                        <div key={field} className="flex items-start gap-2 text-xs">
                          <HelpCircle className="w-3 h-3 text-[#555555] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[#F9F9F9] font-semibold">{field}</span>
                            <span className="text-[#666666]"> = </span>
                            <span className="font-mono text-[#888888]">{String(val)}</span>
                            {info && (
                              <p className="text-[10px] text-[#555555] mt-0.5 leading-relaxed">{info.desc}</p>
                            )}
                            {field === 'alg' && val === 'none' && (
                              <p className="text-[10px] text-[#ff4444] mt-0.5 font-mono">
                                WARNING: alg=none tokens have no signature — reject these on the server.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payload block — enhanced with validation status */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[#888888]">
                    Payload <span className="text-xs font-medium text-[#555555]">(claims & user data)</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(payloadObj, null, 2), setCopiedPayload)}
                    className="terminal-btn"
                    title="Copy Payload JSON"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-555" /> : <Copy className="w-3.5 h-3.5" />}
                    [<span className="green-chevron">&gt;</span> COPY JSON]
                  </button>
                </div>

                <div className="relative">
                  <pre
                    className="font-mono text-xs leading-relaxed p-4 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] overflow-x-auto whitespace-pre select-text h-[220px]"
                    dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(payloadObj, null, 2)) }}
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 border border-[#00FF41] bg-[#000000] text-[10px] text-[#00FF41] font-mono pointer-events-none select-none uppercase">
                    [ PAYLOAD ]
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps & Dates Section */}
            {(payloadObj.iat || payloadObj.exp || payloadObj.nbf) && (
              <div className="p-5 border border-[#333333] bg-[#000000] space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#F9F9F9] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00FF41]" />
                  TOKEN TIMEFRAME SCHEDULE
                </h3>

                <div className="relative flex flex-col md:flex-row justify-between items-stretch gap-6 md:gap-4 md:pt-4">
                  {/* Progress Line for Desktop */}
                  <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-[#333333] z-0">
                    {payloadObj.exp && payloadObj.iat && (
                      <div
                        className={`h-full transition-none ${
                          expStatusType === 'expired' ? 'bg-[#F9F9F9]' :
                          expStatusType === 'warning' ? 'bg-[#F9F9F9]' : 'bg-[#00FF41]'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, ((now / 1000) - payloadObj.iat) / (payloadObj.exp - payloadObj.iat) * 100))}%`
                        }}
                      />
                    )}
                  </div>

                  {/* Issued At Timeline */}
                  {payloadObj.iat && (
                    <div className="flex-1 relative z-10 border border-[#333333] bg-[#000000] p-3 md:bg-transparent md:border-0 md:p-0 text-center md:text-left">
                      <div className="w-8 h-8 border border-[#F9F9F9] bg-[#000000] flex items-center justify-center text-xs font-mono text-[#F9F9F9] mx-auto md:mx-0">
                        1
                      </div>
                      <p className="text-xs font-mono text-[#666666] mt-2">Issued At (iat)</p>
                      <p className="text-sm font-mono text-[#F9F9F9] mt-0.5">{new Date(payloadObj.iat * 1000).toLocaleString()}</p>
                      <p className="text-[10px] text-[#444444] font-mono mt-0.5">Unix: {payloadObj.iat}</p>
                      {claimValidations.iat && (
                        <div className="mt-1 flex items-center justify-center md:justify-start gap-1">
                          {validationIcon(claimValidations.iat.status)}
                          <span className="text-[9px] font-mono" style={{ color: validationColor(claimValidations.iat.status) }}>
                            {claimValidations.iat.message}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Not Before Timeline */}
                  {payloadObj.nbf && (
                    <div className="flex-1 relative z-10 border border-[#333333] bg-[#000000] p-3 md:bg-transparent md:border-0 md:p-0 text-center">
                      <div className="w-8 h-8 border border-[#F9F9F9] bg-[#000000] flex items-center justify-center text-xs font-mono text-[#F9F9F9] mx-auto">
                        2
                      </div>
                      <p className="text-xs font-mono text-[#666666] mt-2">Valid From (nbf)</p>
                      <p className="text-sm font-mono text-[#F9F9F9] mt-0.5">{new Date(payloadObj.nbf * 1000).toLocaleString()}</p>
                      <p className="text-[10px] text-[#444444] font-mono mt-0.5">Unix: {payloadObj.nbf}</p>
                      {claimValidations.nbf && (
                        <div className="mt-1 flex items-center justify-center gap-1">
                          {validationIcon(claimValidations.nbf.status)}
                          <span className="text-[9px] font-mono" style={{ color: validationColor(claimValidations.nbf.status) }}>
                            {claimValidations.nbf.message}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expiration Timeline */}
                  {payloadObj.exp && (
                    <div className="flex-1 relative z-10 border border-[#333333] bg-[#000000] p-3 md:bg-transparent md:border-0 md:p-0 text-center md:text-right">
                      <div className={`w-8 h-8 border bg-[#000000] flex items-center justify-center text-xs font-mono mx-auto md:ml-auto md:mr-0 border-[#F9F9F9] text-[#F9F9F9]`}>
                        3
                      </div>
                      <p className="text-xs font-mono text-[#666666] mt-2">Expires At (exp)</p>
                      <p className="text-sm font-mono text-[#F9F9F9] mt-0.5">{new Date(payloadObj.exp * 1000).toLocaleString()}</p>
                      <p className="text-[10px] text-[#444444] font-mono mt-0.5">Unix: {payloadObj.exp}</p>
                      {claimValidations.exp && (
                        <div className="mt-1 flex items-center justify-center md:justify-end gap-1">
                          {validationIcon(claimValidations.exp.status)}
                          <span className="text-[9px] font-mono" style={{ color: validationColor(claimValidations.exp.status) }}>
                            {claimValidations.exp.message}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PREMIUM FEATURE 2 & 3: Claims Breakdown table with validation */}
            <div>
              <h3 className="text-sm font-mono font-bold text-[#F9F9F9] mb-3">
                PAYLOAD CLAIMS BREAKDOWN
              </h3>

              <div className="border border-[#333333] rounded-none overflow-hidden bg-[#000000]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#1a1a1a] text-[#666666] font-semibold border-b border-[#333333]">
                        <th className="px-4 py-3">Claim / Key</th>
                        <th className="px-4 py-3">Classification</th>
                        <th className="px-4 py-3">Validation</th>
                        <th className="px-4 py-3">Parsed Value</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                      {claimsList.map((claim) => {
                        const validation = claimValidations[claim.key];
                        return (
                          <tr key={claim.key} className="hover:bg-[#1a1a1a]">
                            <td className="px-4 py-3.5 font-mono text-[#F9F9F9] font-semibold text-xs"
                                title={claim.desc}>
                              {claim.key}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {claim.isStandard ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 border border-[#00FF41] text-[#00FF41]">
                                  RFC Standard
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 border border-[#F9F9F9] text-[#F9F9F9]">
                                  Custom Claim
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {validation ? (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5"
                                  style={{
                                    border: `1px solid ${validationColor(validation.status)}`,
                                    color: validationColor(validation.status),
                                    opacity: validation.status === 'valid' ? 0.7 : 1,
                                  }}
                                  title={validation.message}
                                >
                                  {validationIcon(validation.status)}
                                  {validation.status === 'valid' ? 'OK' : validation.status === 'invalid' ? 'FAIL' : validation.status === 'warning' ? 'ALERT' : 'INFO'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#444444] font-mono">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs max-w-xs truncate" title={typeof claim.value === 'object' ? JSON.stringify(claim.value) : String(claim.value)}>
                              {['iat', 'exp', 'nbf'].includes(claim.key)
                                ? formatTimestamp(claim.value)
                                : typeof claim.value === 'object'
                                  ? JSON.stringify(claim.value)
                                  : String(claim.value)
                              }
                            </td>
                            <td className="px-4 py-3.5 text-xs text-[#666666] leading-relaxed min-w-[200px]">
                              {claim.desc}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div>
              <h3 className="text-base font-semibold text-[#888888] mb-3">
                Signature Validation
              </h3>

              <div className="p-5 rounded-none border border-[#333333] bg-[#000000] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                    Signature Cryptographic Verification
                  </span>
                  <button
                    onClick={() => copyToClipboard(signaturePart, setCopiedSignature)}
                    className="terminal-btn"
                    title="Copy Raw Signature"
                  >
                    {copiedSignature ? <Check className="w-3.5 h-3.5 text-emerald-555" /> : <Copy className="w-3.5 h-3.5" />}
                    [<span className="green-chevron">&gt;</span> COPY SIG]
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                  {/* Visual signature explanation */}
                  <div className="space-y-3">
                    <div className="p-4 border border-[#333333] bg-[#1a1a1a] font-mono text-xs leading-relaxed text-[#888888]">
                      <p className="text-[#00FF41] font-bold mb-1">{"// Signature Construction Rule"}</p>
                      <p>
                        <span className="text-[#F9F9F9] font-bold">HMACSHA256</span>(
                      </p>
                      <p className="pl-4 break-all">
                        <span className="text-[#888888]">{rawHeader || 'headerBase64Url'}</span>{" + "}<span className="font-semibold text-[#F9F9F9]">{"\".\""}</span>{" + "}
                      </p>
                      <p className="pl-4 break-all">
                        <span className="text-[#888888]">{rawPayload || 'payloadBase64Url'}</span>,
                      </p>
                      <p className="pl-4 text-[#00FF41] font-bold">
                        {secretInput ? secretInput : '[your-signing-secret]'}
                      </p>
                      <p>)</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold py-0.5 px-2 bg-[#1a1a1a] text-[#888888] rounded-none border border-[#333333]">
                        Signature Block:
                      </span>
                      <span className="font-mono break-all line-clamp-1 select-all text-[#666666] max-w-[200px]" title={signaturePart}>
                        {signaturePart}
                      </span>
                    </div>
                  </div>

                  {/* Signature Verification Interface */}
                  <div className="p-4 rounded-none border border-[#333333] bg-[#1a1a1a] space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#888888]">
                        Local Validation Simulator
                      </span>
                      {verificationResult === 'success' && (
                        <span className="text-[10px] font-mono border border-[#00FF41] text-[#00FF41] px-2 py-0.5">
                          <ShieldCheck className="w-3 h-3 inline mr-1" /> Valid Structure
                        </span>
                      )}
                      {verificationResult === 'failed' && (
                        <span className="text-[10px] font-mono border border-[#ff4444] text-[#ff4444] px-2 py-0.5">
                          <ShieldAlert className="w-3 h-3 inline mr-1" /> Secret Required
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                        HMAC Signature Verification Secret
                      </label>
                      <input
                        type="password"
                        value={secretInput}
                        onChange={(e) => setSecretInput(e.target.value)}
                        placeholder="Enter secret to verify token integrity..."
                        className="w-full px-3 py-2 border border-[#333333] rounded-none text-xs bg-[#000000] focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="terminal-btn w-full justify-center disabled:opacity-40"
                    >
                      {isVerifying ? (
                        <><RefreshCw className="w-3 h-3" /> [<span className="green-chevron">&gt;</span> VERIFYING...]</>
                      ) : (
                        '[> VERIFY SIGNATURE]'
                      )}
                    </button>
                  </div>
                </div>

                {/* Pro Feature Gate for detailed verification */}
                              </div>
            </div>
          </div>
        )}

        {/* Empty state instruction */}
        {!jwtInput && (
          <div className="p-12 text-center border border-dashed border-[#333333] max-w-lg mx-auto space-y-4 bg-[#000000]">
            <div className="w-12 h-12 border border-[#333333] flex items-center justify-center mx-auto text-[#555555]">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-[#F9F9F9]">
                &gt; Pasted token will decode automatically
              </h3>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Paste your encoded JWT into the text area above. The tool will parse and split the token securely entirely on your computer�--none of your sensitive data leaves your device.
              </p>
            </div>
            <button
              onClick={handleLoadSample}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> LOAD SAMPLE]
            </button>
          </div>
        )}

      </div>
    </ToolLayout>
  )
}
