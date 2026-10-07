import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface ResizablePanelEntry {
  id: string
  /** Starting share of the space, in percent. Panels without one split what is left. */
  defaultSize: Ref<number | undefined>
  /** Smallest share it can be dragged down to, in percent. */
  minSize: Ref<number>
}

export interface ResizableContext {
  direction: Ref<'horizontal' | 'vertical'>
  /** Each panel's share of the space in percent, in order. */
  sizes: Ref<number[]>
  panels: Ref<ResizablePanelEntry[]>
  /** Adds a panel in the order panels are written; returns the function that removes it. */
  registerPanel: (panel: ResizablePanelEntry) => () => void
  /** Adds a handle; returns its position (handle 0 sits between panels 0 and 1) and the function that removes it. */
  registerHandle: (id: string) => { index: Ref<number>; unregister: () => void }
  /** Give the panel before handle `index` this share; the panel after it gives up or takes the difference. */
  resize: (index: number, size: number) => void
  /** Size of the whole group along its direction, in px. */
  extent: () => number
}

export const [provideResizable, useResizable] = createContext<ResizableContext>('ResizablePanels')
