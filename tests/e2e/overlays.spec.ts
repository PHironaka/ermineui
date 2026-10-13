import { demo, expect, readout, tabKey, test } from './helpers'

test.describe('dialog', () => {
  test('moves focus in, keeps Tab inside, and hands focus back on Escape', async ({ page }) => {
    const trigger = demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Invite a teammate' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAccessibleDescription(/email with a link/)
    await expect(dialog.getByLabel('Email')).toBeFocused()

    // Tab from the last control wraps to the first, and Shift+Tab from the first wraps to the last.
    await dialog.getByRole('button', { name: 'Close' }).focus()
    await page.keyboard.press('Tab')
    await expect(dialog.getByLabel('Email')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('focus returns to the trigger even when it was opened by a mouse click', async ({ page }) => {
    // Safari does not focus a button on click, so this is the case that needs the layer to remember the press.
    const trigger = demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' })
    await demo(page, 'input').getByLabel('Project name').focus()
    await trigger.click()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('locks page scrolling while open, and a press on the backdrop closes it', async ({ page }) => {
    await demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' }).click()
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
    await page.mouse.click(5, 5)
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
  })

  test('a select inside a dialog closes first; the dialog stays', async ({ page }) => {
    await demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' }).click()
    const dialog = page.getByRole('dialog', { name: 'Invite a teammate' })
    await dialog.getByRole('combobox', { name: 'Role' }).click()
    await expect(page.getByRole('listbox')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(dialog).toBeVisible()
    await dialog.getByRole('combobox', { name: 'Role' }).click()
    await page.getByRole('option', { name: 'Owner' }).click()
    await expect(dialog.getByRole('combobox', { name: 'Role' })).toHaveText('Owner')
    await expect(dialog).toBeVisible()
  })

  test('submitting the form inside closes it and raises a toast', async ({ page }) => {
    await demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' }).click()
    await page.getByRole('dialog').getByLabel('Email').fill('mei@northwind.com')
    await page.getByRole('button', { name: 'Send invitation' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByText('mei@northwind.com was invited as developer.')).toBeVisible()
  })
})

test.describe('alert dialog', () => {
  test('starts on Cancel, ignores the backdrop, and Escape cancels', async ({ page }) => {
    const card = demo(page, 'alert-dialog')
    await card.getByRole('button', { name: 'Delete project' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Delete northwind-storefront?' })
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
    await page.mouse.click(5, 5)
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(readout(page, 'alert-dialog')).toHaveText('northwind-storefront is still here')
  })

  test('confirming runs the action', async ({ page }) => {
    await demo(page, 'alert-dialog').getByRole('button', { name: 'Delete project' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete project' }).click()
    await expect(page.getByRole('alertdialog')).toBeHidden()
    await expect(readout(page, 'alert-dialog')).toHaveText('northwind-storefront was deleted')
  })
})

test.describe('sheet', () => {
  test('slides in from the chosen side as a dialog, and closes with Escape', async ({ page }) => {
    const card = demo(page, 'sheet')
    await card.getByRole('radio', { name: 'left' }).check()
    await card.getByRole('button', { name: 'Add environment variable' }).click()
    const sheet = page.getByRole('dialog', { name: 'Add environment variable' })
    await expect(sheet).toBeVisible()
    await expect(sheet).toHaveAttribute('data-side', 'left')
    const box = (await sheet.boundingBox())!
    expect(box.x).toBe(0)
    expect(box.height).toBe(page.viewportSize()!.height)
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(card.getByRole('button', { name: 'Add environment variable' })).toBeFocused()
  })
})

test.describe('popover', () => {
  test('opens beside its trigger, keeps Tab inside, and closes on an outside press', async ({ page }) => {
    const card = demo(page, 'popover')
    const trigger = card.getByRole('button', { name: 'Screenshot size' })
    await trigger.click()
    const popover = page.getByRole('dialog').filter({ hasText: 'Viewport' })
    await expect(popover.getByLabel('Width')).toBeFocused()
    await popover.getByLabel('Width').fill('1440')
    await expect(readout(page, 'popover')).toHaveText('1440 × 800')
    await popover.getByLabel('Height').focus()
    await page.keyboard.press('Tab')
    await expect(popover.getByLabel('Width')).toBeFocused()
    await card.getByRole('heading', { name: 'Popover' }).click()
    await expect(popover).toBeHidden()
  })
})

test.describe('tooltip', () => {
  test('shows on hover and on keyboard focus, and Escape hides it', async ({ page, browserName }) => {
    const card = demo(page, 'tooltip')
    const trigger = card.getByRole('button', { name: 'No delay, on the right' })
    await trigger.hover()
    const tip = page.getByRole('tooltip', { name: 'Appears immediately' })
    await expect(tip).toBeVisible()
    await expect(trigger).toHaveAccessibleDescription('Appears immediately')
    const anchor = (await trigger.boundingBox())!
    expect((await tip.boundingBox())!.x).toBeGreaterThanOrEqual(anchor.x + anchor.width)
    await page.mouse.move(0, 0)
    await expect(tip).toBeHidden()

    await card.getByRole('button', { name: 'Build cache' }).focus()
    await page.keyboard.press(tabKey(browserName))
    await expect(tip).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(tip).toBeHidden()
  })
})

test.describe('hover card', () => {
  test('appears after a pause, can be moved into, and closes on leaving', async ({ page }) => {
    const link = demo(page, 'hover-card').getByRole('link', { name: 'Ines Kovač' }).first()
    await link.hover()
    const card = page.locator('.er-hover-card')
    await expect(card).toBeVisible()
    await card.getByRole('link', { name: 'See her deployments' }).hover()
    await page.waitForTimeout(400)
    await expect(card).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(card).toBeHidden()
  })
})

test.describe('toast', () => {
  test('appears in a live region, runs its action, and can be dismissed', async ({ page }) => {
    const card = demo(page, 'toast')
    await card.getByRole('button', { name: 'With action' }).click()
    await expect(page.getByText('Deployment archived')).toBeVisible()
    await page.locator('.er-toast-action', { hasText: 'Undo' }).click()
    await expect(page.getByText('Deployment restored')).toBeVisible()
    await expect(page.getByText('Deployment archived')).toBeHidden()
  })

  test('a toast does not close a dialog that is open behind it', async ({ page }) => {
    await demo(page, 'toast').getByRole('button', { name: 'Default', exact: true }).click()
    await demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' }).click()
    await page.getByText('Settings saved').click()
    await expect(page.getByRole('dialog', { name: 'Invite a teammate' })).toBeVisible()
  })
})

test.describe('command palette', () => {
  test('opens with the shortcut, filters by text and keywords, and runs with Enter', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.getByRole('dialog', { name: 'Command palette' })
    const search = palette.getByRole('combobox')
    await expect(search).toBeFocused()
    await expect(palette.getByRole('option')).toHaveCount(7)
    await search.fill('secrets')
    await expect(palette.getByRole('option')).toHaveCount(1)
    await expect(palette.getByRole('option', { name: 'Environment variables' })).toHaveAttribute('aria-selected', 'true')
    await expect(palette.getByText('Deployments', { exact: true })).toBeHidden()
    await page.keyboard.press('Enter')
    await expect(palette).toBeHidden()
    await expect(readout(page, 'command')).toHaveText('Open environment variables')
  })

  test('arrow keys skip disabled items, and nothing matching says so', async ({ page }) => {
    await demo(page, 'command').getByRole('button', { name: /Open command palette/ }).click()
    const palette = page.getByRole('dialog', { name: 'Command palette' })
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(palette.getByRole('option', { name: 'Environment variables' })).toHaveAttribute('aria-selected', 'true')
    await palette.getByRole('combobox').fill('qqq')
    await expect(palette.getByText('No command matches.')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(palette).toBeHidden()
    await expect(demo(page, 'command').getByRole('button', { name: /Open command palette/ })).toBeFocused()
  })
})

test.describe('tour', () => {
  test('walks through its steps, highlighting each target', async ({ page }) => {
    const card = demo(page, 'alert-dialog')
    await card.getByRole('button', { name: 'Start the tour' }).click()
    const tour = page.getByRole('dialog', { name: 'Deploy from here' })
    await expect(tour).toBeVisible()
    await expect(tour).toContainText('1 of 3')

    const target = (await card.locator('#tour-deploy').boundingBox())!
    const spotlight = (await page.locator('.er-tour-spotlight').boundingBox())!
    expect(Math.abs(spotlight.x - (target.x - 6))).toBeLessThan(2)
    expect(Math.abs(spotlight.width - (target.width + 12))).toBeLessThan(2)

    // Scoped to the tour's own card: the page behind has other "Next" buttons.
    const controls = page.locator('.er-tour')
    await controls.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByRole('dialog', { name: 'Find anything' })).toContainText('2 of 3')
    await controls.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByRole('dialog', { name: 'Deploy from here' })).toBeVisible()
    await controls.getByRole('button', { name: 'Next' }).click()
    await controls.getByRole('button', { name: 'Next' }).click()
    await controls.getByRole('button', { name: 'Done' }).click()
    await expect(page.locator('.er-tour')).toBeHidden()
    await expect(page.getByText('Tour finished')).toBeVisible()
  })

  test('Escape ends it and returns focus', async ({ page }) => {
    const start = demo(page, 'alert-dialog').getByRole('button', { name: 'Start the tour' })
    await start.click()
    await expect(page.locator('.er-tour')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.er-tour')).toBeHidden()
    await expect(start).toBeFocused()
  })
})
