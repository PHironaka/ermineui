import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface ComboboxContext {
  value: Ref<string | undefined>
  /** Choose a value and close the list. */
  select: (value: string) => void
  /** value → visible label, filled in by each ComboboxItem. Filtering and the input text both read it. */
  labels: Map<string, string>
  /** Whether a label fits what has been typed. Everything fits until the user types. */
  matches: (label: string) => boolean
  /** id of the highlighted option. Focus stays in the input; this is what the arrow keys move. */
  activeId: Ref<string | undefined>
}

export const [provideCombobox, useCombobox] = createContext<ComboboxContext>('Combobox')
