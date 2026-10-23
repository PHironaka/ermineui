import type { Ref, ShallowRef } from 'vue'
import { createContext } from '../../lib/context'

export interface StickyScrollContext {
  /** Each step's copy, in page order. */
  steps: Readonly<ShallowRef<HTMLElement[]>>
  /** Index of the step whose media is showing. */
  active: Ref<number>
  register: (copy: HTMLElement) => void
  unregister: (copy: HTMLElement) => void
}

export const [provideStickyScroll, useStickyScroll] = createContext<StickyScrollContext>('StickyScroll')
