import { onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

// What counts as the reader being there. Moving the mouse counts, so a reader who is only reading still has to nudge it.
const ACTIVITY = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'] as const

/**
 * Tracks whether the reader has done nothing for `timeout` ms. Time in another tab or another window
 * counts as nothing, and is caught up on as soon as the page is shown again, since browsers slow
 * timers down in hidden tabs. `idle` goes back to false on the next activity.
 */
export function useIdle(timeout: MaybeRefOrGetter<number>, options: { enabled?: MaybeRefOrGetter<boolean> } = {}) {
  const idle = ref(false)
  /** When the reader last did something, as a timestamp in ms. */
  const lastActive = ref(Date.now())
  let timer: ReturnType<typeof setTimeout> | undefined

  const enabled = () => toValue(options.enabled ?? true)

  function check() {
    clearTimeout(timer)
    if (!enabled()) return
    const left = lastActive.value + toValue(timeout) - Date.now()
    if (left <= 0) idle.value = true
    else timer = setTimeout(check, left)
  }

  /** Start counting again from now, as if the reader had just done something. */
  function reset() {
    lastActive.value = Date.now()
    idle.value = false
    check()
  }

  // Activity only records the time; the one timer re-arms itself, so a moving mouse costs nothing.
  function onActivity() {
    lastActive.value = Date.now()
    if (idle.value) reset()
  }

  // Coming back to the tab is not activity: the reader should see what they missed.
  function onVisibility() {
    if (document.visibilityState === 'visible') check()
  }

  onMounted(() => {
    for (const type of ACTIVITY) window.addEventListener(type, onActivity, { passive: true, capture: true })
    document.addEventListener('visibilitychange', onVisibility)
    reset()
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
    for (const type of ACTIVITY) window.removeEventListener(type, onActivity, { capture: true })
    document.removeEventListener('visibilitychange', onVisibility)
  })

  // Turning it back on, or changing the timeout, starts the count again.
  watch([enabled, () => toValue(timeout)], () => {
    if (enabled()) return reset()
    clearTimeout(timer)
    idle.value = false
  })

  return { idle, lastActive, reset }
}
