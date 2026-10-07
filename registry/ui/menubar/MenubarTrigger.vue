<script setup lang="ts">
import { useDropdownMenu } from '../dropdown-menu/context'
import { useMenubar, useMenubarMenu } from './context'

defineProps<{
  disabled?: boolean
}>()

const bar = useMenubar()
const { id } = useMenubarMenu()
const menu = useDropdownMenu()

function openMenu(focusFirst: boolean) {
  menu.focusFirst.value = focusFirst
  menu.setOpen(true)
}

function onClick(event: MouseEvent) {
  bar.tabStop.value = id
  if (menu.open.value) menu.setOpen(false)
  // detail is 0 when the click came from Enter or Space rather than a pointer.
  else openMenu(event.detail === 0)
}

function onPointerEnter() {
  // Once one menu is open, sliding along the bar opens whichever menu the pointer is over.
  if (bar.openId.value !== undefined && bar.openId.value !== id) openMenu(false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openMenu(true)
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    bar.move(id, event.key === 'ArrowRight' ? 1 : -1, menu.open.value)
  }
}
</script>

<template>
  <button
    :id="menu.triggerId"
    :ref="(el) => (menu.anchor.value = el as HTMLElement | null)"
    type="button"
    role="menuitem"
    class="sb-menubar-trigger"
    aria-haspopup="menu"
    :aria-expanded="menu.open.value"
    :aria-controls="menu.open.value ? menu.contentId : undefined"
    :tabindex="bar.tabStop.value === id ? 0 : -1"
    :disabled="disabled"
    :data-state="menu.open.value ? 'open' : 'closed'"
    :data-menu="id"
    @click="onClick"
    @pointerenter="onPointerEnter"
    @keydown="onKeydown"
    @focus="bar.tabStop.value = id"
    @sb-open-menu="openMenu(true)"
  >
    <slot />
  </button>
</template>
