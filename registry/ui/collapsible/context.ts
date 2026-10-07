import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface CollapsibleContext {
  open: Ref<boolean>
  toggle: () => void
  disabled: Ref<boolean>
  contentId: string
}

export const [provideCollapsible, useCollapsible] = createContext<CollapsibleContext>('Collapsible')
