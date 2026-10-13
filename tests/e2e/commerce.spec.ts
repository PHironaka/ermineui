import { demo, expect, readout, test } from './helpers'

test.describe('quantity stepper', () => {
  test('counts between its limits, and at one the minus becomes a bin', async ({ page }) => {
    const card = demo(page, 'quantity-stepper')
    const stepper = card.getByRole('group', { name: 'Quantity of Stoneware mug' })
    await stepper.getByRole('button', { name: 'Increase quantity' }).click()
    await expect(stepper.locator('output')).toHaveText('3')
    await stepper.getByRole('button', { name: 'Increase quantity' }).click()
    await stepper.getByRole('button', { name: 'Increase quantity' }).click()
    await expect(stepper.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
    await expect(readout(page, 'quantity-stepper')).toContainText('quantity: 5')

    for (let press = 0; press < 4; press++) await stepper.getByRole('button', { name: 'Decrease quantity' }).click()
    await expect(stepper.locator('output')).toHaveText('1')
    await stepper.getByRole('button', { name: 'Remove Stoneware mug' }).click()
    await expect(readout(page, 'quantity-stepper')).toContainText('quantity: removed')

    // Without `removable`, the minus simply stops at the lowest quantity.
    await expect(card.getByRole('group', { name: 'Quantity of Wool throw' }).getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
  })
})

test.describe('wishlist button', () => {
  test('is a pressed button, with or without its words', async ({ page }) => {
    const card = demo(page, 'quantity-stepper')
    const heart = card.getByRole('button', { name: 'Save Stoneware mug for later' })
    await expect(heart).toHaveAttribute('aria-pressed', 'false')
    await heart.click()
    await expect(heart).toHaveAttribute('aria-pressed', 'true')
    await expect(readout(page, 'quantity-stepper')).toContainText('saved: true')
    await expect(card.getByRole('button', { name: 'Save for later', exact: true })).toHaveText('Saved')
  })
})

test.describe('segmented control', () => {
  test('is a radio group that the arrow keys move through, skipping what is disabled', async ({ page }) => {
    const group = demo(page, 'quantity-stepper').getByRole('radiogroup', { name: 'View' })
    await expect(group.getByRole('radio', { name: 'Grid' })).toBeChecked()
    await expect(group.getByRole('radio', { name: 'Map' })).toBeDisabled()
    await group.getByRole('radio', { name: 'Grid' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(group.getByRole('radio', { name: 'List' })).toBeChecked()
    await expect(readout(page, 'quantity-stepper')).toContainText('view: list')
  })
})

test.describe('shipping method', () => {
  test('lists each way with its price, and one that is not offered cannot be chosen', async ({ page }) => {
    const card = demo(page, 'shipping-method')
    const group = card.getByRole('radiogroup', { name: 'Delivery method' })
    await expect(group.locator('.er-option-card').first()).toContainText('Free')
    await group.getByRole('radio', { name: /Express/ }).check()
    await expect(readout(page, 'shipping-method')).toContainText('delivery: express')
    await expect(group.locator('.er-option-card').nth(1)).toContainText('$12.00')
    await expect(group.getByRole('radio', { name: /Drone/ }).first()).toBeDisabled()
  })
})

test.describe('order tracker', () => {
  test('says which stage is done, which is now and which are to come', async ({ page }) => {
    const card = demo(page, 'shipping-method')
    const stages = card.getByRole('list', { name: 'Order progress' }).getByRole('listitem')
    await expect(stages).toHaveText(['Done: OrderedOct 12', 'Now: PackedOct 13', 'To come: Shipped', 'To come: Delivered'])
    await expect(stages.nth(1)).toHaveAttribute('aria-current', 'step')
    await card.getByRole('button', { name: 'Next stage' }).click()
    await expect(stages.nth(2)).toHaveAttribute('aria-current', 'step')
    await expect(stages.nth(1)).toContainText('Done: Packed')

    await card.getByRole('button', { name: 'Hold it up' }).click()
    await expect(card.locator('.er-order-tracker')).toHaveAttribute('data-problem', '')
    await expect(card.locator('.er-order-tracker-note')).toHaveText('Held at the depot: the address needs checking.')
  })
})

test.describe('mini cart', () => {
  test('opens as a dialog from a button that carries the count, and changes the cart', async ({ page }) => {
    const card = demo(page, 'mini-cart')
    await card.getByRole('button', { name: 'Cart (3)' }).click()
    const cart = page.getByRole('dialog', { name: 'Your cart' })
    await expect(cart).toBeVisible()
    await expect(cart).toContainText('3 items')
    await expect(cart.locator('.er-mini-cart-subtotal')).toContainText('$144.00')

    await cart.getByRole('group', { name: 'Quantity of Stoneware mug' }).getByRole('button', { name: 'Decrease quantity' }).click()
    await expect(cart.locator('.er-mini-cart-subtotal')).toContainText('$120.00')
    await cart.getByRole('button', { name: 'Remove Stoneware mug' }).click()
    await expect(cart.getByRole('listitem')).toHaveCount(1)
    await expect(cart.locator('.er-mini-cart-status')).toHaveText('Stoneware mug removed from your cart.')
    await expect(cart).toContainText('1 item')

    await cart.getByRole('button', { name: 'Checkout' }).click()
    await expect(cart).toBeHidden()
    await expect(readout(page, 'mini-cart')).toHaveText('checkout with 1 lines')
    await expect(card.getByRole('button', { name: 'Cart (1)' })).toBeVisible()
  })

  test('says so when it is empty', async ({ page }) => {
    const card = demo(page, 'mini-cart')
    await card.getByRole('button', { name: /^Cart/ }).click()
    const cart = page.getByRole('dialog', { name: 'Your cart' })
    await cart.getByRole('button', { name: 'Remove Wool throw' }).click()
    await cart.getByRole('group', { name: 'Quantity of Stoneware mug' }).getByRole('button', { name: 'Decrease quantity' }).click()
    await cart.getByRole('button', { name: 'Remove Stoneware mug' }).click()
    await expect(cart).toContainText('Things you add will be listed here.')
    await expect(cart.getByRole('button', { name: 'Checkout' })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(cart).toBeHidden()
  })
})

test.describe('comparison table', () => {
  test('is a real table whose ticks and dashes are read as yes and no', async ({ page }) => {
    const card = demo(page, 'comparison-table')
    const table = card.getByRole('table', { name: 'Mugs compared' })
    await expect(table.getByRole('columnheader', { name: /Travel mug/ })).toContainText('$32')
    const microwave = table.getByRole('row', { name: /Microwave safe/ })
    await expect(microwave.getByRole('cell')).toHaveText(['Yes', 'No', 'Yes'])
    await expect(table.getByRole('row', { name: /^Holds/ }).getByRole('cell')).toHaveText(['350 ml', '450 ml', '90 ml'])
    await card.getByRole('button', { name: 'Choose Travel mug' }).click()
    await expect(readout(page, 'comparison-table')).toHaveText('chose Travel mug')
  })
})

test.describe('pricing table', () => {
  test('the switch changes the prices, and the current plan cannot be chosen again', async ({ page }) => {
    const card = demo(page, 'pricing-table')
    const pro = card.locator('.er-pricing-table-plan').filter({ hasText: 'Most popular' })
    await expect(pro.locator('.er-pricing-table-price')).toHaveText('$20/ month')
    await card.getByRole('radiogroup', { name: 'Billing period' }).getByRole('radio', { name: /Yearly/ }).check()
    await expect(pro.locator('.er-pricing-table-price')).toHaveText('$16/ month, billed yearly')
    await expect(card.getByRole('radiogroup', { name: 'Billing period' })).toContainText('Save 20%')

    await pro.getByRole('button', { name: 'Choose Pro' }).click()
    await expect(readout(page, 'pricing-table')).toContainText('chose Pro, yearly')
    await expect(card.getByRole('button', { name: 'Current plan' })).toBeDisabled()
    await expect(card.getByRole('list', { name: 'Pro includes' }).getByRole('listitem')).toHaveCount(4)
    await expect(card.locator('.er-pricing-table-plan').filter({ hasText: 'Enterprise' }).locator('.er-pricing-table-price')).toHaveText('Contact us')
  })
})

test.describe('size guide', () => {
  test('converts between centimetres and inches and marks the chosen size', async ({ page }) => {
    const card = demo(page, 'size-guide')
    const table = card.getByRole('table', { name: 'Shirt sizes, in centimetres' })
    const medium = table.getByRole('row', { name: /^M/ })
    await expect(medium.getByRole('cell')).toHaveText(['96–101', '81–86', '96–101'])
    await expect(medium.getByRole('rowheader')).toHaveText('M (selected)')

    await card.getByRole('radiogroup', { name: 'Units' }).getByRole('radio', { name: 'in' }).check()
    await expect(card.getByRole('table', { name: 'Shirt sizes, in inches' }).getByRole('row', { name: /^M/ }).getByRole('cell')).toHaveText(['38–40', '32–34', '38–40'])
    await expect(readout(page, 'size-guide')).toHaveText('units: in · a 98 cm chest is size M')
  })
})
