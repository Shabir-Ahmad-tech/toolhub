// ──────────────────────────────────────────────────────────
// Programmatic SEO variant registry
// Each variant targets a specific long-tail search query with
// unique title, meta description, content, and FAQ.
// ──────────────────────────────────────────────────────────

export interface SEOSection {
  heading: string
  body: string
}

export interface SEOVariant {
  /** URL segment, e.g. "javascript" */
  slug: string
  /** Parent tool slug, e.g. "code-formatter" */
  toolSlug: string
  /** Canonical tool name for display */
  toolName: string
  meta: { title: string; description: string }
  h1: string
  intro: string
  sections: SEOSection[]
  faq: Array<{ question: string; answer: string }>
  /** Slugs of related tools to link to */
  relatedToolSlugs?: string[]
}

export const SEO_VARIANTS: SEOVariant[] = [
  // ════════════════════════════════════════════════════════
  // CODE FORMATTER — language variants
  // ════════════════════════════════════════════════════════
  {
    slug: 'javascript',
    toolSlug: 'code-formatter',
    toolName: 'Code Formatter',
    meta: {
      title: 'JavaScript Code Formatter — Beautify & Lint JS Online',
      description:
        'Format and beautify messy JavaScript code instantly. Paste minified or unformatted JS and get clean, consistent output with custom indentation.',
    },
    h1: 'JavaScript Code Formatter — Beautify Your JS in One Click',
    intro:
      'Whether you are debugging a minified bundle, cleaning up copy-pasted code from Stack Overflow, or enforcing team style on a legacy project, a JavaScript code formatter turns unreadable JS into well-structured, maintainable source. No editor plugin required — paste, format, and copy in seconds.',
    sections: [
      {
        heading: 'Why JavaScript Code Needs Formatting',
        body: 'JavaScript is the most forgiving language when it comes to whitespace — but that flexibility is exactly why unformatted JS is so hard to read. A single missing semicolon or deeply nested callback chain can turn a 50-line function into an unreadable block. Formatting restores visual structure: consistent indentation reveals scope boundaries, line breaks separate logical statements, and bracket alignment makes control flow (if/else, for, switch) immediately scannable. Minified production code, which strips all whitespace for bandwidth savings, is especially painful to debug without reformatting. This tool reverses that: feed it a single line of minified JS and get back a properly indented, human-readable file.',
      },
      {
        heading: 'What the JavaScript Formatter Fixes',
        body: 'The formatter analyzes your JavaScript line by line, tracking bracket depth, string literals, comments, and template literals to produce correct indentation without breaking syntax. It handles: arrow function chains and promise `.then()` cascades, object and array literals nested more than three levels deep, JSX inside `.jsx` or `.tsx` files (treated as regular JS with bracket-aware indentation), mixed single/double quotes and template strings, and multi-line comments that cross indentation levels. The output uses 2-space or 4-space indentation based on your setting. If you need the reverse — minification for production — toggle the Minify button to strip comments and extraneous whitespace.',
      },
      {
        heading: 'Common JavaScript Formatting Pitfalls',
        body: 'One frequent mistake: pasting code that contains ES module imports with dynamic expressions. The formatter preserves strings and template literals verbatim, so dynamic `import()` calls are left intact. Another issue is misaligned object destructuring with default values — the output aligns braces correctly, but you should still verify that default values (e.g., `const { name = "Guest" } = user`) parse before formatting. Finally, if your code uses a non-standard transpiler extension (like decorators or pipeline operators), the formatter treats unknown syntax as regular text and may produce odd indentation. Stick to standard ECMAScript for best results.',
      },
    ],
    faq: [
      {
        question: 'Will this JavaScript formatter remove my comments?',
        answer:
          'No. The beautify mode preserves all comments — single-line (`//`) and block (`/* */`). Only the Minify mode strips them for production output.',
      },
      {
        question: 'Can I format TypeScript with this formatter?',
        answer:
          'Yes — select the TypeScript language option. The formatting logic handles TS-specific syntax like type annotations, interfaces, and generics correctly.',
      },
      {
        question: 'Does it work with minified JavaScript from a CDN?',
        answer:
          'Yes. Paste minified JS (a single long line) and the formatter will expand it into a properly indented, readable structure. This is the most common use case for debugging production issues.',
      },
    ],
    relatedToolSlugs: ['json-formatter', 'regex-tester'],
  },
  {
    slug: 'typescript',
    toolSlug: 'code-formatter',
    toolName: 'Code Formatter',
    meta: {
      title: 'TypeScript Code Formatter — Format & Beautify TS Online',
      description:
        'Clean up unformatted TypeScript code instantly. Supports interfaces, generics, type annotations, and decorators with custom indentation.',
    },
    h1: 'TypeScript Code Formatter — Keep Your TS Clean and Consistent',
    intro:
      'TypeScript adds type annotations, interfaces, generics, and decorators on top of JavaScript — which means more syntax to keep consistently formatted. Whether you are reviewing a PR with messy code generation output or reformatting a project that inherited mixed styles, a dedicated TypeScript formatter handles the type-specific syntax that generic beautifiers get wrong.',
    sections: [
      {
        heading: 'TypeScript-Specific Formatting Rules',
        body: 'TypeScript introduces several syntactic constructs that need special handling during formatting. Interface and type alias declarations can span many lines with optional and readonly modifiers — the formatter ensures each property sits on its own line with consistent indentation. Generic type parameters (`<T, U extends SomeType>`) are tracked as bracket pairs so they do not confuse the indentation logic. Decorators (`@Component`, `@Input`) are treated as annotations and left attached to the declaration they precede. The formatter also correctly handles type assertions (`value as Type`), mapped types (`{ [K in keyof T]: T[K] }`), and conditional types (`T extends U ? X : Y`).',
      },
      {
        heading: 'Formatting Code-Generated TypeScript',
        body: 'Many developers encounter unformatted TypeScript when using code generators — OpenAPI generators, GraphQL codegen, or scaffolding tools. These often produce valid but poorly formatted `.ts` files with inconsistent indentation, extra blank lines, or inline type definitions that are hard to read. Drop the generated output into this formatter, select TypeScript, and get back a clean file that matches your team\'s style before review. The same applies to copy-pasted snippets from documentation or AI assistants that often omit proper indentation.',
      },
      {
        heading: 'Why Manual Formatting Wastes Time',
        body: 'Manually aligning type annotations, re-indenting nested generics, and fixing brace positions in a 300-line TypeScript file is error-prone and slow. Developers who format by hand introduce inconsistencies — one interface indented at 2 spaces, the next at 4. Automated formatting removes the human factor: consistent rules applied to every line, every time. This is especially important in TypeScript monorepos where shared types across packages need to look identical when read side-by-side.',
      },
    ],
    faq: [
      {
        question: 'Does this formatter preserve my TypeScript decorators?',
        answer:
          'Yes. Decorators are left attached to their declaration and formatted with proper indentation. Both class decorators and property decorators are supported.',
      },
      {
        question: 'Can it format `.tsx` files with JSX?',
        answer:
          'Yes. The formatter treats JSX in TypeScript the same as in JavaScript, handling bracket depth across both JSX and TS syntax correctly.',
      },
      {
        question: 'What indentation options are available for TypeScript?',
        answer:
          'You can choose 2-space or 4-space indentation. The TypeScript community standard is 2 spaces, but the formatter supports both to match your project conventions.',
      },
    ],
    relatedToolSlugs: ['json-formatter', 'json-csv-converter'],
  },
  {
    slug: 'python',
    toolSlug: 'code-formatter',
    toolName: 'Code Formatter',
    meta: {
      title: 'Python Code Formatter — Beautify Python Online',
      description:
        'Format messy Python code instantly. Fix indentation, align blocks, and clean up whitespace. Works with Python 3 syntax, f-strings, and type hints.',
    },
    h1: 'Python Code Formatter — Clean Up Your Python Indentation',
    intro:
      'Python\'s significance of whitespace makes formatting more critical than in any other language. A single misplaced tab or space can break a program. Whether you copied code from a Jupyter notebook, a forum post, or an AI output, running it through a formatter ensures the indentation is correct and consistent before you even try to run it.',
    sections: [
      {
        heading: 'How Python Indentation Differs from Brace Languages',
        body: 'In languages like JavaScript or Java, braces define scope and formatting is cosmetic. In Python, indentation IS syntax. This means copy-pasting code from different sources often mixes tabs and spaces, creating `IndentationError` at runtime. The Python formatter detects the input\'s indentation style (tabs or spaces) and normalises it to consistent 2-space or 4-space indentation. It also handles edge cases like line continuation in long function signatures, nested list/dict comprehensions, and multi-line `with` statements. The formatter preserves blank lines between top-level functions and classes (PEP 8 style) while collapsing excessive vertical whitespace inside function bodies.',
      },
      {
        heading: 'Formatting Python with Type Hints',
        body: 'Modern Python heavily uses type hints (`def fetch(id: int) -> User | None:`), which can make function signatures span multiple lines. The formatter wraps long parameter lists with hanging indentation, aligning continuation lines with the opening parenthesis. Type unions using `|` (Python 3.10+), generic types (`list[str]`), and `Optional` / `Literal` types are all preserved verbatim. If you are using Pydantic models or dataclasses, their field declarations with default values are formatted to keep the `=` alignment readable.',
      },
      {
        heading: 'Common Python Formatting Errors and Fixes',
        body: 'The most common issue is mixing tabs and spaces. When the formatter detects a leading tab, it converts the entire file to space-based indentation. Another frequent problem is inconsistent blank lines around top-level definitions — PEP 8 requires two blank lines before class definitions and one before methods. The formatter enforces this automatically. Finally, trailing whitespace on lines (invisible in most editors) is stripped, preventing subtle issues with linters like flake8 or ruff.',
      },
    ],
    faq: [
      {
        question: 'Does this Python formatter replace Black or autopep8?',
        answer:
          'It serves a different purpose — quick online formatting without installing anything. For daily development, use Black, ruff, or autopep8 in your editor. This tool is ideal for one-off formatting of snippets, AI output, or code from the web.',
      },
      {
        question: 'Can it format Jupyter notebook code?',
        answer:
          'Yes. Paste the content of a notebook cell and it will be formatted identically to a standalone `.py` file. Note that cell magic commands (`%matplotlib`, `!pip install`) are left as-is.',
      },
      {
        question: 'Are f-strings preserved correctly?',
        answer:
          'Yes. f-string expressions and format specifiers are left intact. The formatter only modifies whitespace and indentation, never string content.',
      },
    ],
    relatedToolSlugs: ['json-formatter', 'base64-encoder'],
  },
  {
    slug: 'html',
    toolSlug: 'code-formatter',
    toolName: 'Code Formatter',
    meta: {
      title: 'HTML Code Formatter — Beautify HTML Online Free',
      description:
        'Format messy HTML instantly. Indent nested tags properly, fix spacing, and get clean, readable HTML output with one click.',
    },
    h1: 'HTML Code Formatter — Make Your Markup Readable Again',
    intro:
      'HTML from email templates, CMS exports, or legacy sites often arrives as a single unbroken line or a deeply nested mess. A good HTML formatter restores the tag hierarchy visually, making it easy to spot unclosed elements, nested structure errors, and accessibility issues at a glance.',
    sections: [
      {
        heading: 'What the HTML Formatter Handles',
        body: 'The formatter processes standard HTML5, XHTML, and template syntax. It properly indents nested tags — each child element gets one level of indentation deeper than its parent. Self-closing tags (`<br>`, `<img>`, `<input>`) are recognised and do not cause additional indentation. The formatter also preserves inline SVG markup, conditional comments (Internet Explorer), and embedded `<script>` and `<style>` blocks without reformatting their content — only the surrounding HTML structure is adjusted. DOCTYPE declarations and `<html>` attributes are left unchanged.',
      },
      {
        heading: 'Formatting HTML from Templates and CMS Platforms',
        body: 'HTML generated by WordPress, Django templates, or static site builders often includes template tags (`{{ variable }}`, `<?php ?>`, `{% block %}`) mixed with raw HTML. The formatter treats these as regular text and preserves them, while still formatting the surrounding HTML structure. This is useful when debugging rendered output: paste the live page source, format it, and immediately spot which template block is missing a closing tag or causing layout shift.',
      },
      {
        heading: 'Why Nested HTML Readability Matters',
        body: 'Poorly formatted HTML hides structural bugs. An unclosed `<div>` or misplaced `</section>` can break an entire page layout, and these are trivial to spot in properly indented markup. Accessibility auditors rely on clean HTML structure to verify heading hierarchy (`<h1>` through `<h6>`), landmark elements (`<nav>`, `<main>`, `<aside>`), and form label associations. Running your HTML through a formatter before an audit saves time and catches issues the validator might miss.',
      },
    ],
    faq: [
      {
        question: 'Does it format embedded CSS and JavaScript inside HTML?',
        answer:
          'No. CSS inside `<style>` tags and JavaScript inside `<script>` tags are preserved as-is. The formatter only adjusts the HTML structure. For CSS/JS formatting, paste those sections into the CSS or JavaScript mode separately.',
      },
      {
        question: 'Will it break my HTML email templates?',
        answer:
          'No. Inline styles, table-based layouts, and Outlook conditional comments are preserved. However, test the output — some email templates rely on precise whitespace around table cells that formatting might alter.',
      },
      {
        question: 'Can I format HTML that contains Vue or Angular bindings?',
        answer:
          'Yes. `v-if`, `*ngFor`, `{{ interpolation }}`, and `[property]` bindings are treated as regular attributes and left intact.',
      },
    ],
    relatedToolSlugs: ['html-playground', 'url-encoder'],
  },

  // ════════════════════════════════════════════════════════
  // JSON FORMATTER — use case variants
  // ════════════════════════════════════════════════════════
  {
    slug: 'validate',
    toolSlug: 'json-formatter',
    toolName: 'JSON Formatter',
    meta: {
      title: 'JSON Validator — Validate & Lint JSON Online',
      description:
        'Validate JSON data instantly and get precise error messages pointing to the exact line and character. Checks syntax, trailing commas, and encoding issues.',
    },
    h1: 'JSON Validator — Find JSON Errors in Seconds',
    intro:
      'A single misplaced comma or unescaped quote in a JSON payload can crash an API request or break a configuration file. A JSON validator catches these errors instantly, telling you exactly where the syntax broke and why. No more scanning a 2000-line file by eye.',
    sections: [
      {
        heading: 'What JSON Validation Checks For',
        body: 'The validator parses your JSON against the ECMA-404 standard and surfaces every syntax error with precise line and column numbers. It detects: trailing commas after the last array element or object property (forbidden in strict JSON but tolerated by some parsers), missing quotes around property names (`{name: "value"}` is invalid — must be `{"name": "value"}`), unescaped control characters inside strings (tabs, newlines, backspaces), mismatched brackets or braces, duplicate keys (which most parsers silently overwrite with the last value), and incorrect number formats like leading zeros (`01`) or hex literals (`0xFF`). Each error message includes a sample of the surrounding context so you can spot the issue without cross-referencing line numbers.',
      },
      {
        heading: 'Validating JSON from Different Sources',
        body: 'API responses, database exports, configuration files (ESLint, Prettier, tsconfig, VS Code settings), and AI-generated JSON all benefit from validation before use. API responses from third-party services occasionally include BOM markers or non-standard encodings — the validator flags these. Configuration files with comments (not valid JSON, but common in VS Code settings) will fail validation, which serves as a reminder that comments are only supported in JSONC or JSON5, not strict JSON. For AI-generated JSON, validation catches the common hallucination patterns: unclosed arrays, inconsistent comma placement, and incorrectly escaped characters in nested strings.',
      },
      {
        heading: 'Schema Validation vs. Syntax Validation',
        body: 'This tool performs syntax validation (is it valid JSON?) but does not perform schema validation (does it have the right structure?). Schema validation checks that required properties exist, values match expected types, and constraints like minimum/maximum are satisfied. For schema validation, you would combine a JSON Schema linter with this tool: validate syntax first, then check structure against your schema. Syntax validation is the prerequisite — a file that is not valid JSON cannot be validated against any schema, and schema validation errors on top of syntax errors are confusing and unhelpful.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between JSON validation and JSON formatting?',
        answer:
          'Validation checks that the JSON syntax is correct (no trailing commas, proper quotes, matching brackets). Formatting rearranges whitespace for readability. This tool does both — validate first, then format the validated output.',
      },
      {
        question: 'Does it catch duplicate keys?',
        answer:
          'Yes. Duplicate keys in a JSON object are flagged as errors. While some parsers silently use the last value, this is a common source of bugs in configuration files.',
      },
      {
        question: 'Can I validate a JSON array (not an object)?',
        answer:
          'Yes. Valid JSON can be an array at the top level (`[...]`), a string, a number, or even `null`. The validator handles all valid JSON types.',
      },
    ],
    relatedToolSlugs: ['json-csv-converter', 'yaml-json-converter'],
  },
  {
    slug: 'beautifier',
    toolSlug: 'json-formatter',
    toolName: 'JSON Formatter',
    meta: {
      title: 'JSON Beautifier — Pretty-Print JSON Online',
      description:
        'Beautify minified or ugly JSON with proper indentation and line breaks. Paste a single-line JSON blob and get back clean, readable output instantly.',
    },
    h1: 'JSON Beautifier — Turn a Wall of Text into Readable JSON',
    intro:
      'API responses, WebSocket messages, and database dumps often arrive as a single, unbroken line of JSON. Reading it to find a specific value is painful. A JSON beautifier (also called a pretty-printer) adds indentation and line breaks so the structure becomes visually clear at a glance.',
    sections: [
      {
        heading: 'What Pretty-Printing Does to Your JSON',
        body: 'Pretty-printing takes a compact JSON string and applies consistent indentation (2 or 4 spaces per level), line breaks between elements, and vertical alignment of array elements and object properties. A 20 KB API response that fits on one line expands to 200+ readable lines. This is purely cosmetic — the data is unchanged, and the beautified JSON is still valid JSON that any parser can read. The inverse operation (minification) strips whitespace for bandwidth efficiency, and this tool does both: beautify for debugging, minify for production.',
      },
      {
        heading: 'When to Use Beautified vs. Minified JSON',
        body: 'Use beautified JSON when: debugging an API during development, sharing data in a code review or documentation, storing configuration files that humans will edit, or logging structured data for analysis. Use minified JSON when: sending data over the wire (API payloads, WebSocket messages), storing large datasets where file size matters, or caching serialised state in memory or localStorage. This formatter lets you toggle between the two modes instantly, so you can start from a minified blob, beautify it to understand its structure, edit it, then re-minify for deployment.',
      },
      {
        heading: 'Common Issues with Pretty-Printed JSON',
        body: 'Beautified JSON is valid JSON, but some recipients have limits on line length or total size. A pretty-printed 2 MB file takes up more bandwidth and memory than its minified version (roughly 1.5–2× larger). If you are pasting beautified JSON into a code editor, ensure your editor\'s syntax highlighter does not truncate lines longer than its buffer size. Also note that some JSON parsers in embedded systems have limited nesting depth — a beautified file with deep nesting is the same data as the minified version and will fail at the same depth.',
      },
    ],
    faq: [
      {
        question: 'Does beautifying change my JSON data?',
        answer:
          'No. The data is identical — only whitespace is added. The beautified JSON parses to the exact same object as the minified original.',
      },
      {
        question: 'Can I go back from beautified to minified?',
        answer:
          'Yes. Toggle the Minify button to strip all non-essential whitespace and produce a compact JSON string. The round-trip is lossless.',
      },
      {
        question: 'What indentation should I use?',
        answer:
          '2 spaces is the most common convention for JSON. 4 spaces is used in some projects for consistency with code indentation. Both are supported — your choice is a matter of team style.',
      },
    ],
    relatedToolSlugs: ['json-csv-converter', 'yaml-json-converter'],
  },

  // ════════════════════════════════════════════════════════
  // PASSWORD GENERATOR — use case variants
  // ════════════════════════════════════════════════════════
  {
    slug: 'strong',
    toolSlug: 'password-generator',
    toolName: 'Password Generator',
    meta: {
      title: 'Strong Password Generator — Create Secure Passwords Online',
      description:
        'Generate cryptographically strong passwords with customizable length, symbols, numbers, and uppercase letters. No server upload — everything runs in your browser.',
    },
    h1: 'Strong Password Generator — Build Passwords That Resist Cracking',
    intro:
      'Weak passwords are the most common attack vector in data breaches. A strong password generator produces passwords with high entropy — meaning they are computationally infeasible to crack through brute force or dictionary attacks. This tool creates passwords locally in your browser using the Web Crypto API, so your generated passwords never leave your machine.',
    sections: [
      {
        heading: 'What Makes a Password "Strong"?',
        body: 'Password strength is measured in bits of entropy. A password\'s entropy depends on its length and the size of the character set it draws from. For example, a 12-character password using only lowercase letters has roughly 56 bits of entropy, while a 16-character password with uppercase, lowercase, digits, and symbols exceeds 100 bits — well beyond what current hardware can brute-force in a reasonable time. NIST and OWASP recommend a minimum of 12 characters for general use and 16+ for privileged accounts (admin panels, database access, cloud consoles). This generator defaults to 24 characters with all character sets enabled, giving you headroom above the recommended minimum.',
      },
      {
        heading: 'Common Password Generation Mistakes',
        body: 'Many online password generators run on the server side, meaning your generated password crosses the network and could be logged. This tool runs entirely client-side in your browser — no data is sent anywhere. Another mistake is using "memorable" patterns like `Passw0rd!` or `Admin2024!` which attackers include in their dictionaries. True random generation avoids any pattern that a human might find convenient. Finally, reusing strong passwords across multiple sites negates their strength — if one site is breached, all accounts using that password are compromised. Use a password manager (Bitwarden, 1Password, KeePass) to store unique, strong passwords per site.',
      },
      {
        heading: 'Character Sets and Their Trade-offs',
        body: 'Including symbols (`!@#$%^&*`) increases entropy but can cause issues with systems that restrict special characters. Some websites reject passwords with certain symbols or cap the maximum length. If you encounter this, reduce the symbol count or switch to a longer alphanumeric password instead. An 18-character alphanumeric password (uppercase + lowercase + digits) has comparable entropy to a 12-character password with symbols, while avoiding compatibility issues. The generator lets you toggle each character set independently, so you can adapt to any site\'s requirements while maximising entropy within those constraints.',
      },
    ],
    faq: [
      {
        question: 'Are these passwords truly random?',
        answer:
          'Yes. The generator uses `crypto.getRandomValues()`, which is cryptographically secure — suitable for passwords, tokens, and encryption keys.',
      },
      {
        question: 'How long should my password be?',
        answer:
          '12 characters minimum for general use, 16+ for admin accounts. This tool defaults to 24 characters, which provides strong protection against brute-force attacks for decades with current hardware.',
      },
      {
        question: 'Does the generator avoid ambiguous characters?',
        answer:
          'No, but you can customize the character set manually. Common ambiguous pairs are `1`/`l`/`I` and `0`/`O`. If the system you are generating for is hard to read, regenerate until you get a clear string or use only uppercase + digits.',
      },
    ],
    relatedToolSlugs: ['hash-generator', 'uuid-generator'],
  },
  {
    slug: 'secure',
    toolSlug: 'password-generator',
    toolName: 'Password Generator',
    meta: {
      title: 'Secure Password Generator — Crypto-Grade Passwords for Devs',
      description:
        'Generate FIPS-compliant random passwords with enhanced character variety. Perfect for API keys, database credentials, and admin accounts.',
    },
    h1: 'Secure Password Generator — For Developers Who Need Real Security',
    intro:
      'Developers generate passwords not just for personal accounts but for API keys, database credentials, service accounts, admin panels, and CI/CD secrets. A "secure" password for a development context needs higher entropy than what consumer-grade generators produce. This tool is designed with developer use cases in mind: longer default length, full symbol set, and local-only generation.',
    sections: [
      {
        heading: 'Developer-Specific Password Requirements',
        body: 'Service accounts and API keys face different threat models than user passwords. They are often stored in plaintext in environment variables, CI/CD secrets, or configuration files — which means a leak of the file exposes the credential directly. The defence is not just entropy but also uniqueness: every service account should get a unique, randomly generated credential. This generator produces passwords that are suitable for: database user passwords in production, API keys for third-party services, CI/CD environment secrets (GitHub Actions, GitLab CI), admin panel credentials for staging environments, and encryption-at-rest passphrases. For each use case, use the maximum length the target system allows.',
      },
      {
        heading: 'Password Managers and Developer Workflows',
        body: 'Developers should never memorise generated passwords. Use a password manager (Bitwarden CLI, 1Password CLI, or a `.env` file with restricted permissions). For shared team credentials, consider a vault solution like HashiCorp Vault or a cloud secrets manager (AWS Secrets Manager, Azure Key Vault) instead of sharing the password via chat or email. The generated password should exist in exactly two places: the password manager/vault and the system it grants access to.',
      },
      {
        heading: 'What About Passphrases for SSH and GPG Keys?',
        body: 'For SSH key passphrases and GPG key protection, a random string with high entropy is ideal — but the length should be at least 24–32 characters since passphrase cracking targets the key\'s encryption directly, not a rate-limited login form. The generator supports up to 128 characters, which covers even the most restrictive key derivation requirements. In practice, a 32-character password with all character sets enabled provides more entropy than any human-passphrase approach and takes less time to generate.',
      },
    ],
    faq: [
      {
        question: 'Can I use these passwords for SSH key passphrases?',
        answer:
          'Yes. The crypto-grade generator is well-suited for SSH and GPG key passphrases. Use at least 24 characters and all character sets for maximum protection.',
      },
      {
        question: 'Are the passwords stored anywhere?',
        answer:
          'No. All generation happens locally in your browser using the Web Crypto API. No data is sent to any server, logged, or stored. Copy the password and save it in your password manager immediately.',
      },
      {
        question: 'What is the maximum password length?',
        answer:
          'The generator supports up to 128 characters. Most systems accept at least 64 characters, but check the target system\'s limits before generating an extremely long password.',
      },
    ],
    relatedToolSlugs: ['hash-generator', 'uuid-generator'],
  },

  // ════════════════════════════════════════════════════════
  // REGEX TESTER — language variants
  // ════════════════════════════════════════════════════════
  {
    slug: 'javascript',
    toolSlug: 'regex-tester',
    toolName: 'Regex Tester',
    meta: {
      title: 'JavaScript Regex Tester — Test Regular Expressions Online',
      description:
        'Test JavaScript regular expressions in real time. See matches, groups, and replacements instantly. Cheat sheet included for JS-specific regex syntax.',
    },
    h1: 'JavaScript Regex Tester — Debug Your Patterns in Real Time',
    intro:
      'JavaScript regular expressions have their own flavour of regex syntax, including features like the `u` (unicode) and `y` (sticky) flags that differ from other languages. Testing a JS regex in a generic tester can give wrong results because of subtle differences in character class handling, backreference syntax, and flag behaviour. This tool matches JavaScript\'s regex semantics, making it the right environment for debugging patterns destined for `.match()`, `.replace()`, `.test()`, or `.split()` calls in your JS code.',
    sections: [
      {
        heading: 'JavaScript-Specific Regex Features',
        body: 'JavaScript regex supports named capture groups (`(?<name>...)`), lookahead assertions (`x(?=y)` for positive, `x(?!y)` for negative), and lookbehind assertions (`(?<=y)x` for positive, `(?<!y)x` for negative). These are all tested in real time as you type, with matched groups highlighted in the output. The `u` flag enables full Unicode matching (emoji, accented characters, CJK) while the `y` flag forces sticky matching from `lastIndex`. Unlike some regex engines (PCRE, Python), JavaScript does not support atomic groups (`(?>...)`), possessive quantifiers (`*+`), or recursion — the tool flags these if you try to use them so you can adjust your pattern.',
      },
      {
        heading: 'Common JavaScript Regex Pitfalls',
        body: 'One common mistake is forgetting to escape forward slashes when using the `/pattern/flags` literal syntax — every `/` inside the pattern must be escaped as `\/`. Another is assuming `\d` matches only ASCII digits in non-Unicode mode; with the `u` flag, `\d` still matches only `0-9` in JavaScript, unlike some other languages where it matches Unicode digits. The global `g` flag changes how `lastIndex` behaves — using `.test()` in a loop with `g` flag can produce alternating true/false results, a frequent source of bugs. The tester shows the `lastIndex` value so you can debug this behaviour visually.',
      },
      {
        heading: 'Using the Regex Tester for Replace Operations',
        body: 'JavaScript\'s `.replace()` method supports replacement patterns with special tokens like `$1` (first capture group), `$&` (the match), and `$\`` / `$\'` (before/after the match). The tester includes a replace mode where you can input a replacement string and see the result alongside the match details. This is useful for data transformation tasks: reformatting phone numbers, normalising date formats, or cleaning CSV exports.',
      },
    ],
    faq: [
      {
        question: 'Does the tester support the `s` (dotall) flag?',
        answer:
          'Yes. When the `s` flag is enabled, `.` matches newline characters. This is useful for matching across multiple lines, common in log parsing and multiline string extraction.',
      },
      {
        question: 'Can I test regex for `String.prototype.matchAll()`?',
        answer:
          'Yes. The tester shows all matches in a list when using the `g` flag, similar to what `matchAll()` returns with capture groups.',
      },
      {
        question: 'What is the difference between `g` and `y` flags?',
        answer:
          'The `g` flag finds all matches anywhere in the string. The `y` flag only matches starting at `lastIndex`, making it useful for tokenising or lexer-style parsing.',
      },
    ],
    relatedToolSlugs: ['code-formatter', 'json-formatter'],
  },
  {
    slug: 'python',
    toolSlug: 'regex-tester',
    toolName: 'Regex Tester',
    meta: {
      title: 'Python Regex Tester — Test re Module Patterns Online',
      description:
        'Test Python regular expressions with accurate `re` module semantics. See match groups, named groups, and substitution results. Includes Python-specific regex syntax reference.',
    },
    h1: 'Python Regex Tester — Test Your `re` Module Patterns Accurately',
    intro:
      'Python\'s `re` module has its own flavour of regular expressions that differs from JavaScript, PCRE, and other engines. Features like verbose mode (`re.VERBOSE` / `(?x)`), named groups with `(?P<name>...)` syntax, and `re.split()` with group retention are Python-specific. Testing Python-targeted regex patterns in a generic tester can produce false positives or miss valid matches. This tool validates your pattern against Python\'s regex semantics, so the results you see here match what `re.search()`, `re.match()`, `re.findall()`, and `re.sub()` will produce in your Python code.',
    sections: [
      {
        heading: 'Python Regex Syntax That Differs from Other Engines',
        body: 'Python uses `(?P<name>...)` for named capture groups and `(?P=name)` for backreferences, distinct from the `(?<name>...)` / `\k<name>` syntax in PCRE and JavaScript. The `re` module also supports `(?aiLmsux)` inline flags, where you can embed `(?i)` for case-insensitive matching or `(?m)` for multiline anywhere in the pattern. Python\'s `\A` and `\Z` anchors match start/end of string (unlike `^` and `$`, which match start/end of line in multiline mode). The tester handles these correctly, so you won\'t get misleading results from an engine that interprets the syntax differently.',
      },
      {
        heading: 'Common Python Regex Mistakes',
        body: 'A frequent bug is confusing `re.match()` with `re.search()`. `re.match()` only matches from the beginning of the string, while `re.search()` finds the pattern anywhere. The tester lets you toggle between match-semantics and search-semantics to see the difference. Another issue is raw string usage: forgetting to prefix your pattern with `r` (`r"\\d+"`) causes Python to interpret backslashes before they reach the regex engine, leading to "bad escape" errors. The tester assumes raw string semantics, matching what `r"..."` produces in Python. Finally, Python\'s `re.split()` with a capture group includes the captured text in the result — the tester\'s split mode replicates this behaviour.',
      },
      {
        heading: 'Using the Tester with re.sub() and Replacement Functions',
        body: 'The `re.sub()` function accepts both string replacements and callable functions. The `\\g<name>` syntax references named groups in replacements. The tester supports replacement mode where you can specify a replacement pattern and see the output of `re.sub()` in real time. This is particularly useful for data cleaning pipelines: normalising whitespace, reformatting dates, or extracting structured data from log files before loading into a DataFrame.',
      },
    ],
    faq: [
      {
        question: 'What Python version does the tester simulate?',
        answer:
          'The tester follows the semantics of Python 3.11+ `re` module. Key differences from Python 2 (removed in Python 3) like Unicode string handling are reflected correctly.',
      },
      {
        question: 'Does it support `re.VERBOSE` mode?',
        answer:
          'Yes. Toggle verbose mode to write patterns with whitespace and comments — useful for complex patterns that span multiple lines.',
      },
      {
        question: 'Can I test patterns that use the `regex` library instead of `re`?',
        answer:
          'The tester follows `re` module semantics. The third-party `regex` library adds features like overlapping matches and fuzzy matching that are not supported here.',
      },
    ],
    relatedToolSlugs: ['code-formatter', 'json-formatter'],
  },

  // ════════════════════════════════════════════════════════
  // UNIX TIMESTAMP CONVERTER — direction variants
  // ════════════════════════════════════════════════════════
  {
    slug: 'epoch-to-date',
    toolSlug: 'unix-timestamp-converter',
    toolName: 'Unix Timestamp Converter',
    meta: {
      title: 'Epoch to Date Converter — Unix Timestamp to Human Date',
      description:
        'Convert Unix epoch timestamps (seconds and milliseconds since 1970-01-01) to human-readable date and time in any timezone. Instant conversion with no upload.',
    },
    h1: 'Epoch to Date Converter — Turn 1712332800 into a Real Date',
    intro:
      'Unix timestamps — integers like `1712332800` — are the standard way computers store time, but they are meaningless at a glance. Whether you are debugging a log file, inspecting a database column, or analysing an API response from Stripe or GitHub, converting those numbers to a human-readable date is the first step in understanding what happened and when.',
    sections: [
      {
        heading: 'How Unix Time Works',
        body: 'The Unix epoch is 1970-01-01 00:00:00 UTC. A Unix timestamp counts the number of seconds (or milliseconds) that have elapsed since that moment. Timestamps in seconds are ten digits (e.g., `1712332800` for April 5, 2024), while millisecond timestamps are thirteen digits (e.g., `1712332800000`). The converter auto-detects which format you have entered — no need to specify. It then displays the corresponding date in UTC and your local timezone, including the day of the week, ISO 8601 format, and the relative time ("3 hours ago", "in 2 days").',
      },
      {
        heading: 'Common Sources of Unix Timestamps',
        body: 'You will encounter Unix timestamps in: database columns with `created_at` / `updated_at` fields stored as integers, server access logs and application logs, JWT token `iat` (issued at) and `exp` (expiration) claims, Stripe API events (`created` field), GitHub API responses (`pushed_at`, `updated_at` in ISO format or epoch), file system metadata (`mtime`, `ctime` on Linux/Mac), and blockchain block timestamps. The converter handles all of these, including edge cases like timestamps before the epoch (negative values) and the year 2038 problem boundary.',
      },
      {
        heading: 'Milliseconds vs. Seconds — Spotting the Difference',
        body: 'A common source of confusion is whether a timestamp is in seconds or milliseconds. A value like `1712332800000` (13 digits) is milliseconds, while `1712332800` (10 digits) is seconds. If you treat a millisecond timestamp as seconds, the date will show as roughly April 50155 — clearly wrong. The converter auto-detects: values above `9999999999` (roughly 2286-11-21) are treated as milliseconds, below as seconds. If your timestamp is in microseconds (16 digits) or nanoseconds (19 digits), convert to milliseconds by dividing by 1000 or 1000000 before entering.',
      },
    ],
    faq: [
      {
        question: 'Why do I see two different dates for the same timestamp?',
        answer:
          'You are likely mixing seconds and milliseconds. A 13-digit timestamp interpreted as seconds gives a far-future date. Check the digit count: 10 digits = seconds, 13 digits = milliseconds, 16+ = microseconds.',
      },
      {
        question: 'What is the year 2038 problem?',
        answer:
          'On 2038-01-19 03:14:07 UTC, 32-bit Unix timestamps overflow because the maximum signed 32-bit integer is exceeded. Most modern systems use 64-bit timestamps, which are safe for billions of years. The converter supports 64-bit timestamps.',
      },
      {
        question: 'Can it convert timestamps before 1970?',
        answer:
          'Yes. Negative timestamps (values less than 0) represent dates before the Unix epoch. For example, `-2208988800` is 1900-01-01. The converter handles negative timestamps correctly.',
      },
    ],
    relatedToolSlugs: ['jwt-decoder', 'hash-generator'],
  },
  {
    slug: 'date-to-epoch',
    toolSlug: 'unix-timestamp-converter',
    toolName: 'Unix Timestamp Converter',
    meta: {
      title: 'Date to Epoch Converter — Human Date to Unix Timestamp',
      description:
        'Convert any date and time to a Unix epoch timestamp in seconds or milliseconds. Works with any timezone and date format. Free online time converter.',
    },
    h1: 'Date to Epoch Converter — Generate Timestamps for API Calls',
    intro:
      'When building API requests, generating cron schedules, or setting JWT expiration times, you often need the current (or a specific) time as a Unix timestamp. Instead of doing the mental arithmetic — or searching "current unix timestamp" every time — use this converter: pick a date, time, and timezone, and get the exact epoch timestamp in seconds and milliseconds.',
    sections: [
      {
        heading: 'When You Need to Generate a Timestamp',
        body: 'Developers generate timestamps for: querying data between two dates in an API that accepts epoch filters, setting `exp` (expiration) and `nbf` (not before) claims in a JWT, creating a Unix timestamp for a cron job that runs only within a specific date range, generating a `created_at` field for a test record in a database that stores timestamps as integers, or calculating the number of seconds between two events for performance metrics. The converter outputs both seconds and milliseconds simultaneously so you can use whichever format your target API expects.',
      },
      {
        heading: 'Timezones and Timestamp Generation',
        body: 'A common mistake is assuming that converting "2025-01-15 09:00:00" from your local timezone gives the same timestamp as doing so from UTC. It does not — the timestamp is the same instant in time, but if you enter a local time without specifying the timezone, you may introduce an offset error. The converter defaults to UTC (the standard for most APIs and databases) but lets you override to any timezone. When generating timestamps for API calls, always use UTC unless the API explicitly documents otherwise. For user-facing features like "send a reminder at 9 AM in the user\'s timezone", convert the local time to UTC before storing the timestamp.',
      },
      {
        heading: 'Edge Cases in Date-to-Epoch Conversion',
        body: 'Several edge cases can produce unexpected results. Leap seconds are not represented in Unix time — the timestamp treats them as "normal" seconds. The converter uses the POSIX convention of ignoring leap seconds. The year 2038 boundary affects 32-bit systems but most modern APIs and databases use 64-bit integers. If you need a date beyond 2038, verify that your target system uses 64-bit timestamps. For dates before 1970, the converter produces negative timestamps — confirm that your database column supports signed integers before storing negative values.',
      },
    ],
    faq: [
      {
        question: 'Can I get both seconds and milliseconds?',
        answer:
          'Yes. The converter shows both formats side by side. Use seconds for most APIs and databases, milliseconds for JavaScript `Date.getTime()` and Redis TTL commands.',
      },
      {
        question: 'Does the converter handle daylight saving time?',
        answer:
          'Yes. When you specify a timezone that observes DST, the converter uses the correct offset for that date. This is why specifying the timezone explicitly is important.',
      },
      {
        question: 'What date formats are accepted?',
        answer:
          'The converter provides a date/time picker, so you select each field (year, month, day, hour, minute, second) rather than typing a format string. This avoids format ambiguity (e.g., is 03/04/2025 March 4 or April 3?).',
      },
    ],
    relatedToolSlugs: ['jwt-decoder', 'hash-generator'],
  },
]
