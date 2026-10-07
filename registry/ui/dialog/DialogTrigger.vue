<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useDialog } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. a Button) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'button' },
)

const dialog = useDialog()
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    aria-haspopup="dialog"
    :aria-expanded="dialog.open.value"
    :data-state="dialog.open.value ? 'open' : 'closed'"
    @click="dialog.setOpen(true)"
  >
    <slot />
  </Primitive>
</template>
