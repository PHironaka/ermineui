<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    label: string
    href?: string
    /** This is the page being shown. */
    current?: boolean
    /** A small count over the icon, e.g. items in the cart. Hidden when empty or zero. */
    badge?: number | string
    /** What the count is of, for screen readers: "items in cart". */
    badgeLabel?: string
    /** Tag or component to render, e.g. NuxtLink. */
    as?: string | Component
  }>(),
  { as: 'a' },
)
</script>

<template>
  <component :is="as" :href="href" class="er-bottom-nav-item" :aria-current="current ? 'page' : undefined">
    <span class="er-bottom-nav-icon">
      <!-- The icon. -->
      <slot />
      <span v-if="badge" class="er-bottom-nav-badge" aria-hidden="true">{{ badge }}</span>
    </span>
    <span class="er-bottom-nav-label">{{ label }}<span v-if="badge" class="er-bottom-nav-hidden">, {{ badge }} {{ badgeLabel }}</span></span>
  </component>
</template>
