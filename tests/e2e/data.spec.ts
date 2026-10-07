import { demo, expect, readout, test } from './helpers'

test.describe('table', () => {
  test('is a real table with row and column headings', async ({ page }) => {
    const table = demo(page, 'table').getByRole('table')
    await expect(table.getByRole('columnheader')).toHaveCount(4)
    await expect(table.getByRole('rowheader')).toHaveCount(4)
    await expect(table.getByRole('row').last()).toContainText('$94.50')
  })
})

test.describe('data table', () => {
  const columnValues = async (card: ReturnType<typeof demo>, index: number) =>
    card.locator(`tbody tr td:nth-child(${index})`).allTextContents()

  test('sorts ascending, descending, then back to the original order', async ({ page }) => {
    const card = demo(page, 'data-table')
    const original = await columnValues(card, 2)
    const heading = card.getByRole('columnheader', { name: 'Build time' })
    await heading.getByRole('button').click()
    await expect(heading).toHaveAttribute('aria-sort', 'ascending')
    const ascending = (await columnValues(card, 5)).map((text) => Number.parseInt(text))
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b))
    await heading.getByRole('button').click()
    await expect(heading).toHaveAttribute('aria-sort', 'descending')
    const descending = (await columnValues(card, 5)).map((text) => Number.parseInt(text))
    expect(descending).toEqual([...descending].sort((a, b) => b - a))
    await heading.getByRole('button').click()
    await expect(heading).toHaveAttribute('aria-sort', 'none')
    expect(await columnValues(card, 2)).toEqual(original)
  })

  test('pages through the rows and reports where it is', async ({ page }) => {
    const card = demo(page, 'data-table')
    await expect(card.getByRole('status').first()).toHaveText('1–6 of 23')
    await card.getByRole('button', { name: 'Page 4' }).click()
    await expect(card.getByRole('status').first()).toHaveText('19–23 of 23')
    await expect(card.locator('tbody tr')).toHaveCount(5)
    await expect(card.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  test('selection survives paging, and the heading box selects a page', async ({ page }) => {
    const card = demo(page, 'data-table')
    const all = card.getByRole('checkbox', { name: 'Select every row on this page' })
    await card.locator('tbody').getByRole('checkbox').first().check()
    await expect(all).toHaveJSProperty('indeterminate', true)
    await expect(card.getByRole('status').first()).toHaveText('1 of 23 selected')
    await all.check()
    await expect(card.getByRole('status').first()).toHaveText('6 of 23 selected')
    await card.getByRole('button', { name: 'Next page' }).click()
    await expect(all).not.toBeChecked()
    await expect(card.getByRole('status').first()).toHaveText('6 of 23 selected')
    await card.getByRole('button', { name: 'Previous page' }).click()
    await expect(card.locator('tbody tr[aria-selected="true"]')).toHaveCount(6)
  })
})

test.describe('pagination and breadcrumb', () => {
  test('shortens long ranges and marks the current page', async ({ page }) => {
    const nav = demo(page, 'pagination').getByRole('navigation', { name: 'Build log pages' })
    await expect(nav.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await nav.getByRole('button', { name: 'Page 5', exact: true }).click()
    await nav.getByRole('button', { name: 'Next page' }).click()
    await nav.getByRole('button', { name: 'Next page' }).click()
    await expect(readout(page, 'pagination')).toHaveText('page 7 of 24')
    await expect(nav.getByRole('button', { name: /^Page / })).toHaveText(['1', '6', '7', '8', '24'])
    await nav.getByRole('button', { name: 'Page 24', exact: true }).click()
    await expect(nav.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  test('the breadcrumb is a list of links ending in the current page', async ({ page }) => {
    const trail = demo(page, 'pagination').getByRole('navigation', { name: 'Breadcrumb' })
    await expect(trail.getByRole('link')).toHaveCount(3)
    await expect(trail.getByText('Build logs')).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('tree', () => {
  test('arrow keys move, open and close; Enter selects; typing jumps', async ({ page }) => {
    const tree = demo(page, 'tree').getByRole('tree', { name: 'Project files' })
    await tree.getByRole('treeitem', { name: 'app', exact: true }).focus()
    await page.keyboard.press('ArrowDown')
    const pages = tree.getByRole('treeitem', { name: 'pages' })
    await expect(pages).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(pages).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('ArrowRight')
    await expect(tree.getByRole('treeitem', { name: 'index.vue' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(readout(page, 'tree')).toHaveText('app/pages/index.vue')
    await page.keyboard.press('ArrowLeft')
    await expect(pages).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(pages).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.type('n')
    await expect(tree.getByRole('treeitem', { name: 'nuxt.config.ts' })).toBeFocused()
  })

  test('levels are announced, and a disabled node is skipped', async ({ page }) => {
    const tree = demo(page, 'tree').getByRole('tree', { name: 'Project files' })
    await expect(tree.getByRole('treeitem', { name: 'app', exact: true })).toHaveAttribute('aria-level', '1')
    await expect(tree.getByRole('treeitem', { name: 'app.vue' })).toHaveAttribute('aria-level', '2')
    await tree.getByRole('treeitem', { name: 'nuxt.config.ts' }).focus()
    await page.keyboard.press('ArrowUp')
    await expect(tree.getByRole('treeitem', { name: 'server' })).toBeFocused()
  })
})

test.describe('kanban', () => {
  test('Alt and an arrow key moves a card, keeps it focused, and announces the move', async ({ page }) => {
    const card = demo(page, 'kanban')
    const board = card.getByRole('group', { name: 'Sprint board' })
    const item = board.getByText('Search filters', { exact: true })
    await item.focus()
    await page.keyboard.press('Alt+ArrowRight')
    await expect(readout(page, 'kanban')).toHaveText('To do: 2 · In progress: 2 · In review: 2 · Done: 0')
    await expect(board.getByRole('status')).toHaveText('Search filters moved to In progress, position 2 of 2.')
    await expect(item).toBeFocused()
    await page.keyboard.press('Alt+ArrowUp')
    await expect(board.getByRole('region', { name: /In progress/ }).getByRole('listitem').first()).toHaveText('Search filters')
  })
})

test.describe('virtual list', () => {
  test('draws a screenful of ten thousand rows and keeps up with scrolling', async ({ page }) => {
    const list = demo(page, 'virtual-list').getByRole('list', { name: 'Request log' })
    expect(await list.getByRole('listitem').count()).toBeLessThan(30)
    await expect(list.getByRole('listitem').first()).toHaveAttribute('aria-setsize', '10000')
    await list.evaluate((el) => el.scrollTo({ top: 140_000 }))
    await expect(list.locator('[aria-posinset="5001"]')).toBeVisible()
    expect(await list.getByRole('listitem').count()).toBeLessThan(30)
  })
})

test.describe('stat', () => {
  test('writes the direction as a sign and an arrow, and marks good and bad', async ({ page }) => {
    const card = demo(page, 'stat')
    await expect(card.getByText('1.8M')).toBeVisible()
    await expect(card.locator('.er-stat-delta').nth(0)).toHaveAttribute('data-tone', 'good')
    await expect(card.locator('.er-stat-delta').nth(0)).toContainText('+12.4%')
    // Error rate going down is good news; build time going up is bad news.
    await expect(card.locator('.er-stat-delta').nth(1)).toHaveAttribute('data-tone', 'good')
    await expect(card.locator('.er-stat-delta').nth(2)).toHaveAttribute('data-tone', 'bad')
  })
})
