import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface TabsContext {
  value: Ref<string | undefined>
  orientation: Ref<'horizontal' | 'vertical'>
  baseId: string
  select: (value: string) => void
}

export const [provideTabs, useTabs] = createContext<TabsContext>('Tabs')

export const tabId = (baseId: string, value: string) => `${baseId}-tab-${value.replace(/\s+/g, '-')}`
export const panelId = (baseId: string, value: string) => `${baseId}-panel-${value.replace(/\s+/g, '-')}`
