import { demo, expect, readout, test } from './helpers'

test.describe('app bar', () => {
  test('has a heading, a back button and room for actions', async ({ page }) => {
    const card = demo(page, 'app-bar')
    const bar = card.locator('.er-app-bar')
    await expect(bar.getByRole('heading', { name: 'Orders' })).toBeVisible()
    await bar.getByRole('button', { name: 'Back' }).click()
    await expect(readout(page, 'app-bar')).toHaveText('back')
    await bar.getByRole('button', { name: 'Search orders' }).click()
    await expect(readout(page, 'app-bar')).toHaveText('search')
  })
})

test.describe('fab', () => {
  test('opens a stack of actions, takes focus into it, and closes on Escape or a choice', async ({ page }) => {
    const card = demo(page, 'app-bar')
    const fab = card.getByRole('button', { name: 'New', exact: true })
    await expect(fab).toHaveAttribute('aria-expanded', 'false')
    await fab.click()
    await expect(fab).toHaveAttribute('aria-expanded', 'true')
    const actions = card.getByRole('group', { name: 'New' })
    await expect(actions.getByRole('button', { name: 'New order' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(actions).toBeHidden()
    await expect(fab).toBeFocused()

    await fab.click()
    await actions.getByRole('button', { name: 'New customer' }).click()
    await expect(actions).toBeHidden()
    await expect(readout(page, 'app-bar')).toHaveText('new customer')
  })
})

test.describe('action sheet', () => {
  test('is a dialog named after what it acts on; choosing closes it', async ({ page }) => {
    const card = demo(page, 'action-sheet')
    const trigger = card.getByRole('button', { name: 'Item options' })
    await trigger.click()
    const sheet = page.getByRole('dialog', { name: 'Wool throw' })
    await expect(sheet).toBeVisible()
    await expect(sheet).toContainText('Moss / 130 × 180 cm')
    await expect(sheet.getByRole('button')).toHaveText(['Save for later', 'Share', 'Remove from cart', 'Cancel'])

    await sheet.getByRole('button', { name: 'Cancel' }).click()
    await expect(sheet).toBeHidden()
    await expect(card.locator('[data-readout="action-sheet"]')).toHaveText('nothing chosen')

    await trigger.click()
    await sheet.getByRole('button', { name: 'Remove from cart' }).click()
    await expect(sheet).toBeHidden()
    await expect(card.locator('[data-readout="action-sheet"]')).toHaveText('removed')
  })
})

test.describe('swipe actions', () => {
  test('tabbing onto a hidden button uncovers it, and tabbing away covers it again', async ({ page }) => {
    const card = demo(page, 'action-sheet')
    const row = card.locator('.er-swipe-actions').first()
    await expect(row).toHaveAttribute('data-state', 'closed')
    await row.getByRole('button', { name: /^Archive/ }).focus()
    await expect(row).toHaveAttribute('data-state', 'open')
    await card.getByRole('button', { name: 'Item options' }).focus()
    await expect(row).toHaveAttribute('data-state', 'closed')

    await row.getByRole('button', { name: /^Archive/ }).focus()
    await page.keyboard.press('Enter')
    await expect(readout(page, 'action-sheet')).toHaveText('archived Your order has shipped')
    await expect(card.locator('.er-swipe-actions')).toHaveCount(2)
  })
})

test.describe('pull to refresh', () => {
  test('the button refreshes for anyone not using a finger, and says when it is done', async ({ page }) => {
    const card = demo(page, 'pull-to-refresh')
    await card.getByRole('button', { name: 'Refresh' }).click()
    await expect(card.locator('.er-pull-to-refresh')).toHaveAttribute('data-state', 'refreshing')
    await expect(card.locator('.er-pull-to-refresh-status')).toHaveText('Refreshing…')
    await expect(card.locator('.feed-top .readout')).toHaveText('refreshed 1 times')
    await expect(card.locator('.er-pull-to-refresh-status')).toHaveText('Updated.')
    await expect(card.locator('.er-pull-to-refresh')).toHaveAttribute('data-state', 'idle')
  })
})

test.describe('infinite scroll', () => {
  test('loads the next rows when its end is scrolled to, and says when there are no more', async ({ page }) => {
    const card = demo(page, 'pull-to-refresh')
    await card.scrollIntoViewIfNeeded()
    await expect(readout(page, 'pull-to-refresh')).toHaveText('8 rows loaded')
    const feed = card.locator('.feed')
    // To the end, again and again, as someone reading down the list would.
    for (const rows of [16, 24]) {
      await feed.evaluate((el) => (el.scrollTop = el.scrollHeight))
      await expect(readout(page, 'pull-to-refresh')).toHaveText(`${rows} rows loaded`)
    }
    await feed.evaluate((el) => (el.scrollTop = el.scrollHeight))
    await expect(card.locator('.er-infinite-scroll-status')).toHaveText('You have reached the end.')
  })
})

test.describe('install prompt', () => {
  test('explains itself, and goes away on “Not now”', async ({ page }) => {
    const card = demo(page, 'install-prompt')
    const prompt = card.getByRole('region', { name: 'Install Ermine' })
    await expect(prompt).toContainText('Opens straight to your orders, and works offline.')
    await expect(prompt.getByRole('button', { name: 'Install' })).toBeVisible()
    await prompt.getByRole('button', { name: 'Not now' }).click()
    await expect(prompt).toBeHidden()
    await expect(card.locator('.readout').first()).toHaveText('install: not now')
  })
})

test.describe('update prompt', () => {
  test('is empty until there is an update, then offers to reload', async ({ page }) => {
    const card = demo(page, 'install-prompt')
    const prompt = card.locator('.er-update-prompt')
    await expect(prompt).toBeEmpty()
    await card.getByRole('button', { name: 'Pretend a new version shipped' }).click()
    await expect(prompt).toContainText('A new version is available.')
    await prompt.getByRole('button', { name: 'Later' }).click()
    await expect(prompt).toBeEmpty()
    await expect(readout(page, 'install-prompt')).toHaveText('update: put off')

    await card.getByRole('button', { name: 'Pretend a new version shipped' }).click()
    await prompt.getByRole('button', { name: 'Reload' }).click()
    await expect(readout(page, 'install-prompt')).toHaveText('update: reloading into the new version')
  })
})
