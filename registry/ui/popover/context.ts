import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface PopoverContext {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  anchor: Ref<HTMLElement | null>
  contentId: string
}

export const [providePopover, usePopover] = createContext<PopoverContext>('Popover')
