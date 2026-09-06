import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = "http://127.0.0.1:4321"
const base = `${origin}/ai-recipe-poc/`
const evidence = new URL("../evidence/", import.meta.url)
await mkdir(evidence, { recursive: true })
const server = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321"], { stdio: "inherit" })
const report = { checks: [], errors: [], images: [], count: 0 }
let browser
let page
const pass = (name) => { report.checks.push(name); console.log(`PASS: ${name}`) }
try {
  let online = false
  for (let attempt = 0; attempt < 90; attempt++) {
    try { if ((await fetch(base)).ok) { online = true; break } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  assert(online, "Astro preview must start")
  const catalogue = await (await fetch(`${base}api/recipes.json`)).json()
  report.count = catalogue.count
  assert(catalogue.count > 24, "Bulk-content fixture must include multiple pages")
  browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, locale: "ja-JP" })
  page = await context.newPage()
  page.on("pageerror", (error) => report.errors.push(error.message))
  const ready = async () => {
    await page.waitForSelector('.recipe-explorer[data-ready="true"]')
    await page.waitForTimeout(150)
  }
  const openHome = async (suffix = "") => { await page.goto(base + suffix, { waitUntil: "networkidle" }); await ready() }
  const count = async () => Number(await page.locator(".result-count strong").textContent())
  await openHome()
  assert.equal(await count(), catalogue.count)
  assert.equal(await page.locator(".recipe-card").count(), 24)
  assert.equal(await page.locator(".browse-main h1:not(.sr-only)").count(), 0)
  pass("Full catalogue counted; 24 rendered cards; no marketing hero")
  await page.locator(".recipe-photo img").first().waitFor()
  await page.waitForTimeout(1500)
  report.images = await page.locator(".recipe-photo img").evaluateAll((images) => images.slice(0, 6).map((image) => ({ src: image.src, loaded: image.complete && image.naturalWidth > 0 })))
  await page.screenshot({ path: new URL("desktop.png", evidence).pathname, fullPage: true })
  assert(report.images.every((image) => image.loaded), "Visible reference photographs must load")
  pass("Visible reference photographs load with explicit image labels")

  const first = catalogue.recipes[0]
  await page.locator("#recipe-search").fill(first.title)
  await page.waitForTimeout(200)
  assert(await count() >= 1)
  assert((await page.locator(".recipe-card-title").allTextContents()).some((text) => text.includes(first.title)))
  assert(new URL(page.url()).searchParams.get("q") === first.title)
  await page.reload({ waitUntil: "networkidle" }); await ready()
  assert.equal(await page.locator("#recipe-search").inputValue(), first.title)
  pass("Recipe search and URL restoration")
  await page.getByRole("button", { name: "条件をリセット" }).click()
  await page.getByRole("group", { name: "カテゴリで絞り込み" }).getByRole("button", { name: first.category, exact: true }).click()
  assert.equal(await count(), catalogue.recipes.filter((recipe) => recipe.category === first.category).length)
  pass("Content-derived category filters")
  await page.getByRole("button", { name: "条件をリセット" }).click()
  await page.locator("#recipe-time").selectOption("15")
  assert.equal(await count(), catalogue.recipes.filter((recipe) => recipe.prep_minutes + recipe.cook_minutes <= 15).length)
  assert((await page.locator(".recipe-card").evaluateAll((cards) => cards.map((card) => Number(card.dataset.minutes)))).every((time) => time <= 15))
  await page.getByRole("combobox", { name: "並び順" }).selectOption("quick")
  const times = await page.locator(".recipe-card").evaluateAll((cards) => cards.map((card) => Number(card.dataset.minutes)))
  assert.deepEqual(times, [...times].sort((a, b) => a - b))
  pass("Total-time filter and ascending duration sort")
  await page.locator("#recipe-search").fill("zz_no_such_recipe_19287")
  assert.equal(await count(), 0)
  assert(await page.getByText("レシピが見つかりません", { exact: true }).isVisible())
  pass("Empty results and reset path")
  await openHome()
  const firstPage = await page.locator(".recipe-card-title").allTextContents()
  await page.getByRole("button", { name: "次のページ", exact: true }).click()
  assert.equal(new URL(page.url()).searchParams.get("page"), "2")
  const secondPage = await page.locator(".recipe-card-title").allTextContents()
  assert(secondPage.every((title) => !firstPage.includes(title)))
  pass("Pagination shows a distinct second page")
  await openHome()
  const savedTitle = await page.locator(".recipe-card-title h3").first().textContent()
  const savedUrl = await page.locator(".recipe-card-title").first().getAttribute("href")
  await page.locator(".save-button").first().click()
  await openHome("?saved=1")
  assert.equal(await count(), 1)
  assert.equal(await page.locator(".recipe-card-title h3").textContent(), savedTitle)
  pass("Saved recipes persist across navigation and reload")
  await page.locator(".recipe-card-title").first().click()
  await page.waitForSelector(".recipe-actions button")
  await page.waitForTimeout(200)
  assert.equal(await page.locator("h1").textContent(), savedTitle)
  assert.equal(await page.locator(".recipe-actions button").first().getAttribute("aria-pressed"), "true")
  const checkbox = page.locator('.ingredient-list input[type="checkbox"]').first()
  await checkbox.check()
  assert(await checkbox.isChecked())
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
  assert(!schema.image, "Reference photos must not be claimed as actual recipe images")
  pass("Existing detail URL, saved state, working ingredients and honest structured data")
  await page.screenshot({ path: new URL("detail-desktop.png", evidence).pathname, fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await openHome()
  await page.screenshot({ path: new URL("mobile.png", evidence).pathname, fullPage: true })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "No mobile horizontal page overflow")
  assert.equal(await page.locator(".recipe-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length), 2)
  pass("390px mobile layout uses two columns without horizontal overflow")
  await page.setViewportSize({ width: 320, height: 740 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "No 320px overflow")
  await page.screenshot({ path: new URL("mobile-320.png", evidence).pathname, fullPage: true })
  pass("320px narrow layout remains contained")
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(origin + savedUrl, { waitUntil: "networkidle" })
  await page.getByRole("link", { name: "材料を見る", exact: true }).click()
  assert.equal(new URL(page.url()).hash, "#ingredients")
  await page.getByRole("link", { name: "作り方を見る", exact: true }).click()
  assert.equal(new URL(page.url()).hash, "#method")
  await page.screenshot({ path: new URL("detail-mobile.png", evidence).pathname, fullPage: true })
  pass("Mobile cooking shortcuts reach ingredients and method")

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const staticPage = await noJs.newPage()
  await staticPage.goto(base)
  const links = await staticPage.locator('a[href*="/recipes/"]').evaluateAll((items) => [...new Set(items.map((link) => link.getAttribute("href")))])
  assert.equal(links.length, catalogue.count)
  await noJs.close()
  pass("Every recipe stays reachable without JavaScript")
  for (let offset = 0; offset < catalogue.recipes.length; offset += 8) {
    await Promise.all(catalogue.recipes.slice(offset, offset + 8).map(async (recipe) => {
      const response = await fetch(origin + recipe.url)
      assert.equal(response.status, 200, `Existing route: ${recipe.url}`)
    }))
  }
  pass(`All ${catalogue.count} published recipe URLs return HTTP 200`)
  assert.deepEqual(report.errors, [])
  pass("No uncaught browser JavaScript errors")
} catch (error) {
  report.failure = error.stack || String(error)
  console.error(report.failure)
  if (page) await page.screenshot({ path: new URL("failure.png", evidence).pathname, fullPage: true }).catch(() => {})
  process.exitCode = 1
} finally {
  await writeFile(new URL("report.json", evidence), JSON.stringify(report, null, 2))
  if (browser) await browser.close()
  server.kill("SIGTERM")
}
