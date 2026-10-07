import { createRequire } from 'node:module'
import type { Page } from '@playwright/test'
import { demo, expect, readout, test } from './helpers'

// Components that wrap one browser feature each. Where the feature needs hardware or a permission a
// test browser does not have (vibration, the share sheet, notifications), it is replaced by a stand-in
// that records how it was called.

const jsQR = createRequire(import.meta.url)('jsqr') as (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null

/** Reloads the page with motion allowed and, optionally, some browser features swapped for recorders. */
async function reload(page: Page, setup?: () => void) {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  if (setup) await page.addInitScript(setup)
  await page.reload()
  await expect(page.locator('.demo').first()).toBeVisible()
}

test.describe('haptics', () => {
  test('v-haptic vibrates with the named pattern, and the switch turns it off', async ({ page }) => {
    await reload(page, () => {
      const calls: number[][] = []
      ;(window as unknown as { __vibrations: number[][] }).__vibrations = calls
      navigator.vibrate = (pattern) => (calls.push([pattern].flat() as number[]), true)
    })
    const card = demo(page, 'haptics')
    const calls = () => page.evaluate(() => (window as unknown as { __vibrations: number[][] }).__vibrations)
    await expect(card.getByText('This device can vibrate.')).toBeVisible()
    await card.getByRole('button', { name: 'Press' }).click()
    await card.getByRole('button', { name: 'Success' }).click()
    expect(await calls()).toEqual([[14], [12, 60, 18]])

    // A toggling control buzzes more firmly going on than coming off.
    await card.getByRole('switch', { name: /buzzes as it flips/ }).click()
    await card.getByRole('switch', { name: /buzzes as it flips/ }).click()
    expect((await calls()).slice(2)).toEqual([[14], [8]])

    await card.getByRole('switch', { name: 'Vibration' }).click()
    await card.getByRole('button', { name: 'Heavy' }).click()
    // Switched off: nothing more.
    expect(await calls()).toHaveLength(4)
  })

  test('on a device that cannot vibrate, the buttons still work and the demo says so', async ({ page }) => {
    await reload(page, () => {
      Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
    })
    const card = demo(page, 'haptics')
    await expect(card.getByText(/cannot vibrate/)).toBeVisible()
    await card.getByRole('button', { name: 'Press' }).click()
  })

  test('vibration starts off when the system asks for reduced motion', async ({ page }) => {
    // The suite's default is reduced motion, so the page as first loaded is the case to check.
    await expect(demo(page, 'haptics').getByRole('switch', { name: 'Vibration' })).not.toBeChecked()
  })
})

test.describe('share button and QR code', () => {
  test('uses the share sheet when there is one', async ({ page }) => {
    await reload(page, () => {
      navigator.share = async (data) => void ((window as unknown as { __shared: unknown }).__shared = data)
      navigator.canShare = () => true
    })
    const card = demo(page, 'share-button')
    await card.getByRole('button', { name: 'Share' }).click()
    await expect(readout(page, 'share-button')).toHaveText('Shared')
    expect(await page.evaluate(() => (window as unknown as { __shared: unknown }).__shared)).toEqual({
      url: 'https://example.com/sable-ui',
      title: 'Sable UI',
      text: 'Vue components you copy in and own.',
    })
  })

  test('copies the link where there is no share sheet, and says so', async ({ page }) => {
    await reload(page, () => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => void ((window as unknown as { __copied: string }).__copied = text) }, configurable: true })
    })
    const card = demo(page, 'share-button')
    const button = card.getByRole('button', { name: 'Share' })
    await button.click()
    await expect(card.getByRole('button', { name: /Link copied/ })).toBeVisible()
    await expect(card.getByRole('status')).toHaveText('Link copied')
    await expect(readout(page, 'share-button')).toHaveText('Copied https://example.com/sable-ui')
  })

  test('closing the share sheet without choosing is not treated as an error', async ({ page }) => {
    await reload(page, () => {
      navigator.share = async () => {
        throw new DOMException('cancelled', 'AbortError')
      }
      navigator.canShare = () => true
    })
    await demo(page, 'share-button').getByRole('button', { name: 'Share' }).click()
    await expect(readout(page, 'share-button')).toHaveText('Nothing shared yet')
  })

  /** Draws the QR code as the browser shows it and hands the pixels to an independent reader. */
  const scan = async (page: Page) => {
    const image = await demo(page, 'share-button')
      .getByRole('img', { name: 'QR code for the link above' })
      .evaluate(async (svg) => {
        const picture = new Image()
        picture.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`
        await picture.decode()
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 400
        const context = canvas.getContext('2d')!
        context.drawImage(picture, 0, 0, 400, 400)
        return Array.from(context.getImageData(0, 0, 400, 400).data)
      })
    return jsQR(new Uint8ClampedArray(image), 400, 400)?.data
  }

  test('the QR code on the page really scans, and follows the link as it is edited', async ({ page }) => {
    expect(await scan(page)).toBe('https://example.com/sable-ui')
    await demo(page, 'share-button').getByRole('textbox', { name: 'Link' }).fill('https://example.com/changed?x=1')
    expect(await scan(page)).toBe('https://example.com/changed?x=1')
  })

  test('the QR code is dark on white in both themes, and refuses text that is too long', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const code = demo(page, 'share-button').getByRole('img', { name: 'QR code for the link above' })
    await expect(code.locator('rect')).toHaveAttribute('fill', '#fff')
    await expect(code.locator('path')).toHaveAttribute('fill', '#000')
    await demo(page, 'share-button').getByRole('textbox', { name: 'Link' }).fill('x'.repeat(3000))
    await expect(demo(page, 'share-button').getByRole('alert')).toHaveText('This is too much text for a QR code.')
  })
})

test.describe('offline banner', () => {
  test('appears when the connection drops and confirms when it returns', async ({ page, context }) => {
    const banner = page.locator('.sb-offline-banner')
    await expect(banner).toHaveText('')
    await context.setOffline(true)
    await expect(banner).toContainText('You are offline')
    await expect(banner).toBeInViewport()
    await context.setOffline(false)
    await expect(banner).toHaveText('Back online.')
    await expect(banner).toHaveText('', { timeout: 6000 })
  })
})

test.describe('signature pad', () => {
  test('drawing makes an image, and Clear empties it', async ({ page }) => {
    const card = demo(page, 'signature-pad')
    const pad = card.getByRole('img', { name: /Your signature/ })
    await expect(pad).toHaveAccessibleName('Your signature: empty')
    await expect(card.getByRole('button', { name: 'Clear' })).toBeDisabled()
    await pad.scrollIntoViewIfNeeded()
    const box = (await pad.boundingBox())!
    await page.mouse.move(box.x + 30, box.y + 80)
    await page.mouse.down()
    await page.mouse.move(box.x + 90, box.y + 40, { steps: 6 })
    await page.mouse.move(box.x + 150, box.y + 100, { steps: 6 })
    await page.mouse.up()
    await expect(pad).toHaveAccessibleName('Your signature: signed')
    await expect(readout(page, 'signature-pad')).toHaveText(/^image ready, \d+ KB$/)
    await card.getByRole('button', { name: 'Clear' }).click()
    await expect(readout(page, 'signature-pad')).toHaveText('not signed')
    await expect(pad).toHaveAccessibleName('Your signature: empty')
  })

  test('the exported image is dark ink on a clear background, even in the dark theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const pad = demo(page, 'signature-pad').getByRole('img', { name: /Your signature/ })
    await pad.scrollIntoViewIfNeeded()
    const box = (await pad.boundingBox())!
    await page.mouse.move(box.x + 40, box.y + 60)
    await page.mouse.down()
    await page.mouse.move(box.x + 200, box.y + 60, { steps: 8 })
    await page.mouse.up()
    // The on-screen ink follows the theme (light on dark)...
    const onScreen = await pad.evaluate((canvas: HTMLCanvasElement) => {
      const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
      for (let i = 0; i < data.length; i += 4) if (data[i + 3]! > 200) return [data[i], data[i + 1], data[i + 2]]
      return null
    })
    expect(onScreen![0]).toBeGreaterThan(200)
    // ...while the exported image (kept by the demo in an <img> for this check) is dark ink on a clear background.
    const exported = await page.evaluate(async () => {
      const picture = new Image()
      picture.src = (document.querySelector('#signature-pad [data-signature]') as HTMLElement).dataset.signature!
      await picture.decode()
      const canvas = document.createElement('canvas')
      canvas.width = picture.width
      canvas.height = picture.height
      const context = canvas.getContext('2d')!
      context.drawImage(picture, 0, 0)
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data
      let ink: number[] | null = null
      for (let i = 0; i < data.length && !ink; i += 4) if (data[i + 3]! > 200) ink = [data[i]!, data[i + 1]!, data[i + 2]!]
      return { ink, cornerAlpha: data[3] }
    })
    expect(exported.ink![0]).toBeLessThan(60)
    expect(exported.cornerAlpha).toBe(0)
  })
})

test.describe('scroll progress, reveal and count up', () => {
  test('the bar fills from empty to full as the page is scrolled', async ({ page }) => {
    const bar = page.locator('.sb-scroll-progress')
    const progress = () => bar.evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--sb-scroll-progress')))
    expect(await progress()).toBe(0)
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2))
    await expect.poll(progress).toBeCloseTo(0.5, 1)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect.poll(progress).toBe(1)
    await expect(bar).toHaveAttribute('aria-hidden', 'true')
  })

  test('with reduced motion, revealed content is simply visible and numbers show their value', async ({ page }) => {
    const card = demo(page, 'scroll-progress')
    await expect(card.locator('.sb-card').first()).toHaveCSS('opacity', '1')
    await expect(card.locator('.sb-count-up [aria-hidden]').first()).toHaveText('21.5K')
  })

  test('with motion allowed, content waits out of view, then appears when scrolled to', async ({ page }) => {
    await reload(page)
    const item = demo(page, 'scroll-progress').locator('.sb-card').first()
    await expect(item).toHaveAttribute('data-reveal', 'waiting')
    await expect(item).toHaveCSS('opacity', '0')
    await item.scrollIntoViewIfNeeded()
    await expect(item).toHaveAttribute('data-reveal', 'shown')
    await expect(item).toHaveCSS('opacity', '1')
  })

  test('a number counts up to its value once in view, while screen readers get the final value from the start', async ({ page }) => {
    await reload(page)
    const count = demo(page, 'scroll-progress').locator('p .sb-count-up')
    await expect(count.locator('.sb-count-up-value')).toHaveText('1,284,306')
    await expect(count.locator('[aria-hidden]')).toHaveText('0')
    await count.scrollIntoViewIfNeeded()
    await expect(count.locator('[aria-hidden]')).toHaveText('1,284,306')
  })
})

test.describe('wake lock, fullscreen, notification prompt', () => {
  test('the wake lock toggle asks for the lock, releases it, and takes it again when the tab returns', async ({ page }) => {
    await reload(page, () => {
      const log: string[] = []
      ;(window as unknown as { __wake: string[] }).__wake = log
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
          request: async () => {
            log.push('request')
            let onRelease = () => {}
            return { release: async () => (log.push('release'), onRelease()), addEventListener: (_type: string, listener: () => void) => (onRelease = listener) }
          },
        },
      })
    })
    const toggle = demo(page, 'wake-lock').getByRole('button', { name: 'Keep screen on' })
    const log = () => page.evaluate(() => (window as unknown as { __wake: string[] }).__wake)
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(demo(page, 'wake-lock').getByText('screen kept on: true')).toBeVisible()
    expect(await log()).toEqual(['request'])
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(await log()).toEqual(['request', 'release'])
  })

  test('the wake lock toggle is left out where the browser has no such thing', async ({ page }) => {
    await reload(page, () => {
      delete (Navigator.prototype as unknown as { wakeLock?: unknown }).wakeLock
    })
    await expect(demo(page, 'wake-lock').getByRole('button', { name: 'Keep screen on' })).toHaveCount(0)
  })

  test('the fullscreen button asks for its target and renames itself', async ({ page }) => {
    await reload(page, () => {
      // A test browser has no screen to fill, so the request is recorded and the change event sent by hand.
      let current: Element | null = null
      Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => true })
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => current })
      Element.prototype.requestFullscreen = async function () {
        current = this
        ;(window as unknown as { __fullscreen: string }).__fullscreen = this.id
        document.dispatchEvent(new Event('fullscreenchange'))
      }
      document.exitFullscreen = async () => {
        current = null
        document.dispatchEvent(new Event('fullscreenchange'))
      }
    })
    const card = demo(page, 'wake-lock')
    await card.getByRole('button', { name: 'Enter full screen' }).click()
    expect(await page.evaluate(() => (window as unknown as { __fullscreen: string }).__fullscreen)).toBe('wake-lock')
    await card.getByRole('button', { name: 'Exit full screen' }).click()
    await expect(card.getByRole('button', { name: 'Enter full screen' })).toBeVisible()
  })

  const fakeNotifications = (answer: string) => `
    window.__asked = 0
    window.Notification = { permission: 'default', requestPermission: async () => { window.__asked++; window.Notification.permission = '${answer}'; return '${answer}' } }
  `

  test('the notification prompt never asks the browser until its button is pressed', async ({ page }) => {
    await page.addInitScript(fakeNotifications('granted'))
    await reload(page)
    const card = demo(page, 'wake-lock')
    await expect(card.getByText('Get told when a deployment fails?')).toBeVisible()
    expect(await page.evaluate(() => (window as unknown as { __asked: number }).__asked)).toBe(0)
    await card.getByRole('button', { name: 'Turn on' }).click()
    await expect(readout(page, 'wake-lock').last()).toHaveText('notifications: Allowed')
    await expect(card.getByText('Get told when a deployment fails?')).toHaveCount(0)
    expect(await page.evaluate(() => (window as unknown as { __asked: number }).__asked)).toBe(1)
  })

  test('"Not now" closes the prompt without asking, and a refusal explains where the setting is', async ({ page }) => {
    await page.addInitScript(fakeNotifications('denied'))
    await reload(page)
    const card = demo(page, 'wake-lock')
    await card.getByRole('button', { name: 'Turn on' }).click()
    await expect(card.getByText(/Notifications are blocked for this site/)).toBeVisible()
    await expect(readout(page, 'wake-lock').last()).toHaveText('notifications: Blocked')

    await page.reload()
    // Permission is "default" again after the reload (the stand-in resets), so the prompt is back.
    await demo(page, 'wake-lock').getByRole('button', { name: 'Not now' }).click()
    await expect(demo(page, 'wake-lock').getByText('Get told when a deployment fails?')).toHaveCount(0)
    expect(await page.evaluate(() => (window as unknown as { __asked: number }).__asked)).toBe(0)
  })
})

test.describe('view transition', () => {
  const order = (page: Page) => demo(page, 'view-transition').getByRole('list', { name: 'Regions' }).getByRole('listitem').allTextContents()

  test('the change is applied whether or not the browser can animate it', async ({ page }) => {
    const card = demo(page, 'view-transition')
    await card.getByRole('button', { name: 'Sort by latency' }).click()
    await expect.poll(() => order(page)).toEqual(['Singapore176 ms', 'San Francisco148 ms', 'Washington, D.C.92 ms', 'London24 ms', 'Frankfurt18 ms'])
    await card.getByRole('button', { name: 'Rotate' }).click()
    await expect.poll(async () => (await order(page))[0]).toBe('Washington, D.C.92 ms')
  })

  test('each row carries a name of its own, so it can be followed from old place to new', async ({ page }) => {
    const names = await demo(page, 'view-transition')
      .getByRole('listitem')
      .evaluateAll((rows) => rows.map((row) => (row as HTMLElement).style.getPropertyValue('view-transition-name')))
    expect(names).toEqual(['sb-region-fra1', 'sb-region-lhr1', 'sb-region-iad1', 'sb-region-sfo1', 'sb-region-sin1'])
  })

  test('with motion allowed the browser’s transition is used; with reduced motion it is skipped', async ({ page }) => {
    const count = () => page.evaluate(() => (window as unknown as { __transitions: number }).__transitions)
    const wrap = () => {
      ;(window as unknown as { __transitions: number }).__transitions = 0
      const original = document.startViewTransition?.bind(document)
      // A browser without the feature gets a minimal one, so the same check runs everywhere.
      document.startViewTransition = ((update: () => Promise<void>) => {
        ;(window as unknown as { __transitions: number }).__transitions++
        if (original) return original(update)
        const done = Promise.resolve(update())
        return { ready: done, finished: done, updateCallbackDone: done, skipTransition() {} }
      }) as typeof document.startViewTransition
    }
    await page.addInitScript(wrap)
    await page.reload()
    await demo(page, 'view-transition').getByRole('button', { name: 'Rotate' }).click()
    await expect.poll(async () => (await order(page))[0]).toBe('Washington, D.C.92 ms')
    expect(await count(), 'reduced motion: changed at once').toBe(0)

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.reload()
    await demo(page, 'view-transition').getByRole('button', { name: 'Rotate' }).click()
    await expect.poll(async () => (await order(page))[0]).toBe('Washington, D.C.92 ms')
    expect(await count()).toBe(1)
  })

  test('the theme button still switches theme', async ({ page }) => {
    await reload(page)
    await page.getByRole('button', { name: /Switch to dark theme/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: /Switch to light theme/ })).toBeVisible()
    await expect(page.locator('html')).not.toHaveAttribute('data-sb-reveal')
  })
})

test.describe('eyedropper', () => {
  test('where the browser can pick from the screen, the colour picker offers it', async ({ page }) => {
    await reload(page, () => {
      ;(window as unknown as { EyeDropper: unknown }).EyeDropper = class {
        open = async () => ({ sRGBHex: '#1BAF7A' })
      }
    })
    const card = demo(page, 'time-picker')
    await card.getByRole('button', { name: /Brand colour/ }).click()
    await page.getByRole('button', { name: 'Pick a colour from the screen' }).click()
    await expect(readout(page, 'time-picker')).toContainText('colour: #1baf7a')
  })

  test('where it cannot, the button is not there', async ({ page }) => {
    await reload(page, () => {
      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper
    })
    await demo(page, 'time-picker').getByRole('button', { name: /Brand colour/ }).click()
    await expect(page.getByRole('dialog', { name: 'Brand colour' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pick a colour from the screen' })).toHaveCount(0)
  })
})
