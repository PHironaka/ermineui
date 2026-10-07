import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface SelectContext {
  value: Ref<string | undefined>
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  /** Choose a value and close the list. */
  select: (value: string) => void
  disabled: Ref<boolean>
  anchor: Ref<HTMLElement | null>
  contentId: string
  /** value → visible label, filled in by each SelectItem so the trigger can show it. */
  labels: Map<string, string>
}

export const [provideSelect, useSelect] = createContext<SelectContext>('Select')
