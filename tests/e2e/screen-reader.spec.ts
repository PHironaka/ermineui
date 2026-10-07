import type { Locator, Page } from '@playwright/test'
import { demo, expect, test } from './helpers'
import { startScreenReader } from './screen-reader'

// What a screen reader would say, checked with a simulated one (see screen-reader.ts for what that
// does and does not prove). These tests are about words: is each control named, is its state
// spoken, and is anything that changes on screen also announced?

// The simulator works on the page's structure, which is the same in every browser, so one is enough.
test.skip(({ browserName }) => browserName !== 'chromium', 'the simulated screen reader runs in Chromium only')

const today = (() => {
  const now = new Date()
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
})()

type Reader = Awaited<ReturnType<typeof startScreenReader>>

/** Move keyboard focus to something and return what the screen reader says about it. */
async function focus(reader: Reader, locator: Locator): Promise<string> {
  await locator.evaluate((el: HTMLElement) => el.blur())
  await locator.focus()
  return reader.last()
}

/** Waits for an announcement: live regions speak a moment after the change that causes them. */
const announced = (reader: Reader) => expect.poll(async () => (await reader.log()).join('\n'))

async function setup(page: Page) {
  return startScreenReader(page)
}

test.describe('names and states', () => {
  test('checkboxes say whether they are checked, partly checked or disabled', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'checkbox')
    expect(await focus(reader, card.getByLabel('Build succeeds'))).toBe('checkbox, Build succeeds, checked')
    expect(await focus(reader, card.getByLabel('One approving review'))).toBe('checkbox, One approving review, not checked')
    expect(await focus(reader, card.getByLabel('Required checks'))).toBe('checkbox, Required checks, partially checked')
    await reader.act()
    await expect(card.getByLabel('One approving review')).toBeChecked()
    await page.waitForTimeout(60)
    expect(await focus(reader, card.getByLabel('One approving review'))).toBe('checkbox, One approving review, checked')
  })

  test('a switch is announced as a switch, not a checkbox', async ({ page }) => {
    const reader = await setup(page)
    expect(await focus(reader, demo(page, 'switch').getByLabel('Deploy on push to main'))).toBe('switch, Deploy on push to main, checked')
  })

  test('radio buttons say their position in the group', async ({ page }) => {
    const reader = await setup(page)
    expect(await focus(reader, demo(page, 'radio-group').getByLabel(/Pro/))).toBe('radio, Pro — $20 a month, checked, position 2, set size 3')
  })

  test('a field speaks its label, its hint, that it is required, and later its error', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'field')
    expect(await focus(reader, card.getByLabel('Billing email'))).toBe('textbox, Billing email, Invoices are sent here., required')
    await focus(reader, card.getByLabel('Team name'))
    await reader.clear()
    await reader.press('Tab')
    await announced(reader).toContain('assertive: Give the team a name.')
    expect(await focus(reader, card.getByLabel('Team name'))).toBe('textbox, Team name, Give the team a name., invalid, required')
  })

  test('a date picker says the chosen date, not just its label', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'date-picker')
    expect(await focus(reader, card.getByRole('button', { name: 'Launch date' }))).toBe('button, Launch date, Pick a date, not expanded, has popup dialog')
    expect(await focus(reader, card.getByRole('button', { name: 'Review date' }))).toMatch(/^button, Review date, \w+day, \w+ \d+, \d{4}, not expanded, has popup dialog$/)
    await focus(reader, card.getByRole('button', { name: 'Launch date' }))
    await reader.act()
    // Focus lands on today in the calendar, and the day is read as a full date.
    await expect.poll(() => reader.last()).toContain(today)
  })

  test('sliders, progress bars and meters speak their values', async ({ page }) => {
    const reader = await setup(page)
    expect(await focus(reader, demo(page, 'slider').getByLabel('Function memory'))).toBe('slider, Function memory, 1024, orientated horizontally, max value 3008, min value 128')
    const progress = await startScreenReader(page, '#progress .demo-stage')
    expect(await progress.nextUntil('progressbar, Build,')).toBe('progressbar, Build, max value 100, min value 0, current value 35%')
    // No value at all for the one whose amount is unknown, rather than a made-up 0%.
    expect(await progress.nextUntil('progressbar, Waiting')).toBe('progressbar, Waiting for a build machine, max value 100, min value 0')
  })

  test('tabs, tree items, steps and pages say where they are and what state they are in', async ({ page }) => {
    const reader = await setup(page)
    expect(await focus(reader, demo(page, 'tabs').getByRole('tab', { name: 'Overview' }))).toBe('tab, Overview, selected, 1 control, position 1, set size 4')
    expect(await focus(reader, demo(page, 'tree').getByRole('treeitem', { name: 'pages' }))).toBe('treeitem, pages, not expanded, level 2, position 1, not selected, set size 3')
    expect(await focus(reader, demo(page, 'pagination').getByRole('button', { name: 'Page 1', exact: true }))).toBe('button, Page 1, current page')
    expect(await focus(reader, demo(page, 'stepper').getByRole('button', { name: /Cart/ }))).toBe('button, Completed: Cart')
    expect(await focus(reader, demo(page, 'navigation-menu').getByRole('link', { name: 'Components' }))).toBe('link, Components, current page')
  })

  test('toggle buttons say pressed or not, and a toggle group in single mode reads as radio buttons', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'toggle-group')
    expect(await focus(reader, card.getByRole('radio', { name: '30 days' }))).toBe('radio, 30 days, checked, position 2, set size 4')
    expect(await focus(reader, card.getByRole('button', { name: 'Production' }))).toBe('button, Production, pressed')
  })
})

test.describe('overlays', () => {
  test('a dialog announces its title and description, and focus comes back to the button after', async ({ page }) => {
    const reader = await setup(page)
    const trigger = demo(page, 'dialog').getByRole('button', { name: 'Invite a teammate' })
    expect(await focus(reader, trigger)).toBe('button, Invite a teammate, not expanded, has popup dialog')
    await reader.clear()
    await reader.act()
    await announced(reader).toContain('dialog, Invite a teammate, They get an email with a link to join northwind-storefront., modal')
    await expect.poll(() => reader.last()).toBe('textbox, Email, placeholder teammate@example.com')
    await reader.press('Escape')
    await expect.poll(() => reader.last()).toBe('button, Invite a teammate, not expanded, has popup dialog')
  })

  test('an alert dialog is announced as one, and starts on Cancel', async ({ page }) => {
    const reader = await setup(page)
    await focus(reader, demo(page, 'alert-dialog').getByRole('button', { name: 'Delete project' }))
    await reader.clear()
    await reader.act()
    await announced(reader).toMatch(/alertdialog, Delete northwind-storefront\?, This removes the project/)
    await announced(reader).toContain('button, Cancel')
    await expect(page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' })).toBeFocused()
  })

  test('a select reads the chosen option and each option’s position', async ({ page }) => {
    const reader = await setup(page)
    const trigger = demo(page, 'select').getByRole('combobox', { name: 'Region' })
    expect(await focus(reader, trigger)).toBe('combobox, Region, has popup listbox, not expanded, 1 control')
    await reader.press('ArrowDown')
    await expect.poll(() => reader.last()).toBe('option, Frankfurt (fra1), selected, position 1, set size 6')
    await reader.press('ArrowDown')
    await expect.poll(() => reader.last()).toBe('option, London (lhr1), not selected, position 2, set size 6')
  })

  test('a combobox keeps focus in the field and names the highlighted option', async ({ page }) => {
    const reader = await setup(page)
    await focus(reader, demo(page, 'combobox').getByRole('combobox', { name: 'Time zone' }))
    await reader.press('ArrowDown')
    await expect.poll(() => reader.last()).toContain('expanded, active descendant Auckland')
    await reader.press('ArrowDown')
    await expect.poll(() => reader.last()).toContain('active descendant Berlin')
  })

  test('menu items say their kind and state, and a checkbox item updates when toggled', async ({ page }) => {
    const reader = await setup(page)
    expect(await focus(reader, demo(page, 'dropdown-menu').getByRole('button', { name: 'View options' }))).toBe('button, View options, not expanded, has popup menu')
    await reader.press('ArrowDown')
    await expect.poll(() => reader.last()).toBe('menuitemcheckbox, Preview deployments, checked, position 1, set size 2')
    await reader.press('Enter')
    expect(await focus(reader, page.getByRole('menuitemcheckbox', { name: 'Preview deployments' }))).toBe('menuitemcheckbox, Preview deployments, not checked, position 1, set size 2')
    expect(await focus(reader, page.getByRole('menuitem', { name: 'Export' }))).toContain('menuitem, Export, not expanded, has popup menu')
  })
})

test.describe('announcements', () => {
  test('a toast is announced politely, without moving focus', async ({ page }) => {
    const reader = await setup(page)
    const button = demo(page, 'toast').getByRole('button', { name: 'Default', exact: true })
    await focus(reader, button)
    await reader.clear()
    await reader.act()
    await announced(reader).toContain('polite: Settings saved')
    await expect(button).toBeFocused()
  })

  test('rejected tags and rejected files are announced with the reason', async ({ page }) => {
    const reader = await setup(page)
    const tags = demo(page, 'input-group').getByLabel('Send the report to')
    await tags.focus()
    await page.keyboard.type('nope')
    await reader.clear()
    await reader.press('Enter')
    await announced(reader).toContain('assertive: nope is not an email address.')

    await reader.clear()
    await demo(page, 'file-upload').getByLabel('Import files').setInputFiles({ name: 'huge.json', mimeType: 'application/json', buffer: Buffer.alloc(3 * 1024 * 1024) })
    await announced(reader).toContain('assertive: huge.json is larger than 2 MB.')
  })

  test('a chart says how to read it, and announces the values at each position', async ({ page }) => {
    const reader = await setup(page)
    const plot = demo(page, 'chart').getByRole('img', { name: /Weekly requests/ })
    expect(await focus(reader, plot)).toBe('chart, Weekly requests, and how many were served from cache. Use the left and right arrow keys to read values.')
    await reader.clear()
    await reader.press('End')
    await announced(reader).toContain('polite: Sep 28: Requests 66,800, Served from cache 52,300')
    await reader.clear()
    await reader.press('ArrowLeft')
    await announced(reader).toContain('polite: Sep 21: Requests 59,200, Served from cache 47,900')
  })

  test('sorting a table is confirmed aloud and shown on the column heading', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'data-table')
    await focus(reader, card.getByRole('columnheader', { name: 'Build time' }).getByRole('button'))
    await reader.clear()
    await reader.act()
    await announced(reader).toContain('polite: Sorted by Build time, ascending.')
    await expect(card.getByRole('columnheader', { name: 'Build time' })).toHaveAttribute('aria-sort', 'ascending')
    await reader.clear()
    await reader.act()
    await announced(reader).toContain('polite: Sorted by Build time, descending.')
    await reader.act()
    await announced(reader).toContain('polite: Sorting removed.')
  })

  test('moving a kanban card is announced, and the instructions are given once for the board', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'kanban')
    await expect(card.getByRole('group', { name: 'Sprint board' })).toHaveAccessibleDescription('To move a card, focus it, hold Alt and press an arrow key.')
    // Not repeated on every card.
    await expect(card.getByText('Search filters', { exact: true })).not.toHaveAttribute('aria-describedby')
    await card.getByText('Search filters', { exact: true }).focus()
    await reader.clear()
    await reader.press('Alt+ArrowRight')
    await announced(reader).toContain('polite: Search filters moved to In progress, position 2 of 2.')
  })
})

test.describe('changes that happen without focus moving', () => {
  test('typing in a combobox says how many options are left', async ({ page }) => {
    const reader = await setup(page)
    const input = demo(page, 'combobox').getByRole('combobox', { name: 'Time zone' })
    await input.click()
    await reader.clear()
    await input.pressSequentially('to')
    await announced(reader).toContain('polite: 1 result')
    await input.pressSequentially('zz')
    await announced(reader).toContain('polite: No results')
  })

  test('a multi-select says what was added and removed, and counts results while typing', async ({ page }) => {
    const reader = await setup(page)
    const card = demo(page, 'multi-select')
    const input = card.getByRole('combobox', { name: 'Alert me about' })
    await input.click()
    await reader.clear()
    await input.pressSequentially('lon')
    await announced(reader).toContain('polite: 1 result')
    await page.keyboard.press('Enter')
    await announced(reader).toContain('polite: London added')
    await card.getByRole('button', { name: 'Remove Frankfurt' }).click()
    await announced(reader).toContain('polite: Frankfurt removed')
    await page.keyboard.press('Backspace')
    await announced(reader).toContain('polite: London removed')
  })

  test('the command palette counts results as you type', async ({ page }) => {
    const reader = await setup(page)
    await page.keyboard.press('ControlOrMeta+k')
    const search = page.getByRole('dialog', { name: 'Command palette' }).getByRole('combobox')
    await reader.clear()
    await search.fill('deploy')
    await announced(reader).toMatch(/polite: \d+ results?/)
    await search.fill('qqq')
    await announced(reader).toContain('polite: No results')
  })

  test('adding and removing tags and files is confirmed aloud', async ({ page }) => {
    const reader = await setup(page)
    const tags = demo(page, 'input-group').getByLabel('Send the report to')
    await tags.click()
    await page.keyboard.type('tomas@northwind.com')
    await reader.clear()
    await page.keyboard.press('Enter')
    await announced(reader).toContain('polite: tomas@northwind.com added')
    await page.keyboard.press('Backspace')
    await announced(reader).toContain('polite: tomas@northwind.com removed')

    await reader.clear()
    const upload = demo(page, 'file-upload')
    await upload.getByLabel('Import files').setInputFiles({ name: 'users.csv', mimeType: 'text/csv', buffer: Buffer.alloc(100) })
    await announced(reader).toContain('polite: users.csv added')
    await upload.getByRole('button', { name: 'Remove users.csv' }).click()
    await announced(reader).toContain('polite: users.csv removed')
  })

  test('a carousel says which slide is showing when its buttons are used', async ({ page }) => {
    const reader = await setup(page)
    const carousel = demo(page, 'carousel').getByRole('region', { name: 'Recent releases' })
    await reader.clear()
    await carousel.getByRole('button', { name: 'Next slide' }).click()
    await announced(reader).toContain('polite: Slide 2 of 4')
    await carousel.getByRole('button', { name: 'Go to slide 4 of 4' }).click()
    await announced(reader).toContain('polite: Slide 4 of 4')
  })

  test('a QR code that cannot be drawn says why', async ({ page }) => {
    const reader = await setup(page)
    await reader.clear()
    await demo(page, 'share-button').getByRole('textbox', { name: 'Link' }).fill('x'.repeat(3000))
    await announced(reader).toContain('assertive: This is too much text for a QR code.')
  })
})

test.describe('reading order', () => {
  test('a table is read with its caption and headings before its rows', async ({ page }) => {
    const reader = await startScreenReader(page, '#table .demo-stage')
    const heard: string[] = []
    for (let step = 0; step < 12; step++) heard.push(await reader.next())
    const text = heard.join('\n')
    expect(text.indexOf('caption, Invoices for the last four months.')).toBeGreaterThanOrEqual(0)
    expect(text.indexOf('columnheader, Invoice')).toBeLessThan(text.indexOf('rowheader, INV-0912'))
  })

  test('closed accordion sections and collapsed content are skipped entirely', async ({ page }) => {
    const reader = await startScreenReader(page, '#accordion .demo-stage')
    const heard: string[] = []
    for (let step = 0; step < 12; step++) heard.push(await reader.next())
    const text = heard.join('\n')
    expect(text).toContain('button, How do I add a custom domain?, 1 control, expanded')
    expect(text).toContain("Open the project's Domains tab")
    expect(text).toContain('button, Can I roll back a deployment?, 1 control, not expanded')
    expect(text).not.toContain('Every deployment is kept')
  })

  test('a kanban column is named by its title, with the count read as "3 cards"', async ({ page }) => {
    const reader = await startScreenReader(page, '#kanban .demo-stage')
    expect(await reader.nextUntil('region,')).toBe('region, To do')
    expect(await reader.next()).toBe('heading, To do 3 cards, level 3')
  })
})
