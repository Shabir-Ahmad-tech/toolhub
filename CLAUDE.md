# ToolHub (KRUMB.DEV) — Developer Tools Only (v3)

This supersedes all prior specs (v1 regional, v2 global dev+freelancer). **New scope: developer tools exclusively.** No freelancer/business tools, no health/finance calculators, no country-specific anything.

## Why this scope (context for the agent, not just the owner)

Owner builds software/automation professionally and IS the target user for these tools. This closes the content gap that killed prior scope — writing about dev-tool pain points is native knowledge, not researched-from-scratch copy.

## Non-negotiable rules

1. Do not add any non-developer tool (finance, health, freelancer, education) to nav, sitemap, or `constants.ts` `TOOLS`.
2. Do not add AdSense, ad slots, or pricing/paywall UI until Phase 2/3 gates are met (see below).
3. Do not delete existing non-dev route folders — unlist only (remove from `constants.ts`, nav, sitemap). If they were already deleted in a prior batch, note it and rebuild only the ones marked "reactivate or rebuild" below.
4. One content template, applied consistently — see `CONTENT_TEMPLATE.md`.
5. No fabricated usage stats ("Popular," "X users today") until real analytics exist.

## Current State (as of July 2026)

### All Tool Pages Have Metadata
Every page.tsx has been refactored into a server/client split pattern:
- **Server page.tsx**: exports `metadata: Metadata` + re-exports default from `_client.tsx`
- **Client _client.tsx**: contains all 'use client' logic, exported as default
- Applies to: binary-converter, code-formatter, code-playground, cron-expression-builder, curl-to-code, gitignore-generator, hex-to-rgb, password-generator, qr-code-generator, url-encoder, url-encoder, report-bug, tools

### SEO Variant System (12 pages across 5 tools)
Data-driven variant pages at `[slug]/[variant]`:
- Source: `src/lib/seo-variants.ts` (SEO_VARIANTS array)
- Route: `src/app/[slug]/[variant]/page.tsx` using `generateStaticParams()`
- Each variant has: meta (title/description), h1, intro, sections (heading + body), FAQ (with JSON-LD), relatedToolSlugs
- Variants cataloged: code-formatter (4 language variants), json-formatter (2), password-generator (2), regex-tester (2), unix-timestamp-converter (2)

### Internal Linking Strategy
- Every variant page links to `/free-developer-tools` ("collection of 46 free developer tools")
- Footer has "Free Dev Tools Guide" link to `/free-developer-tools`
- /free-developer-tools page links to all 21 tools by category
- `<RelatedTools>` component on all tool pages links to related tools

### GitHub Presence
- Footer includes `[> Star on GitHub ★]` link to `https://github.com/Shabir-Ahmad-tech/toolhub`
- Repo name in README Vercel badge: `Shabir-Ahmad-tech/toolhub`
- SITE_CONFIG.socialLinks.github: `https://github.com/krumbdev`

### Built Tools Status
46 tools in BUILT_TOOLS array. All tools have working client-side logic, FAQ entries, seoContent JSX, and ToolLayout integration.

### Meta Description < 160 chars — Verified
All page meta descriptions audited and fixed for the 160-character limit.

## Phase 2 — AdSense gate (locked)
≥10,000 organic sessions/month sustained 2+ months AND live/indexed ≥60 days. Developer-tool traffic often carries higher CPC than generic calculators — do not underprice ad density once live, but still don't touch this section early.

## Phase 3 — Premium gate (locked)
Only after repeat-usage data exists. Real hooks for a dev audience: API access (usage-metered) for JSON/Base64/UUID/Hash/Regex tools, bulk/batch processing, embeddable widgets, ad-free. No "save history" as a standalone hook — too weak.

## Content cadence
1 tool/article per week minimum, sustained. Writing is delegated (see `CONTENT_TEMPLATE.md` — hand this to a paid writer, do not write it yourself).

## Definition of done per tool
Working + unique content + schema + internal links + mobile-verified + zero premature monetization + no regional references.

## Future Roadmap & Strategies

### Immediate (Next 1-2 Weeks)

1. **Vercel Deploy** — Push to Vercel. Build passes clean with 62 static pages. Domain: `https://krumb.dev`.

2. **Google Search Console Setup**
   - Add domain at https://search.google.com/search-console
   - Verify via DNS TXT record
   - Submit `https://krumb.dev/sitemap.xml`
   - Monitor for indexing errors, crawl stats
   - After 2-4 weeks: check which pages are indexed

3. **Product Hunt Launch (see PRODUCT_HUNT_DESCRIPTION.md)**

4. **Dev.to / Hashnode Article** — "I Built 46 Free Dev Tools That Run 100% Locally"

### High-Impact New Tools to Build (Ranked by SEO Potential)

These are developer tools with high estimated monthly search volume and relatively low competition. Build in priority order.

| # | Tool | Est. Monthly Searches | Competition | Dev Effort | Why |
|---|------|----------------------|-------------|------------|-----|
| 1 | **HTTP Status Codes Reference** | 200K+ | Low-Medium | 1 day | One of the most-searched dev queries. Simple reference page with descriptions, no complex logic needed. Easy win. |
| 2 | **SQL Formatter / Beautifier** | 150K+ | Medium | 2-3 days | Huge demand. Parse and format SQL queries with customizable indentation. Multiple SQL dialects (MySQL, Postgres, SQLite). |
| 3 | **JavaScript Minifier** | 110K+ | Medium | 2 days | "js minifier" + "javascript minifier" + "compress js" combined have massive volume. Minify with esbuild or terser. |
| 4 | **CSS Gradient Generator** | 90K+ | Low | 1-2 days | "css gradient generator" is always searched. Visual tool with CSS code output. Linear, radial, conic gradients. |
| 5 | **HTML to Markdown Converter** | 70K+ | Low | 1-2 days | Developers migrating content between platforms. Convert HTML to clean Markdown and vice versa. |
| 6 | **Lorem Ipsum Generator** | 170K+ | High | 0.5 day | Very high volume but more competitive. Still worth it — simple to build and can capture long-tail ("lorem ipsum generator dev", "generate dummy text") |
| 7 | **HTML Minifier** | 60K+ | Medium | 1-2 days | "html minifier" + "compress html" for page speed optimization. Works well with JS/CSS minifier suite. |
| 8 | **Case Converter (camelCase/snake_case/kebab-case)** | 50K+ | Low | 1 day | Unique angle: focused on programming identifier case conversions (not generic text case). "camel case converter" + "snake case converter" capture dev searches. |
| 9 | **HTML to JSX Converter** | 40K+ | Low | 1-2 days | Complements existing svg-to-jsx. Convert any HTML markup into React-compatible JSX syntax (className, camelCase attributes, self-closing tags). |
| 10 | **CSS Box Shadow Generator** | 50K+ | Low | 0.5 day | Visual shadow builder with live preview and CSS output. Quick win — similar to gradient generator. |
| 11 | **IP Address Lookup / What is My IP** | 200K+ | High | 1 day | "what is my ip" and "ip lookup" have enormous volume but are competitive. Still valuable as a complementary tool with unique dev angle (IP info + geolocation + DNS). |
| 12 | **Mermaid.js Diagram Editor** | 60K+ | Low | 3-5 days | Growing search trend. Live editor for Mermaid.js diagrams (flowcharts, sequence diagrams, Gantt charts). Higher dev effort but strong SEO + differentiation. |
| 13 | **Color Palette Generator** | 80K+ | Medium | 2-3 days | "color palette generator" + "color scheme generator". Generate palettes from colors, images, or rules (analogous, complementary, triadic). |
| 14 | **Cron Schedule Translator** | 30K+ | Low | 1 day | Different from existing cron builder. SEO-targets "cron schedule translator" + "cron expression meaning" — people pasting cron strings to decode. |
| 15 | **Regex Generator (from text)** | 30K+ | Low | 2-3 days | Inverse of regex tester: input example text + desired matches → generate regex pattern. Complements existing regex tester. High differentiation. |

**Implementation notes:**
- All tools must follow the same pattern: ToolLayout wrapper, FAQ (5+ questions), seoContent JSX, JSON-LD, internal links
- Add SEO variants for high-value tools (e.g., SQL Formatter: MySQL/PostgreSQL/SQLite variants)
- Every new tool gets a content page at `/free-developer-tools` update
- Add to sitemap.ts automatically
- Build in priority order — start with HTTP Status Codes (#1, simple reference) then SQL Formatter (#2, big SEO win)

### Short-term (Weeks 3-6)

4. **Backlink Acquisition**

4. **Backlink Acquisition**
   - **Product Hunt Launch**: Create launch page for KRUMB.DEV. Target catgeory: Developer Tools, Tech, SaaS
   - **Dev.to / Hashnode / Medium**: Publish "I Built 46 Free Dev Tools That Run 100% in Your Browser" — organic reach + dofollow backlink
   - **GitHub Awesome Lists**: Submit to awesome-developer-tools, awesome-web-dev, awesome-selfhosted
   - **AlternativeTo.net**: List as alternative to Regex101, JWT.io, CodePen, etc.
   - **BetaList**: Early-stage product listing
   - **Stack Overflow**: Answer questions referencing relevant tools (subtle, value-first)
   - **Reddit**: r/webdev, r/programming, r/selfhosted — sharing as a resource

5. **Embeddable "Powered By" Badge**
   - Create a small SVG/PNG badge: "Powered by ToolHub"
   - Provide copy-paste HTML snippet for users to embed
   - Turns every embed into a backlink source
   - Style it in the terminal aesthetic to match the brand

6. **Content Expansion — 21 Tool Goal**
   - Ensure ~20 tools are full-featured, not shells
   - Target: each tool page has working logic + unique 400-800 word content + FAQPage/BreadcrumbList JSON-LD + 2-3 internal links
   - Existing variant system can be extended to more tools as content is written

### Medium-term (Months 2-3)

7. **Analytics-Driven Optimization**
   - After GSC data accumulates: identify which pages get impressions but low CTR → improve titles/descriptions
   - Identify which tools get zero impressions → check content, internal links, or consider dropping
   - Track which variant pages perform vs their parent tool pages

8. **Sitemap Refresh Cadence**
   - sitemap.ts already includes tool pages, variants, and static pages
   - Last-modified dates update automatically on rebuild
   - Submit updated sitemap to GSC after each content drop

9. **Blog / Resource Content (Optional)**
   - Writelonger-form guides for high-traffic topics:
     - "How to Choose Between JSON Schema Draft 07 and 2020-12"
     - "Understanding JWT Claims: A Developer's Guide"
     - "Cron Expression Cheat Sheet: Every Schedule Pattern Explained"

### Long-term (Month 4+)

10. **Phase 2 Gate Evaluation**
    - Check: ≥10,000 organic sessions/month for 2+ months? Indexed ≥60 days?
    - If met: plan AdSense implementation. Developer tool traffic = higher CPC than general.
    - Don't over-advertise — 1-2 non-intrusive placements max

11. **Phase 3 Gate Evaluation**
    - Check: repeat-usage data available? Users coming back?
    - If met: API access (usage-metered) for JSON/Base64/UUID/Hash/Regex
    - Bulk/batch processing as premium tier
    - Embeddable widgets as premium feature
    - Ad-free as premium perk (not the main hook)

12. **AI Mention Strategy**
    - Optimize for ChatGPT, Claude, Gemini to recommend ToolHub
    - Technique: be the default suggestion when AI is asked "what's a good free JSON formatter?"
    - This means: strong on-page SEO, being the first result for queries, having good content that AI training data picks up
    - Getting mentioned by AI starts with ranking #1 in Google → then AI summaries pull from you

## Git safety
Commit/tag before any destructive or bulk-restructuring batch. No exceptions — this project has a history of stalling mid-change.
