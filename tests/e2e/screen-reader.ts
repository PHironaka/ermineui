import { createRequire } from 'node:module'
import type { Page } from '@playwright/test'

const bundle = createRequire(import.meta.url).resolve('@guidepup/virtual-screen-reader/browser.js')

/**
 * A simulated screen reader, running inside the page under test.
 *
 * It walks the page the way a screen reader does (one item at a time, by role, name and state) and
 * records what would be spoken, including announcements from live regions. It follows the same
 * accessibility rules real screen readers follow, but it is not one: it has no speech, no quirks,
 * and no opinion on whether something is pleasant to use. It catches a missing name, a wrong role,
 * a state that is not exposed, or an announcement that never fires.
 */
export async function startScreenReader(page: Page, container = 'body') {
  await page.route('**/__virtual-screen-reader.js', (route) => route.fulfill({ path: bundle, contentType: 'text/javascript' }))
  await page.evaluate(async (selector) => {
    // The simulator reads the `checked` attribute; real screen readers read the live state. For native
    // checkboxes and radio buttons the two differ as soon as one is ticked, so the live state is kept
    // copied onto the attributes the simulator looks at. This changes nothing a user could see.
    const sync = () => {
      for (const input of document.querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')) {
        if (input.hasAttribute('checked') !== input.checked) input.toggleAttribute('checked', input.checked)
        if (input.indeterminate) input.setAttribute('aria-checked', 'mixed')
        else if (input.getAttribute('aria-checked') === 'mixed') input.removeAttribute('aria-checked')
      }
    }
    sync()
    setInterval(sync, 30)

    const { virtual } = await import(/* @vite-ignore */ `${location.origin}/__virtual-screen-reader.js`)
    await virtual.start({ container: document.querySelector(selector) })
    ;(window as unknown as { __sr: typeof virtual }).__sr = virtual
  }, container)

  type Virtual = {
    next: () => Promise<void>
    previous: () => Promise<void>
    press: (key: string) => Promise<void>
    act: () => Promise<void>
    stop: () => Promise<void>
    lastSpokenPhrase: () => Promise<string>
    spokenPhraseLog: () => Promise<string[]>
    clearSpokenPhraseLog: () => Promise<void>
  }
  const call = <T>(method: keyof Virtual, argument?: string) =>
    page.evaluate(([name, value]) => (window as unknown as { __sr: Record<string, (value?: string) => Promise<T>> }).__sr[name!]!(value), [method, argument] as const)

  return {
    /** Move to the next item, as a screen reader's "next" command does, and return what was spoken. */
    next: async () => {
      await call('next')
      return call<string>('lastSpokenPhrase')
    },
    previous: async () => {
      await call('previous')
      return call<string>('lastSpokenPhrase')
    },
    /** Press a key (or combination, such as "Shift+Tab") on whatever has focus. */
    press: (key: string) => call<void>('press', key),
    /** Activate the current item: what Enter or a double-tap does. */
    act: () => call<void>('act'),
    last: () => call<string>('lastSpokenPhrase'),
    /** Everything spoken so far, oldest first. */
    log: () => call<string[]>('spokenPhraseLog'),
    clear: () => call<void>('clearSpokenPhraseLog'),
    /** Keep moving to the next item until the reader says something matching `phrase`. */
    nextUntil: async (phrase: string | RegExp, limit = 60) => {
      for (let step = 0; step < limit; step++) {
        await call('next')
        const spoken = await call<string>('lastSpokenPhrase')
        if (typeof phrase === 'string' ? spoken.includes(phrase) : phrase.test(spoken)) return spoken
      }
      throw new Error(`The screen reader never said ${phrase} within ${limit} items. Heard: ${(await call<string[]>('spokenPhraseLog')).slice(-12).join(' | ')}`)
    },
    stop: () => call<void>('stop'),
  }
}
