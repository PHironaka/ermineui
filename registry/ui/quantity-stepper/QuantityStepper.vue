<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    min?: number
    /** The most that can be chosen, e.g. what is left in stock. */
    max?: number
    /** Accessible name of the group: what is being counted, e.g. "Quantity of Wool throw". */
    label?: string
    /** At the lowest quantity, turn the minus into a bin that emits `remove`. */
    removable?: boolean
    disabled?: boolean
    size?: 'sm' | 'md'
    decreaseLabel?: string
    increaseLabel?: string
    removeLabel?: string
  }>(),
  { min: 1, label: 'Quantity', size: 'md', decreaseLabel: 'Decrease quantity', increaseLabel: 'Increase quantity', removeLabel: 'Remove' },
)

const emit = defineEmits<{
  /** The bin was pressed. Take the item out of your cart. */
  remove: []
}>()

/** How many. Always a whole number between min and max. */
const quantity = defineModel<number>({ default: 1 })

const atMin = computed(() => quantity.value <= props.min)
const atMax = computed(() => props.max !== undefined && quantity.value >= props.max)
const removes = computed(() => props.removable && atMin.value)

function nudge(direction: 1 | -1) {
  if (direction === -1 && removes.value) return emit('remove')
  quantity.value = Math.min(props.max ?? Infinity, Math.max(props.min, Math.round(quantity.value) + direction))
}
</script>

<template>
  <div class="er-quantity-stepper" role="group" :aria-label="label" :data-size="size" :data-disabled="disabled ? '' : undefined">
    <button type="button" :aria-label="removes ? removeLabel : decreaseLabel" :disabled="disabled || (atMin && !removable)" @click="nudge(-1)">
      <svg v-if="removes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
    </button>
    <!-- Announced when it changes, since the buttons themselves say nothing new. -->
    <output class="er-quantity-stepper-value" aria-live="polite">{{ quantity }}</output>
    <button type="button" :aria-label="increaseLabel" :disabled="disabled || atMax" @click="nudge(1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  </div>
</template>

<style>
@layer components {
  .er-quantity-stepper {
    display: inline-flex;
    align-items: center;
    height: 2.25rem;
    border: 1px solid var(--er-input);
    border-radius: 999px;
    background: var(--er-input-background);
  }

  .er-quantity-stepper[data-size='sm'] {
    height: 1.875rem;
  }

  .er-quantity-stepper[data-disabled] {
    opacity: 0.5;
  }

  .er-quantity-stepper button {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 100%;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-quantity-stepper[data-size='sm'] button {
    width: 1.875rem;
  }

  .er-quantity-stepper button:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-quantity-stepper button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-quantity-stepper button:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .er-quantity-stepper svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-quantity-stepper-value {
    min-width: 1.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }
}
</style>
