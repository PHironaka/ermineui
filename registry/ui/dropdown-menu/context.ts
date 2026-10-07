import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface DropdownMenuContext {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  anchor: Ref<HTMLElement | null>
  /** True when the menu was opened from the keyboard, so focus goes to the first item. */
  focusFirst: Ref<boolean>
  triggerId: string
  contentId: string
}

export const [provideDropdownMenu, useDropdownMenu] = createContext<DropdownMenuContext>('DropdownMenu')

export interface DropdownMenuRadioContext {
  value: Ref<string | undefined>
  select: (value: string) => void
}

export const [provideDropdownMenuRadio, useDropdownMenuRadio] = createContext<DropdownMenuRadioContext>('DropdownMenuRadioGroup')

export interface DropdownMenuSubContext {
  open: Ref<boolean>
  /** Open or close the submenu. `focusFirst` moves focus to its first item, as the keyboard expects. */
  setOpen: (open: boolean, focusFirst?: boolean) => void
  focusFirst: Ref<boolean>
  anchor: Ref<HTMLElement | null>
  content: Ref<HTMLElement | null>
  contentId: string
  /** Close shortly, unless the pointer arrives in the submenu first. */
  scheduleClose: () => void
  cancelClose: () => void
}

export const [provideDropdownMenuSub, useDropdownMenuSub] = createContext<DropdownMenuSubContext>('DropdownMenuSub')

/** Items of one menu that can take focus, in order. */
export function menuItems(menu: HTMLElement | null | undefined): HTMLElement[] {
  return Array.from(menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([data-disabled])') ?? [])
}

/** Enter and Space activate the focused item, the same as a click. */
export function onItemKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).click()
}

/** The item under the pointer takes focus, so hover and keyboard highlight are one and the same. */
export function onItemPointerMove(event: PointerEvent) {
  const item = event.currentTarget as HTMLElement
  if (!item.hasAttribute('data-disabled')) item.focus({ preventScroll: true })
}

export function onItemPointerLeave(event: PointerEvent) {
  ;(event.currentTarget as HTMLElement).closest<HTMLElement>('[role="menu"]')?.focus({ preventScroll: true })
}
