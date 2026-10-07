<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    min?: number
    max?: number
    /** What is being measured. */
    label: string
    /** From this value up, the gauge reads as a warning; from `critical` up, as critical. Leave out for a neutral gauge. */
    warning?: number
    critical?: number
    /** Diameter in px. */
    size?: number
    /** How the value is written. */
    format?: (value: number) => string
  }>(),
  { min: 0, max: 100, size: 160 },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const shown = computed(() => (props.format ?? fullNumber.format)(props.value))

const share = computed(() => {
  const span = props.max - props.min
  return span > 0 ? Math.max(0, Math.min((props.value - props.min) / span, 1)) : 0
})
const state = computed(() => {
  if (props.critical !== undefined && props.value >= props.critical) return 'critical'
  if (props.warning !== undefined && props.value >= props.warning) return 'warning'
  return 'normal'
})
const stateText = computed(() => (state.value === 'critical' ? 'Critical' : state.value === 'warning' ? 'Warning' : ''))

const STROKE = 10
const radius = computed(() => props.size / 2 - STROKE / 2)
/** A half circle from the left end, over the top, to the right end. */
const arc = computed(() => {
  const r = radius.value
  const y = props.size / 2
  return `M${STROKE / 2},${y}A${r},${r} 0 0 1 ${props.size - STROKE / 2},${y}`
})
const length = computed(() => Math.PI * radius.value)
</script>

<template>
  <div
    class="er-gauge"
    role="meter"
    :aria-label="label"
    :aria-valuenow="value"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuetext="`${shown}${stateText ? `, ${stateText.toLowerCase()}` : ''}`"
    :data-state="state"
    :style="{ width: `${size}px` }"
  >
    <svg :width="size" :height="size / 2 + STROKE / 2" aria-hidden="true">
      <!-- The unfilled part is a pale step of the same colour, so the state reads across the whole arc. -->
      <path class="er-gauge-track" :d="arc" :stroke-width="STROKE" />
      <path class="er-gauge-fill" :d="arc" :stroke-width="STROKE" :stroke-dasharray="`${length * share} ${length}`" />
    </svg>
    <div class="er-gauge-text">
      <strong>{{ shown }}</strong>
      <span>{{ label }}</span>
      <!-- The state is written out as well as coloured. -->
      <span v-if="stateText" class="er-gauge-state">{{ stateText }}</span>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-gauge {
    --er-gauge-color: var(--er-chart-1);
    position: relative;
    display: grid;
    justify-items: center;
    max-width: 100%;
  }

  .er-gauge[data-state='warning'] {
    --er-gauge-color: var(--er-warning);
  }

  .er-gauge[data-state='critical'] {
    --er-gauge-color: var(--er-destructive);
  }

  .er-gauge svg {
    display: block;
    max-width: 100%;
  }

  .er-gauge path {
    fill: none;
    stroke-linecap: round;
  }

  .er-gauge-track {
    stroke: color-mix(in oklab, var(--er-gauge-color) 18%, transparent);
  }

  .er-gauge-fill {
    stroke: var(--er-gauge-color);
    transition: stroke-dasharray 300ms var(--er-ease);
  }

  @media (prefers-reduced-motion: reduce) {
    .er-gauge-fill {
      transition: none;
    }
  }

  .er-gauge-text {
    display: grid;
    justify-items: center;
    margin-top: -1.75rem;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    text-align: center;
  }

  .er-gauge-text strong {
    color: var(--er-foreground);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .er-gauge-state {
    color: var(--er-foreground);
    font-size: 0.75rem;
    font-weight: 600;
  }
}
</style>
