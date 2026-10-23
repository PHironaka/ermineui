import type { Ref, ShallowRef } from 'vue'
import { createContext } from '../../lib/context'

export interface StickyScrollContext {
  /** Each step's copy, in page order. */
  steps: Readonly<ShallowRef<HTMLElement[]>>
  /** Index of the step whose media is showing. */
  active: Ref<number>
  /** How far each step's copy has scrolled past the middle of the window, 0 to 1, by index. */
  progress: Readonly<Ref<number[]>>
  register: (copy: HTMLElement) => void
  unregister: (copy: HTMLElement) => void
}

export const [provideStickyScroll, useStickyScroll] = createContext<StickyScrollContext>('StickyScroll')
