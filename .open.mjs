import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:4321/?cart=mug-sand:2,throw-moss:9,nope:1')
await page.waitForSelector('astro-island:not([ssr])')
for (const wait of [100, 1500]) { await page.waitForTimeout(wait); console.log(wait, 'scrollY', await page.evaluate(() => scrollY), 'window top', Math.round((await page.locator('.window').boundingBox()).y)) }
await page.screenshot({ path: process.argv[2] })
await browser.close()
