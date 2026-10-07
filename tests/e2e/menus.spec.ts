import { demo, expect, readout, tabKey, test } from './helpers'

test.describe('dropdown menu', () => {
  test('arrow keys, Home, End and typing move; Enter chooses and focus returns', async ({ page }) => {
    const card = demo(page, 'dropdown-menu')
    const trigger = card.getByRole('button', { name: 'Deployment actions' })
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: 'Promote to production' })).toBeFocused()
    await page.keyboard.press('End')
    await expect(menu.getByRole('menuitem', { name: 'Delete deployment' })).toBeFocused()
    await page.keyboard.press('Home')
    await page.keyboard.type('c')
    await expect(menu.getByRole('menuitem', { name: 'Copy URL' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(readout(page, 'dropdown-menu')).toContainText('Copy URL')
  })

  test('a disabled item is skipped and cannot be chosen', async ({ page }) => {
    const card = demo(page, 'dropdown-menu')
    await card.getByRole('button', { name: 'Deployment actions' }).click()
    const menu = page.getByRole('menu')
    await menu.getByRole('menuitem', { name: 'Copy URL' }).hover()
    await page.keyboard.press('ArrowDown')
    await expect(menu.getByRole('menuitem', { name: 'Delete deployment' })).toBeFocused()
    await menu.getByRole('menuitem', { name: /Roll back/ }).click({ force: true })
    await expect(menu).toBeVisible()
  })

  test('checkbox and radio items change their value and keep the menu open', async ({ page }) => {
    const card = demo(page, 'dropdown-menu')
    await card.getByRole('button', { name: 'View options' }).click()
    const menu = page.getByRole('menu')
    await menu.getByRole('menuitemcheckbox', { name: 'Failed deployments' }).click()
    await expect(menu.getByRole('menuitemcheckbox', { name: 'Failed deployments' })).toHaveAttribute('aria-checked', 'true')
    await menu.getByRole('menuitemradio', { name: 'Compact' }).click()
    await expect(menu.getByRole('menuitemradio', { name: 'Comfortable' })).toHaveAttribute('aria-checked', 'false')
    await expect(menu).toBeVisible()
    await expect(readout(page, 'dropdown-menu')).toContainText('failed: true · compact')
  })

  test('a submenu opens with the right arrow, closes with the left, and choosing closes everything', async ({ page }) => {
    const card = demo(page, 'dropdown-menu')
    const trigger = card.getByRole('button', { name: 'View options' })
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('End')
    const sub = page.getByRole('menuitem', { name: 'Export' })
    await expect(sub).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('menuitem', { name: 'CSV' })).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(sub).toBeFocused()
    await expect(sub).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(readout(page, 'dropdown-menu')).toContainText('Export as JSON')
  })

  test('a submenu opens on hover and stays open while the pointer moves into it', async ({ page }) => {
    await demo(page, 'dropdown-menu').getByRole('button', { name: 'View options' }).click()
    await page.getByRole('menuitem', { name: 'Export' }).hover()
    const csv = page.getByRole('menuitem', { name: 'CSV' })
    await expect(csv).toBeVisible()
    await csv.hover()
    await page.waitForTimeout(300)
    await expect(csv).toBeVisible()
    await csv.click()
    await expect(readout(page, 'dropdown-menu')).toContainText('Export as CSV')
  })
})

test.describe('context menu', () => {
  test('opens at the pointer on right-click, and Escape closes it', async ({ page }) => {
    const card = demo(page, 'context-menu')
    const area = card.getByText('Right-click here')
    const box = (await area.boundingBox())!
    await area.click({ button: 'right', position: { x: 40, y: 30 } })
    const menu = page.getByRole('menu', { name: 'File actions' })
    await expect(menu).toBeVisible()
    const placed = (await menu.boundingBox())!
    expect(Math.abs(placed.x - (box.x + 40))).toBeLessThan(3)
    await menu.getByRole('menuitem', { name: /Rename/ }).click()
    await expect(menu).toBeHidden()
    await expect(readout(page, 'context-menu')).toContainText('Rename')
  })

  test('right-clicking again moves it rather than opening a second one', async ({ page }) => {
    const area = demo(page, 'context-menu').getByText('Right-click here')
    await area.click({ button: 'right', position: { x: 20, y: 20 } })
    await area.click({ button: 'right', position: { x: 120, y: 60 } })
    await expect(page.getByRole('menu')).toHaveCount(1)
  })
})

test.describe('menubar', () => {
  test('is one Tab stop; arrows move along it and between open menus', async ({ page }) => {
    const bar = demo(page, 'navigation-menu').getByRole('menubar', { name: 'Editor' })
    const file = bar.getByRole('menuitem', { name: 'File' })
    const edit = bar.getByRole('menuitem', { name: 'Edit' })
    await file.focus()
    await page.keyboard.press('ArrowRight')
    await expect(edit).toBeFocused()
    await expect(edit).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: /Undo/ })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(bar.getByRole('menuitem', { name: 'View' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('menuitemcheckbox', { name: 'Word wrap' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('choosing from a submenu closes the whole bar', async ({ page }) => {
    const bar = demo(page, 'navigation-menu').getByRole('menubar', { name: 'Editor' })
    await bar.getByRole('menuitem', { name: 'File' }).click()
    await page.getByRole('menuitem', { name: 'Export' }).hover()
    await page.getByRole('menuitem', { name: 'Markdown' }).click()
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(readout(page, 'navigation-menu')).toContainText('Export as Markdown')
  })

  test('with one menu open, hovering another opens it instead', async ({ page }) => {
    const bar = demo(page, 'navigation-menu').getByRole('menubar', { name: 'Editor' })
    await bar.getByRole('menuitem', { name: 'File' }).click()
    await bar.getByRole('menuitem', { name: 'View' }).hover()
    await expect(page.getByRole('menuitemcheckbox', { name: 'Word wrap' })).toBeVisible()
    await expect(page.getByRole('menu')).toHaveCount(1)
  })
})

test.describe('navigation menu', () => {
  test('a panel opens on click and on hover, and closes with Escape', async ({ page }) => {
    const nav = demo(page, 'navigation-menu').getByRole('navigation', { name: 'Site' })
    const product = nav.getByRole('button', { name: 'Product' })
    await product.click()
    await expect(nav.getByRole('link', { name: /Charts/ })).toBeVisible()
    await nav.getByRole('button', { name: 'Resources' }).hover()
    await expect(nav.getByRole('link', { name: 'Install guide' })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Charts/ })).toBeHidden()
    await page.keyboard.press('Escape')
    await expect(nav.getByRole('link', { name: 'Install guide' })).toBeHidden()
  })

  test('a panel opened by hovering closes with Escape wherever focus is', async ({ page }) => {
    const nav = demo(page, 'navigation-menu').getByRole('navigation', { name: 'Site' })
    const field = demo(page, 'input').getByLabel('Project name')
    await field.focus()
    await nav.getByRole('button', { name: 'Product' }).hover()
    await expect(nav.getByRole('link', { name: /Charts/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(nav.getByRole('link', { name: /Charts/ })).toBeHidden()
    // Focus was elsewhere and stays there: a hover does not steal it.
    await expect(field).toBeFocused()
  })

  test('Tab goes from the button straight into its panel', async ({ page, browserName }) => {
    const nav = demo(page, 'navigation-menu').getByRole('navigation', { name: 'Site' })
    const product = nav.getByRole('button', { name: 'Product' })
    await product.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press(tabKey(browserName))
    await expect(nav.getByRole('link', { name: /Charts/ })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(product).toBeFocused()
    await expect(product).toHaveAttribute('aria-expanded', 'false')
  })

  test('the current page is marked', async ({ page }) => {
    const nav = demo(page, 'navigation-menu').getByRole('navigation', { name: 'Site' })
    await expect(nav.getByRole('link', { name: 'Components' })).toHaveAttribute('aria-current', 'page')
  })
})
