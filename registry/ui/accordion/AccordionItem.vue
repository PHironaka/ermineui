<script setup lang="ts">
import { computed, useId } from 'vue'
import { provideAccordionItem, useAccordion } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
}>()

const accordion = useAccordion()
const open = computed(() => accordion.isOpen(props.value))

provideAccordionItem({
  open,
  disabled: computed(() => props.disabled || accordion.disabled.value),
  toggle: () => accordion.toggle(props.value),
  triggerId: useId(),
  contentId: useId(),
})
</script>

<template>
  <div class="sb-accordion-item" :data-state="open ? 'open' : 'closed'">
    <slot :open="open" />
  </div>
</template>
