<script setup lang="ts">
import { useAccordionItem } from './context'

const item = useAccordionItem()
</script>

<template>
  <!-- Closed content stays in the page so it can animate, but inert keeps it out of Tab order and screen readers. -->
  <div
    :id="item.contentId"
    role="region"
    class="sb-accordion-content"
    :aria-labelledby="item.triggerId"
    :data-state="item.open.value ? 'open' : 'closed'"
    :inert="!item.open.value"
  >
    <div>
      <div class="sb-accordion-body"><slot /></div>
    </div>
  </div>
</template>
