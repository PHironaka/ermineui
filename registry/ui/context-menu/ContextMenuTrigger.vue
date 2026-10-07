<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useContextMenu } from './context'

const props = withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child as the right-click area instead of wrapping it in an element. */
    asChild?: boolean
    disabled?: boolean
  }>(),
  { as: 'div' },
)

const menu = useContextMenu()

function onContextMenu(event: MouseEvent) {
  if (props.disabled) return
  event.preventDefault()
  // The Menu key and Shift+F10 also fire this event, without a real pointer position.
  const fromKeyboard = event.button !== 2 && event.detail === 0
  if (fromKeyboard) {
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
    menu.openAt(box.left + Math.min(box.width / 2, 24), box.top + Math.min(box.height / 2, 24), true)
  } else {
    menu.openAt(event.clientX, event.clientY, false)
  }
}
</script>

<template>
  <Primitive :as="as" :as-child="asChild" @contextmenu="onContextMenu">
    <slot />
  </Primitive>
</template>
