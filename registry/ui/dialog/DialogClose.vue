<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useDialog } from './context'

withDefaults(
  defineProps<{
    as?: string | Component
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
    @click="dialog.setOpen(false)"
  >
    <slot />
  </Primitive>
</template>
