import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface MultiSelectContext {
  values: Ref<string[]>
  /** Add the value if it is not chosen, remove it if it is. */
  toggle: (value: string) => void
  /** value → visible label, filled in by each MultiSelectItem. Filtering and the tags both read it. */
  labels: Map<string, string>
  /** Whether a label fits what has been typed. */
  matches: (label: string) => boolean
  /** id of the highlighted option. Focus stays in the input; this is what the arrow keys move. */
  activeId: Ref<string | undefined>
}

export const [provideMultiSelect, useMultiSelect] = createContext<MultiSelectContext>('MultiSelect')
