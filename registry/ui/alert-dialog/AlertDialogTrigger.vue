<script setup lang="ts">
import type { Component } from 'vue'
import { DialogTrigger } from '../dialog'

withDefaults(
  defineProps<{
    as?: string | Component
    /** Use the single child (e.g. a Button) as the trigger instead of rendering one. */
    asChild?: boolean
  }>(),
  { as: 'button' },
)
</script>

<template>
  <DialogTrigger :as="as" :as-child="asChild"><slot /></DialogTrigger>
</template>
