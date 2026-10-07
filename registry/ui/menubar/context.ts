import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface MenubarContext {
  /** id of the menu that is open, if any. */
  openId: Ref<string | undefined>
  /** id of the trigger Tab stops on: the bar is one stop, and the arrow keys move within it. */
  tabStop: Ref<string | undefined>
  /** Move to the menu before (-1) or after (1) the given one, opening it if a menu was open. */
  move: (from: string, direction: 1 | -1, open: boolean) => void
}

export const [provideMenubar, useMenubar] = createContext<MenubarContext>('Menubar')
export const [provideMenubarMenu, useMenubarMenu] = createContext<{ id: string }>('MenubarMenu')
