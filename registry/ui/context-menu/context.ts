import { createContext } from '../../lib/context'

export interface ContextMenuContext {
  /** Open the menu at a point in the window. `fromKeyboard` puts focus on the first item. */
  openAt: (x: number, y: number, fromKeyboard: boolean) => void
}

export const [provideContextMenu, useContextMenu] = createContext<ContextMenuContext>('ContextMenu')
