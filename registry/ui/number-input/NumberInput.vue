<script setup lang="ts">
import { computed } from 'vue'

// The wrapper is only a frame; id, name, aria-invalid and the rest belong on the input.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    /** Accessible names of the two buttons. */
    decreaseLabel?: string
    increaseLabel?: string
  }>(),
  { step: 1, decreaseLabel: 'Decrease', increaseLabel: 'Increase' },
)

/** The number, or undefined while the field is empty. */
const model = defineModel<number>()

const text = computed({
  get: () => (model.value === undefined || Number.isNaN(model.value) ? '' : String(model.value)),
  set: (raw: string) => {
    const number = raw === '' ? Number.NaN : Number(raw)
    model.value = Number.isNaN(number) ? undefined : number
  },
})

const clamp = (value: number) => Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, value))
const atMin = computed(() => props.min !== undefined && model.value !== undefined && model.value <= props.min)
const atMax = computed(() => props.max !== undefined && model.value !== undefined && model.value >= props.max)

function nudge(direction: 1 | -1) {
  // From empty, the first press lands on the lowest allowed value (or zero) rather than jumping past it.
  const start = model.value ?? (props.min !== undefined ? props.min - direction * props.step : -direction * props.step)
  // Rounded so that 0.1 + 0.2 gives 0.3, not 0.30000000000000004.
  model.value = clamp(Number((start + direction * props.step).toFixed(10)))
}

/** Typing may pass the limits on the way to a valid number; leaving the field pulls it back inside them. */
function onBlur() {
  if (model.value !== undefined) model.value = clamp(model.value)
}
</script>

<template>
  <div class="er-number-input" :data-disabled="disabled ? '' : undefined">
    <!-- The buttons are for the pointer; on the keyboard the arrow keys already do the same job. -->
    <button type="button" tabindex="-1" :aria-label="decreaseLabel" :disabled="disabled || atMin" @click="nudge(-1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
    </button>
    <input v-bind="$attrs" v-model="text" type="number" inputmode="decimal" :min="min" :max="max" :step="step" :disabled="disabled" @blur="onBlur" />
    <button type="button" tabindex="-1" :aria-label="increaseLabel" :disabled="disabled || atMax" @click="nudge(1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  </div>
</template>

<style>
@layer components {
  .er-number-input {
    display: flex;
    width: 100%;
    height: var(--er-control-md);
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-control);
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-number-input:focus-within {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-number-input:has(input[aria-invalid='true']) {
    border-color: var(--er-destructive);
  }

  .er-number-input[data-disabled] {
    opacity: 0.5;
  }

  .er-number-input input {
    appearance: textfield;
    flex: 1;
    min-width: 0;
    padding: 0 0.25rem;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
    text-align: center;
    outline: none;
  }

  @media (min-width: 48rem) {
    .er-number-input input {
      font-size: 0.875rem;
    }
  }

  .er-number-input input::-webkit-inner-spin-button,
  .er-number-input input::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  .er-number-input button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: var(--er-control-md);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-number-input button:first-child {
    border-right: 1px solid var(--er-input);
    border-radius: calc(var(--er-radius-control) - 1px) 0 0 calc(var(--er-radius-control) - 1px);
  }

  .er-number-input button:last-child {
    border-left: 1px solid var(--er-input);
    border-radius: 0 calc(var(--er-radius-control) - 1px) calc(var(--er-radius-control) - 1px) 0;
  }

  .er-number-input button:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-number-input button:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .er-number-input svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
