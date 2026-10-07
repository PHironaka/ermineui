import { toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'

export interface FloatingOptions {
  /** Preferred side of the anchor. Flips to the opposite side when there is no room. */
  side?: Side
  /** Alignment along the anchor's edge. */
  align?: Align
  /** Gap between anchor and floating element, in px. */
  sideOffset?: number
  /** Shift along the aligned edge, in px. */
  alignOffset?: number
  /** Minimum distance kept from the viewport edge, in px. */
  padding?: number
}

interface Box {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

export interface Placement {
  x: number
  y: number
  side: Side
  /** Space available on the chosen side, in px — useful as a max-height / max-width. */
  available: number
}

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
const ORIGIN: Record<Side, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

/** Pure placement maths: where a `width` × `height` box goes next to `anchor` inside `viewport`. */
export function computePlacement(
  anchor: Box,
  width: number,
  height: number,
  viewport: { width: number; height: number },
  options: FloatingOptions = {},
): Placement {
  const { align = 'center', sideOffset = 0, alignOffset = 0, padding = 8 } = options
  let side = options.side ?? 'bottom'

  const space: Record<Side, number> = {
    top: anchor.top - padding - sideOffset,
    bottom: viewport.height - anchor.bottom - padding - sideOffset,
    left: anchor.left - padding - sideOffset,
    right: viewport.width - anchor.right - padding - sideOffset,
  }

  const vertical = side === 'top' || side === 'bottom'
  const needed = vertical ? height : width
  if (space[side] < needed && space[OPPOSITE[side]] > space[side]) side = OPPOSITE[side]

  let x: number
  let y: number
  if (vertical) {
    y = side === 'bottom' ? anchor.bottom + sideOffset : anchor.top - height - sideOffset
    if (align === 'start') x = anchor.left + alignOffset
    else if (align === 'end') x = anchor.right - width - alignOffset
    else x = anchor.left + anchor.width / 2 - width / 2
    x = clamp(x, padding, viewport.width - width - padding)
  } else {
    x = side === 'right' ? anchor.right + sideOffset : anchor.left - width - sideOffset
    if (align === 'start') y = anchor.top + alignOffset
    else if (align === 'end') y = anchor.bottom - height - alignOffset
    else y = anchor.top + anchor.height / 2 - height / 2
    y = clamp(y, padding, viewport.height - height - padding)
  }

  return { x, y, side, available: Math.max(0, space[side]) }
}

/**
 * Keeps `floating` positioned next to `anchor` while `active` is true.
 * Give the floating element the `.sb-floating` class (position: fixed).
 *
 * Besides left/top it sets, on the floating element:
 *   data-side                 the side it actually ended up on
 *   --sb-anchor-width         width of the anchor (e.g. min-width for a select)
 *   --sb-available-size       free space on that side (e.g. a max-height)
 *   --sb-transform-origin     so scale animations grow from the anchor
 */
export function useFloating(
  anchor: Ref<HTMLElement | null | undefined>,
  floating: Ref<HTMLElement | null | undefined>,
  active: MaybeRefOrGetter<boolean>,
  options: FloatingOptions = {},
) {
  function update() {
    const anchorEl = anchor.value
    const floatingEl = floating.value
    if (!anchorEl || !floatingEl) return

    const rect = anchorEl.getBoundingClientRect()
    const placement = computePlacement(
      rect,
      floatingEl.offsetWidth,
      floatingEl.offsetHeight,
      { width: document.documentElement.clientWidth, height: window.innerHeight },
      options,
    )

    floatingEl.style.left = `${Math.round(placement.x)}px`
    floatingEl.style.top = `${Math.round(placement.y)}px`
    floatingEl.dataset.side = placement.side
    floatingEl.style.setProperty('--sb-anchor-width', `${Math.round(rect.width)}px`)
    floatingEl.style.setProperty('--sb-available-size', `${Math.floor(placement.available)}px`)
    floatingEl.style.setProperty('--sb-transform-origin', ORIGIN[placement.side])
  }

  watch(
    [() => (toValue(active) ? anchor.value : null), floating],
    ([anchorEl, floatingEl], _previous, onCleanup) => {
      if (!anchorEl || !floatingEl) return

      let frame = 0
      const schedule = () => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(update)
      }

      update()
      const observer = new ResizeObserver(schedule)
      observer.observe(anchorEl)
      observer.observe(floatingEl)
      window.addEventListener('scroll', schedule, { capture: true, passive: true })
      window.addEventListener('resize', schedule)

      onCleanup(() => {
        cancelAnimationFrame(frame)
        observer.disconnect()
        window.removeEventListener('scroll', schedule, { capture: true })
        window.removeEventListener('resize', schedule)
      })
    },
    { flush: 'post', immediate: true },
  )

  return { update }
}
