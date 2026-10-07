<script setup lang="ts">
import { onItemKeydown, onItemPointerLeave, onItemPointerMove, useDropdownMenu } from './context'

const props = defineProps<{
  disabled?: boolean
  /** Close the menu after toggling. Off by default, so several boxes can be changed in one go. */
  closeOnSelect?: boolean
}>()

const emit = defineEmits<{
  select: [event: Event]
}>()

const checked = defineModel<boolean>({ default: false })
const menu = useDropdownMenu()

function onClick(event: MouseEvent) {
  if (props.disabled) return
  checked.value = !checked.value
  emit('select', event)
  if (props.closeOnSelect) menu.setOpen(false)
}
</script>

<template>
  <div
    role="menuitemcheckbox"
    tabindex="-1"
    class="er-menu-item"
    :aria-checked="checked"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    @click="onClick"
    @keydown="onItemKeydown"
    @pointermove="onItemPointerMove"
    @pointerleave="onItemPointerLeave"
  >
    <span class="er-menu-indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
    <slot />
  </div>
</template>
