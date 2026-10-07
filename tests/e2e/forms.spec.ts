import { demo, expect, readout, test } from './helpers'

test.describe('button', () => {
  test('variants render, and `as` changes the element', async ({ page }) => {
    const card = demo(page, 'button')
    await expect(card.getByRole('button', { name: 'Deploy' })).toBeVisible()
    await expect(card.getByRole('link', { name: 'Link to dialog' })).toHaveAttribute('href', '#dialog')
    await expect(card.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })
})

test.describe('input, textarea, label', () => {
  test('a label focuses its field, and typing updates the value', async ({ page }) => {
    const card = demo(page, 'input')
    await card.getByText('Project name').click()
    await expect(card.getByLabel('Project name')).toBeFocused()
    await card.getByLabel('Project name').fill('acme-shop')
    await expect(card.getByLabel('Project name')).toHaveValue('acme-shop')
  })

  test('an invalid field points at its message', async ({ page }) => {
    const field = demo(page, 'input').getByLabel('Custom domain')
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toHaveAccessibleDescription(/top-level domain/)
  })
})

test.describe('checkbox and switch', () => {
  test('a select-all box is indeterminate until every box agrees', async ({ page }) => {
    const card = demo(page, 'checkbox')
    const all = card.getByLabel('Required checks')
    await expect(all).toHaveJSProperty('indeterminate', true)
    await card.getByLabel('One approving review').check()
    await expect(all).toBeChecked()
    await expect(all).toHaveJSProperty('indeterminate', false)
    await all.uncheck()
    await expect(card.getByLabel('Build succeeds')).not.toBeChecked()
    await expect(card.getByLabel('Tests pass')).not.toBeChecked()
  })

  test('Space toggles a focused checkbox and a focused switch', async ({ page }) => {
    const box = demo(page, 'checkbox').getByLabel('Tests pass')
    await box.focus()
    await page.keyboard.press('Space')
    await expect(box).not.toBeChecked()

    const toggle = demo(page, 'switch').getByLabel('Preview every pull request')
    await toggle.focus()
    await page.keyboard.press('Space')
    await expect(toggle).toBeChecked()
    await expect(readout(page, 'switch')).toContainText('previews: true')
  })
})

test.describe('radio group', () => {
  test('arrow keys move the choice, and a disabled option stays disabled', async ({ page }) => {
    const group = demo(page, 'radio-group').getByRole('radiogroup', { name: 'Plan' })
    await expect(group.getByLabel(/Pro/)).toBeChecked()
    await group.getByLabel(/Pro/).focus()
    await page.keyboard.press('ArrowUp')
    await expect(group.getByLabel(/Hobby/)).toBeChecked()
    await expect(readout(page, 'radio-group')).toContainText('plan: hobby')
    await page.keyboard.press('ArrowDown')
    await expect(group.getByLabel(/Pro/)).toBeChecked()
    // These are native radio buttons, so what happens past the ends is the browser's own choice
    // (Chrome and Firefox wrap round, Safari stops) and is not tested here.
    await expect(group.getByLabel(/Enterprise/)).toBeDisabled()
  })

  test('two groups on a page do not interfere', async ({ page }) => {
    const card = demo(page, 'radio-group')
    await card.getByRole('radiogroup', { name: 'Billing period' }).getByLabel('Yearly').check()
    await expect(readout(page, 'radio-group')).toHaveText('plan: pro · billing: yearly')
  })
})

test.describe('slider', () => {
  test('arrow keys, Home and End change the value by steps', async ({ page }) => {
    const slider = demo(page, 'slider').getByLabel('Function memory')
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(readout(page, 'slider')).toHaveText('1088 MB')
    await page.keyboard.press('Home')
    await expect(readout(page, 'slider')).toHaveText('128 MB')
    await page.keyboard.press('End')
    await expect(readout(page, 'slider')).toHaveText('3008 MB')
  })
})

test.describe('toggle group and toggle', () => {
  test('single mode behaves like radio buttons', async ({ page }) => {
    const group = demo(page, 'toggle-group').getByRole('radiogroup', { name: 'Period' })
    await expect(group.getByRole('radio', { name: '30 days' })).toBeChecked()
    await group.getByRole('radio', { name: '30 days' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(group.getByRole('radio', { name: '90 days' })).toBeChecked()
    await expect(group.getByRole('radio', { name: '90 days' })).toBeFocused()
    // The disabled "1 year" is skipped and the arrow wraps to the start.
    await page.keyboard.press('ArrowRight')
    await expect(group.getByRole('radio', { name: '7 days' })).toBeChecked()
    await expect(readout(page, 'toggle-group')).toContainText('period: 7d')
  })

  test('multiple mode toggles each button on its own', async ({ page }) => {
    const group = demo(page, 'toggle-group').getByRole('group', { name: 'Environments' })
    await group.getByRole('button', { name: 'Preview' }).click()
    await expect(group.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true')
    await group.getByRole('button', { name: 'Production' }).click()
    await expect(readout(page, 'toggle-group')).toContainText('environments: preview')
  })

  test('a toggle stays pressed', async ({ page }) => {
    const bold = demo(page, 'input-group').getByRole('button', { name: 'Bold' })
    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await bold.click()
    await expect(bold).toHaveAttribute('aria-pressed', 'false')
  })
})

test.describe('number input', () => {
  test('buttons and arrow keys step within the limits', async ({ page }) => {
    const card = demo(page, 'multi-select')
    const field = card.getByLabel('Replicas')
    await card.getByRole('button', { name: 'Increase' }).click()
    await expect(field).toHaveValue('4')
    await field.focus()
    await page.keyboard.press('ArrowDown')
    await expect(field).toHaveValue('3')
    await field.fill('10')
    await expect(card.getByRole('button', { name: 'Increase' })).toBeDisabled()
  })

  test('typing past the limit is pulled back on leaving, and empty is not zero', async ({ page }) => {
    const card = demo(page, 'multi-select')
    const field = card.getByLabel('Replicas')
    await field.fill('42')
    await field.blur()
    await expect(field).toHaveValue('10')
    await field.fill('')
    await expect(readout(page, 'multi-select')).toContainText('replicas: empty')
    await card.getByRole('button', { name: 'Increase' }).click()
    await expect(field).toHaveValue('1')
  })
})

test.describe('PIN input', () => {
  test('typing fills box by box and reports when complete', async ({ page }) => {
    const card = demo(page, 'pin-input')
    await card.getByRole('textbox', { name: 'Character 1 of 6' }).click()
    await page.keyboard.type('12x3456')
    // The letter is ignored in a numeric code.
    await expect(readout(page, 'pin-input')).toContainText('code: 123456')
    await expect(card.getByText('Checking 123456…')).toBeVisible()
    await expect(card.getByRole('textbox', { name: 'Character 6 of 6' })).toBeFocused()
  })

  test('Backspace steps back, and arrow keys move between boxes', async ({ page }) => {
    const card = demo(page, 'pin-input')
    await card.getByRole('textbox', { name: 'Character 1 of 6' }).click()
    await page.keyboard.type('123')
    await page.keyboard.press('Backspace')
    await expect(readout(page, 'pin-input')).toContainText('code: 12 ')
    await expect(card.getByRole('textbox', { name: 'Character 3 of 6' })).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(card.getByRole('textbox', { name: 'Character 2 of 6' })).toBeFocused()
  })

  test('a whole code arriving in the first box (autofill) spreads across the boxes', async ({ page }) => {
    const card = demo(page, 'pin-input')
    await card.getByRole('textbox', { name: 'Character 1 of 6' }).fill('445566')
    await expect(readout(page, 'pin-input')).toContainText('code: 445566')
    await expect(card.getByText('Checking 445566…')).toBeVisible()
  })

  test('a pasted code spreads across the boxes', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'only Chromium lets a test hand a paste event its clipboard contents')
    const card = demo(page, 'pin-input')
    const first = card.getByRole('textbox', { name: 'Character 1 of 6' })
    await first.focus()
    await first.evaluate((input) => {
      const data = new DataTransfer()
      data.setData('text', '98-76 54')
      input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    })
    await expect(readout(page, 'pin-input')).toContainText('code: 987654')
  })
})

test.describe('rating', () => {
  test('click to rate, click again to clear, arrow keys to change', async ({ page }) => {
    const group = demo(page, 'pin-input').getByRole('radiogroup', { name: 'Deploy experience' })
    await expect(group.getByRole('radio', { name: '4 stars' })).toBeChecked()
    await group.getByRole('radio', { name: '2 stars' }).check({ force: true })
    await expect(readout(page, 'pin-input')).toContainText('score: 2')
    // Focused explicitly: Safari does not focus a radio button when it is clicked.
    await group.getByRole('radio', { name: '2 stars' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(readout(page, 'pin-input')).toContainText('score: 3')
    await group.getByRole('radio', { name: '3 stars' }).click({ force: true })
    await expect(readout(page, 'pin-input')).toContainText('score: 0')
  })

  test('a read-only rating is one image with the score in its name', async ({ page }) => {
    await expect(demo(page, 'pin-input').getByRole('img', { name: 'Average rating: 3.5 out of 5' })).toBeVisible()
  })
})

test.describe('input group, password, search', () => {
  test('the password can be shown and hidden', async ({ page }) => {
    const card = demo(page, 'input-group')
    const field = card.getByLabel('API secret')
    await expect(field).toHaveAttribute('type', 'password')
    await card.getByRole('button', { name: 'Show password' }).click()
    await expect(field).toHaveAttribute('type', 'text')
    await expect(card.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('search clears with its button or with Escape', async ({ page }) => {
    const card = demo(page, 'input-group')
    const field = card.getByLabel('Search deployments')
    await card.getByRole('button', { name: 'Clear search' }).click()
    await expect(field).toHaveValue('')
    await expect(field).toBeFocused()
    await expect(card.getByRole('button', { name: 'Clear search' })).toHaveCount(0)
    await field.fill('main')
    await page.keyboard.press('Escape')
    await expect(field).toHaveValue('')
  })
})

test.describe('tags input', () => {
  test('Enter and comma add tags; invalid and duplicate ones are refused with a reason', async ({ page }) => {
    const card = demo(page, 'input-group')
    const field = card.getByLabel('Send the report to')
    await field.click()
    await page.keyboard.type('tomas@northwind.com')
    await page.keyboard.press('Enter')
    await page.keyboard.type('priya@northwind.com,')
    await expect(readout(page, 'input-group')).toContainText('to: ines@northwind.com, tomas@northwind.com, priya@northwind.com')

    await page.keyboard.type('not an email')
    await page.keyboard.press('Enter')
    await expect(card.getByRole('alert')).toHaveText('not an email is not an email address.')
    await expect(field).toHaveValue('not an email')

    await field.fill('INES@northwind.com')
    await page.keyboard.press('Enter')
    await expect(card.getByRole('alert')).toHaveText('INES@northwind.com is already added.')
  })

  test('Backspace removes the last tag, and each tag has a remove button', async ({ page }) => {
    const card = demo(page, 'input-group')
    await card.getByLabel('Send the report to').click()
    await page.keyboard.type('tomas@northwind.com')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Backspace')
    await expect(readout(page, 'input-group')).toContainText('to: ines@northwind.com ·')
    await card.getByRole('button', { name: 'Remove ines@northwind.com' }).click()
    await expect(readout(page, 'input-group')).toContainText('to: nobody')
  })
})

test.describe('field and validation', () => {
  test('quiet until checked, then names the problem and clears once fixed', async ({ page }) => {
    const card = demo(page, 'field')
    const name = card.getByLabel('Team name')
    // The message areas are always there, and empty until something is wrong.
    await expect(card.getByRole('alert')).toHaveText(['', ''])
    await name.focus()
    await name.blur()
    await expect(card.getByRole('alert').first()).toHaveText('Give the team a name.')
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription('Give the team a name.')
    await name.fill('Northwind')
    await expect(card.getByRole('alert').first()).toHaveText('')
  })

  test('submitting checks every field', async ({ page }) => {
    const card = demo(page, 'field')
    await card.getByLabel('Billing email').fill('nope')
    await card.getByRole('button', { name: 'Save' }).click()
    await expect(card.getByRole('alert')).toHaveText(['Give the team a name.', /^Enter an email address/])
    await expect(card.getByLabel('Billing email')).toHaveAccessibleDescription(/Enter an email address.*Invoices are sent here/)
  })
})

test.describe('file upload', () => {
  test('accepts files by the rules and explains what it turned away', async ({ page }) => {
    const card = demo(page, 'file-upload')
    await card.getByLabel('Import files').setInputFiles([
      { name: 'users.csv', mimeType: 'text/csv', buffer: Buffer.alloc(1536) },
      { name: 'huge.json', mimeType: 'application/json', buffer: Buffer.alloc(3 * 1024 * 1024) },
    ])
    const list = card.getByRole('list', { name: 'Chosen files' })
    await expect(list.getByRole('listitem')).toHaveCount(1)
    await expect(list).toContainText('users.csv')
    await expect(list).toContainText('1.5 KB')
    await expect(card.getByRole('alert')).toHaveText('huge.json is larger than 2 MB.')
    await expect(list.getByRole('progressbar', { name: 'Uploading users.csv' })).toBeVisible()

    await card.getByRole('button', { name: 'Remove users.csv' }).click()
    await expect(list).toHaveCount(0)
  })
})

test.describe('colour picker', () => {
  test('hex field, presets and the keyboard all change the colour', async ({ page }) => {
    const card = demo(page, 'time-picker')
    await card.getByRole('button', { name: /Brand colour/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Brand colour' })
    await expect(dialog.getByRole('slider', { name: 'Saturation and brightness' })).toBeFocused()

    await dialog.getByLabel('Hex code').fill('#0f8')
    await page.keyboard.press('Enter')
    await expect(readout(page, 'time-picker')).toContainText('colour: #00ff88')

    await dialog.getByRole('button', { name: '#eb6834' }).click()
    await expect(readout(page, 'time-picker')).toContainText('colour: #eb6834')

    await dialog.getByRole('slider', { name: 'Saturation and brightness' }).focus()
    await page.keyboard.press('Shift+ArrowDown')
    await expect(readout(page, 'time-picker')).not.toContainText('#eb6834')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(card.getByRole('button', { name: /Brand colour/ })).toBeFocused()
  })
})
