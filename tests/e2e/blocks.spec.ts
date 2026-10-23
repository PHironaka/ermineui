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

test.describe('image fan', () => {
  test('pictures overlap, tilt outward from the middle, and the middle one is on top', async ({ page }) => {
    const items = demo(page, 'image-fan').locator('.er-image-fan-item')
    await expect(items).toHaveCount(5)
    const boxes = await items.evaluateAll((list) =>
      list.map((item) => ({ left: item.getBoundingClientRect().left, right: item.getBoundingClientRect().right, layer: Number(getComputedStyle(item).zIndex), transform: getComputedStyle(item).transform })),
    )
    for (let index = 1; index < boxes.length; index++) {
      expect(boxes[index].left).toBeGreaterThan(boxes[index - 1].left)
      expect(boxes[index].left).toBeLessThan(boxes[index - 1].right)
    }
    expect(boxes.map((box) => box.layer)).toEqual([3, 4, 5, 4, 3])
    // The middle picture is level: its matrix has no rotation in it.
    expect(boxes[2].transform).toBe('matrix(1, 0, 0, 1, 0, 0)')
    expect(boxes[0].transform).not.toBe(boxes[4].transform)
  })

  test('a picture comes to the front when pointed at or focused, and each link is named by its picture', async ({ page }) => {
    const card = demo(page, 'image-fan')
    const first = card.locator('.er-image-fan-item').first()
    await first.hover({ position: { x: 10, y: 40 } })
    await expect(first).toHaveCSS('z-index', '99')
    await card.getByRole('link', { name: 'Notes home page' }).focus()
    await expect(card.locator('.er-image-fan-item').last()).toHaveCSS('z-index', '99')
    await expect(card.getByRole('link')).toHaveCount(5)
  })

  test('the picture pointed at straightens and lifts, the others slide clear of it, and its name shows underneath', async ({ page }) => {
    const card = demo(page, 'image-fan')
    const items = card.locator('.er-image-fan-item')
    const caption = card.locator('.er-image-fan-caption')
    await expect(caption).toHaveText('')
    await expect(caption).toHaveAttribute('aria-hidden', 'true')

    const before = await items.first().boundingBox()
    await items.first().hover({ position: { x: 10, y: 40 } })
    await expect(caption).toHaveText('Journal')
    // Animations are off in these tests, so everything is already in its new place.
    await expect(items.first()).toHaveAttribute('data-state', 'active')
    const after = await items.first().boundingBox()
    expect(after!.x).toBeGreaterThan(before!.x - 1) // it stays where it was, only level now
    expect(after!.y).toBeLessThan(before!.y) // and higher
    const boxes = await items.evaluateAll((list) => list.map((item) => item.getBoundingClientRect()))
    // Every other picture is now clear of it, to the right, in order.
    for (let index = 1; index < boxes.length; index++) expect(boxes[index]!.left).toBeGreaterThan(boxes[0]!.right - 12)
    for (let index = 2; index < boxes.length; index++) expect(boxes[index]!.left).toBeGreaterThan(boxes[index - 1]!.left)

    await page.mouse.move(0, 0)
    await expect(caption).toHaveText('')
    await expect(items.first()).not.toHaveAttribute('data-state', 'active')
    await card.getByRole('link', { name: 'Archive home page' }).focus()
    await expect(caption).toHaveText('Archive')
  })
})

test.describe('sticky scroll', () => {
  const centre = (locator: import('@playwright/test').Locator) => locator.evaluate((element) => element.scrollIntoView({ block: 'center' }))

  test('the media column stays put and changes to each step as its copy reaches the middle', async ({ page }) => {
    const card = demo(page, 'sticky-scroll')
    const items = card.locator('.er-sticky-scroll-item')
    const media = items.locator('.er-sticky-scroll-media')
    const copy = items.locator('.er-sticky-scroll-copy')
    await expect(items).toHaveCount(4)

    await centre(copy.nth(0))
    await expect(items.nth(0)).toHaveAttribute('data-state', 'active')
    await expect(media.nth(0)).toHaveCSS('opacity', '1')
    await expect(media.nth(1)).toHaveCSS('opacity', '0')
    const before = await media.nth(0).boundingBox()

    await centre(copy.nth(1))
    await expect(items.nth(1)).toHaveAttribute('data-state', 'active')
    await expect(items.nth(0)).toHaveAttribute('data-state', 'inactive')
    await expect(media.nth(1)).toHaveCSS('opacity', '1')
    await expect(media.nth(0)).toHaveCSS('opacity', '0')
    // Stuck: the media is where the first step's was, while the copy has moved up a whole step.
    const after = await media.nth(1).boundingBox()
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(2)
    expect(after!.x).toBe(before!.x)
    const [left, right] = [await media.nth(1).boundingBox(), await copy.nth(1).boundingBox()]
    expect(left!.x + left!.width).toBeLessThanOrEqual(right!.x)

    await expect(items.nth(0).getByRole('heading', { name: 'Copy it in.' })).toBeAttached()
    await centre(copy.nth(3))
    await expect(items.nth(3)).toHaveAttribute('data-state', 'active')
    await expect(card.getByRole('img', { name: 'A light page with a red accent' })).toBeVisible()
  })

  test('tabbing to a link in a step shows that step', async ({ page }) => {
    const card = demo(page, 'sticky-scroll')
    await centre(card.locator('.er-sticky-scroll-copy').first())
    await card.getByRole('link', { name: 'Start with the button' }).focus()
    await expect(card.locator('.er-sticky-scroll-item').nth(2)).toHaveAttribute('data-state', 'active')
  })
})
