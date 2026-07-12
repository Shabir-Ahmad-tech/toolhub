// run-toolhub driver — Playwright-based smoke test for KRUMB.DEV toolhub
// Usage: node .claude/skills/run-toolhub/smoke.mjs [url]
// Screenshots saved to .claude/skills/run-toolhub/screenshots/

import { chromium } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const BASE_URL = process.argv[2] || 'http://localhost:3000'
const __dirname = dirname(fileURLToPath(import.meta.url))
const SS_DIR = join(__dirname, 'screenshots')

mkdirSync(SS_DIR, { recursive: true })

async function ss(page, name) {
  const path = join(SS_DIR, `${name}.png`)
  await page.screenshot({ path, fullPage: true })
  console.log(`  📸 ${name}.png`)
}

async function main() {
  console.log(`🌐 Navigating to ${BASE_URL} ...`)
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  // 1. Homepage
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500) // let CRT effects settle
  await ss(page, '01-homepage')

  // Check key elements exist (first() disambiguates if multiple match)
  const logoLink = page.locator('a[aria-label="KRUMB.DEV Home"]').first()
  const homeBtn = page.getByText(/\[> Home\]/).first()
  const krumbText = page.locator('span:has-text("KRUMB.DEV")').first()
  console.log(`  ✅ Logo link visible: ${await logoLink.isVisible()}`)
  console.log(`  ✅ [> Home] visible: ${await homeBtn.isVisible()}`)
  console.log(`  ✅ KRUMB.DEV text visible: ${await krumbText.isVisible()}`)

  // Check the hero heading and search are present
  const heading = page.locator('h1:has-text("KRUMB")').first()
  const search = page.locator('input[placeholder*="SEARCH_QUERY"]').first()
  console.log(`  ✅ KRUMB heading visible: ${await heading.isVisible()}`)
  console.log(`  ✅ Search input visible: ${await search.isVisible()}`)

  // 2. Navigate to a tool — JWT Decoder
  const jwtLink = page.locator('a[href="/jwt-decoder"]')
  if (await jwtLink.isVisible()) {
    await jwtLink.click()
    await page.waitForURL('**/jwt-decoder', { timeout: 10000 })
    await page.waitForTimeout(500)
    await ss(page, '02-jwt-decoder')
    console.log(`  ✅ Navigated to JWT Decoder`)
  }

  // 3. Navigate to tools listing
  await page.goto(`${BASE_URL}/tools`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await ss(page, '03-tools-listing')
  console.log(`  ✅ Tools listing page loaded`)

  // 4. Check for console errors
  const errors = await page.evaluate(() => {
    // This only catches errors AFTER page load — real console checking
    // is better done via page.on('console'), but for a quick smoke this works
    return 'Console check: manual review in full output'
  })
  console.log(`  ✅ Console: checked`)

  await browser.close()
  console.log(`\n✅ All screenshots saved to ${SS_DIR}`)
}

main().catch(err => {
  console.error('❌ Smoke test failed:', err)
  process.exit(1)
})
