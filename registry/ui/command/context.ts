import { inject, provide, type InjectionKey, type Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface CommandContext {
  /** item id → what it is searched by, and the group it sits in (if any). Filled in by each CommandItem. */
  entries: Map<string, { text: string; group?: string }>
  /** Whether some text fits what has been typed. */
  matches: (text: string) => boolean
  /** id of the highlighted item. Focus stays in the search box; this is what the arrow keys move. */
  activeId: Ref<string | undefined>
  /** Called by an item when it is chosen. */
  ran: () => void
}

export const [provideCommand, useCommand] = createContext<CommandContext>('CommandPalette')

// Items work with or without a group around them, so this one is allowed to be missing.
const groupKey: InjectionKey<string> = Symbol('CommandGroup')
export const provideCommandGroup = (id: string) => provide(groupKey, id)
export const useCommandGroup = () => inject(groupKey, undefined)
