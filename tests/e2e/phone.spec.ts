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
  const sidebar = card.locator('.sb-sidebar')
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
  const widths = await steps.locator('.sb-stepper-text').evaluateAll((labels) => labels.map((label) => label.getBoundingClientRect().width))
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
