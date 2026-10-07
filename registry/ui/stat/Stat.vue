<script setup lang="ts">
import { computed } from 'vue'
import { CountUp } from '../count-up'
import Sparkline from './Sparkline.vue'

const props = withDefaults(
  defineProps<{
    /** What the number is. */
    label: string
    /** A number is shortened (12.9K, 4.2M); a string is shown exactly as given. */
    value: number | string
    /** Change since the comparison period, in percent: 12.4 for +12.4%. */
    delta?: number
    /** What the change is measured against, e.g. "vs last month". */
    deltaLabel?: string
    /** Whether going up is good news. Turn off for things like error rate or build time. */
    upIsGood?: boolean
    /** Recent values, oldest first, drawn as a small line. */
    trend?: readonly number[]
    /** Run a number value up from zero when the tile scrolls into view. */
    countUp?: boolean
  }>(),
  { upIsGood: true },
)

// Fixed locale, so server and browser write numbers the same way.
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const shown = computed(() => (typeof props.value === 'number' ? compact.format(props.value) : props.value))
const direction = computed(() => (!props.delta ? 'flat' : props.delta > 0 ? 'up' : 'down'))
const tone = computed(() => {
  if (direction.value === 'flat') return 'neutral'
  return (direction.value === 'up') === props.upIsGood ? 'good' : 'bad'
})
</script>

<template>
  <div class="er-stat">
    <div class="er-stat-label">{{ label }}</div>
    <div class="er-stat-row">
      <div class="er-stat-value">
        <CountUp v-if="countUp && typeof value === 'number'" :value="value" :format="compact.format" />
        <template v-else>{{ shown }}</template>
      </div>
      <Sparkline v-if="trend?.length" :data="trend" />
    </div>
    <div v-if="delta !== undefined" class="er-stat-delta" :data-tone="tone">
      <!-- The arrow and the sign say which way it went, so the colour is never the only cue. -->
      <svg v-if="direction !== 'flat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-if="direction === 'up'" d="M12 19V5M6 11l6-6 6 6" />
        <path v-else d="M12 5v14M6 13l6 6 6-6" />
      </svg>
      <strong>{{ percent.format(delta) }}%</strong>
      <span v-if="deltaLabel">{{ deltaLabel }}</span>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-stat {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }

  .er-stat-label {
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-stat-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }

  .er-stat-value {
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }

  .er-stat-delta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-stat-delta svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-stat-delta strong {
    margin-right: 0.125rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .er-stat-delta[data-tone='good'] svg,
  .er-stat-delta[data-tone='good'] strong {
    color: var(--er-success);
  }

  .er-stat-delta[data-tone='bad'] svg,
  .er-stat-delta[data-tone='bad'] strong {
    color: var(--er-destructive);
  }
}
</style>
