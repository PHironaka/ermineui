import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface NavigationMenuContext {
  /** id of the item whose panel is open. Only one is open at a time. */
  openId: Ref<string | undefined>
  /** Open a panel now, or after the short pause that tells a pass-over from a real hover. */
  open: (id: string, immediate?: boolean) => void
  /** Close after a moment (time to move into the panel), or at once. */
  close: (immediate?: boolean) => void
  cancelClose: () => void
}

export interface NavigationMenuItemContext {
  id: string
  isOpen: Ref<boolean>
  triggerId: string
  contentId: string
}

export const [provideNavigationMenu, useNavigationMenu] = createContext<NavigationMenuContext>('NavigationMenu')
export const [provideNavigationMenuItem, useNavigationMenuItem] = createContext<NavigationMenuItemContext>('NavigationMenuItem')
