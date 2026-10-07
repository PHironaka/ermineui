import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './helpers'

// axe checks what can be checked by machine: names, roles, ARIA usage, colour contrast and the like.
// It is a floor, not a verdict — it cannot tell whether a screen reader user can actually get the job done.

const summarize = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.map((violation) => `${violation.id} (${violation.nodes.length}): ${violation.help}\n    ${violation.nodes.slice(0, 3).map((node) => node.target.join(' ')).join('\n    ')}`)

// One engine is enough: axe reads the page's structure and computed colours, which do not differ by browser,
// and a full scan of a page this size takes minutes in Firefox and WebKit.
test.skip(({ browserName }) => browserName !== 'chromium', 'the axe scan runs in Chromium only')

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme })

    test('the whole page passes axe', async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze()
      expect(summarize(results.violations)).toEqual([])
    })

    test('open overlays pass axe', async ({ page }) => {
      const problems: string[] = []
      const scan = async (name: string, selector: string) => {
        const results = await new AxeBuilder({ page }).include(selector).analyze()
        problems.push(...summarize(results.violations).map((line) => `${name}: ${line}`))
      }

      await page.locator('#dialog').getByRole('button', { name: 'Invite a teammate' }).click()
      await scan('dialog', '.sb-dialog-content')
      await page.keyboard.press('Escape')

      await page.locator('#dropdown-menu').getByRole('button', { name: 'View options' }).click()
      await scan('dropdown menu', '.sb-menu')
      await page.keyboard.press('Escape')

      await page.locator('#select').getByRole('combobox', { name: 'Region' }).click()
      await scan('select', '.sb-select-content[data-state="open"]')
      await page.keyboard.press('Escape')

      await page.locator('#date-picker').getByRole('button', { name: 'Launch date' }).click()
      await scan('date picker', '.sb-date-picker-content')
      await page.keyboard.press('Escape')

      await page.locator('#date-range-picker').getByRole('button', { name: 'Report period' }).click()
      await scan('date range picker', '.sb-date-range-picker-content')
      await page.keyboard.press('Escape')

      await page.keyboard.press('ControlOrMeta+k')
      await scan('command palette', '.sb-command')
      await page.keyboard.press('Escape')

      await page.locator('#alert-dialog').getByRole('button', { name: 'Delete project' }).click()
      await scan('alert dialog', '.sb-alert-dialog')
      await page.keyboard.press('Escape')

      await page.locator('#time-picker').getByRole('button', { name: /Brand colour/ }).click()
      await scan('colour picker', '.sb-color-picker-content')
      await page.keyboard.press('Escape')

      await page.locator('#toast').getByRole('button', { name: 'Error' }).click()
      await scan('toast', '[data-sb-layer-ignore]')

      expect(problems).toEqual([])
    })
  })
}
