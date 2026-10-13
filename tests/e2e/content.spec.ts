import { demo, expect, readout, test } from './helpers'

test.describe('phone input', () => {
  test('lays the number out as it is typed and gives back an international number', async ({ page }) => {
    const card = demo(page, 'phone-input')
    const field = card.getByRole('textbox', { name: 'Phone' })
    await field.pressSequentially('5550100199')
    await expect(field).toHaveValue('(555) 010-0199')
    await expect(readout(page, 'phone-input')).toHaveText('phone: +15550100199')

    await card.getByRole('combobox', { name: 'Country calling code' }).selectOption('GB')
    await expect(readout(page, 'phone-input')).toHaveText('phone: +445550100199')
    await expect(field).toHaveValue('5550 100199')
  })

  test('a whole international number pasted in sets the country', async ({ page }) => {
    const card = demo(page, 'phone-input')
    const field = card.getByRole('textbox', { name: 'Phone' })
    await field.fill('+33 6 12 34 56 78')
    await expect(card.getByRole('combobox', { name: 'Country calling code' })).toHaveValue('FR')
    await expect(field).toHaveValue('6 12 34 56 78')
    await expect(readout(page, 'phone-input')).toHaveText('phone: +33612345678')
  })
})

test.describe('password strength', () => {
  test('names the strength and ticks off the rules as they are met', async ({ page }) => {
    const card = demo(page, 'phone-input')
    const meter = card.locator('.er-password-strength')
    await expect(meter).toHaveAttribute('data-score', '0')
    await card.getByLabel('New password', { exact: true }).fill('abc')
    await expect(meter.getByRole('status')).toHaveText('Password strength: Weak')
    await expect(meter.getByRole('listitem').first()).toHaveText('Not met: At least 8 characters')

    await card.getByLabel('New password', { exact: true }).fill('xK9#mQ2$vL')
    await expect(meter.getByRole('status')).toHaveText('Password strength: Strong')
    await expect(meter.getByRole('listitem')).toHaveText(['Met: At least 8 characters', 'Met: A lower-case and an upper-case letter', 'Met: A number or a symbol'])
  })
})

test.describe('toolbar', () => {
  test('is one stop in the tab order; arrow keys move between its buttons and skip a disabled one', async ({ page }) => {
    const toolbar = demo(page, 'toolbar').getByRole('toolbar', { name: 'Text alignment' })
    const tabbable = toolbar.locator('button[tabindex="0"]')
    await expect(tabbable).toHaveCount(1)
    await toolbar.getByRole('button', { name: 'Align left' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(toolbar.getByRole('button', { name: 'Align centre' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(toolbar.getByRole('button', { name: 'Align centre' })).toHaveAttribute('aria-pressed', 'true')
    await expect(toolbar.getByRole('button', { name: 'Align left' })).toHaveAttribute('aria-pressed', 'false')
    await expect(tabbable).toHaveCount(1)

    await page.keyboard.press('End')
    await expect(toolbar.getByRole('button', { name: 'Clear' })).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(toolbar.getByRole('button', { name: 'Copy' })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(toolbar.getByRole('button', { name: 'Align left' })).toBeFocused()
  })
})

test.describe('meter', () => {
  test('reports its reading in words and changes tone past the levels set', async ({ page }) => {
    const card = demo(page, 'toolbar')
    const storage = card.getByRole('meter', { name: 'Storage used' })
    await expect(storage).toHaveAttribute('aria-valuetext', '42 GB of 64 GB')
    await expect(card.locator('.er-meter').first()).toHaveAttribute('data-tone', 'fair')
    await card.getByRole('slider', { name: 'Storage used, in GB' }).fill('60')
    await expect(storage).toHaveAttribute('aria-valuenow', '60')
    await expect(card.locator('.er-meter').first()).toHaveAttribute('data-tone', 'bad')

    // For a battery the low end is the bad one.
    await expect(card.locator('.er-meter').last()).toHaveAttribute('data-tone', 'bad')
    await card.getByRole('slider', { name: 'Battery, in percent' }).fill('80')
    await expect(card.locator('.er-meter').last()).toHaveAttribute('data-tone', 'good')
    await expect(card.getByRole('meter', { name: 'Battery' })).toHaveAttribute('aria-valuetext', '80%')
  })
})

test.describe('rich text editor', () => {
  test('formats what is selected and gives back HTML', async ({ page }) => {
    const card = demo(page, 'rich-text-editor')
    const box = card.getByRole('textbox', { name: 'Product description' })
    await expect(box).toContainText('Thrown by hand and glazed twice')
    await box.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Plain ')
    await card.getByRole('button', { name: 'Italic' }).click()
    await expect(card.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.type('slanted')
    await expect(box.locator('i, em')).toHaveText('slanted')
    await expect(readout(page, 'rich-text-editor')).toContainText('Plain <')

    await page.keyboard.press('ControlOrMeta+a')
    await card.getByRole('button', { name: 'Bulleted list' }).click()
    await expect(box.locator('ul > li')).toHaveCount(1)
  })

  test('a link is made from a field in the page, and only to a safe address', async ({ page }) => {
    const card = demo(page, 'rich-text-editor')
    const box = card.getByRole('textbox', { name: 'Product description' })
    await box.click()
    await page.keyboard.press('ControlOrMeta+a')
    await card.getByRole('button', { name: 'Link' }).click()
    const address = card.getByRole('textbox', { name: 'Link address' })
    await expect(address).toBeFocused()
    await address.fill('javascript:alert(1)')
    await card.getByRole('button', { name: 'Apply' }).click()
    await expect(card.locator('.er-rich-text-editor-error')).toHaveText('Enter a web address, such as https://example.com.')
    await expect(box.locator('a')).toHaveCount(0)

    await address.fill('example.com/mugs')
    await page.keyboard.press('Enter')
    await expect(box.locator('a')).toHaveAttribute('href', 'https://example.com/mugs')
    await expect(address).toBeHidden()
  })

  test('what is pasted loses everything but the formatting on the toolbar', async ({ page }) => {
    const card = demo(page, 'rich-text-editor')
    const box = card.getByRole('textbox', { name: 'Product description' })
    await box.click()
    await page.keyboard.press('ControlOrMeta+a')
    await box.evaluate((el) => {
      const data = new DataTransfer()
      data.setData('text/html', '<p style="color:red" onclick="alert(1)">Hello <b>there</b><script>alert(1)<\/script><img src=x onerror=alert(1)></p>')
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    })
    await expect(box).toHaveText('Hello there')
    await expect(box.locator('b, strong')).toHaveText('there')
    await expect(box.locator('[style], [onclick], script, img')).toHaveCount(0)
  })
})

test.describe('markdown', () => {
  test('renders the usual blocks, and leaves HTML in the source as text', async ({ page }) => {
    const card = demo(page, 'markdown')
    await expect(card.getByRole('heading', { name: 'Release notes', level: 3 })).toBeVisible()
    await expect(card.getByRole('link', { name: 'changelog' })).toHaveAttribute('href', '#markdown')
    await expect(card.getByRole('checkbox', { name: 'Done', exact: true })).toBeChecked()
    await expect(card.getByRole('checkbox', { name: 'Not done' })).not.toBeChecked()
    await expect(card.getByRole('table').getByRole('row')).toHaveCount(3)
    await expect(card.locator('.er-markdown pre code')).toHaveText('npx ermine add markdown\n')
    await expect(card.locator('.er-markdown blockquote')).toContainText('<script>alert(1)</script> stays text.')
    await expect(card.locator('.er-markdown script')).toHaveCount(0)
  })
})

test.describe('emoji picker', () => {
  test('searches by name, and choosing one remembers it', async ({ page }) => {
    const card = demo(page, 'emoji-picker')
    const picker = card.getByRole('group', { name: 'Emoji', exact: true })
    await picker.getByRole('searchbox', { name: 'Search emoji' }).fill('clapping')
    await expect(picker.getByRole('status')).toHaveText('1 found')
    await picker.getByRole('button', { name: 'clapping hands' }).click()
    await expect(readout(page, 'emoji-picker')).toHaveText('👏 clapping hands')

    await picker.getByRole('searchbox', { name: 'Search emoji' }).fill('zzzzzz')
    await expect(picker.getByRole('status')).toHaveText('No emoji found.')
    await picker.getByRole('searchbox', { name: 'Search emoji' }).fill('')
    await expect(picker.getByRole('region', { name: 'Recent' }).getByRole('button')).toHaveText(['👏'])
  })

  test('only one emoji is in the tab order, and the arrow keys move it', async ({ page }) => {
    const picker = demo(page, 'emoji-picker').getByRole('group', { name: 'Emoji', exact: true })
    await expect(picker.locator('.er-emoji-picker-emoji[tabindex="0"]')).toHaveCount(1)
    await picker.getByRole('button', { name: 'grinning face', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(picker.getByRole('button', { name: 'smiling face with big eyes' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    const below = await picker.locator('.er-emoji-picker-emoji:focus').evaluate((el) => {
      const first = el.parentElement!.firstElementChild as HTMLElement
      return { sameColumn: Math.abs(el.getBoundingClientRect().left - first.nextElementSibling!.getBoundingClientRect().left) < 2, lower: el.getBoundingClientRect().top > first.getBoundingClientRect().top }
    })
    expect(below).toEqual({ sameColumn: true, lower: true })
    await expect(picker.locator('.er-emoji-picker-emoji[tabindex="0"]')).toHaveCount(1)
  })
})

test.describe('image cropper', () => {
  test('moves and zooms with the keyboard, never past the edge of the picture, and cuts out a file', async ({ page }) => {
    const card = demo(page, 'image-cropper')
    const frame = card.getByRole('application', { name: 'Position your profile picture' })
    await expect(readout(page, 'image-cropper')).toContainText('zoom 1.00 · moved 0, 0')
    await frame.focus()
    await page.keyboard.press('ArrowRight')
    await expect(readout(page, 'image-cropper')).toContainText('moved 8, 0')
    // The picture is wider than the frame but no taller, so at this zoom it cannot move up or down at all.
    await page.keyboard.press('ArrowDown')
    await expect(readout(page, 'image-cropper')).toContainText('moved 8, 0')
    await page.keyboard.press('+')
    await expect(readout(page, 'image-cropper')).toContainText('zoom 1.10')
    await expect(card.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuetext', '110%')

    await card.getByRole('button', { name: 'Crop' }).click()
    await expect(readout(page, 'image-cropper')).toContainText('cropped to a image/png of some bytes')
    await card.getByRole('button', { name: 'Reset' }).click()
    await expect(readout(page, 'image-cropper')).toContainText('zoom 1.00 · moved 0, 0')
  })
})

test.describe('chat', () => {
  test('Enter sends, Shift+Enter does not, and the reply is added to the log', async ({ page }) => {
    const card = demo(page, 'chat')
    const log = card.getByRole('log', { name: 'Chat with support' })
    const box = card.getByRole('textbox', { name: 'Message to support' })
    await expect(card.getByRole('button', { name: 'Send' })).toBeDisabled()
    await box.fill('It is ER-10482')
    await page.keyboard.press('Shift+Enter')
    await expect(log.getByRole('listitem')).toHaveCount(2)
    await box.fill('It is ER-10482')
    await page.keyboard.press('Enter')
    await expect(box).toHaveValue('')
    await expect(box).toBeFocused()
    await expect(log.getByRole('listitem').nth(2)).toContainText('It is ER-10482')
    await expect(log.getByRole('listitem').nth(2)).toContainText('Sent')
    await expect(log).toContainText('Support is typing…')
    await expect(log.getByRole('listitem').nth(3)).toContainText('A replacement is on its way.')
    await expect(readout(page, 'chat')).toHaveText('4 messages')
    // New messages keep the log scrolled to its end.
    expect(await log.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(4)
  })
})

test.describe('comment thread', () => {
  test('a reply box opens under a comment, one at a time, and the reply lands there', async ({ page }) => {
    const card = demo(page, 'comment-thread')
    await expect(card.getByRole('heading', { name: 'Comments 3' })).toBeVisible()
    const reply = card.getByRole('button', { name: 'Reply to Maya Robinson' })
    await reply.click()
    const box = card.getByRole('textbox', { name: 'Reply to Maya Robinson' })
    await expect(box).toBeFocused()
    await card.getByRole('button', { name: 'Reply to Ines Kovač' }).click()
    await expect(box).toHaveCount(0)

    await reply.click()
    await box.fill('Good to know, thank you.')
    await card.locator('.er-comment-reply').getByRole('button', { name: 'Reply' }).click()
    await expect(box).toHaveCount(0)
    await expect(reply).toBeFocused()
    await expect(card.locator('.er-comment').first().locator('.er-comment-replies > .er-comment')).toHaveCount(2)
    await expect(card.getByRole('heading', { name: 'Comments 4' })).toBeVisible()
  })

  test('a new comment goes to the top, and your own can be deleted', async ({ page }) => {
    const card = demo(page, 'comment-thread')
    await expect(card.getByRole('button', { name: 'Comment', exact: true })).toBeDisabled()
    await card.getByRole('textbox', { name: 'Add a comment' }).fill('Is the handle comfortable?')
    await card.getByRole('button', { name: 'Comment', exact: true }).click()
    await expect(card.locator('.er-comment-thread-list > .er-comment').first()).toContainText('Is the handle comfortable?')
    await card.locator('.er-comment-thread-list > .er-comment').first().getByRole('button', { name: 'Delete your comment' }).click()
    await expect(card.getByText('Is the handle comfortable?')).toHaveCount(0)
  })
})

test.describe('notification centre', () => {
  test('the bell counts what is unread; pressing one marks it read', async ({ page }) => {
    const card = demo(page, 'notification-center')
    await card.getByRole('button', { name: 'Notifications, 2 unread' }).click()
    const list = page.getByRole('dialog', { name: 'Notifications' })
    await expect(list.getByRole('listitem')).toHaveCount(3)
    await expect(list.getByRole('listitem').first()).toContainText('Unread: Deployment failed')
    await list.getByRole('button', { name: /Deployment failed/ }).click()
    await expect(list).toBeHidden()
    await expect(card.locator('[data-readout="notification-center"]')).toHaveText('opened: Deployment failed · 1 unread')

    await card.getByRole('button', { name: 'Notifications, 1 unread' }).click()
    await list.getByRole('button', { name: 'Mark all as read' }).click()
    await expect(list.getByText('Unread:')).toHaveCount(0)
    await expect(list.getByRole('button', { name: 'Mark all as read' })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(card.getByRole('button', { name: 'Notifications', exact: true })).toBeFocused()
  })
})

test.describe('marquee', () => {
  test('keeps its second copy away from screen readers and the keyboard, and stands still when motion is reduced', async ({ page }) => {
    const card = demo(page, 'notification-center')
    const marquee = card.getByRole('group', { name: 'Customers' })
    await expect(marquee.locator('.er-marquee-group')).toHaveCount(2)
    await expect(marquee.locator('.er-marquee-group').last()).toHaveAttribute('aria-hidden', 'true')
    await expect(marquee.locator('.er-marquee-group').last()).toHaveAttribute('inert', '')
    // The tests run with reduced motion, where nothing moves and neither the copy nor the pause button is needed.
    await expect(marquee.locator('.er-marquee-group').last()).toBeHidden()
    await expect(marquee.locator('.er-marquee-track')).toHaveCSS('animation-name', 'none')
    await expect(marquee.getByRole('button')).toHaveCount(0)
  })

  test('with motion allowed it moves, and the button stops it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const card = demo(page, 'notification-center')
    const marquee = card.getByRole('group', { name: 'Customers' })
    await expect(marquee.locator('.er-marquee-track')).toHaveCSS('animation-play-state', 'running')
    await marquee.getByRole('button', { name: 'Pause' }).focus()
    await page.keyboard.press('Enter')
    await expect(marquee.locator('.er-marquee-track')).toHaveCSS('animation-play-state', 'paused')
    await expect(marquee.getByRole('button', { name: 'Play', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(readout(page, 'notification-center')).toHaveText('marquee paused: true')
  })
})

test.describe('json viewer', () => {
  test('branches open and close, and a closed one says how much it holds', async ({ page }) => {
    const tree = demo(page, 'json-viewer').getByRole('group', { name: 'Order' })
    await expect(tree).toContainText('"id": "ord_10482",')
    await expect(tree.locator('[data-type="null"]')).toHaveText('null')
    const customer = tree.getByRole('button', { name: /"customer"/ })
    await expect(customer).toHaveAttribute('aria-expanded', 'false')
    await expect(customer).toContainText('2 keys')
    await customer.click()
    await expect(customer).toHaveAttribute('aria-expanded', 'true')
    await expect(tree).toContainText('"email": "maya@example.com"')
    await tree.getByRole('button', { name: /"items"/ }).click()
    await expect(tree.getByRole('button', { name: /2 keys/ })).toHaveCount(2)
  })
})

test.describe('diff viewer', () => {
  test('counts what changed and marks each line, in one column or two', async ({ page }) => {
    const card = demo(page, 'json-viewer')
    const diff = card.locator('.er-diff-viewer')
    await expect(diff.locator('.er-diff-viewer-stats')).toHaveText(/^\+2\s*lines added−2\s*lines removed$/)
    const table = diff.getByRole('table', { name: 'ermine.config.ts' })
    await expect(table.locator('tr[data-type="removed"]')).toHaveText([/Removed:\s+cache: false,/, /Removed:\s+previews: true,/])
    await expect(table.locator('tr[data-type="added"]')).toHaveText([/Added:\s+cache: true,/, /Added:\s+timeout: 600,/])

    await card.getByRole('radiogroup', { name: 'Diff layout' }).getByRole('radio', { name: 'Split' }).check()
    await expect(diff).toHaveAttribute('data-view', 'split')
    // Side by side, the line taken out sits opposite the one that replaced it.
    const changed = table.getByRole('row').filter({ hasText: 'cache: false' })
    await expect(changed.locator('td[data-type="removed"].er-diff-viewer-text')).toContainText('cache: false,')
    await expect(changed.locator('td[data-type="added"].er-diff-viewer-text')).toContainText('cache: true,')
    await expect(table.locator('td[data-type="blank"]').first()).toBeAttached()
  })
})

test.describe('media player', () => {
  test('plays, seeks and mutes from its own controls and from the keyboard', async ({ page, browserName }) => {
    const card = demo(page, 'media-player')
    const player = card.getByRole('group', { name: 'Three seconds of a test tone' })
    const seek = player.getByRole('slider', { name: 'Seek' })
    await expect(seek).toHaveAttribute('max', '3')
    await expect(player.locator('.er-media-player-time').last()).toHaveText('0:03')

    await player.getByRole('button', { name: 'Mute' }).click()
    await expect(player.getByRole('button', { name: 'Unmute' })).toBeVisible()
    await expect(player.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuetext', '0%')
    await page.keyboard.press('m')
    await expect(player.getByRole('button', { name: 'Mute' })).toBeVisible()

    await seek.fill('2')
    await expect(seek).toHaveAttribute('aria-valuetext', '2 seconds of 3 seconds')
    await player.getByRole('button', { name: /Playback speed, 1 times/ }).click()
    await expect(player.getByRole('button', { name: /Playback speed, 1.25 times/ })).toHaveText('1.25×')

    // WebKit on Linux, as the tests run it in CI, has no audio device to play through.
    test.skip(browserName === 'webkit' && process.platform === 'linux', 'no audio output')
    await player.getByRole('button', { name: 'Mute' }).click()
    await player.getByRole('button', { name: 'Play', exact: true }).click()
    await expect(readout(page, 'media-player')).toHaveText(/playing|finished/)
    await expect(readout(page, 'media-player')).toHaveText('finished')
    await expect(player.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  })
})
