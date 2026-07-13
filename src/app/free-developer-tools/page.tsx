import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Free Developer Tools — 21 Online Dev Utilities (No Signup)',
  description:
    'The definitive collection of 21 free online developer tools. JSON formatter, JWT decoder, regex tester, code beautifier, password generator, converters, playgrounds, and more. All tools run in your browser — no server upload, no signup required.',
  openGraph: {
    title: 'Best Free Developer Tools — 21 Online Dev Utilities (No Signup)',
    description:
      '21 free online developer tools: formatters, validators, encoders, generators, playgrounds. Zero server upload, no signup.',
    type: 'website',
  },
}

const toolCategories = [
  {
    name: 'Formatters & Beautifiers',
    description: 'Turn messy, minified, or unformatted code into clean, readable, properly indented output.',
    tools: [
      {
        slug: 'json-formatter',
        name: 'JSON Formatter & Validator',
        desc: 'Format, validate, and minify JSON data. Detects syntax errors with precise line/column numbers. Supports JSON Schema validation for Draft 07 and 2020-12. Ideal for debugging API responses and editing configuration files like tsconfig, .eslintrc, or VS Code settings.',
      },
      {
        slug: 'code-formatter',
        name: 'Code Formatter (17 Languages)',
        desc: 'Beautify or minify code in 17 languages: JavaScript, TypeScript, HTML, CSS, JSON, Python, XML, SQL, YAML, GraphQL, Rust, Go, Java, C#, PHP, Ruby, and Bash. Each language has language specific formatting rules. Toggle minify mode for production output.',
      },
      {
        slug: 'diff-checker',
        name: 'Diff Checker',
        desc: 'Compare two blocks of text or code side by side and see additions, removals, and changes highlighted. Supports ignore whitespace mode and file upload. Essential for code review, configuration comparison, and debugging content changes.',
      },
    ],
  },
  {
    name: 'Encoders, Decoders & Converters',
    description: 'Convert data between formats and encodings. All processing happens client-side — nothing is uploaded.',
    tools: [
      {
        slug: 'base64-encoder',
        name: 'Base64 Encoder / Decoder',
        desc: 'Encode text or files to Base64 and decode Base64 back to readable text. Supports file upload with preview. Handles large payloads comfortably. Commonly used for embedding binary data in web pages, API payloads, and data URLs.',
      },
      {
        slug: 'url-encoder',
        name: 'URL Encoder / Decoder',
        desc: 'Encode special characters into URL-safe percent-encoding and decode URL-encoded strings back. Essential for building query strings, form URL encoding, and debugging malformed URLs in API requests.',
      },
      {
        slug: 'hex-to-rgb',
        name: 'Hex to RGB Converter',
        desc: 'Convert hex color codes (#FF6600) to RGB (rgb(255, 102, 0)) and HSL values. Preview the colour instantly. Useful for designers and developers working across CSS, design tokens, and graphics code.',
      },
      {
        slug: 'binary-converter',
        name: 'Binary / ASCII Converter',
        desc: 'Convert between binary, decimal, octal, and hexadecimal number systems. Includes ASCII text to binary conversion and bitwise utility operations. Handy for low-level debugging, embedded systems work, and understanding how data is represented in memory.',
      },
      {
        slug: 'json-csv-converter',
        name: 'JSON ↔ CSV Converter',
        desc: 'Convert JSON arrays of objects to CSV and CSV back to JSON. Handles nested objects, custom delimiters, and large datasets. Perfect for migrating data between databases, spreadsheets, and API payloads.',
      },
      {
        slug: 'yaml-json-converter',
        name: 'YAML ↔ JSON Converter',
        desc: 'Convert YAML to JSON and JSON to YAML with live preview and error highlighting. Supports custom indentation and key sorting. Useful for translating between Kubernetes manifests (YAML) and API payloads (JSON), or between Docker Compose files and configuration services.',
      },
    ],
  },
  {
    name: 'Security & Cryptography Tools',
    description: 'Generate secure credentials, inspect tokens, and compute hashes entirely in your browser using the Web Crypto API.',
    tools: [
      {
        slug: 'password-generator',
        name: 'Password Generator',
        desc: 'Generate cryptographically strong passwords with customizable length (up to 128 characters). Toggle uppercase, lowercase, digits, and symbols independently. Uses crypto.getRandomValues() for true randomness — passwords never leave your browser. Designed for API keys, database credentials, admin accounts, and SSH passphrases.',
      },
      {
        slug: 'hash-generator',
        name: 'Hash Generator (MD5, SHA, HMAC)',
        desc: 'Compute MD5, SHA-1, SHA-256, SHA-512, and HMAC hashes from text input. Supports batch processing (one hash per line). Useful for verifying file integrity, generating checksums, and building HMAC signed API requests.',
      },
      {
        slug: 'jwt-decoder',
        name: 'JWT Decoder',
        desc: 'Decode the header and payload of any JSON Web Token. View claims like issuer (iss), subject (sub), expiration (exp), and custom claims. Shows an automatic expiry countdown. Useful for debugging OAuth flows, verifying token contents, and inspecting authentication headers.',
      },
      {
        slug: 'uuid-generator',
        name: 'UUID Generator',
        desc: 'Generate universally unique identifiers (UUIDs) in versions 1, 3, 4, and 5. Supports bulk generation (multiple UUIDs at once). Uses crypto.randomUUID() for v4 and custom namespace/UUID pairs for v3 and v5. Essential for database primary keys, API resource identifiers, and distributed system IDs.',
      },
    ],
  },
  {
    name: 'Text & Regex Tools',
    description: 'Test patterns, write and preview markup, and compare text — with instant feedback.',
    tools: [
      {
        slug: 'regex-tester',
        name: 'Regex Tester',
        desc: 'Test regular expressions in real time. View all matches, capture groups, named groups, and replacement results. Supports common flags (g, i, m, s, u, y). Use the JavaScript mode for .match() and .replace() patterns, or the Python mode for re module patterns. Includes a cheat sheet for quick reference.',
      },
      {
        slug: 'markdown-editor',
        name: 'Markdown Editor',
        desc: 'Write Markdown with live HTML preview. Supports headings, lists, code blocks, tables, images, and links. Auto-saves your content to localStorage. Export formatted output as text. Perfect for drafting README files, documentation, or blog posts before committing.',
      },
    ],
  },
  {
    name: 'Playgrounds & Sandboxes',
    description: 'Write, preview, and experiment with code directly in the browser — no local setup needed.',
    tools: [
      {
        slug: 'html-playground',
        name: 'HTML Playground',
        desc: 'Write HTML, CSS, and JavaScript and see the result rendered in a live preview iframe. Includes popular CSS libraries (Tailwind, Bootstrap). Ideal for prototyping UI components, testing layout ideas, or creating embeddable widgets without setting up a local dev environment.',
      },
      {
        slug: 'qr-code-generator',
        name: 'QR Code Generator',
        desc: 'Generate QR codes from URLs, text, or any string. Choose size and download as PNG. Privacy note: QR generation happens via an API call, while decoding is done client-side.',
      },
      {
        slug: 'qr-code-decoder',
        name: 'QR Code Decoder',
        desc: 'Upload an image containing a QR code and extract the encoded text. Full client-side decoding — your images are never uploaded to a server. Useful for scanning QR codes from screenshots, product packaging, or business cards.',
      },
    ],
  },
  {
    name: 'API & Web Development Tools',
    description: 'Debug webhooks, validate API responses, test endpoints, and generate code snippets for HTTP requests.',
    tools: [
      {
        slug: 'webhook-tester',
        name: 'Webhook Tester',
        desc: 'Generate realistic mock webhook payloads for Stripe (payment events), GitHub (push, pull request, issue events), and Shopify (order, product events). View the full payload structure, headers, and sample responses. Useful for testing webhook handlers, building integrations, and understanding third-party API event formats.',
      },
      {
        slug: 'api-response-validator',
        name: 'API Response Validator',
        desc: 'Paste an HTTP response (status line, headers, body) and get a formatted breakdown. See the status code meaning, header table, and syntax highlighted body. Supports JSON and XML responses. Useful for debugging HTTP clients, inspecting proxy output, and learning HTTP protocol details.',
      },
      {
        slug: 'curl-to-code',
        name: 'cURL → Code Converter',
        desc: 'Convert a cURL command into ready-to-use code snippets for JavaScript fetch, Axios, Python requests, and Go. Parses URL, method, headers, and body from the cURL string. Saves time when translating API examples from documentation into your language of choice.',
      },
    ],
  },
  {
    name: 'Time & Scheduling Tools',
    description: 'Convert timestamps, build cron schedules, and work with time-related developer formats.',
    tools: [
      {
        slug: 'unix-timestamp-converter',
        name: 'Unix Timestamp Converter',
        desc: 'Convert Unix epoch timestamps (seconds and milliseconds) to human readable dates and vice versa. Auto detects seconds vs milliseconds. Shows UTC and local time, day of the week, ISO 8601 format, and relative time. Handles negative timestamps (pre-1970) and the year 2038 boundary.',
      },
      {
        slug: 'cron-expression-builder',
        name: 'Cron Expression Builder',
        desc: 'Build cron expressions visually with a human readable translation. Select minute, hour, day of month, month, and day of week from dropdowns. Shows the expression in standard 5-field format. Useful for scheduling cron jobs, CI/CD pipeline triggers, and serverless function schedules.',
      },
    ],
  },
]

const faq = [
  {
    question: 'Are these developer tools really free?',
    answer:
      'Yes. All 21 tools are completely free to use with no hidden charges, no usage limits, and no signup required. There are no "pro" features locked behind a paywall. Every tool runs entirely in your browser — no server costs for us, no privacy risk for you.',
  },
  {
    question: 'Do I need to create an account to use these tools?',
    answer:
      'No. None of the tools require authentication or account creation. Just open a tool page and start using it. Tool preferences (like indentation size or language selection) are stored in your browser\'s localStorage, not on any server.',
  },
  {
    question: 'Is my data safe when using these tools?',
    answer:
      'Yes. The vast majority of tools process everything in your browser — your data never leaves your machine. The only exceptions are the QR Code Generator (which uses a third-party API) and the Webhook Tester (which sends mock payloads to your specified endpoint). No tool stores, logs, or transmits your input data to our servers.',
  },
  {
    question: 'Which JSON formatter supports schema validation?',
    answer:
      'The JSON Formatter & Validator (/json-formatter) includes optional JSON Schema validation against Draft 07 and 2020-12 schemas. Paste your schema and payload side by side to validate structure, types, required fields, and constraints.',
  },
  {
    question: 'How do I generate a strong password for my database?',
    answer:
      'Use the Password Generator at /password-generator. Set the length to 24+ characters, enable all character sets (uppercase, lowercase, digits, symbols), and click generate. The result is cryptographically random and suitable for database credentials, admin accounts, and API keys. Store it in a password manager immediately.',
  },
  {
    question: 'What is the difference between the HTML Playground and the Code Playground?',
    answer:
      'The HTML Playground (/html-playground) focuses on front-end prototyping — write HTML, CSS, and JavaScript with a live preview iframe. The Code Playground (/code-playground) is a general purpose code editor with syntax highlighting for multiple languages, more suitable for writing and sharing snippets without rendering them.',
  },
  {
    question: 'Can I use these tools offline?',
    answer:
      'Once you have visited a tool page and the JavaScript has been cached by your browser, most tools will continue to work offline or on unreliable connections because they run entirely client-side. Pages that fetch external resources (like the QR Code Generator) require an internet connection.',
  },
]

export default function FreeDeveloperToolsPage() {
  return (
    <>
      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          }),
        }}
      />

      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Tools',
                item: 'https://toolhub.com/tools',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Best Free Developer Tools',
                item: 'https://toolhub.com/free-developer-tools',
              },
            ],
          }),
        }}
      />

      <main className="max-w-4xl mx-auto py-4 md:py-8 space-y-8 md:space-y-10">
        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#666666] select-none">
          <Link href="/tools" className="hover:text-[#F9F9F9] transition-none">Tools</Link>
          <span>/</span>
          <span className="text-[#888888]">free-developer-tools</span>
        </nav>

        {/* ── HERO ──────────────────────────────────── */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-3xl font-heading font-bold text-[#F9F9F9] leading-snug">
            21 Free Developer Tools — The Complete Collection
          </h1>
          <p className="text-xs md:text-sm font-mono text-[#888888] leading-relaxed">
            This is the complete guide to every developer tool on ToolHub. From formatting JSON to generating
            cryptographically secure passwords, all 21 tools are free, require no signup, and process
            everything in your browser. Each tool is described with its exact use case, how it differs
            from alternatives, and why you would use it in your daily workflow.
          </p>
          <p className="text-xs md:text-sm font-mono text-[#888888] leading-relaxed">
            Bookmark this page and come back whenever you need a quick online utility. All tools are
            designed for developers, by a developer — no fluff, no ads, no account required.
          </p>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="bg-[#000000] border-l-4 border-[#00FF41] p-3 md:p-4 space-y-2">
          <span className="text-xs font-mono font-bold text-[#00FF41] uppercase tracking-wider">
            $ Quick navigation
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-[#888888]">
            {toolCategories.map((cat) => (
              <a key={cat.name} href={`#cat-${cat.name.toLowerCase().replace(/[\s&]+/g, '-')}`} className="hover:text-[#F9F9F9] transition-none underline underline-offset-4 decoration-[#333333]">
                {cat.name}
              </a>
            ))}
          </div>
        </div>

        {/* ── TOOL CATEGORIES ───────────────────────── */}
        {toolCategories.map((category) => (
          <section
            key={category.name}
            id={`cat-${category.name.toLowerCase().replace(/[\s&]+/g, '-')}`}
            className="space-y-4 scroll-mt-20"
          >
            <div className="border-t border-[#333333]" />
            <h2 className="text-base md:text-lg font-heading font-bold text-[#F9F9F9]">
              {category.name}
            </h2>
            <p className="text-xs md:text-sm font-mono text-[#888888] leading-relaxed">
              {category.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.tools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group block border border-[#333333] hover:border-[#00FF41] p-3 md:p-4 transition-none"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-heading font-bold text-[#F9F9F9] group-hover:text-[#00FF41] transition-none">
                      {tool.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#00FF41] opacity-0 group-hover:opacity-100 transition-none shrink-0 ml-2">
                      [&gt;]
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#888888] leading-relaxed">
                    {tool.desc}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* ── WHY THESE TOOLS ────────────────────────── */}
        <section className="space-y-4">
          <div className="border-t border-[#333333]" />
          <h2 className="text-base md:text-lg font-heading font-bold text-[#F9F9F9]">
            Why Use These Tools Instead of the Alternatives?
          </h2>
          <div className="space-y-4 text-xs md:text-sm font-mono text-[#888888] leading-relaxed">
            <p>
              There are hundreds of free developer tools scattered across the web — individual sites
              for JSON formatting, code beautifying, Base64 encoding, and so on. ToolHub brings 21 tools
              into one consistent interface so you do not waste time context-switching between tabs.
              Every tool shares the same terminal-inspired design, the same keyboard shortcuts, and the
              same privacy guarantee: your data stays on your machine.
            </p>
            <p>
              Many popular alternatives inject ads, require signup for basic features, or limit how much
              data you can process. ToolHub has none of these restrictions. Tools like the JSON formatter
              handle arbitrarily large payloads. The password generator uses the Web Crypto API for genuine
              randomness. The YAML-to-JSON converter shows live syntax errors as you type, so you can fix
              problems before they reach your deployment pipeline.
            </p>
            <p>
              The programmatic SEO variant pages — like{' '}
              <Link href="/code-formatter/javascript" className="text-[#00FF41] hover:underline">JavaScript code formatter</Link>,{' '}
              <Link href="/json-formatter/validate" className="text-[#00FF41] hover:underline">JSON validator</Link>, and{' '}
              <Link href="/unix-timestamp-converter/epoch-to-date" className="text-[#00FF41] hover:underline">epoch to date converter</Link> — target specific
              long-tail search queries with dedicated pages. Each variant has unique content, FAQ, and
              metadata so you find the exact tool for your task without wading through generic results.
            </p>
          </div>
        </section>

        {/* ── WHO THESE TOOLS ARE FOR ─────────────────── */}
        <section className="space-y-4">
          <div className="border-t border-[#333333]" />
          <h2 className="text-base md:text-lg font-heading font-bold text-[#F9F9F9]">
            Who Are These Tools For?
          </h2>
          <ul className="space-y-2 text-xs md:text-sm font-mono text-[#888888] leading-relaxed list-disc list-inside">
            <li><strong className="text-[#F9F9F9]">Full-stack developers</strong> who need quick JSON formatting, JWT inspection, and API response validation without leaving the browser.</li>
            <li><strong className="text-[#F9F9F9]">DevOps engineers</strong> who generate password credentials, compute file hashes, convert timestamps, and build cron expressions during infrastructure setup.</li>
            <li><strong className="text-[#F9F9F9]">Front-end developers</strong> who prototype HTML/CSS/JS in the playground, format TypeScript, and encode/decode Base64 data URLs.</li>
            <li><strong className="text-[#F9F9F9]">Security researchers</strong> who decode JWTs, test regex patterns for input validation, and generate secure tokens.</li>
            <li><strong className="text-[#F9F9F9]">Students and learners</strong> who experiment with formats, test regular expressions, and understand how encoding and hashing work by seeing input and output side by side.</li>
          </ul>
        </section>

        {/* ── FAQ ────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="border-t border-[#333333]" />
          <h2 className="text-base md:text-lg font-heading font-bold text-[#F9F9F9]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 divide-y divide-[#1a1a1a]">
            {faq.map((item, i) => (
              <div key={i} className="pt-4 first:pt-0 first:border-t-0 border-t border-[#1a1a1a]">
                <h3 className="text-xs md:text-sm font-heading font-bold text-[#F9F9F9] mb-1">
                  {item.question}
                </h3>
                <p className="text-xs font-mono text-[#888888] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────── */}
        <div className="bg-[#000000] border border-[#333333] p-4 md:p-6 space-y-3">
          <p className="text-xs md:text-sm font-mono font-bold text-[#F9F9F9]">
            Ready to use a free developer tool right now?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/json-formatter" className="terminal-btn">
              [<span className="green-chevron">&gt;</span> JSON Formatter]
            </Link>
            <Link href="/code-formatter" className="terminal-btn">
              [<span className="green-chevron">&gt;</span> Code Formatter]
            </Link>
            <Link href="/password-generator" className="terminal-btn">
              [<span className="green-chevron">&gt;</span> Password Generator]
            </Link>
            <Link href="/regex-tester" className="terminal-btn">
              [<span className="green-chevron">&gt;</span> Regex Tester]
            </Link>
            <Link href="/tools" className="terminal-btn">
              [<span className="green-chevron">&gt;</span> All Tools]
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
