import type { Page } from '@playwright/test'
import { demo, expect, test } from './helpers'

// A test cannot listen, so the browser's audio engine is swapped for one that writes down every tone
// it is asked to play. What reaches the speakers is covered by the unit tests on the sound recipes.
async function recordAudio(page: Page, options: { reducedMotion?: 'reduce' | 'no-preference'; saved?: string } = {}) {
  await page.emulateMedia({ reducedMotion: options.reducedMotion ?? 'no-preference' })
  await page.addInitScript((saved) => {
    if (saved) localStorage.setItem('sb-sound', saved)
    const played: Array<{ freq: number; volume: number }> = []
    ;(window as unknown as { __played: typeof played }).__played = played
    const param = (onSet: (value: number) => void = () => {}) => ({ value: 1, setValueAtTime: onSet, exponentialRampToValueAtTime: () => {} })
    class FakeAudioContext {
      currentTime = 0
      state = 'running'
      destination = {}
      resume() {}
      createGain() {
        const node = { gain: param(), connect: (next: unknown) => next }
        ;(this as unknown as { last: typeof node }).last = node
        return node
      }
      createOscillator() {
        const volume = (this as unknown as { master?: { gain: { value: number } } }).master
        return { type: 'sine', frequency: param((value) => played.push({ freq: value, volume: volume?.gain.value ?? -1 })), connect: (next: unknown) => next, start() {}, stop() {} }
      }
    }
    // The first gain node made for each sound is the volume control; remember it so tones can report it.
    const createGain = FakeAudioContext.prototype.createGain
    let fresh = true
    FakeAudioContext.prototype.createGain = function () {
      const node = createGain.call(this)
      if (fresh) (this as unknown as { master: typeof node }).master = node
      fresh = false
      queueMicrotask(() => (fresh = true))
      return node
    }
    ;(window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext
  }, options.saved ?? '')
  await page.reload()
  await expect(page.locator('.demo').first()).toBeVisible()
  return {
    played: () => page.evaluate(() => (window as unknown as { __played: Array<{ freq: number; volume: number }> }).__played),
    clear: () => page.evaluate(() => void ((window as unknown as { __played: unknown[] }).__played.length = 0)),
  }
}

test.describe('sound', () => {
  test('a button with v-sound plays its sound on click and on the keyboard', async ({ page }) => {
    const audio = await recordAudio(page)
    const card = demo(page, 'sound')
    await card.getByRole('button', { name: 'Click', exact: true }).click()
    expect((await audio.played()).map((tone) => tone.freq)).toEqual([1100])

    await audio.clear()
    await card.getByRole('button', { name: 'Success' }).focus()
    await page.keyboard.press('Enter')
    expect((await audio.played()).map((tone) => tone.freq)).toEqual([523.25, 659.25, 783.99])
  })

  test('a disabled button stays silent', async ({ page }) => {
    const audio = await recordAudio(page)
    await demo(page, 'sound').getByRole('button', { name: 'Disabled' }).click({ force: true })
    expect(await audio.played()).toEqual([])
  })

  test('a toggling control plays "on" or "off" to match where it ended up', async ({ page }) => {
    const audio = await recordAudio(page)
    const toggle = demo(page, 'sound').getByRole('switch')
    await toggle.click()
    await expect(toggle).not.toBeChecked()
    expect((await audio.played()).map((tone) => tone.freq)).toEqual([780, 520])
    await audio.clear()
    await toggle.click()
    expect((await audio.played()).map((tone) => tone.freq)).toEqual([520, 780])
  })

  test('hovering plays a faint tick, once per visit', async ({ page }) => {
    const audio = await recordAudio(page)
    const button = demo(page, 'sound').getByRole('button', { name: 'Hover, then press' })
    await button.hover()
    expect((await audio.played()).map((tone) => tone.freq)).toEqual([1800])
    await page.mouse.move(0, 0)
    await button.hover()
    expect(await audio.played()).toHaveLength(2)
  })

  test('the mute button silences everything and says so; turning it back on plays a sound', async ({ page }) => {
    const audio = await recordAudio(page)
    const card = demo(page, 'sound')
    const mute = card.getByRole('button', { name: 'Sound', exact: true })
    await expect(mute).toHaveAttribute('aria-pressed', 'true')
    await mute.click()
    await expect(mute).toHaveAttribute('aria-pressed', 'false')
    await card.getByRole('button', { name: 'Click', exact: true }).click()
    await card.getByRole('switch').click()
    expect(await audio.played()).toEqual([])
    await mute.click()
    expect((await audio.played()).map((tone) => tone.freq)).toEqual([520, 780])
  })

  test('the volume slider sets how loud sounds are, and zero means nothing plays', async ({ page }) => {
    const audio = await recordAudio(page)
    const card = demo(page, 'sound')
    const volume = card.getByRole('slider', { name: 'Volume' })
    await volume.fill('20')
    await card.getByRole('button', { name: 'Click', exact: true }).click()
    expect((await audio.played())[0]!.volume).toBeCloseTo(0.2)
    await audio.clear()
    await volume.fill('0')
    await card.getByRole('button', { name: 'Click', exact: true }).click()
    expect(await audio.played()).toEqual([])
  })

  test('sound starts off when the system asks for reduced motion, until the reader turns it on', async ({ page }) => {
    const audio = await recordAudio(page, { reducedMotion: 'reduce' })
    const card = demo(page, 'sound')
    await expect(card.getByRole('button', { name: 'Sound', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await card.getByRole('button', { name: 'Click', exact: true }).click()
    expect(await audio.played()).toEqual([])
    await card.getByRole('button', { name: 'Sound', exact: true }).click()
    await audio.clear()
    await card.getByRole('button', { name: 'Click', exact: true }).click()
    expect(await audio.played()).toHaveLength(1)
  })

  test('the choice is remembered on the next visit', async ({ page }) => {
    const audio = await recordAudio(page)
    const card = demo(page, 'sound')
    await card.getByRole('button', { name: 'Sound', exact: true }).click()
    await card.getByRole('slider', { name: 'Volume' }).fill('30')
    await expect.poll(() => page.evaluate(() => localStorage.getItem('sb-sound'))).toBe('{"enabled":false,"volume":0.3}')
    await page.reload()
    await expect(demo(page, 'sound').getByRole('button', { name: 'Sound', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await expect(demo(page, 'sound').getByRole('slider', { name: 'Volume' })).toHaveValue('30')
    await demo(page, 'sound').getByRole('button', { name: 'Click', exact: true }).click()
    expect(await audio.played()).toEqual([])
  })

  test('a browser with no audio support still works: the click goes through silently', async ({ page }) => {
    await page.addInitScript(() => {
      delete (window as unknown as { AudioContext?: unknown }).AudioContext
      delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext
    })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.reload()
    const toggle = demo(page, 'sound').getByRole('switch')
    await toggle.click()
    await expect(toggle).not.toBeChecked()
  })
})
