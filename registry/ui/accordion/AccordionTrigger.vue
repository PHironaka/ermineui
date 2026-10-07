<script setup lang="ts">
import { useAccordionItem } from './context'

withDefaults(
  defineProps<{
    /** Heading tag wrapped around the button, to fit the page's outline. */
    heading?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }>(),
  { heading: 'h3' },
)

const item = useAccordionItem()
</script>

<template>
  <component :is="heading" class="sb-accordion-heading">
    <button
      :id="item.triggerId"
      type="button"
      class="sb-accordion-trigger"
      :aria-expanded="item.open.value"
      :aria-controls="item.contentId"
      :disabled="item.disabled.value"
      @click="item.toggle()"
    >
      <slot />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  </component>
</template>
