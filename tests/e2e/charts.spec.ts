import type { Locator, Page } from '@playwright/test'
import { demo, expect, test } from './helpers'

/** One chart in the chart demo, found by the heading above it. */
function chart(page: Page, title: string): Locator {
  return demo(page, 'chart').locator('.chart-grid > div').filter({ has: page.getByText(title, { exact: true }) })
}

test.describe('line, area and bar charts', () => {
  test('pointing at the plot reads out every series at that position', async ({ page }) => {
    const area = chart(page, 'Weekly requests')
    const plot = area.getByRole('img', { name: /Weekly requests/ })
    await plot.scrollIntoViewIfNeeded()
    const box = (await plot.boundingBox())!
    // Just inside the left edge of the plot area, over the first position.
    await page.mouse.move(box.x + 42, box.y + box.height / 2)
    const tooltip = area.locator('.sb-chart-tooltip')
    await expect(tooltip).toContainText('Aug 3')
    await expect(tooltip).toContainText('41,200')
    await expect(tooltip).toContainText('28,100')
    await page.mouse.move(0, 0)
    await expect(tooltip).toBeHidden()
  })

  test('arrow keys read values and announce them', async ({ page }) => {
    const area = chart(page, 'Weekly requests')
    await area.getByRole('img', { name: /Weekly requests/ }).focus()
    await page.keyboard.press('End')
    await expect(area.getByRole('status')).toHaveText('Sep 28: Requests 66,800, Served from cache 52,300')
    await page.keyboard.press('ArrowLeft')
    await expect(area.locator('.sb-chart-tooltip')).toContainText('Sep 21')
    await page.keyboard.press('Escape')
    await expect(area.locator('.sb-chart-tooltip')).toBeHidden()
  })

  test('the legend hides a series, rescales the axis, and keeps the last one', async ({ page }) => {
    const bars = chart(page, 'Deployments by month')
    const ticks = bars.locator('.sb-chart-axis text[text-anchor="end"]')
    await expect(ticks).toHaveText(['0', '50', '100', '150'])
    await bars.getByRole('button', { name: 'Preview' }).click()
    await expect(bars.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'false')
    await expect(ticks.last()).not.toHaveText('150')
    await bars.getByRole('button', { name: 'Production' }).click()
    // Failed is now the only series showing, so it cannot be hidden too.
    await bars.getByRole('button', { name: 'Failed' }).click()
    await expect(bars.getByRole('button', { name: 'Failed' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('every chart has the same numbers as a table', async ({ page }) => {
    const bars = chart(page, 'Deployments by month')
    await bars.getByRole('button', { name: 'Show table' }).click()
    const table = bars.getByRole('table', { name: /Deployments by month/ })
    await expect(table.getByRole('columnheader')).toHaveText(['Month', 'Production', 'Preview', 'Failed'])
    await expect(table.getByRole('row').nth(1)).toHaveText(/Apr\s*14\s*52\s*4/)
    await bars.getByRole('button', { name: 'Show chart' }).click()
    await expect(bars.getByRole('img')).toBeVisible()
  })

  test('a missing value draws no bar and reads as a dash', async ({ page }) => {
    const builds = chart(page, 'Median build time, this week')
    await expect(builds.locator('svg > path')).toHaveCount(6)
    await builds.getByRole('img').focus()
    for (let press = 0; press < 6; press++) await page.keyboard.press('ArrowRight')
    await expect(builds.getByRole('status')).toHaveText('Sat: Median build time –')
  })

  test('stacked bars stay within 24px and fill no more than their slot', async ({ page }) => {
    const widths = await chart(page, 'Deployments by month')
      .locator('svg > path')
      .evaluateAll((paths) => paths.map((path) => path.getBoundingClientRect().width))
    expect(widths.length).toBe(18)
    // A little slack: browsers measure the rounded corners of a path slightly differently.
    expect(Math.max(...widths)).toBeLessThanOrEqual(24.1)
  })
})

test.describe('donut, scatter, heatmap, gauge, bar list', () => {
  test('the donut folds small slices into Other and lists every value beside it', async ({ page }) => {
    const donut = chart(page, 'Bandwidth by region, last 30 days')
    await expect(donut.locator('.sb-chart-slice')).toHaveCount(6)
    const rows = donut.locator('.sb-chart-donut-legend li')
    await expect(rows.first()).toHaveText(/Frankfurt\s*412 GB\s*32.7%/)
    await expect(rows.last()).toHaveText(/Other\s*63 GB\s*5%/)
    await donut.getByRole('img').focus()
    await page.keyboard.press('ArrowRight')
    await expect(donut.getByRole('status')).toHaveText('Frankfurt: 412 GB, 32.7%')
  })

  test('the scatter chart finds the nearest point and can hide a group', async ({ page }) => {
    const scatter = chart(page, 'Build time against bundle size')
    const dots = scatter.locator('circle.sb-chart-dot')
    await expect(dots).toHaveCount(20)
    await scatter.getByRole('img').scrollIntoViewIfNeeded()
    const first = (await dots.first().boundingBox())!
    // A little off the dot: the pointer only has to be close.
    await page.mouse.move(first.x - 8, first.y + 14)
    await expect(scatter.locator('.sb-chart-tooltip')).toContainText('embed · Vite')
    await page.mouse.move(0, 0)
    await scatter.getByRole('button', { name: 'Nuxt' }).click()
    await expect(dots).toHaveCount(14)
    await scatter.getByRole('img').focus()
    await page.keyboard.press('End')
    await expect(scatter.getByRole('status')).toHaveText('legacy-portal, Other: Bundle size (KB) 590, Build time (s) 132')
  })

  test('the heatmap reads out cells by pointer and keyboard, and marks a missing one', async ({ page }) => {
    const heatmap = chart(page, 'Requests by day and hour (thousands)')
    const cells = heatmap.locator('.sb-heatmap-cell')
    await expect(cells).toHaveCount(56)
    await expect(heatmap.locator('.sb-heatmap-cell[data-empty]')).toHaveCount(1)
    await cells.nth(11).hover()
    await expect(heatmap.locator('.sb-chart-tooltip')).toContainText('Tue · 09')
    await page.mouse.move(0, 0)
    await heatmap.getByRole('img').focus()
    await page.keyboard.press('ArrowRight')
    for (let press = 0; press < 6; press++) await page.keyboard.press('ArrowDown')
    await expect(heatmap.getByRole('status')).toHaveText('Sun, 00: –')
  })

  test('gauges are meters, and a warning is written out as well as coloured', async ({ page }) => {
    const usage = chart(page, 'Plan usage')
    await expect(usage.getByRole('meter', { name: 'Bandwidth' })).toHaveAttribute('aria-valuenow', '62')
    const builds = usage.getByRole('meter', { name: 'Build minutes' })
    await expect(builds).toHaveAttribute('aria-valuetext', '91%, warning')
    await expect(builds.getByText('Warning')).toBeVisible()
  })

  test('the bar list is sorted with values written beside each name', async ({ page }) => {
    const list = chart(page, 'Top pages by views').getByRole('list', { name: 'Top pages by views' })
    await expect(list.locator('.sb-bar-list-name')).toHaveText(['/', '/products', '/cart', '/checkout', '/account', '/help'])
    await expect(list.locator('.sb-bar-list-value').first()).toHaveText('61,940')
  })
})
