<script setup lang="ts">
import { computed } from 'vue'
import { Status } from '../status'

const props = withDefaults(
  defineProps<{
    /** How many are left. Zero or less is out of stock. */
    quantity: number
    /** At or below this many, the count is shown as a nudge: "Only 3 left". */
    lowAt?: number
    inLabel?: string
    outLabel?: string
    /** What to say when few are left. */
    lowLabel?: (quantity: number) => string
  }>(),
  { lowAt: 5, inLabel: 'In stock', outLabel: 'Out of stock', lowLabel: (quantity: number) => `Only ${quantity} left` },
)

const level = computed(() => (props.quantity <= 0 ? 'out' : props.quantity <= props.lowAt ? 'low' : 'in'))
</script>

<template>
  <Status class="er-stock-indicator" :tone="level === 'in' ? 'success' : level === 'low' ? 'warning' : 'neutral'" :data-level="level">
    {{ level === 'in' ? inLabel : level === 'low' ? lowLabel(quantity) : outLabel }}
  </Status>
</template>

<style>
@layer components {
  .er-stock-indicator[data-level='out'] {
    color: var(--er-muted-foreground);
  }
}
</style>
