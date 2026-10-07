<script setup lang="ts">
import { computed } from 'vue'
import { onItemKeydown, onItemPointerLeave, onItemPointerMove, useDropdownMenu, useDropdownMenuRadio } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
  /** Close the menu after choosing. Off by default, like the checkbox item. */
  closeOnSelect?: boolean
}>()

const emit = defineEmits<{
  select: [event: Event]
}>()

const menu = useDropdownMenu()
const group = useDropdownMenuRadio()
const checked = computed(() => group.value.value === props.value)

function onClick(event: MouseEvent) {
  if (props.disabled) return
  group.select(props.value)
  emit('select', event)
  if (props.closeOnSelect) menu.setOpen(false)
}
</script>

<template>
  <div
    role="menuitemradio"
    tabindex="-1"
    class="sb-menu-item"
    :aria-checked="checked"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    @click="onClick"
    @keydown="onItemKeydown"
    @pointermove="onItemPointerMove"
    @pointerleave="onItemPointerLeave"
  >
    <span class="sb-menu-indicator">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
      </svg>
    </span>
    <slot />
  </div>
</template>
