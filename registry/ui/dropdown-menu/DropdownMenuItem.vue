<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useDropdownMenu } from './context'

const props = withDefaults(
  defineProps<{
    /** Tag or component to render — use "a" (or a router link) for navigation items. */
    as?: string | Component
    disabled?: boolean
    variant?: 'default' | 'destructive'
  }>(),
  { as: 'div', variant: 'default' },
)

const emit = defineEmits<{
  /** Fired when the item is chosen. Call event.preventDefault() to keep the menu open. */
  select: [event: Event]
}>()

const menu = useDropdownMenu()

function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('select', event)
  if (!event.defaultPrevented) menu.setOpen(false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).click()
}

function onPointerMove(event: PointerEvent) {
  if (!props.disabled) (event.currentTarget as HTMLElement).focus({ preventScroll: true })
}

function onPointerLeave(event: PointerEvent) {
  ;(event.currentTarget as HTMLElement).closest<HTMLElement>('[role="menu"]')?.focus({ preventScroll: true })
}
</script>

<template>
  <Primitive
    :as="as"
    role="menuitem"
    tabindex="-1"
    class="er-menu-item"
    :data-variant="variant"
    :data-disabled="disabled ? '' : undefined"
    :aria-disabled="disabled || undefined"
    @click="onClick"
    @keydown="onKeydown"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <slot />
  </Primitive>
</template>
