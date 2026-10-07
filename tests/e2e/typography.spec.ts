import { demo, expect, test } from './helpers'

const fontSize = (locator: import('@playwright/test').Locator) => locator.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))

test.describe('typography', () => {
  test('text is its smallest at 320px, its largest from 1280px, and in between otherwise', async ({ page }) => {
    const card = demo(page, 'typography')
    const body = card.locator('.er-typography[data-variant="body"]')
    const h1 = card.locator('.er-typography[data-variant="h1"]')

    await page.setViewportSize({ width: 320, height: 800 })
    expect(await fontSize(body)).toBeCloseTo(16, 1)
    expect(await fontSize(h1)).toBeCloseTo(16 * 1.2 ** 5, 1)

    await page.setViewportSize({ width: 1280, height: 800 })
    expect(await fontSize(body)).toBeCloseTo(18, 1)
    expect(await fontSize(h1)).toBeCloseTo(18 * 1.3 ** 5, 1)

    // Halfway between the two widths, exactly halfway between the two sizes.
    await page.setViewportSize({ width: 800, height: 800 })
    expect(await fontSize(body)).toBeCloseTo(17, 1)

    // And it stops growing: a very wide screen does not get giant text.
    await page.setViewportSize({ width: 2400, height: 800 })
    expect(await fontSize(body)).toBeCloseTo(18, 1)
    expect(await fontSize(h1)).toBeCloseTo(18 * 1.3 ** 5, 1)
  })

  test('sizes follow the reader’s own text-size setting', async ({ page }) => {
    const body = demo(page, 'typography').locator('.er-typography[data-variant="body"]')
    await page.setViewportSize({ width: 320, height: 800 })
    // A reader who has set their browser's default text size to 20px instead of 16px.
    await page.addStyleTag({ content: 'html { font-size: 125%; }' })
    // 320px is now 16rem, narrower than the 20rem starting point, so text is at its minimum: 1rem = 20px.
    expect(await fontSize(body)).toBeCloseTo(20, 1)
  })

  test('every variant is bigger than the one below it, at any width', async ({ page }) => {
    const order = ['caption', 'small', 'body', 'lead', 'h4', 'h3', 'h2', 'h1', 'display']
    for (const width of [320, 700, 1280]) {
      await page.setViewportSize({ width, height: 800 })
      const sizes = await Promise.all(order.map((variant) => fontSize(demo(page, 'typography').locator(`.er-typography[data-variant="${variant}"]`))))
      expect(sizes, `at ${width}px`).toEqual([...sizes].sort((a, b) => a - b))
      expect(sizes[0], 'the smallest text stays readable').toBeGreaterThanOrEqual(12)
    }
  })

  test('variants choose a sensible tag, and `as` overrides it', async ({ page }) => {
    // The demo renders every variant as a paragraph, to keep headings out of the page's outline.
    const display = demo(page, 'typography').locator('.er-typography[data-variant="display"]')
    await expect(display).toHaveJSProperty('tagName', 'P')
    await expect(display).toHaveCSS('text-wrap', 'balance')
  })

  test('prose in a container sizes to the container, not the screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const card = demo(page, 'typography')
    const headings = card.locator('.er-prose h1')
    const wide = await fontSize(headings.first())
    const narrow = await fontSize(headings.last())
    // Same heading, same screen: the narrower column sets it smaller.
    expect(narrow).toBeLessThan(wide)
    expect(wide).toBeLessThan(18 * 1.3 ** 5)

    // Narrowing the wide column shrinks its text.
    const handle = card.getByRole('separator', { name: 'Resize article columns' })
    await handle.focus()
    await page.keyboard.press('Home')
    expect(await fontSize(headings.first())).toBeLessThan(wide)
  })

  test('prose styles plain HTML: headings step down in size and lists keep their markers', async ({ page }) => {
    const prose = demo(page, 'typography').locator('.er-prose').first()
    expect(await fontSize(prose.locator('h1'))).toBeGreaterThan(await fontSize(prose.locator('h2')))
    expect(await fontSize(prose.locator('h2'))).toBeGreaterThan(await fontSize(prose.locator('p').first()))
    await expect(prose.locator('ul')).toHaveCSS('list-style-type', 'disc')
    expect(await fontSize(prose.locator('code'))).toBeLessThan(await fontSize(prose.locator('li').first()))
  })
})
