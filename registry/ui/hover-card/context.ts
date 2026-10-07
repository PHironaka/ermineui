import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface HoverCardContext {
  open: Ref<boolean>
  show: () => void
  hide: (immediate?: boolean) => void
  anchor: Ref<HTMLElement | null>
}

export const [provideHoverCard, useHoverCard] = createContext<HoverCardContext>('HoverCard')
