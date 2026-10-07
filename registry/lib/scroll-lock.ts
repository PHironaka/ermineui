let locks = 0
let restore: (() => void) | undefined

/**
 * Stops the page behind a modal from scrolling. Returns the function that
 * releases the lock. Locks are counted, so nested modals behave.
 */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}

  if (locks++ === 0) {
    const root = document.documentElement
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight }
    const scrollbar = window.innerWidth - root.clientWidth

    root.style.overflow = 'hidden'
    // Reserve the space the scrollbar took so the page does not shift sideways.
    if (scrollbar > 0) {
      const current = Number.parseFloat(getComputedStyle(root).paddingRight) || 0
      root.style.paddingRight = `${current + scrollbar}px`
    }

    restore = () => {
      root.style.overflow = previous.overflow
      root.style.paddingRight = previous.paddingRight
    }
  }

  let released = false
  return () => {
    if (released) return
    released = true
    if (--locks === 0) {
      restore?.()
      restore = undefined
    }
  }
}
