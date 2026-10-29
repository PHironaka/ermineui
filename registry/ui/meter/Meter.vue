<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    min?: number
    max?: number
    /** At or below this, the reading counts as low. */
    low?: number
    /** At or above this, the reading counts as high. */
    high?: number
    /** Which end is the good one. "low" suits disk space used; "high" suits battery left. Without it the bar stays neutral. */
    optimum?: 'low' | 'high'
    /** What is being measured. Shown above the bar. */
    label: string
    /** Writes the reading out in words, for the text beside the label and for screen readers: "42 GB of 64 GB". */
    format?: (value: number, max: number) => string
    /** Keep the label and the reading for screen readers only. */
    hideLabel?: boolean
  }>(),
  { min: 0, max: 100 },
)

const id = useId()
const clamped = computed(() => Math.max(props.min, Math.min(props.value, props.max)))
const percent = computed(() => (props.max > props.min ? ((clamped.value - props.min) / (props.max - props.min)) * 100 : 0))
const text = computed(() => (props.format ? props.format(clamped.value, props.max) : `${Math.round(percent.value)}%`))

/** Where the reading falls: in the range you would like it in, getting away from it, or at the wrong end. */
const tone = computed(() => {
  if (!props.optimum) return 'neutral'
  const isLow = props.low !== undefined && clamped.value <= props.low
  const isHigh = props.high !== undefined && clamped.value >= props.high
  if (props.optimum === 'low') return isHigh ? 'bad' : isLow || props.low === undefined ? 'good' : 'fair'
  return isLow ? 'bad' : isHigh || props.high === undefined ? 'good' : 'fair'
})
</script>

<template>
  <div class="er-meter" :data-tone="tone">
    <div class="er-meter-top" :data-hidden="hideLabel ? '' : undefined">
      <span :id="id" class="er-meter-label">{{ label }}</span>
      <span class="er-meter-value" aria-hidden="true">{{ text }}</span>
    </div>
    <div class="er-meter-track" role="meter" :aria-labelledby="id" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="clamped" :aria-valuetext="text">
      <div class="er-meter-fill" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>

<style>
@layer components {
  .er-meter {
    display: grid;
    gap: 0.375rem;
    width: 100%;
    --er-meter-color: var(--er-primary);
  }

  .er-meter[data-tone='good'] {
    --er-meter-color: var(--er-success);
  }

  .er-meter[data-tone='fair'] {
    --er-meter-color: var(--er-warning);
  }

  .er-meter[data-tone='bad'] {
    --er-meter-color: var(--er-destructive);
  }

  .er-meter-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-meter-top[data-hidden] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-meter-label {
    font-weight: var(--er-weight-medium);
  }

  .er-meter-value {
    color: var(--er-muted-foreground);
    font-variant-numeric: tabular-nums;
  }

  .er-meter-track {
    height: 0.5rem;
    border-radius: 999px;
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-meter-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--er-meter-color);
    transition:
      width 300ms var(--er-ease),
      background-color var(--er-duration);
  }

  @media (prefers-reduced-motion: reduce) {
    .er-meter-fill {
      transition: none;
    }
  }
}
</style>
