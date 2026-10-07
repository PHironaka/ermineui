<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The values, oldest first. */
    data: readonly number[]
    width?: number
    height?: number
  }>(),
  { width: 96, height: 32 },
)

// Room for the 2px line and the end dot, so neither is cut off at the edges.
const PAD = 4

const points = computed(() => {
  const values = props.data.filter((value) => Number.isFinite(value))
  if (values.length < 2) return []
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  const step = (props.width - PAD * 2) / (values.length - 1)
  return values.map((value, index) => ({
    x: PAD + index * step,
    y: props.height - PAD - ((value - min) / span) * (props.height - PAD * 2),
  }))
})
const line = computed(() => points.value.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(''))
const last = computed(() => points.value[points.value.length - 1])
</script>

<template>
  <!-- A shape, not a readout: the number beside it carries the value, so this is hidden from screen readers. -->
  <svg class="sb-sparkline" :width="width" :height="height" aria-hidden="true">
    <path :d="line" />
    <circle v-if="last" :cx="last.x" :cy="last.y" r="3" />
  </svg>
</template>

<style>
@layer components {
  .sb-sparkline {
    display: block;
    flex-shrink: 0;
    overflow: visible;
  }

  /* The history stays quiet; only the latest point takes the accent colour. */
  .sb-sparkline path {
    fill: none;
    stroke: var(--sb-muted-foreground);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.7;
  }

  .sb-sparkline circle {
    fill: var(--sb-chart-1, var(--sb-primary));
  }
}
</style>
