import { nextTick } from 'vue'

/**
 * The View Transitions API takes a picture of the page, lets you change it, takes another, and
 * animates from one to the other. Elements that carry the same view-transition-name in both
 * pictures glide from their old place to their new one. Where the browser does not support it,
 * or the reader has asked for reduced motion, the change simply happens at once.
 */

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => { ready: Promise<void>; finished: Promise<void> }
}

/** True where the browser can animate between two states of the page. */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof (document as TransitionDocument).startViewTransition === 'function'
}

const calm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Runs `update` (which changes your state) and animates the page from how it looked before to how
 * it looks after. Resolves when the animation is over.
 *
 *   viewTransition(() => { items.value = shuffle(items.value) })
 */
export async function viewTransition(update: () => void | Promise<void>): Promise<void> {
  if (!supportsViewTransitions() || calm()) {
    await update()
    return
  }
  const transition = (document as TransitionDocument).startViewTransition!(async () => {
    await update()
    // Vue redraws a tick later; the "after" picture has to wait for that.
    await nextTick()
  })
  // Rejects if the transition is skipped (another one started, the tab was hidden). The change still happened.
  await transition.finished.catch(() => {})
}

/**
 * Like viewTransition, but the new look is uncovered by a circle growing from a point: usually
 * the button that was pressed. Made for switching theme.
 *
 *   revealTransition(() => toggleTheme(), event)
 */
export async function revealTransition(update: () => void | Promise<void>, origin?: { clientX: number; clientY: number } | { x: number; y: number }): Promise<void> {
  if (!supportsViewTransitions() || calm()) {
    await update()
    return
  }
  const x = origin ? ('clientX' in origin ? origin.clientX : origin.x) : window.innerWidth / 2
  const y = origin ? ('clientY' in origin ? origin.clientY : origin.y) : window.innerHeight / 2
  // Far enough to reach the furthest corner from the starting point.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  const root = document.documentElement
  root.dataset.erReveal = ''
  const transition = (document as TransitionDocument).startViewTransition!(async () => {
    await update()
    await nextTick()
  })
  try {
    await transition.ready
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
    )
    await transition.finished
  } catch {
    // Skipped: the change still happened, just without the animation.
  } finally {
    delete root.dataset.erReveal
  }
}
