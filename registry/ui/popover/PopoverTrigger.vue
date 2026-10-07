<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive, toElement } from '../../lib/primitive'
import { usePopover } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. a Button) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'button' },
)

const popover = usePopover()

function setAnchor(target: unknown) {
  popover.anchor.value = toElement(target)
}
</script>

<template>
  <Primitive
    :ref="setAnchor"
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    aria-haspopup="dialog"
    :aria-expanded="popover.open.value"
    :aria-controls="popover.open.value ? popover.contentId : undefined"
    :data-state="popover.open.value ? 'open' : 'closed'"
    @click="popover.setOpen(!popover.open.value)"
  >
    <slot />
  </Primitive>
</template>
