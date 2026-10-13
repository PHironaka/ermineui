import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface SegmentedControlContext {
  value: Ref<string | undefined>
  select: (value: string) => void
  /** Shared by every segment: it is what makes the arrow keys move between them. */
  name: Ref<string>
  disabled: Ref<boolean>
}

export const [provideSegmentedControl, useSegmentedControl] = createContext<SegmentedControlContext>('SegmentedControl')
