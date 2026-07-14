# Google Search Console Setup — KRUMB.DEV

## Why This Matters

Without Google Search Console, Google doesn't know your site exists. Submitting the sitemap tells Google which pages to crawl and index. This is step zero for all organic traffic.

## Step 1: Add Property

1. Go to https://search.google.com/search-console
2. Sign in with a Google account (any Gmail works)
3. Click **"Add property"** → Choose **"Domain"** (not URL prefix)
4. Enter: `krumb.dev`

## Step 2: Domain Verification (DNS TXT Record)

The domain provider is whoever manages krumb.dev's DNS (Cloudflare, Namecheap, Vercel DNS, etc.).

1. Go to your DNS provider's dashboard
2. Add a **TXT record**:
   - Type: `TXT`
   - Name: `@` (or leave blank — depends on provider)
   - Value: (unique string Google provides in step 1 — something like `google-site-verification=...`)
   - TTL: `3600` (or default)

3. Click Verify in Google Search Console
4. Verification is instant once the record propagates (usually 1-5 min)

> **Tip:** Don't delete this TXT record later — re-verification is required if it drops.

## Step 3: Submit Sitemap

1. In GSC, go to **Sitemaps** (left sidebar)
2. Enter: `https://krumb.dev/sitemap.xml`
3. Click Submit
4. You'll see status: "Success" after a few minutes

## Step 4: Request Indexing

1. Go to **URL Inspection** (top search bar in GSC)
2. Enter: `https://krumb.dev`
3. Click **"Request Indexing"**
4. Do the same for key pages:
   - `https://krumb.dev/free-developer-tools`
   - `https://krumb.dev/tools`
   - `https://krumb.dev/json-formatter`
   - `https://krumb.dev/jwt-decoder`
   - `https://krumb.dev/regex-tester`

## Step 5: Check Coverage (After 1-2 Weeks)

Go to **Index → Coverage** to see:
- How many pages are indexed (target: all 61)
- Any errors (404s, server errors)
- Pages excluded (intentional: /privacy, /terms are low-priority)

## Why Not URL Prefix Verification

URL prefix (`https://krumb.dev/`) requires the verification file to be served at a specific path. Domain verification is simpler and covers all subdomains (important if you add `www` or `api` later).

## What to Monitor Monthly

| Metric | Where in GSC | Target |
|--------|-------------|--------|
| Indexed pages | Index → Coverage | 50+ |
| Total clicks | Performance | Growing |
| Average position | Performance | Under 20 for key pages |
| Crawl errors | Index → Coverage | 0 |
| Mobile usability | Mobile Usability | 0 errors |
