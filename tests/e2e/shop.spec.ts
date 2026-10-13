import { demo, expect, readout, test } from './helpers'

test.describe('price', () => {
  test('a reduced price says which number is now and which was, and other currencies follow their own rules', async ({ page }) => {
    const card = demo(page, 'product-card')
    const sale = card.locator('.stack .er-price[data-sale]')
    await expect(sale.locator('.er-price-now')).toHaveText('Now $96.00')
    await expect(sale.locator('.er-price-was')).toHaveText('Was $120.00')
    await expect(sale).toContainText('Save 20%')
    await expect(card.locator('.stack .er-price').first()).toHaveText('$24.00')
    await expect(card.locator('.stack .er-price').last()).toHaveText(/^1\.299,00\s€$/)
  })
})

test.describe('swatch', () => {
  test('colours and sizes are radio buttons; ones that are not available cannot be chosen', async ({ page }) => {
    const card = demo(page, 'product-card')
    const colours = card.getByRole('radiogroup', { name: 'Colour' })
    await expect(colours.getByRole('radio', { name: 'Sand' })).toBeChecked()
    await colours.getByRole('radio', { name: 'Ink' }).check()
    await expect(readout(page, 'product-card')).toContainText('ink, 350 ml')
    await expect(colours.getByRole('radio', { name: 'Chalk, not available' })).toBeDisabled()

    const sizes = card.getByRole('radiogroup', { name: 'Size' })
    await sizes.getByRole('radio', { name: '250 ml' }).check()
    await expect(readout(page, 'product-card')).toContainText('ink, 250 ml')
    await expect(sizes.getByRole('radio', { name: '500 ml' })).toBeDisabled()
  })

  test('arrow keys move the choice along', async ({ page }) => {
    const colours = demo(page, 'product-card').getByRole('radiogroup', { name: 'Colour' })
    await colours.getByRole('radio', { name: 'Sand' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(colours.getByRole('radio', { name: 'Moss' })).toBeChecked()
    await expect(readout(page, 'product-card')).toContainText('moss')
  })
})

test.describe('product card', () => {
  test('the title is the link, and the buttons on the card can still be pressed', async ({ page }) => {
    const card = demo(page, 'product-card')
    await expect(card.getByRole('article')).toHaveCount(3)
    const throwCard = card.getByRole('article').filter({ hasText: 'Wool throw' })
    await expect(throwCard.getByRole('link', { name: 'Wool throw' })).toHaveAttribute('href', '#product-gallery')
    await expect(throwCard.getByRole('img', { name: 'Rated: 4.8 out of 5' })).toBeVisible()
    await expect(throwCard).toContainText('(64 reviews)')

    await throwCard.getByRole('button', { name: 'Add to cart' }).click()
    await expect(readout(page, 'product-card')).toContainText('added Wool throw')
    const save = throwCard.getByRole('button', { name: 'Save Wool throw for later' })
    await save.click()
    await expect(save).toHaveAttribute('aria-pressed', 'true')
    await expect(readout(page, 'product-card')).toContainText('saved: 1')
  })
})

test.describe('product gallery', () => {
  test('thumbnails and arrow keys change the picture', async ({ page }) => {
    const card = demo(page, 'product-gallery')
    const thumb = (number: number) => card.getByRole('button', { name: new RegExp(`^Picture ${number} of 4`) })
    await expect(thumb(1)).toHaveAttribute('aria-current', 'true')
    await thumb(3).click()
    await expect(readout(page, 'product-gallery')).toHaveText('picture 3 of 4')
    await expect(thumb(3)).toHaveAttribute('aria-current', 'true')
    await expect(thumb(1)).not.toHaveAttribute('aria-current')
    await expect(card.getByRole('img', { name: 'The glaze up close' })).toBeInViewport()

    await card.locator('.er-carousel-track').focus()
    await page.keyboard.press('ArrowLeft')
    await expect(readout(page, 'product-gallery')).toHaveText('picture 2 of 4')
    await expect(thumb(2)).toHaveAttribute('aria-current', 'true')
  })
})

test.describe('range slider', () => {
  test('each thumb moves with the keyboard and stops short of the other', async ({ page }) => {
    const card = demo(page, 'range-slider')
    const low = card.getByRole('slider', { name: 'Lowest price' })
    const high = card.getByRole('slider', { name: 'Highest price' })
    await expect(card.getByRole('group', { name: 'Price' })).toBeVisible()
    await low.focus()
    await page.keyboard.press('ArrowRight')
    await expect(card.locator('.readout').first()).toHaveText('$45 to $160')
    // End would be 200; the lower thumb stops the minimum gap below the higher one.
    await page.keyboard.press('End')
    await expect(card.locator('.readout').first()).toHaveText('$150 to $160')
    await expect(low).toHaveValue('150')
    await high.focus()
    await page.keyboard.press('Home')
    await expect(card.locator('.readout').first()).toHaveText('$150 to $160')
    await expect(high).toHaveValue('160')
    await page.keyboard.press('End')
    await expect(card.locator('.readout').first()).toHaveText('$150 to $200')
  })

  test('pressing the bare track moves the nearer thumb', async ({ page }) => {
    const card = demo(page, 'range-slider')
    const track = card.locator('.er-range-slider')
    const box = (await track.boundingBox())!
    await track.click({ position: { x: 4, y: box.height / 2 } })
    await expect(card.locator('.readout').first()).toHaveText(/^\$[05] to \$160$/)
    await track.click({ position: { x: box.width - 4, y: box.height / 2 } })
    await expect(card.locator('.readout').first()).toHaveText(/^\$[05] to \$(195|200)$/)
  })
})

test.describe('masked input', () => {
  test('lays out what is typed, drops what does not fit, and reports the bare value', async ({ page }) => {
    const card = demo(page, 'range-slider')
    const number = card.getByLabel('Card number')
    await number.pressSequentially('4242x4242')
    await expect(number).toHaveValue('4242 4242')
    await expect(readout(page, 'range-slider')).toContainText('card: 42424242 ·')
    // Backspace is never stuck on a separator.
    for (let press = 0; press < 4; press++) await number.press('Backspace')
    await expect(number).toHaveValue('4242')

    await card.getByLabel('Expiry').fill('1227')
    await expect(card.getByLabel('Expiry')).toHaveValue('12/27')
    // Text that already has the separators in it, as from autofill or a paste.
    await card.getByLabel('Phone').fill('(555) 010-0199')
    await expect(card.getByLabel('Phone')).toHaveValue('(555) 010-0199')
    await expect(readout(page, 'range-slider')).toContainText('expiry: 1227 · phone: 5550100199')
    await card.getByLabel('Phone').pressSequentially('7')
    await expect(card.getByLabel('Phone')).toHaveValue('(555) 010-0199')
  })

  test('typing in the middle keeps the caret where the typing is', async ({ page }) => {
    const number = demo(page, 'range-slider').getByLabel('Card number')
    await number.fill('12345678')
    await expect(number).toHaveValue('1234 5678')
    await number.evaluate((input: HTMLInputElement) => input.setSelectionRange(2, 2))
    await number.pressSequentially('9')
    await expect(number).toHaveValue('1293 4567 8')
    expect(await number.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(3)
  })
})

test.describe('option card, cart line item, order summary', () => {
  test('pressing anywhere on a card chooses it, and the sums follow', async ({ page }) => {
    const card = demo(page, 'option-card')
    const total = card.locator('.er-order-summary-total dd')
    await expect(card.getByRole('radio', { name: /Standard/ })).toBeChecked()
    await expect(total).toHaveText('$51.84')
    await card.getByText('1 to 2 working days').click()
    await expect(card.getByRole('radio', { name: /Express/ })).toBeChecked()
    await expect(total).toHaveText('$63.84')
    await expect(card.getByRole('radio', { name: /Drone/ })).toBeDisabled()
  })

  test('the quantity changes the line total, stops at the limit, and the item can be removed', async ({ page }) => {
    const card = demo(page, 'option-card')
    const line = card.locator('.er-cart-line-item')
    const quantity = card.getByRole('spinbutton', { name: 'Quantity of Stoneware mug' })
    await expect(line.locator('.er-cart-line-item-total')).toHaveText('$48.00')
    await card.getByRole('button', { name: 'Increase' }).click()
    await expect(quantity).toHaveValue('3')
    await expect(line.locator('.er-cart-line-item-total')).toHaveText('$72.00')
    await quantity.fill('40')
    await quantity.blur()
    await expect(quantity).toHaveValue('6')
    await expect(card.getByRole('button', { name: 'Increase' })).toBeDisabled()
    await card.getByRole('button', { name: 'Remove Stoneware mug' }).click()
    await expect(line).toHaveCount(0)
    await expect(card.locator('.er-order-summary-total dd')).toHaveText('$0.00')
  })
})

test.describe('cart block', () => {
  test('quantities and discount codes change the sums', async ({ page }) => {
    const card = demo(page, 'cart')
    const total = card.locator('.er-order-summary-total dd')
    await expect(card.getByRole('heading', { name: /Your cart/ })).toContainText('4 items')
    await expect(total).toHaveText('$292.50')
    await card.getByRole('button', { name: 'Increase' }).first().click()
    await expect(card.getByRole('heading', { name: /Your cart/ })).toContainText('5 items')
    await expect(total).toHaveText('$316.50')

    await card.getByLabel('Discount code').fill('nope')
    await card.getByRole('button', { name: 'Apply' }).click()
    await expect(card.getByRole('alert').filter({ hasText: 'That code is not valid.' })).toBeVisible()
    await card.getByLabel('Discount code').fill('save10')
    await card.getByLabel('Discount code').press('Enter')
    await expect(card.getByRole('alert').filter({ hasText: 'not valid' })).toHaveCount(0)
    await expect(card.locator('.er-order-summary [data-tone="discount"]')).toHaveText('SAVE10−$10.00')
    await expect(total).toHaveText('$306.50')

    await card.getByRole('button', { name: 'Checkout' }).click()
    await expect(readout(page, 'cart')).toHaveText('checkout with 3 lines')
  })

  test('removing an item is announced and focus is kept; an empty cart says so', async ({ page }) => {
    const card = demo(page, 'cart')
    await card.getByRole('button', { name: 'Remove Desk lamp' }).click()
    await expect(card.getByRole('status')).toHaveText('Desk lamp removed from your cart.')
    await expect(card.getByRole('heading', { name: /Your cart/ })).toBeFocused()
    await expect(card.getByRole('listitem')).toHaveCount(2)
    await card.getByRole('button', { name: 'Remove Stoneware mug' }).click()
    await card.getByRole('button', { name: 'Remove Wool throw' }).click()
    await expect(card.getByText('Your cart is empty')).toBeVisible()
    await expect(card.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '#product-card')
  })
})

test.describe('checkout block', () => {
  test('nothing is sent until every needed answer is given', async ({ page }) => {
    const card = demo(page, 'checkout')
    await card.getByRole('button', { name: 'Pay $155.52' }).click()
    for (const message of ['Enter your email address.', 'Enter your full name.', 'Choose your country.', 'Enter the card number.', 'Enter the expiry date.']) {
      await expect(card.getByText(message)).toBeVisible()
    }
    await expect(readout(page, 'checkout')).toHaveText('nothing yet')
    await card.getByLabel('Expiry date').fill('1327')
    await expect(card.getByText('Enter the expiry date as month and year, such as 09/27.')).toBeVisible()
    await card.getByLabel('Expiry date').fill('1227')
    await expect(card.getByLabel('Expiry date')).not.toHaveAttribute('aria-invalid')
  })

  test('the delivery choice changes the total; a declined card is reported and a good one places the order', async ({ page }) => {
    const card = demo(page, 'checkout')
    await card.getByLabel('Email').fill('ines@example.com')
    await card.getByLabel('Full name').fill('Ines Kovač')
    await card.getByLabel('Address').fill('12 Harbour Street')
    await card.getByLabel('Town or city').fill('Osaka')
    await card.getByLabel('Postcode').fill('530-0001')
    await card.getByRole('combobox', { name: 'Country' }).click()
    await page.getByRole('option', { name: 'Japan', exact: true }).click()
    await card.getByRole('radio', { name: /Express/ }).check()
    await expect(card.locator('.er-order-summary-total dd')).toHaveText('$167.52')
    await card.getByLabel('Name on card').fill('Ines Kovac')
    await card.getByLabel('Card number').fill('4000000000000002')
    await expect(card.getByLabel('Card number')).toHaveValue('4000 0000 0000 0002')
    await card.getByLabel('Expiry date').fill('1227')
    await card.getByLabel('Security code').fill('123')

    await card.getByRole('button', { name: 'Pay $167.52' }).click()
    await expect(card.getByRole('button', { name: 'Placing order…' })).toBeDisabled()
    await expect(card.getByRole('alert').filter({ hasText: 'Your card was declined' })).toBeVisible()

    await card.getByLabel('Card number').fill('4242424242424242')
    await card.getByRole('button', { name: 'Pay $167.52' }).click()
    await expect(readout(page, 'checkout')).toHaveText('order placed for ines@example.com, express delivery to Japan')
    await expect(card.getByRole('alert').filter({ hasText: 'declined' })).toHaveCount(0)
  })
})
