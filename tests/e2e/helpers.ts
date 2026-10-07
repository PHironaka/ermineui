import { expect, test as base, type Locator, type Page } from '@playwright/test'

/**
 * Every test starts on the playground with nothing logged to the console as an error,
 * and fails if anything is logged as one while it runs.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        // The avatar demo requests a picture that does not exist on purpose, to show the fallback.
        if (message.type() === 'error' && !message.text().includes('missing-avatar')) errors.push(message.text())
      })
      await page.goto('/')
      await expect(page.locator('.demo').first()).toBeVisible()
      await use(errors)
      expect(errors, 'errors logged by the page').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/**
 * The key that moves focus to the next control. Safari only tabs to text fields and lists unless
 * Option is held (or the reader has turned on "Press Tab to highlight each item").
 */
export function tabKey(browserName: string): string {
  return browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
}

/** The playground card for one component, by the name used in `ermine add <name>`. */
export function demo(page: Page, name: string): Locator {
  return page.locator(`#${name}`)
}

/** The small monospace line under a demo that echoes its current values. */
export function readout(page: Page, name: string): Locator {
  return demo(page, name).locator('.readout').last()
}
