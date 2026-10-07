<script setup lang="ts">
import { nextTick } from 'vue'
import { useNavigationMenu, useNavigationMenuItem } from './context'

const menu = useNavigationMenu()
const item = useNavigationMenuItem()

function onPointerEnter(event: PointerEvent) {
  // Touch has no hover: a tap is a click, handled below.
  if (event.pointerType !== 'touch') menu.open(item.id)
}

function onClick() {
  if (item.isOpen.value) menu.close(true)
  else menu.open(item.id, true)
}

async function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown') return
  event.preventDefault()
  menu.open(item.id, true)
  await nextTick()
  document.getElementById(item.contentId)?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus()
}
</script>

<template>
  <button
    :id="item.triggerId"
    type="button"
    class="sb-navigation-menu-trigger"
    :aria-expanded="item.isOpen.value"
    :aria-controls="item.contentId"
    @pointerenter="onPointerEnter"
    @pointerleave="menu.close()"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</template>
