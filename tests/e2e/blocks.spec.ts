import { demo, expect, readout, test } from './helpers'

test.describe('icon', () => {
  test('an icon beside text is hidden from screen readers, and one with a label is an image', async ({ page }) => {
    const card = demo(page, 'icon')
    await expect(card.getByRole('button', { name: 'New project' }).locator('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(card.getByRole('img', { name: 'Passed' })).toBeVisible()
    await expect(card.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test('every name draws something, including one that was registered', async ({ page }) => {
    const card = demo(page, 'icon')
    const drawn = await card.locator('.icon-grid svg').evaluateAll((icons) =>
      icons.map((icon) => ({ name: icon.getAttribute('data-icon'), box: (icon.querySelector('path') as SVGPathElement | null)?.getBBox().width ?? 0 })),
    )
    expect(drawn.length).toBeGreaterThan(50)
    expect(drawn.filter((icon) => icon.box === 0).map((icon) => icon.name)).toEqual([])
    expect(drawn.map((icon) => icon.name)).toContain('rocket')
  })

  test('the size prop sets width and height', async ({ page }) => {
    const card = demo(page, 'icon')
    const first = card.locator('.icon-grid svg').first()
    await expect(first).toHaveCSS('width', '24px')
    await card.getByRole('radio', { name: '32' }).or(card.getByRole('button', { name: '32' })).click()
    await expect(first).toHaveCSS('width', '32px')
    await expect(first).toHaveCSS('height', '32px')
  })
})

test.describe('dashboard block', () => {
  test('shows the navigation, the numbers, the chart and the table', async ({ page }) => {
    const card = demo(page, 'dashboard')
    const nav = card.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveCount(7)
    await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
    await expect(card.getByText('$221,500')).toBeVisible()
    await expect(card.getByRole('table', { name: 'Recent orders' }).getByRole('row')).toHaveCount(6)
  })

  test('the top bar button shrinks the sidebar to icons and back', async ({ page }) => {
    const card = demo(page, 'dashboard')
    const sidebar = card.locator('.er-sidebar')
    await expect(sidebar).toHaveCSS('width', '240px')
    await card.getByRole('button', { name: 'Toggle navigation' }).click()
    await expect(sidebar).toHaveCSS('width', '52px')
    await expect(card.getByRole('link', { name: 'Orders' })).toBeVisible()
    await card.getByRole('button', { name: 'Toggle navigation' }).click()
    await expect(sidebar).toHaveCSS('width', '240px')
  })

  test('the user menu signs out, and the action button reports back', async ({ page }) => {
    const card = demo(page, 'dashboard')
    await card.getByRole('button', { name: 'Export' }).click()
    await expect(readout(page, 'dashboard')).toHaveText('export pressed')
    await card.getByRole('button', { name: 'Account menu for Ines Kovač' }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(readout(page, 'dashboard')).toHaveText('signed out')
  })

  test('sorting the orders by total puts the largest first', async ({ page }) => {
    const table = demo(page, 'dashboard').getByRole('table', { name: 'Recent orders' })
    await table.getByRole('button', { name: /Total/ }).click()
    await table.getByRole('button', { name: /Total/ }).click()
    await expect(table.getByRole('row').nth(1)).toContainText('$310.25')
  })
})

test.describe('sign-in block', () => {
  test('empty and malformed answers are caught before anything is sent', async ({ page }) => {
    const card = demo(page, 'sign-in')
    await card.getByRole('button', { name: 'Sign in' }).click()
    await expect(card.getByText('Enter your email address.')).toBeVisible()
    await expect(card.getByText('Enter your password.')).toBeVisible()
    await card.getByLabel('Email').fill('ines')
    await expect(card.getByText('Enter an email address, such as name@example.com.')).toBeVisible()
    await expect(card.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('a good answer is sent, and a server error is shown as an alert', async ({ page }) => {
    const card = demo(page, 'sign-in')
    await card.getByLabel('Email').fill('ines@example.com')
    await card.locator('input[name="password"]').fill('wrong')
    await card.getByRole('button', { name: 'Sign in' }).click()
    await expect(card.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    await expect(card.getByRole('alert').filter({ hasText: 'do not match' })).toBeVisible()

    await card.locator('input[name="password"]').fill('correct horse')
    await card.locator('input[name="password"]').press('Enter')
    await expect(readout(page, 'dashboard')).toHaveText('signed in as ines@example.com')
    await expect(card.getByRole('alert').filter({ hasText: 'do not match' })).toHaveCount(0)
  })
})

test.describe('settings block', () => {
  test('the profile is checked, then saved', async ({ page }) => {
    const card = demo(page, 'settings')
    await card.getByLabel('Name').fill('')
    await card.getByRole('button', { name: 'Save profile' }).click()
    await expect(card.getByText('Enter your name.')).toBeVisible()
    await card.getByLabel('Name').fill('Ines K.')
    await card.getByRole('button', { name: 'Save profile' }).click()
    await expect(readout(page, 'dashboard')).toHaveText('profile saved for Ines K.')
  })

  test('notification switches are saved by key', async ({ page }) => {
    const card = demo(page, 'settings')
    await card.getByRole('tab', { name: 'Notifications' }).click()
    await expect(card.getByRole('switch', { name: 'Security alerts' })).toBeChecked()
    await card.getByRole('switch', { name: 'Account activity' }).uncheck()
    await card.getByRole('switch', { name: 'Weekly summary' }).check()
    await card.getByRole('button', { name: 'Save notifications' }).click()
    await expect(readout(page, 'dashboard')).toHaveText('notifications: security, digest')
  })

  test('deleting the account needs a second, explicit yes', async ({ page }) => {
    const card = demo(page, 'settings')
    await card.getByRole('tab', { name: 'Account' }).click()
    await card.getByRole('button', { name: 'Delete account' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Delete your account?' })
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(readout(page, 'dashboard')).not.toHaveText('account deleted')
    await card.getByRole('button', { name: 'Delete account' }).click()
    await dialog.getByRole('button', { name: 'Delete account' }).click()
    await expect(readout(page, 'dashboard')).toHaveText('account deleted')
  })
})
