import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface SidebarContext {
  collapsed: Ref<boolean>
  /** Called when a link is followed, so an off-canvas sidebar can close itself. */
  navigate: () => void
}

export const [provideSidebar, useSidebar] = createContext<SidebarContext>('Sidebar')
