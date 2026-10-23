import { demo, expect, test } from './helpers'

// Runs on a phone-sized screen only (see the "phone" project in playwright.config.ts).

test('nothing makes the page scroll sideways', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('no demo spills out of its card', async ({ page }) => {
  const spilling = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    return Array.from(document.querySelectorAll<HTMLElement>('.demo-stage > *'))
      .filter((el) => el.getBoundingClientRect().right > width + 1 || el.getBoundingClientRect().left < -1)
      // Elements parked off screen on purpose (the closed sidebar) do not count.
      .filter((el) => getComputedStyle(el).visibility !== 'hidden' && !el.closest('.app-frame'))
      .map((el) => `${el.closest('.demo')?.id}: ${el.className}`)
  })
  expect(spilling).toEqual([])
})

test('the off-canvas sidebar opens as a dialog and closes again', async ({ page }) => {
  const card = demo(page, 'sidebar')
  const sidebar = card.locator('.er-sidebar')
  await expect(sidebar).toBeHidden()
  await card.getByRole('button', { name: 'Menu' }).click()
  const drawer = page.getByRole('dialog', { name: 'Project' })
  await expect(drawer).toBeVisible()
  await expect(drawer).toBeInViewport()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await drawer.getByRole('link', { name: 'Logs' }).click()
  await expect(sidebar).toBeHidden()
  await expect(card.getByText('No logs yet')).toBeVisible()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

test('the stepper keeps only the current step’s name', async ({ page }) => {
  const steps = demo(page, 'stepper').getByRole('list', { name: 'Checkout progress' })
  const widths = await steps.locator('.er-stepper-text').evaluateAll((labels) => labels.map((label) => label.getBoundingClientRect().width))
  expect(widths.filter((width) => width > 2)).toHaveLength(1)
})

test('touch-sized targets: dialog and menu still work by tap', async ({ page }) => {
  await demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' }).tap()
  await expect(page.getByRole('dialog', { name: 'Invite a teammate' })).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).tap()
  await demo(page, 'dropdown-menu').getByRole('button', { name: 'Deployment actions' }).tap()
  await page.getByRole('menuitem', { name: 'Copy URL' }).tap()
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('the dashboard block hides its sidebar and slides it in from the top bar', async ({ page }) => {
  const card = demo(page, 'dashboard')
  await card.scrollIntoViewIfNeeded()
  const sidebar = card.locator('.er-sidebar')
  await expect(sidebar).toBeHidden()
  await card.getByRole('button', { name: 'Toggle navigation' }).click()
  await expect(sidebar).toBeVisible()
  await expect(sidebar).toHaveAttribute('role', 'dialog')
  await page.keyboard.press('Escape')
  await expect(sidebar).toBeHidden()
  // The numbers stack in one column, and nothing pushes the page sideways.
  const tiles = await card.locator('.er-dashboard-stats .er-card').evaluateAll((cards) => cards.map((tile) => tile.getBoundingClientRect().left))
  expect(new Set(tiles).size).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('the image fan shrinks to fit instead of spilling out of its card', async ({ page }) => {
  const card = demo(page, 'image-fan')
  await card.scrollIntoViewIfNeeded()
  const stage = await card.locator('.er-image-fan').boundingBox()
  const boxes = await card.locator('.er-image-fan-item').evaluateAll((list) => list.map((item) => item.getBoundingClientRect().width))
  expect(Math.max(...boxes)).toBeLessThan(210)
  const first = await card.locator('.er-image-fan-card').first().boundingBox()
  const last = await card.locator('.er-image-fan-card').last().boundingBox()
  expect(first!.x).toBeGreaterThanOrEqual(stage!.x - 12)
  expect(last!.x + last!.width).toBeLessThanOrEqual(stage!.x + stage!.width + 12)
})

test('the sticky scroll is one column on a phone, with each step’s media above its copy', async ({ page }) => {
  const card = demo(page, 'sticky-scroll')
  const media = card.locator('.er-sticky-scroll-media')
  const copy = card.locator('.er-sticky-scroll-copy')
  await expect(media).toHaveCount(4)
  for (let index = 0; index < 4; index++) {
    await expect(media.nth(index)).toHaveCSS('opacity', '1')
    await expect(media.nth(index)).toHaveCSS('position', 'static')
    const [above, below] = [await media.nth(index).boundingBox(), await copy.nth(index).boundingBox()]
    expect(above!.y + above!.height).toBeLessThanOrEqual(below!.y + 1)
  }
})
