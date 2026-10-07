<script setup lang="ts">
import { menuItems, useDropdownMenuSub } from './context'

const props = defineProps<{
  disabled?: boolean
}>()

const sub = useDropdownMenuSub()

function onPointerMove(event: PointerEvent) {
  if (props.disabled) return
  ;(event.currentTarget as HTMLElement).focus({ preventScroll: true })
  if (sub.open.value) sub.cancelClose()
  else sub.setOpen(true)
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled || (event.key !== 'ArrowRight' && event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  // Already open from hovering: the keyboard just steps inside.
  if (sub.open.value) menuItems(sub.content.value)[0]?.focus()
  else sub.setOpen(true, true)
}

function onBlur(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && sub.content.value?.contains(next)) return
  sub.scheduleClose()
}
</script>

<template>
  <div
    :ref="(el) => (sub.anchor.value = el as HTMLElement | null)"
    role="menuitem"
    tabindex="-1"
    class="er-menu-item"
    aria-haspopup="menu"
    :aria-expanded="sub.open.value"
    :aria-controls="sub.open.value ? sub.contentId : undefined"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-state="sub.open.value ? 'open' : 'closed'"
    @click="!disabled && sub.setOpen(true)"
    @keydown="onKeydown"
    @pointermove="onPointerMove"
    @blur="onBlur"
  >
    <slot />
    <svg class="er-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  </div>
</template>
