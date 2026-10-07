import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface ToggleGroupContext {
  type: Ref<'single' | 'multiple'>
  isOn: (value: string) => boolean
  toggle: (value: string) => void
  disabled: Ref<boolean>
  /** In single mode, the one item Tab stops on: the chosen one, or the first when nothing is chosen. */
  tabStop: Ref<string | undefined>
}

export const [provideToggleGroup, useToggleGroup] = createContext<ToggleGroupContext>('ToggleGroup')
