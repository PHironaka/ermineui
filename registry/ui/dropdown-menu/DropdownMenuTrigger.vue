<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive, toElement } from '../../lib/primitive'
import { useDropdownMenu } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. a Button) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'button' },
)

const menu = useDropdownMenu()

function setAnchor(target: unknown) {
  menu.anchor.value = toElement(target)
}

function onClick(event: MouseEvent) {
  // detail is 0 when the click came from Enter or Space rather than a pointer.
  menu.focusFirst.value = event.detail === 0
  menu.setOpen(!menu.open.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' || menu.open.value) return
  event.preventDefault()
  menu.focusFirst.value = true
  menu.setOpen(true)
}
</script>

<template>
  <Primitive
    :id="menu.triggerId"
    :ref="setAnchor"
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    aria-haspopup="menu"
    :aria-expanded="menu.open.value"
    :aria-controls="menu.open.value ? menu.contentId : undefined"
    :data-state="menu.open.value ? 'open' : 'closed'"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </Primitive>
</template>
