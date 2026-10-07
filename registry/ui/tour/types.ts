import type { Side } from '../../lib/floating'

export interface TourStep {
  /** The part of the page this step is about: a CSS selector, or a function that returns the element. */
  target: string | (() => HTMLElement | null | undefined)
  title: string
  description?: string
  /** Which side of the target the card prefers. It flips when there is no room. */
  side?: Side
}
