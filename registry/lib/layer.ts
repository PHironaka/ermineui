import { toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export type DismissReason = 'escape' | 'outside'

export interface LayerOptions {
  /** Called when the user presses Escape or presses outside the layer. */
  onDismiss: (reason: DismissReason, event: Event) => void
  /** Extra elements that count as "inside" — usually the trigger, which toggles on its own. */
  ignore?: () => Array<HTMLElement | null | undefined>
  /** Keep Tab / Shift+Tab cycling inside the layer. */
  loopFocus?: boolean
  /** Pull focus back if it lands outside the layer (modal dialogs). */
  modal?: boolean
  /** What to focus on open. Defaults to the first tabbable element, else the layer. Return false to leave focus alone. */
  initialFocus?: () => HTMLElement | null | undefined | false
  /** Return focus to where it was when the layer closes. Default true. */
  restoreFocus?: boolean
}

interface Layer {
  el: HTMLElement
  options: LayerOptions
}

/** Open layers, oldest first. The last entry is the one the user is interacting with. */
const stack: Layer[] = []

/** Put this attribute on anything that should never count as "outside" (e.g. the toaster). */
const IGNORE_SELECTOR = '[data-sb-layer-ignore]'

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Elements inside `root` that Tab can reach, in DOM order. */
export function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (el) => el.tabIndex >= 0 && !el.closest('[inert]') && el.getClientRects().length > 0,
  )
}

/**
 * Safari does not focus a button when it is clicked, so "where was focus when this opened?" comes back
 * empty there. Remembering what was last pressed gives the layer somewhere to return focus to anyway.
 */
let lastPressed: { el: HTMLElement; at: number } | undefined
let trackingPresses = false

function trackPresses() {
  if (trackingPresses || typeof document === 'undefined') return
  trackingPresses = true
  document.addEventListener(
    'pointerdown',
    (event) => {
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>(TABBABLE_SELECTOR) : null
      lastPressed = el ? { el, at: performance.now() } : undefined
    },
    true,
  )
}

/** The control pressed a moment ago, if it is still on the page. */
function recentlyPressed(): HTMLElement | null {
  return lastPressed && lastPressed.el.isConnected && performance.now() - lastPressed.at < 1000 ? lastPressed.el : null
}

function isIgnored(target: Node): boolean {
  return target instanceof Element && target.closest(IGNORE_SELECTOR) !== null
}

function isInside(layer: Layer, target: Node): boolean {
  if (layer.el.contains(target) || isIgnored(target)) return true
  return layer.options.ignore?.().some((el) => el?.contains(target)) ?? false
}

function onPointerDown(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  // Walk from the top layer down: a press inside a layer protects it and everything beneath it.
  for (const layer of [...stack].reverse()) {
    if (isInside(layer, target)) break
    layer.options.onDismiss('outside', event)
  }
}

function onKeyDown(event: KeyboardEvent) {
  const top = stack[stack.length - 1]
  if (!top || event.isComposing) return

  if (event.key === 'Escape') {
    top.options.onDismiss('escape', event)
    return
  }

  if (event.key === 'Tab' && top.options.loopFocus) {
    const items = tabbables(top.el)
    const active = document.activeElement
    const first = items[0]
    const last = items[items.length - 1]
    if (!first || !last) {
      event.preventDefault()
      top.el.focus()
    } else if (!top.el.contains(active)) {
      event.preventDefault()
      first.focus()
    } else if (event.shiftKey && (active === first || active === top.el)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

function onFocusIn(event: FocusEvent) {
  const top = stack[stack.length - 1]
  const target = event.target
  if (!top?.options.modal || !(target instanceof Node)) return
  if (top.el.contains(target) || isIgnored(target)) return
  ;(tabbables(top.el)[0] ?? top.el).focus({ preventScroll: true })
}

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', onPointerDown as EventListener, true)
  document[method]('keydown', onKeyDown as EventListener)
  document[method]('focusin', onFocusIn as EventListener)
}

/**
 * Turns `el` into a dismissable layer while `active` is true: Escape and outside
 * presses call `onDismiss`, focus moves in on open and back out on close, and
 * nested layers (a select inside a dialog) close one at a time, innermost first.
 */
export function useLayer(
  el: Ref<HTMLElement | null | undefined>,
  active: MaybeRefOrGetter<boolean>,
  options: LayerOptions,
) {
  trackPresses()

  watch(
    () => (toValue(active) ? el.value : null),
    (target, _previous, onCleanup) => {
      if (!target) return

      const layer: Layer = { el: target, options }
      const focused = document.activeElement
      const previous = focused instanceof HTMLElement && focused !== document.body ? focused : recentlyPressed()

      stack.push(layer)
      if (stack.length === 1) listen(true)

      const initial = options.initialFocus ? options.initialFocus() : undefined
      if (initial !== false) (initial ?? tabbables(target)[0] ?? target).focus({ preventScroll: true })

      onCleanup(() => {
        const index = stack.indexOf(layer)
        if (index > -1) stack.splice(index, 1)
        if (stack.length === 0) listen(false)

        if (options.restoreFocus === false || !previous?.isConnected) return
        // Only hand focus back if it is still ours to give — not if the user already moved on.
        const current = document.activeElement
        if (!current || current === document.body || target.contains(current)) {
          previous.focus({ preventScroll: true })
        }
      })
    },
    { flush: 'post', immediate: true },
  )
}
