import { demo, expect, readout, test } from './helpers'

test.describe('tabs', () => {
  test('arrow keys move and select; the panel follows; disabled tabs are skipped', async ({ page }) => {
    const card = demo(page, 'tabs')
    const overview = card.getByRole('tab', { name: 'Overview' })
    await expect(overview).toHaveAttribute('aria-selected', 'true')
    await overview.focus()
    await page.keyboard.press('ArrowRight')
    await expect(card.getByRole('tab', { name: 'Deployments' })).toHaveAttribute('aria-selected', 'true')
    await expect(card.getByRole('tabpanel')).toContainText('Fix cart rounding')
    await page.keyboard.press('End')
    await expect(card.getByRole('tab', { name: 'Logs' })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(overview).toBeFocused()
  })
})

test.describe('accordion and collapsible', () => {
  test('sections open and close, and closed content is out of reach', async ({ page }) => {
    const card = demo(page, 'accordion')
    const first = card.getByRole('button', { name: 'How do I add a custom domain?' })
    const second = card.getByRole('button', { name: 'Can I roll back a deployment?' })
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expect(card.getByRole('link', { name: 'See deployment actions.' })).toBeHidden()
    await second.click()
    await expect(card.getByRole('link', { name: 'See deployment actions.' })).toBeVisible()
    await expect(readout(page, 'accordion')).toHaveText('open: domains, rollback')
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'false')
  })

  test('arrow keys move between headings, skipping a disabled one', async ({ page }) => {
    const card = demo(page, 'accordion')
    await card.getByRole('button', { name: 'How do I add a custom domain?' }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(card.getByRole('button', { name: 'Can I roll back a deployment?' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(card.getByRole('button', { name: 'How do I add a custom domain?' })).toBeFocused()
  })

  test('a collapsible shows and hides its section', async ({ page }) => {
    const card = demo(page, 'hover-card')
    await expect(card.getByText('DATABASE_URL')).toBeHidden()
    await card.getByRole('button', { name: 'Show' }).click()
    await expect(card.getByText('DATABASE_URL')).toBeVisible()
    await card.getByRole('button', { name: 'Hide' }).click()
    await expect(card.getByText('DATABASE_URL')).toBeHidden()
  })
})

test.describe('stepper and questionnaire', () => {
  test('a finished step can be pressed to go back; later ones cannot', async ({ page }) => {
    const steps = demo(page, 'stepper').getByRole('list', { name: 'Checkout progress' })
    await expect(steps.getByRole('listitem').nth(1)).toHaveAttribute('aria-current', 'step')
    await expect(steps.getByRole('button')).toHaveCount(1)
    await steps.getByRole('button', { name: /Cart/ }).click()
    await expect(steps.getByRole('listitem').first()).toHaveAttribute('aria-current', 'step')
    await expect(steps.getByRole('button')).toHaveCount(0)
  })

  test('a step with a problem keeps the reader there and says why', async ({ page }) => {
    const form = demo(page, 'questionnaire').getByRole('form', { name: 'Request a quote' })
    await form.getByRole('button', { name: 'Next' }).click()
    await expect(form.getByRole('heading', { name: 'About you' })).toBeVisible()
    await expect(form.getByRole('alert')).toHaveText(['Tell us your name.', 'Enter your email.'])
    await expect(form.getByText('Step 1 of 4')).toBeVisible()
  })

  test('the whole flow: Enter moves on, an answer adds a step, review links go back, submit resets', async ({ page }) => {
    const form = demo(page, 'questionnaire').getByRole('form', { name: 'Request a quote' })
    await form.getByLabel('Name').fill('Ines Kovač')
    await form.getByLabel('Work email').fill('ines@northwind.com')
    await page.keyboard.press('Enter')
    // Focus lands on the new step's heading, so it is announced.
    await expect(form.getByRole('heading', { name: 'Who is this for?' })).toBeFocused()

    await form.getByLabel('A team').check()
    await expect(form.getByText('Step 2 of 5')).toBeVisible()
    await form.getByRole('button', { name: 'Next' }).click()
    await form.getByLabel('People who will deploy').fill('12')
    await form.getByRole('combobox', { name: 'Regions you need' }).click()
    await page.getByRole('option', { name: 'London' }).click()
    await form.getByRole('button', { name: 'Next' }).click()
    await form.getByRole('button', { name: 'Next' }).click()

    await expect(form.getByRole('heading', { name: 'Check your answers' })).toBeFocused()
    await expect(form.locator('.review')).toContainText('A team of 12')
    await expect(form.locator('.review')).toContainText('London')
    await form.locator('.review').getByRole('button', { name: 'Edit' }).nth(2).click()
    await expect(form.getByRole('heading', { name: 'Who is this for?' })).toBeFocused()

    // Changing the answer removes the team step from the sequence.
    await form.getByLabel('Just me').check()
    await expect(form.getByText('Step 2 of 4')).toBeVisible()
    await form.getByRole('button', { name: 'Next' }).click()
    await form.getByRole('button', { name: 'Next' }).click()
    await form.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByText('Request sent')).toBeVisible()
    await expect(form.getByText('Step 1 of 4')).toBeVisible()
    await expect(form.getByLabel('Name')).toHaveValue('')
  })
})

test.describe('carousel', () => {
  test('buttons, dots and arrow keys change the slide, and the ends stop', async ({ page }) => {
    const carousel = demo(page, 'carousel').getByRole('region', { name: 'Recent releases' })
    const previous = carousel.getByRole('button', { name: 'Previous slide' })
    const next = carousel.getByRole('button', { name: 'Next slide' })
    await expect(previous).toBeDisabled()
    await next.click()
    await expect(readout(page, 'carousel')).toHaveText('slide 2 of 4')
    await carousel.getByRole('button', { name: 'Go to slide 4 of 4' }).click()
    await expect(next).toBeDisabled()
    await expect(carousel.getByRole('group', { name: /Version 2.1/ })).toBeInViewport()
    await carousel.locator('.er-carousel-track').focus()
    await page.keyboard.press('Home')
    await expect(readout(page, 'carousel')).toHaveText('slide 1 of 4')
    await expect(carousel.getByRole('group', { name: /Version 2.4/ })).toBeInViewport()
  })

  test('scrolling the slides by hand keeps the dots in step', async ({ page }) => {
    const carousel = demo(page, 'carousel').getByRole('region', { name: 'Recent releases' })
    await carousel.locator('.er-carousel-track').evaluate((track) => {
      const third = track.children[2] as HTMLElement
      track.scrollTo({ left: third.offsetLeft - track.offsetLeft })
    })
    await expect(readout(page, 'carousel')).toHaveText('slide 3 of 4')
    await expect(carousel.getByRole('button', { name: 'Go to slide 3 of 4' })).toHaveAttribute('aria-current', 'true')
  })
})

test.describe('resizable panels', () => {
  test('arrow keys resize, and panels stop at their minimum', async ({ page }) => {
    const card = demo(page, 'resizable')
    const handle = card.getByRole('separator', { name: 'Resize files panel' })
    await expect(handle).toHaveAttribute('aria-valuenow', '25')
    await handle.focus()
    await page.keyboard.press('ArrowRight')
    await expect(readout(page, 'resizable')).toHaveText('30% · 45% · 25%')
    await page.keyboard.press('Home')
    await expect(readout(page, 'resizable')).toHaveText('15% · 60% · 25%')
    await page.keyboard.press('ArrowLeft')
    await expect(readout(page, 'resizable')).toHaveText('15% · 60% · 25%')
  })

  test('dragging a handle resizes the panels either side of it', async ({ page }) => {
    const card = demo(page, 'resizable')
    const handle = card.getByRole('separator', { name: 'Resize files panel' })
    const files = card.getByText('Files', { exact: true })
    await handle.scrollIntoViewIfNeeded()
    const before = (await files.boundingBox())!.width
    const box = (await handle.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 120, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    const after = (await files.boundingBox())!.width
    expect(after - before).toBeGreaterThan(100)
    expect(after - before).toBeLessThan(140)
  })
})

test.describe('resizable panels: scrolling', () => {
  test('a panel whose content overflows can be focused to scroll it; one that fits cannot', async ({ page }) => {
    const article = demo(page, 'typography').locator('.er-resizable-panel').first()
    await expect(article).toHaveAttribute('tabindex', '0')
    await expect(demo(page, 'resizable').locator('.er-resizable-panel').first()).not.toHaveAttribute('tabindex')
  })
})

test.describe('sidebar, banner, empty state', () => {
  test('the sidebar collapses to icons but keeps its link names', async ({ page }) => {
    const card = demo(page, 'sidebar')
    const nav = card.getByRole('navigation', { name: 'Project' })
    await expect(nav.getByRole('link', { name: 'Deployments' })).toHaveAttribute('aria-current', 'page')
    await card.getByRole('button', { name: 'Collapse sidebar' }).click()
    await expect(card.locator('.er-sidebar')).toHaveCSS('width', '52px')
    // Still found by name: the words are hidden from sight only.
    await expect(nav.getByRole('link', { name: 'Logs' })).toHaveAttribute('title', 'Logs')
    await nav.getByRole('link', { name: 'Logs' }).click()
    await expect(card.getByText('No logs yet')).toBeVisible()
  })

  test('the banner can be dismissed', async ({ page }) => {
    const banner = page.getByRole('region', { name: 'Announcement' })
    await expect(banner).toBeVisible()
    await banner.getByRole('button', { name: 'Dismiss' }).click()
    await expect(banner).toHaveCount(0)
  })
})

test.describe('code block and copy button', () => {
  test('copies the exact code and confirms it', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'reading the clipboard back needs a permission only Chromium can be granted in tests')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const card = demo(page, 'code-block')
    const copy = card.getByRole('button', { name: 'Copy code' }).first()
    await copy.click()
    await expect(copy.getByRole('status')).toHaveText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npx ermine-ui init\nnpx ermine-ui add button dialog chart')
  })

  test('line numbers are not part of the code', async ({ page }) => {
    const block = demo(page, 'code-block').locator('.er-code-block').nth(1)
    await expect(block.locator('.er-code-block-line')).toHaveCount(7)
    await expect(block.locator('code')).toHaveText(/^export default defineNuxtConfig\(\{/)
  })
})
