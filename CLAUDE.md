# ToolHub — Developer Tools Only (v3)

This supersedes all prior specs (v1 regional, v2 global dev+freelancer). **New scope: developer tools exclusively.** No freelancer/business tools, no health/finance calculators, no country-specific anything.

## Why this scope (context for the agent, not just the owner)

Owner builds software/automation professionally and IS the target user for these tools. This closes the content gap that killed prior scope — writing about dev-tool pain points is native knowledge, not researched-from-scratch copy.

## Non-negotiable rules

1. Do not add any non-developer tool (finance, health, freelancer, education) to nav, sitemap, or `constants.ts` `TOOLS`.
2. Do not add AdSense, ad slots, or pricing/paywall UI until Phase 2/3 gates are met (see below).
3. Do not delete existing non-dev route folders — unlist only (remove from `constants.ts`, nav, sitemap). If they were already deleted in a prior batch, note it and rebuild only the ones marked "reactivate or rebuild" below.
4. One content template, applied consistently — see `CONTENT_TEMPLATE.md`.
5. No fabricated usage stats ("Popular," "X users today") until real analytics exist.

## Phase 1 — Launch tool list (target ~20, build/verify each)

**Already speced in prior batch (build if not done, enhance if partial):**
1. JSON Formatter/Validator — add JSON Schema validation tab
2. JWT Decoder — expiry countdown + claims breakdown
3. Regex Tester — syntax tree explainer + cheat sheet
4. Cron Expression Builder — visual builder + human-readable translation
5. Base64 Encoder/Decoder — file-to-base64 with preview
6. UUID Generator — v1/v3/v4/v5, bulk
7. Hash Generator — MD5/SHA family/HMAC, batch
8. Diff Checker — file upload, ignore-whitespace mode
9. Code Formatter — multi-language (JS/TS/Python/JSON)
10. cURL → Code Converter — Fetch/Axios/Python/Go output
11. .gitignore Generator — combinable templates
12. Webhook Tester/Inspector — mock payloads (Stripe/GitHub/Shopify)
13. API Response Validator — status + headers table
14. YAML ↔ JSON Converter — live error alerts

**Reactivate (unlisted, not deleted) or rebuild (if already deleted) — verify status first:**
15. URL Encoder/Decoder
16. Binary Converter (with ASCII/bitwise ops)
17. Hex to RGB Converter
18. Password Generator (strong-password focus, dev/security angle)
19. Markdown Editor (live preview, export)
20. HTML Playground (JS/CSS sandbox, embeddable)

**New addition — high-value, was missing from prior scope:**
21. Unix Timestamp / Epoch Converter — extremely common dev search term, add this

## Per-tool requirements (all ~20, no exceptions)

- Working tool, client-side, local-first
- Content per `CONTENT_TEMPLATE.md` (400-800 words)
- Unique title/meta targeting the specific long-tail query
- FAQPage + BreadcrumbList JSON-LD schema
- 2-3 internal links to related dev tools only
- Mobile-first, 44px touch targets
- Zero ads, zero paywall UI

## Phase 2 — AdSense gate (locked)
≥10,000 organic sessions/month sustained 2+ months AND live/indexed ≥60 days. Developer-tool traffic often carries higher CPC than generic calculators — do not underprice ad density once live, but still don't touch this section early.

## Phase 3 — Premium gate (locked)
Only after repeat-usage data exists. Real hooks for a dev audience: API access (usage-metered) for JSON/Base64/UUID/Hash/Regex tools, bulk/batch processing, embeddable widgets, ad-free. No "save history" as a standalone hook — too weak.

## Content cadence
1 tool/article per week minimum, sustained. Writing is delegated (see `CONTENT_TEMPLATE.md` — hand this to a paid writer, do not write it yourself).

## Definition of done per tool
Working + unique content + schema + internal links + mobile-verified + zero premature monetization + no regional references.

## Git safety
Commit/tag before any destructive or bulk-restructuring batch. No exceptions — this project has a history of stalling mid-change.
