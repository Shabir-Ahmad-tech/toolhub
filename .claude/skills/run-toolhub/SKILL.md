---
name: run-toolhub
description: Start, build, test, and screenshot the KRUMB.DEV toolhub web app (Next.js 16). Use when asked to run the dev server, take screenshots, smoke-test the UI, or verify the build.
---

Build and drive the [KRUMB.DEV](https://krumb.dev) free online developer tools — a Next.js 16 web app with App Router, Tailwind CSS v4, and a Kinetic Terminal aesthetic. Launch the dev server on port 3000, then drive it via the Playwright smoke script at `.claude/skills/run-toolhub/smoke.mjs`.

All paths below are relative to the repo root (`toolhub/`).

## Prerequisites

```bash
node --version   # v22.22.3 — Node 20+ required
npm --version    # 10.9.8
```

## Setup

```bash
npm install
```

For running the Playwright smoke test, install a Chromium browser binary:

```bash
npx playwright install chromium
```

## Build

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no build errors (unless dependencies have changed).

## Run (agent path)

Start the dev server in the background, then run the Playwright smoke script:

```bash
npm run dev &
DEV_PID=$!
# Wait for port 3000 to be ready
timeout 30 bash -c 'until curl -sf http://localhost:3000 >/dev/null 2>&1; do sleep 0.5; done'
```

Then run the smoke test:

```bash
node .claude/skills/run-toolhub/smoke.mjs http://localhost:3000
```

The script:
1. Navigates the homepage, screenshots it
2. Checks that the logo, `[> Home]` link, and KRUMB.DEV text are visible
3. Navigates to a visible tool if one exists
4. Navigates to the `/tools` listing page, screenshots it

Screenshots land in `.claude/skills/run-toolhub/screenshots/` as PNGs named `01-homepage.png`, `02-tool-name.png`, `03-tools-listing.png`.

Clean up the dev server when done:

```bash
kill $DEV_PID 2>/dev/null
```

### Smoke script reference

| argument | default | description |
|---|---|---|
| `[url]` | `http://localhost:3000` | Base URL of the running dev server |

## Run (human path)

```bash
npm run dev   # → http://localhost:3000. Ctrl+C to stop.
```

If port 3000 is in use, Next.js prompts to use a different port — accept or pass `-p <port>` to `next dev`.

## Test

```bash
npm run lint
```

No test runner is currently configured (unit/integration test suite not yet added). The smoke test at `.claude/skills/run-toolhub/smoke.mjs` serves as the e2e regression check.

---

## Gotchas

- **Strict CSS in Tailwind v4** — Uses `@import "tailwindcss"` with `@theme` directive, NOT the old `@tailwind` directives. If a component looks unstyled, check that it's using Tailwind v4 utilities correctly (e.g., `text-[#F9F9F9]` not `text-white`).
- **No custom `tailwind.config.js`** — Tailwind v4 uses CSS-based config in `globals.css`. Don't look for a JS config file; it doesn't exist.
- **CRT effects layer** — The layout renders `<CrtNoise />`, `.crt-grid`, and `.crt-scanlines` overlays that cover the full viewport. These don't block clicks but can interfere with screenshot readability at small viewports.
- **Font loading delay** — `Space_Grotesk` and `JetBrains_Mono` are loaded via next/font with `display: "swap"`. First paint shows fallback fonts; the swap happens after load.
- **`.env.local` placeholders** — Supabase and Stripe keys are placeholders. The app renders without them (no server calls needed for most tools), but features like auth or payments will fail without real credentials.

## Troubleshooting

- **`ERR_OSSL_EVP_UNSUPPORTED` during build**: OpenSSL provider mismatch with Node 22. Not normally an issue with Next.js 16, but if it appears, set `NODE_OPTIONS=--openssl-legacy-provider` in the environment.
- **Playwright: `browserType.launch: Executable doesn't exist`**: Chromium browser binary not installed. Run `npx playwright install chromium`.
- **Dev server on port 3001 instead of 3000**: The previous session on this machine may have prompted to use 3001 when 3000 was busy. Pass the correct URL to the smoke script: `node .claude/skills/run-toolhub/smoke.mjs http://localhost:3001`.
- **Turbopack build vs dev differences**: Dev mode uses Turbopack for fast HMR; production build uses the Webpack-based Rust compiler. A build-passing component may still have dev-mode hydration errors (check browser console). The smoke test runs against the dev server.
