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
    const original = await columnValues(card, 3)
    const heading = card.getByRole('columnheader', { name: 'Build time' })
    await heading.getByRole('button').click()
    await expect(heading).toHaveAttribute('aria-sort', 'ascending')
    const ascending = (await columnValues(card, 6)).map((text) => Number.parseInt(text))
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b))
    await heading.getByRole('button').click()
    await expect(heading).toHaveAttribute('aria-sort', 'descending')
    const descending = (await columnValues(card, 6)).map((text) => Number.parseInt(text))
    expect(descending).toEqual([...descending].sort((a, b) => b - a))
    await heading.getByRole('button').click()
    await expect(heading).toHaveAttribute('aria-sort', 'none')
    expect(await columnValues(card, 3)).toEqual(original)
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

test.describe('data table: search, filters, columns, details, bulk actions', () => {
  const summary = (card: ReturnType<typeof demo>) => card.getByRole('status').first()

  test('the search field looks through every column and says when nothing matches', async ({ page }) => {
    const card = demo(page, 'data-table')
    const search = card.getByRole('searchbox', { name: 'Search Deployments' })
    await search.fill('ines')
    await expect(summary(card)).toHaveText(/^1–\d of \d+$/)
    const authors = await card.locator('tbody tr td:last-child').allTextContents()
    expect(authors.length).toBeGreaterThan(0)
    expect(authors.every((author) => author.includes('Ines'))).toBe(true)
    await search.fill('no such deployment')
    await expect(card.getByRole('cell', { name: 'No results.' })).toBeVisible()
    await expect(summary(card)).toHaveText('')
    await search.press('Escape')
    await expect(summary(card)).toHaveText('1–6 of 23')
  })

  test('the filter bar narrows the rows, and each choice can be taken off again', async ({ page }) => {
    const card = demo(page, 'data-table')
    const bar = card.getByRole('group', { name: 'Filter deployments' })
    await card.getByRole('button', { name: 'Page 3' }).click()
    await bar.getByRole('button', { name: 'Status' }).click()
    await page.getByRole('menuitemcheckbox', { name: /Failed/ }).click()
    // Still open, so several can be ticked in one go.
    await expect(page.getByRole('menuitemcheckbox', { name: /Failed/ })).toHaveAttribute('aria-checked', 'true')
    await page.keyboard.press('Escape')
    // Filtering goes back to the first page of what is left.
    await expect(summary(card)).toHaveText('1–3 of 3')
    await expect(card.locator('tbody tr')).toHaveCount(3)
    await expect(bar.getByRole('button', { name: 'Status 1 chosen' })).toBeVisible()
    await expect(bar.getByRole('list', { name: 'Filters in use' }).getByRole('listitem')).toHaveText(['Status: Failed'])
    await bar.getByRole('button', { name: 'Remove filter Status: Failed' }).click()
    await expect(summary(card)).toHaveText('1–6 of 23')
    await expect(bar.getByRole('button', { name: 'Clear all' })).toHaveCount(0)
  })

  test('columns can be hidden and brought back', async ({ page }) => {
    const card = demo(page, 'data-table')
    await card.getByRole('button', { name: 'Columns' }).click()
    await page.getByRole('menuitemcheckbox', { name: 'Branch' }).click()
    await expect(card.getByRole('columnheader', { name: 'Branch' })).toHaveCount(0)
    await page.getByRole('menuitemcheckbox', { name: 'Branch' }).click()
    await expect(card.getByRole('columnheader', { name: 'Branch' })).toBeVisible()
  })

  test('a row opens to show more, and closes again', async ({ page }) => {
    const card = demo(page, 'data-table')
    const toggle = card.getByRole('button', { name: /^Details for row/ }).first()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(card.locator('tbody tr').nth(1)).toContainText('Deployment dpl_')
    await expect(card.locator(`[id="${await toggle.getAttribute('aria-controls')}"]`)).toBeVisible()
    await toggle.click()
    await expect(card.locator('tbody tr')).toHaveCount(6)
  })

  test('ticked rows get a bar of actions, which can clear the selection', async ({ page }) => {
    const card = demo(page, 'data-table')
    const bulk = card.getByRole('group', { name: 'Actions for the selected rows' })
    await expect(bulk).toHaveCount(0)
    await card.locator('tbody').getByRole('checkbox').nth(0).check()
    await card.locator('tbody').getByRole('checkbox').nth(1).check()
    await expect(bulk).toContainText('2 selected')
    await bulk.getByRole('button', { name: 'Redeploy' }).click()
    await expect(readout(page, 'data-table')).toHaveText('bulk action: redeployed 2')
    await expect(bulk).toHaveCount(0)
    await expect(card.locator('tbody').getByRole('checkbox').first()).not.toBeChecked()
  })
})

test.describe('filter bar with a table fed by a server', () => {
  test('the table shows the rows it is given and asks for more by page, sort and filter', async ({ page }) => {
    const card = demo(page, 'filter-bar')
    const summary = card.getByRole('status').first()
    const table = card.locator('.er-data-table')
    await expect(summary).toHaveText('1–8 of 23')
    await expect(table).not.toHaveAttribute('aria-busy')

    await card.getByRole('button', { name: 'Page 3' }).click()
    await expect(table).toHaveAttribute('aria-busy', 'true')
    await expect(summary).toHaveText('17–23 of 23')
    await expect(card.locator('tbody tr')).toHaveCount(7)

    await card.getByRole('group', { name: 'Filter server deployments' }).getByRole('button', { name: 'Status' }).click()
    await page.getByRole('menuitemcheckbox', { name: /Ready/ }).click()
    await page.keyboard.press('Escape')
    // A new filter starts again from the first page; the count is the server's, not the eight rows in hand.
    await expect(summary).toHaveText('1–8 of 19')
    await expect(card.getByRole('button', { name: 'Page 3' })).toBeVisible()
    await expect(card.getByRole('button', { name: 'Page 4' })).toHaveCount(0)

    await card.getByRole('columnheader', { name: 'Author' }).getByRole('button').click()
    await expect(card.getByRole('columnheader', { name: 'Author' })).toHaveAttribute('aria-sort', 'ascending')
    await expect(card.locator('tbody tr td:last-child').first()).toHaveText('Ines Kovač')
    await card.getByRole('searchbox', { name: 'Search server deployments' }).fill('no such thing')
    await expect(card.getByRole('cell', { name: 'No results.' })).toBeVisible()
  })

  test('the headings stay in view while the rows scroll', async ({ page }) => {
    const card = demo(page, 'filter-bar')
    await expect(card.locator('tbody tr')).toHaveCount(8)
    const gap = () =>
      card.locator('.er-table-wrap').evaluate((wrap) => {
        wrap.scrollTop = 120
        return [wrap.scrollTop, Math.round(wrap.querySelector('th')!.getBoundingClientRect().top - wrap.getBoundingClientRect().top)]
      })
    const [scrolled, offset] = await gap()
    expect(scrolled).toBeGreaterThan(0)
    expect(offset).toBeLessThanOrEqual(1)
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
