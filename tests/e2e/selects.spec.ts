import { demo, expect, readout, test } from './helpers'

test.describe('select', () => {
  test('opens on the chosen option; arrows, Home and End move; Enter chooses', async ({ page }) => {
    const card = demo(page, 'select')
    const trigger = card.getByRole('combobox', { name: 'Region' })
    await expect(trigger).toHaveText('Frankfurt (fra1)')
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    const list = page.getByRole('listbox')
    await expect(list.getByRole('option', { name: 'Frankfurt (fra1)' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveText('London (lhr1)')
    await expect(trigger).toBeFocused()
    await expect(readout(page, 'select')).toContainText('region: lhr1')
    await expect(card.locator('input[name="region"]')).toHaveValue('lhr1')
  })

  test('typing jumps to a matching option, and a disabled option is skipped', async ({ page }) => {
    const trigger = demo(page, 'select').getByRole('combobox', { name: 'Region' })
    await trigger.click()
    const list = page.getByRole('listbox')
    await page.keyboard.type('san')
    await expect(list.getByRole('option', { name: 'San Francisco (sfo1)' })).toBeFocused()
    await page.keyboard.press('End')
    // The last option, Montréal, is disabled, so End stops on the one before it.
    await expect(list.getByRole('option', { name: 'San Francisco (sfo1)' })).toBeFocused()
    await expect(list.getByRole('option', { name: /Montréal/ })).toHaveAttribute('aria-disabled', 'true')
  })

  test('Escape and a press outside close without choosing', async ({ page }) => {
    const card = demo(page, 'select')
    const trigger = card.getByRole('combobox', { name: 'Framework' })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
    await trigger.click()
    await card.getByRole('heading', { name: 'Select' }).click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(readout(page, 'select')).toContainText('framework: none')
  })

  test('the list lines up under its trigger', async ({ page }) => {
    const trigger = demo(page, 'select').getByRole('combobox', { name: 'Region' })
    await trigger.click()
    const anchor = (await trigger.boundingBox())!
    const list = (await page.getByRole('listbox').boundingBox())!
    expect(Math.abs(list.x - anchor.x)).toBeLessThan(2)
    expect(list.y).toBeGreaterThanOrEqual(anchor.y + anchor.height)
    expect(list.width).toBeGreaterThanOrEqual(anchor.width - 1)
  })
})

test.describe('combobox', () => {
  test('typing filters; arrows and Enter choose; focus never leaves the input', async ({ page }) => {
    const card = demo(page, 'combobox')
    const input = card.getByRole('combobox', { name: 'Time zone' })
    await input.click()
    const list = page.getByRole('listbox')
    await expect(list.getByRole('option')).toHaveCount(12)
    await input.pressSequentially('o')
    await expect(list.getByRole('option', { name: 'Berlin' })).toBeHidden()
    await expect(list.getByRole('option', { name: 'Tokyo' })).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toHaveValue('Kolkata')
    await expect(readout(page, 'combobox')).toHaveText('timezone: Asia/Kolkata')
    await expect(card.locator('input[name="timezone"]')).toHaveValue('Asia/Kolkata')
  })

  test('shows a message when nothing matches, and Escape puts the text back', async ({ page }) => {
    const input = demo(page, 'combobox').getByRole('combobox', { name: 'Time zone' })
    await input.click()
    await page.getByRole('option', { name: 'Berlin' }).click()
    await expect(input).toHaveValue('Berlin')
    await input.fill('zzz')
    await expect(page.getByText('No city matches.')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(input).toHaveValue('Berlin')
  })

  test('emptying the field and leaving it clears the value', async ({ page }) => {
    const input = demo(page, 'combobox').getByRole('combobox', { name: 'Time zone' })
    await input.click()
    await page.getByRole('option', { name: 'Tokyo' }).click()
    await input.fill('')
    await input.blur()
    await expect(readout(page, 'combobox')).toHaveText('timezone: none')
  })

  test('a disabled option cannot be chosen', async ({ page }) => {
    const input = demo(page, 'combobox').getByRole('combobox', { name: 'Time zone' })
    await input.click()
    await expect(page.getByRole('option', { name: /UTC/ })).toHaveAttribute('aria-disabled', 'true')
    await page.getByRole('option', { name: /UTC/ }).click({ force: true })
    await expect(readout(page, 'combobox')).toHaveText('timezone: none')
  })
})

test.describe('multi-select', () => {
  test('choices become tags, the list stays open, and the limit holds', async ({ page }) => {
    const card = demo(page, 'multi-select')
    const input = card.getByRole('combobox', { name: 'Alert me about' })
    await input.click()
    await input.pressSequentially('lon')
    await page.keyboard.press('Enter')
    await expect(readout(page, 'multi-select')).toContainText('regions: fra1, iad1, lhr1')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(input).toHaveValue('')
    // Three is the maximum here: a fourth cannot be added.
    await page.getByRole('option', { name: 'Singapore', exact: true }).click({ force: true })
    await expect(readout(page, 'multi-select')).toContainText('regions: fra1, iad1, lhr1 ·')
    await expect(card.locator('input[name="regions"]')).toHaveCount(3)
  })

  test('tags are removed by their button, by Backspace, or by pressing the option again', async ({ page }) => {
    const card = demo(page, 'multi-select')
    const input = card.getByRole('combobox', { name: 'Alert me about' })
    await card.getByRole('button', { name: 'Remove Frankfurt' }).click()
    await expect(readout(page, 'multi-select')).toContainText('regions: iad1 ·')
    await expect(input).toBeFocused()
    await page.keyboard.press('Backspace')
    await expect(readout(page, 'multi-select')).toContainText('regions: none')
    await input.click()
    await page.getByRole('option', { name: 'London' }).click()
    await page.getByRole('option', { name: 'London' }).click()
    await expect(readout(page, 'multi-select')).toContainText('regions: none')
  })
})
