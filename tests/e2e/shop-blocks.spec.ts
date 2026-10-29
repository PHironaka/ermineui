import { demo, expect, readout, test } from './helpers'

test.describe('product detail block', () => {
  test('starts on the first choices that can be bought, and hands over what was chosen', async ({ page }) => {
    const card = demo(page, 'product-detail')
    await expect(card.getByRole('heading', { name: 'Stoneware mug', level: 3 })).toBeVisible()
    await expect(card.locator('.er-product-detail-price')).toContainText('Now $24.00')
    await expect(card.locator('.er-product-detail-price')).toContainText('Only 4 left')
    await expect(card.getByRole('radiogroup', { name: 'Colour' }).getByRole('radio', { name: 'Sand' })).toBeChecked()

    await card.getByRole('radiogroup', { name: 'Colour' }).getByRole('radio', { name: 'Ink' }).check()
    await expect(card.locator('.er-product-detail-label').first()).toHaveText('Colour: Ink')
    await card.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: '350 ml' }).check()
    const quantity = card.getByRole('group', { name: 'Quantity of Stoneware mug' })
    await quantity.getByRole('button', { name: 'Increase quantity' }).click()
    await card.getByRole('button', { name: 'Add to cart' }).click()
    await expect(readout(page, 'product-detail')).toContainText('added 2 × mug (ink, 350)')

    // No more can be asked for than are left.
    await quantity.getByRole('button', { name: 'Increase quantity' }).click()
    await quantity.getByRole('button', { name: 'Increase quantity' }).click()
    await expect(quantity.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()

    await card.getByRole('button', { name: 'Save Stoneware mug for later' }).click()
    await expect(readout(page, 'product-detail')).toContainText('saved: true')
  })

  test('the rating summary filters the reviews, and the review count links to them', async ({ page }) => {
    const card = demo(page, 'product-detail')
    const reviews = card.getByRole('region', { name: 'Reviews', exact: true })
    await expect(reviews.locator('.er-review')).toHaveCount(3)
    await reviews.getByRole('button', { name: /4 stars/ }).click()
    await expect(reviews.locator('.er-review')).toHaveCount(1)
    await expect(reviews.locator('.er-review')).toContainText('Lovely, a little small')
    await reviews.getByRole('button', { name: /2 stars/ }).click()
    await expect(reviews).toContainText('No written reviews with 2 stars yet.')

    await expect(card.getByRole('link', { name: /128 reviews/ })).toHaveAttribute('href', `#${await reviews.getAttribute('id')}`)
    await expect(card.locator('.er-description-list')).toContainText('Portugal')
  })
})

test.describe('product listing block', () => {
  test('filters, sorts and pages through the products', async ({ page }) => {
    const card = demo(page, 'product-listing')
    const names = card.locator('.er-product-card-title')
    await expect(card.getByRole('status').filter({ hasText: 'products' })).toHaveText('10 products')
    await expect(names).toHaveCount(6)

    await card.getByRole('navigation', { name: 'Pagination' }).getByRole('button', { name: /2/ }).first().click()
    await expect(names).toHaveCount(4)
    await expect(card.getByRole('heading', { name: 'All products' })).toBeFocused()

    await card.getByRole('button', { name: /Brand/ }).click()
    await page.getByRole('menuitemcheckbox', { name: /Lumen Works/ }).click()
    await page.keyboard.press('Escape')
    await expect(card.getByRole('status').filter({ hasText: 'product' })).toHaveText('3 products')
    // A new set of products starts from its first page, which is now the only one.
    await expect(names).toHaveText(['Desk lamp', 'Pendant light', 'Beeswax candles'])
    await expect(card.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0)

    await card.getByRole('combobox', { name: 'Sort by' }).click()
    await page.getByRole('option', { name: 'Price: low to high' }).click()
    await expect(names).toHaveText(['Beeswax candles', 'Desk lamp', 'Pendant light'])
  })

  test('filters that match nothing can be cleared, and products can be saved and added', async ({ page }) => {
    const card = demo(page, 'product-listing')
    await card.getByRole('button', { name: /Brand/ }).click()
    await page.getByRole('menuitemcheckbox', { name: /Lumen Works/ }).click()
    await page.keyboard.press('Escape')
    await card.getByRole('button', { name: /Category/ }).click()
    await page.getByRole('menuitemcheckbox', { name: /Kitchen/ }).click()
    await page.keyboard.press('Escape')
    await expect(card).toContainText('Nothing matches those filters')
    await card.getByRole('button', { name: 'Clear filters' }).click()
    await expect(card.locator('.er-product-card-title')).toHaveCount(6)

    await card.getByRole('button', { name: 'Save Wool throw for later' }).click()
    await card.getByRole('button', { name: 'Add Wool throw to cart' }).click()
    await expect(readout(page, 'product-listing')).toHaveText('added Wool throw · saved: 1')
  })
})

test.describe('order confirmation block', () => {
  test('gives the order number, where it is going and what it came to', async ({ page }) => {
    const card = demo(page, 'order-confirmation')
    await expect(card.getByRole('heading', { name: 'Thank you for your order' })).toBeVisible()
    await expect(card.locator('.er-order-confirmation-lead')).toHaveText('Order ER-10482 is confirmed. A receipt is on its way to maya@example.com.')
    await expect(card.getByRole('link', { name: 'Track your order' })).toHaveAttribute('href', '#order-history')
    await expect(card.getByRole('list', { name: 'Order progress' }).getByRole('listitem').first()).toHaveAttribute('aria-current', 'step')
    await expect(card.locator('.er-order-confirmation-address')).toContainText('18 Alder Row')
    // 48 + 96 − 14.40 + 10.37, with free shipping.
    await expect(card.locator('.er-order-summary-total')).toContainText('$139.97')
    await expect(card.locator('.er-cart-line-item')).toHaveCount(2)
    await expect(card.locator('.er-cart-line-item').first().getByRole('spinbutton')).toHaveCount(0)
  })
})

test.describe('order history block', () => {
  test('lists orders with their status, and filters by whether they are finished', async ({ page }) => {
    const card = demo(page, 'order-history')
    const orders = card.locator('.er-order-history-order')
    await expect(orders).toHaveCount(4)
    await expect(orders.first()).toContainText('Oct 12, 2026 · 3 items · $139.97')
    await expect(orders.first().locator('.er-status')).toHaveText('Processing')
    await expect(orders.first().getByRole('list', { name: 'Progress of order ER-10482' })).toBeVisible()

    await card.getByRole('radiogroup', { name: 'Show orders' }).getByRole('radio', { name: 'On the way' }).check()
    await expect(orders).toHaveCount(2)
    await expect(orders.nth(1).getByRole('link', { name: 'Track order ER-10317' })).toHaveAttribute('href', '#track-ER-10317')

    await card.getByRole('radiogroup', { name: 'Show orders' }).getByRole('radio', { name: 'Finished' }).check()
    await expect(orders).toHaveCount(2)
    await expect(orders.first().getByRole('list')).toHaveCount(1)
    await orders.first().getByRole('button', { name: 'Buy order ER-09951 again' }).click()
    await expect(readout(page, 'order-history')).toHaveText('buy again ER-09951')
    await orders.last().getByRole('button', { name: 'View order ER-09604' }).click()
    await expect(readout(page, 'order-history')).toHaveText('view ER-09604')
  })
})

test.describe('sign up block', () => {
  test('checks every field, including the terms, before it sends anything', async ({ page }) => {
    const card = demo(page, 'sign-up')
    await card.getByRole('button', { name: 'Create account' }).click()
    await expect(card.getByRole('alert').filter({ hasText: /./ })).toHaveText(['Enter your name.', 'Enter your email address.', 'Choose a password.', 'Tick the box to agree before continuing.'])
    await expect(readout(page, 'sign-up')).toHaveText('not sent')

    await card.getByLabel('Name').fill('Maya Robinson')
    await card.getByLabel('Email').fill('maya@example.com')
    await card.locator('input[name="password"]').fill('short')
    await card.getByRole('button', { name: 'Create account' }).click()
    await expect(card.getByRole('alert').filter({ hasText: /./ })).toHaveText(['Use at least 8 characters.', 'Tick the box to agree before continuing.'])

    await card.locator('input[name="password"]').fill('xK9#mQ2$vL')
    await expect(card.locator('.er-password-strength').getByRole('status')).toContainText('Strong')
    await card.getByRole('checkbox', { name: /I agree/ }).check()
    await card.getByRole('button', { name: 'Create account' }).click()
    await expect(readout(page, 'sign-up')).toHaveText('account made for Maya Robinson')
  })

  test('shows what the server said', async ({ page }) => {
    const card = demo(page, 'sign-up')
    await card.getByLabel('Name').fill('Maya')
    await card.getByLabel('Email').fill('maya@taken.example')
    await card.locator('input[name="password"]').fill('xK9#mQ2$vL')
    await card.getByRole('checkbox', { name: /I agree/ }).check()
    await card.getByRole('button', { name: 'Create account' }).click()
    await expect(card.locator('.er-alert')).toHaveText('There is already an account with that email.')
  })
})

test.describe('forgot password block', () => {
  test('checks the address, confirms without saying whether it has an account, and lets you try another', async ({ page }) => {
    const card = demo(page, 'forgot-password')
    await card.getByRole('button', { name: 'Send reset link' }).click()
    await expect(card.getByRole('alert').filter({ hasText: /./ })).toHaveText('Enter your email address.')
    await card.getByLabel('Email').fill('maya@example.com')
    await card.getByRole('button', { name: 'Send reset link' }).click()

    await expect(card.locator('.er-card-title')).toHaveText('Check your inbox')
    await expect(card.getByRole('status')).toContainText('If there is an account for maya@example.com')
    await expect(card.getByRole('textbox')).toHaveCount(0)

    await card.getByRole('button', { name: 'Use a different email' }).click()
    await expect(card.getByLabel('Email')).toBeFocused()
    await expect(card.getByLabel('Email')).toHaveValue('maya@example.com')
    await expect(card.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '#sign-in')
  })
})

test.describe('not found block', () => {
  test('says what happened, offers a search and the way home', async ({ page }) => {
    const card = demo(page, 'not-found')
    await expect(card.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    await expect(card.locator('.er-not-found-code')).toHaveAttribute('aria-hidden', 'true')
    await expect(card.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '#button')
    const search = card.getByRole('search')
    await search.getByRole('button', { name: 'Search' }).click()
    await expect(readout(page, 'not-found')).toHaveText('nothing searched')
    await search.getByRole('searchbox', { name: 'Search the site' }).fill('mugs')
    await page.keyboard.press('Enter')
    await expect(readout(page, 'not-found')).toHaveText('searched for mugs')
  })
})

test.describe('media and text block', () => {
  test('each layout has its heading, picture and actions', async ({ page }) => {
    const card = demo(page, 'media-text')
    const split = card.getByRole('region', { name: 'Fired twice, built for every day' })
    await expect(split.getByRole('img', { name: 'Hills under a low sun' })).toBeVisible()
    await expect(split.getByRole('link', { name: 'Shop the collection' })).toHaveAttribute('href', '#product-listing')
    await expect(split.getByText('Free delivery on orders over $50.')).toBeVisible()

    // Slot copy replaces the body, and an empty note or a null action is left out.
    const studio = card.getByRole('region', { name: 'Small batches, one kiln' })
    await expect(studio.locator('.er-media-text-body p')).toHaveCount(2)
    await expect(studio.locator('.er-media-text-note')).toHaveCount(0)
    await expect(studio.getByRole('link')).toHaveCount(1)

    await expect(card.getByRole('region', { name: 'The autumn glazes are here' })).toHaveAttribute('data-layout', 'stacked')
    const columns = card.getByRole('region', { name: 'Not sure what they would pick?' })
    await expect(columns).toHaveAttribute('data-layout', 'columns')
    await expect(columns.getByRole('link', { name: 'Check a balance' })).toBeVisible()
  })
})

test.describe('hero block', () => {
  test('each layout keeps its heading and actions, links on the rule and buttons elsewhere', async ({ page }) => {
    const card = demo(page, 'hero')
    const hero = card.getByRole('region', { name: 'Field Studio' })
    await expect(hero).toHaveAttribute('data-layout', 'rule')
    await expect(hero.getByRole('heading', { name: 'Field Studio', level: 3 })).toBeVisible()
    await expect(hero.getByRole('link', { name: 'Schedule a conversation' })).toHaveClass(/er-hero-link/)
    await expect(hero.getByRole('navigation', { name: 'Field Studio' }).getByRole('link')).toHaveCount(4)

    await card.getByRole('radio', { name: 'Centre' }).check()
    const centred = card.getByRole('region', { name: 'Rooms that hold the light' })
    await expect(centred).toHaveAttribute('data-layout', 'center')
    await expect(centred.getByRole('link', { name: 'Schedule a conversation' })).toHaveClass(/er-button/)
    await expect(centred.getByRole('link', { name: 'See the work' })).toHaveAttribute('href', '#product-listing')
  })

  test('a background video waits for the button when motion is reduced, and the button pauses it again', async ({ page }) => {
    const card = demo(page, 'hero')
    await expect(card.locator('video')).toHaveCount(0)
    await card.getByRole('radio', { name: 'Video' }).check()
    const video = card.locator('video')
    await expect(video).toHaveAttribute('aria-hidden', 'true')
    // Firefox has no playsInline property, so the attribute is what is checked.
    await expect(video).toHaveAttribute('playsinline', '')
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop && v.paused)).toBe(true)

    // The tests run with reduced motion, so the video is still until asked.
    await card.getByRole('button', { name: 'Play background video' }).click()
    const pause = card.getByRole('button', { name: 'Pause background video' })
    await expect(pause).toBeVisible()
    await pause.click()
    await expect(card.getByRole('button', { name: 'Play background video' })).toBeVisible()
  })
})
