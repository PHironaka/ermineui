<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive, toElement } from '../../lib/primitive'
import { useHoverCard } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. your own link) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'a' },
)

const card = useHoverCard()

function setAnchor(target: unknown) {
  card.anchor.value = toElement(target)
}

function onPointerEnter(event: PointerEvent) {
  // Touch has no hover; a tap should simply follow the link.
  if (event.pointerType !== 'touch') card.show()
}
</script>

<template>
  <!-- The card is a preview of where the link goes, so it is not announced: the link itself says enough. -->
  <Primitive
    :ref="setAnchor"
    :as="as"
    :as-child="asChild"
    :data-state="card.open.value ? 'open' : 'closed'"
    @pointerenter="onPointerEnter"
    @pointerleave="card.hide()"
    @focus="card.show()"
    @blur="card.hide()"
  >
    <slot />
  </Primitive>
</template>
