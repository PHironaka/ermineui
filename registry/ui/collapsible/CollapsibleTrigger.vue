<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useCollapsible } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. a Button) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'button' },
)

const collapsible = useCollapsible()
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    :aria-expanded="collapsible.open.value"
    :aria-controls="collapsible.contentId"
    :disabled="collapsible.disabled.value || undefined"
    :data-state="collapsible.open.value ? 'open' : 'closed'"
    @click="collapsible.toggle()"
  >
    <slot />
  </Primitive>
</template>
