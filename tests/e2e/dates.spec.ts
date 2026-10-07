import { demo, expect, readout, test } from './helpers'

// Dates are worked out from "now" in the same way the components do it: local date, as YYYY-MM-DD.
const iso = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10)
const today = iso(new Date())
const addDays = (date: string, days: number) => new Date(new Date(date).getTime() + days * 86_400_000).toISOString().slice(0, 10)
const longDate = (date: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(date))

test.describe('date picker', () => {
  test('opens on today; arrow keys move by day and week; Enter chooses', async ({ page }) => {
    const card = demo(page, 'date-picker')
    const trigger = card.getByRole('button', { name: 'Launch date' })
    await expect(trigger).toHaveText('Pick a date')
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Choose a date' })
    await expect(dialog.getByRole('button', { name: longDate(today) })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    const target = addDays(today, 8)
    await expect(dialog.getByRole('button', { name: longDate(target) })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(readout(page, 'date-picker')).toContainText(`launch: ${target}`)
    await expect(card.locator('input[name="launch"]')).toHaveValue(target)
  })

  test('Page Down changes month and keeps focus in the grid; reopening starts on the chosen day', async ({ page }) => {
    const trigger = demo(page, 'date-picker').getByRole('button', { name: 'Launch date' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Choose a date' })
    const title = dialog.locator('.er-calendar-title')
    const before = await title.textContent()
    await page.keyboard.press('PageDown')
    await expect(title).not.toHaveText(before!)
    await expect(dialog.locator('.er-calendar-day:focus')).toHaveCount(1)
    await page.keyboard.press('Enter')
    await trigger.click()
    await expect(dialog.locator('.er-calendar-day:focus')).toHaveAttribute('data-selected', '')
  })

  test('respects min, max and disabled days', async ({ page }) => {
    await demo(page, 'date-picker').getByRole('button', { name: 'Review date' }).click()
    const dialog = page.getByRole('dialog', { name: 'Choose a date' })
    await expect(dialog.getByRole('columnheader').first()).toHaveText('Mon')
    // Hold Page Up: the keyboard stops at the earliest allowed day, which is today.
    for (let press = 0; press < 4; press++) await page.keyboard.press('PageUp')
    await expect(dialog.getByRole('button', { name: longDate(today) })).toBeFocused()
    await expect(dialog.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: longDate(addDays(today, -1)) })).toHaveAttribute('aria-disabled', 'true')
    for (let press = 0; press < 4; press++) await page.keyboard.press('PageDown')
    await expect(dialog.getByRole('button', { name: longDate(addDays(today, 60)) })).toBeFocused()
    await expect(dialog.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  test('Escape closes without choosing', async ({ page }) => {
    const trigger = demo(page, 'date-picker').getByRole('button', { name: 'Launch date' })
    await trigger.click()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Choose a date' })).toBeHidden()
    await expect(readout(page, 'date-picker')).toContainText('launch: none')
  })
})

test.describe('calendar', () => {
  test('month buttons move the view, and a day from the next month can be chosen', async ({ page }) => {
    const card = demo(page, 'calendar')
    const title = card.locator('.er-calendar-title')
    const before = await title.textContent()
    await card.getByRole('button', { name: 'Next month' }).click()
    await expect(title).not.toHaveText(before!)
    const outside = card.locator('.er-calendar-day[data-outside]').first()
    const date = await outside.getAttribute('data-date')
    await outside.click()
    await expect(readout(page, 'calendar')).toHaveText(date!)
    await expect(card.locator('.er-calendar-day[data-selected]')).toBeFocused()
  })
})

test.describe('date range picker', () => {
  test('two presses make a range in either order, and hovering previews it', async ({ page }) => {
    const card = demo(page, 'date-range-picker')
    const trigger = card.getByRole('button', { name: 'Report period' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Choose a date range' })
    await expect(dialog.getByText('Choose the first day.')).toBeVisible()
    // Step back a week by keyboard so both ends are on screen whatever today is.
    await page.keyboard.press('ArrowUp')
    const end = addDays(today, -7)
    const start = addDays(today, -10)
    await page.keyboard.press('Enter')
    await expect(dialog.getByText('Now choose the last day.')).toBeVisible()
    for (let press = 0; press < 3; press++) await page.keyboard.press('ArrowLeft')
    await expect(dialog.locator('.er-calendar-day[data-in-range]')).toHaveCount(4)
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(readout(page, 'date-range-picker')).toHaveText(`${start} to ${end}`)
    await expect(card.locator('input[name="from"]')).toHaveValue(start)
    await expect(card.locator('input[name="to"]')).toHaveValue(end)
  })

  test('a preset fills the range and is marked when reopened', async ({ page }) => {
    const trigger = demo(page, 'date-range-picker').getByRole('button', { name: 'Report period' })
    await trigger.click()
    await page.getByRole('button', { name: 'Last 7 days' }).click()
    await expect(readout(page, 'date-range-picker')).toHaveText(`${addDays(today, -6)} to ${today}`)
    await trigger.click()
    await expect(page.getByRole('button', { name: 'Last 7 days' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('Escape halfway through keeps the previous range', async ({ page }) => {
    const trigger = demo(page, 'date-range-picker').getByRole('button', { name: 'Report period' })
    await trigger.click()
    await page.getByRole('button', { name: 'Last 30 days' }).click()
    await trigger.click()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape')
    await expect(readout(page, 'date-range-picker')).toHaveText(`${addDays(today, -29)} to ${today}`)
  })
})

test.describe('time picker and date-time picker', () => {
  test('lists times at its step between its limits', async ({ page }) => {
    const card = demo(page, 'time-picker')
    const trigger = card.getByRole('combobox', { name: 'Daily stand-up' })
    await expect(trigger).toHaveText('9:30 AM')
    await trigger.click()
    const list = page.getByRole('listbox')
    await expect(list.getByRole('option')).toHaveCount(49)
    await expect(list.getByRole('option').first()).toHaveText('7:00 AM')
    await expect(list.getByRole('option').last()).toHaveText('7:00 PM')
    await list.getByRole('option', { name: '2:15 PM', exact: true }).click()
    await expect(readout(page, 'time-picker')).toContainText('stand-up: 14:15')
    await expect(card.locator('input[name="standup"]')).toHaveValue('14:15')
  })

  test('the combined value appears once both a date and a time are chosen', async ({ page }) => {
    const card = demo(page, 'time-picker')
    const group = card.getByRole('group', { name: 'Date and time' })
    await group.getByRole('combobox', { name: 'Time' }).click()
    await page.getByRole('option', { name: '10:30 PM' }).click()
    await expect(readout(page, 'time-picker')).toContainText('maintenance: not set')
    await group.getByRole('button', { name: 'Maintenance starts' }).click()
    await page.keyboard.press('Enter')
    await expect(readout(page, 'time-picker')).toContainText(`maintenance: ${today}T22:30`)
  })
})

test.describe('event calendar', () => {
  test('lists events on their days, folds extras, and reports presses', async ({ page }) => {
    const card = demo(page, 'event-calendar')
    const first = `${today.slice(0, 8)}01`
    const busy = card.getByRole('cell').filter({ has: page.getByRole('button', { name: longDate(addDays(first, 13)), exact: true }) })
    await expect(busy.locator('.er-event-calendar-event')).toHaveCount(3)
    await busy.getByRole('button', { name: /2 more on/ }).click()
    await expect(readout(page, 'event-calendar')).toHaveText(`Day: ${addDays(first, 13)}`)
    await card.getByRole('button', { name: 'Release 2.5' }).click()
    await expect(readout(page, 'event-calendar')).toHaveText('Event: Release 2.5')
  })

  test('a multi-day event shows on each of its days', async ({ page }) => {
    await expect(demo(page, 'event-calendar').getByRole('button', { name: 'On-call: Ines' })).toHaveCount(4)
  })

  test('month buttons move the view and Today comes back', async ({ page }) => {
    const card = demo(page, 'event-calendar')
    const title = card.getByRole('heading', { level: 3 })
    const current = await title.textContent()
    await card.getByRole('button', { name: 'Next month' }).click()
    await expect(title).not.toHaveText(current!)
    await card.getByRole('button', { name: 'Today' }).click()
    await expect(title).toHaveText(current!)
  })
})
