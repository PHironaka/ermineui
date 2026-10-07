import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface TooltipContext {
  open: Ref<boolean>
  /** Open after the delay, or straight away with `immediate`. */
  show: (immediate?: boolean) => void
  /** Close after a short grace period, or straight away with `immediate`. */
  hide: (immediate?: boolean) => void
  anchor: Ref<HTMLElement | null>
  contentId: string
}

export const [provideTooltip, useTooltip] = createContext<TooltipContext>('Tooltip')
