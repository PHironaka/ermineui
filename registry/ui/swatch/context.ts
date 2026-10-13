import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface SwatchGroupContext {
  value: Ref<string | undefined>
  select: (value: string) => void
  /** Shared by every swatch in the group: it is what makes the arrow keys move between them. */
  name: Ref<string>
  disabled: Ref<boolean>
}

export const [provideSwatchGroup, useSwatchGroup] = createContext<SwatchGroupContext>('SwatchGroup')
