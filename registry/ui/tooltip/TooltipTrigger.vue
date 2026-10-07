<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive, toElement } from '../../lib/primitive'
import { useTooltip } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. a Button) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'button' },
)

const tooltip = useTooltip()

function setAnchor(target: unknown) {
  tooltip.anchor.value = toElement(target)
}

function onPointerEnter(event: PointerEvent) {
  if (event.pointerType !== 'touch') tooltip.show()
}

function onFocus(event: FocusEvent) {
  // Only for keyboard focus — a click also focuses, and should not pop a tooltip.
  if ((event.target as HTMLElement).matches(':focus-visible')) tooltip.show(true)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') tooltip.hide(true)
}
</script>

<template>
  <Primitive
    :ref="setAnchor"
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    :aria-describedby="tooltip.open.value ? tooltip.contentId : undefined"
    :data-state="tooltip.open.value ? 'open' : 'closed'"
    @pointerenter="onPointerEnter"
    @pointerleave="tooltip.hide()"
    @pointerdown="tooltip.hide(true)"
    @focus="onFocus"
    @blur="tooltip.hide(true)"
    @keydown="onKeydown"
  >
    <slot />
  </Primitive>
</template>
