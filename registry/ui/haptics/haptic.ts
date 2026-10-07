import { effectScope, reactive, watch } from 'vue'

/**
 * Vibration feedback through the Vibration API. Android phones support it; iPhones and desktop
 * browsers do not, and there it quietly does nothing — so treat it as a garnish, never as the message.
 */

/** Each pattern is milliseconds of buzz, pause, buzz, pause ... Short and light: a tap, not an alarm. */
const PATTERNS = {
  /** The lightest touch: a key press, a selection moving. */
  light: [8],
  /** A normal button press. The default. */
  medium: [14],
  /** Something weighty: confirming, deleting. */
  heavy: [26],
  /** Two quick taps: it worked. */
  success: [12, 60, 18],
  /** Three firm taps: it did not. */
  error: [22, 50, 22, 50, 22],
  /** A tiny tick, for stepping through values (a slider, a picker). */
  selection: [4],
} satisfies Record<string, number[]>

export type HapticName = keyof typeof PATTERNS
export const hapticNames = Object.keys(PATTERNS) as HapticName[]

const STORAGE_KEY = 'er-haptics'

/** Whether vibration is used. Shared by the whole page and remembered between visits. */
export const hapticSettings = reactive({ enabled: true })

let ready = false
function prepare() {
  if (ready || typeof window === 'undefined') return
  ready = true
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as { enabled?: unknown } | null
    if (typeof saved?.enabled === 'boolean') hapticSettings.enabled = saved.enabled
    // Someone who has asked their system for less motion gets no buzzing until they ask for it.
    else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) hapticSettings.enabled = false
  } catch {
    // Storage can be blocked. The default still works.
  }
  effectScope(true).run(() =>
    watch(
      () => hapticSettings.enabled,
      (enabled) => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled }))
        } catch {
          // Not being able to save the choice is not worth interrupting anyone for.
        }
      },
    ),
  )
}

/**
 * For use inside components: `const { haptic, settings, supported } = useHaptics()`. Calling it
 * loads the saved choice straight away, which is what a settings switch bound to `settings.enabled` needs.
 */
export function useHaptics() {
  prepare()
  return { haptic, settings: hapticSettings, supported: canVibrate() }
}

/** True where the device can vibrate at all. Use it to hide a "vibration" setting that would do nothing. */
export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

/**
 * Vibrates now, unless haptics are switched off or the device cannot. Returns whether it buzzed.
 * Browsers only allow this in response to a tap or key press.
 */
export function haptic(name: HapticName | number[] = 'medium'): boolean {
  prepare()
  if (!hapticSettings.enabled || !canVibrate()) return false
  const pattern = typeof name === 'string' ? PATTERNS[name] : name
  if (!pattern) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}
