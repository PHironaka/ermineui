<script setup lang="ts">
import type { Component } from 'vue'
import { DialogClose } from '../dialog'

withDefaults(
  defineProps<{
    as?: string | Component
    asChild?: boolean
  }>(),
  { as: 'button' },
)
</script>

<template>
  <DialogClose :as="as" :as-child="asChild"><slot /></DialogClose>
</template>
