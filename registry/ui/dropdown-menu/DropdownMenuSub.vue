<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from 'vue'
import { provideDropdownMenuSub, useDropdownMenu } from './context'

const menu = useDropdownMenu()
const open = ref(false)
const focusFirst = ref(false)
const anchor = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined
function cancelClose() {
  clearTimeout(timer)
}

function setOpen(next: boolean, first = false) {
  cancelClose()
  focusFirst.value = next && first
  open.value = next
}

provideDropdownMenuSub({
  open,
  setOpen,
  focusFirst,
  anchor,
  content,
  contentId: useId(),
  // The short wait lets the pointer travel diagonally from the trigger into the submenu without it closing.
  scheduleClose: () => {
    cancelClose()
    timer = setTimeout(() => setOpen(false), 150)
  },
  cancelClose,
})

// When the whole menu closes, this closes with it. Focus steps back into the parent menu first,
// so the menu can hand it back to the button that opened it.
watch(menu.open, (isOpen) => {
  if (isOpen || !open.value) return
  if (content.value?.contains(document.activeElement)) anchor.value?.focus({ preventScroll: true })
  setOpen(false)
})

onBeforeUnmount(cancelClose)
</script>

<template>
  <slot :open="open" />
</template>
