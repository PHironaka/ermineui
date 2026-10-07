<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    /** Tag or component for the link, e.g. NuxtLink. Attributes such as href or to are passed on to it. */
    as?: string | Component
    /** The page the reader is on now: shown as plain text, not a link. */
    current?: boolean
  }>(),
  { as: 'a' },
)
</script>

<template>
  <li class="er-breadcrumb-item">
    <span v-if="current" class="er-breadcrumb-link" aria-current="page"><slot /></span>
    <Primitive v-else v-bind="$attrs" :as="as" class="er-breadcrumb-link"><slot /></Primitive>
  </li>
</template>
