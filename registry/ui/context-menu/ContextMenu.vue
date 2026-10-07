<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { Portal } from '../../lib/primitive'
import { provideDropdownMenu } from '../dropdown-menu/context'
import { provideContextMenu } from './context'

const open = defineModel<boolean>('open', { default: false })

/** An invisible point placed where the pointer was. The menu positions itself against it like any trigger. */
const anchor = ref<HTMLElement | null>(null)
const point = ref({ x: 0, y: 0 })
const focusFirst = ref(false)

function setOpen(next: boolean) {
  open.value = next
}

// The same state the dropdown menu's parts expect, so its items, groups and submenus all work inside.
provideDropdownMenu({ open, setOpen, anchor, focusFirst, triggerId: useId(), contentId: useId() })

provideContextMenu({
  openAt: async (x, y, fromKeyboard) => {
    // A second right-click while open moves the menu: close first so it reopens at the new point.
    if (open.value) {
      open.value = false
      await nextTick()
    }
    point.value = { x, y }
    focusFirst.value = fromKeyboard
    await nextTick()
    open.value = true
  },
})
</script>

<template>
  <slot :open="open" />
  <Portal>
    <span ref="anchor" class="er-context-menu-point" aria-hidden="true" :style="{ left: `${point.x}px`, top: `${point.y}px` }" />
  </Portal>
</template>

<style>
@layer components {
  .er-context-menu-point {
    position: fixed;
    width: 0;
    height: 0;
    pointer-events: none;
  }
}
</style>
