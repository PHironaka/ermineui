<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
  }>(),
  { min: 0, max: 100, step: 1 },
)

const model = defineModel<number>({ default: 0 })

/** How far along the track the thumb is, for the filled part. */
const fill = computed(() => {
  const span = props.max - props.min
  return span > 0 ? `${Math.max(0, Math.min(((model.value - props.min) / span) * 100, 100))}%` : '0%'
})
</script>

<template>
  <input v-model.number="model" type="range" class="er-slider" :min="min" :max="max" :step="step" :style="{ '--er-slider-fill': fill }" />
</template>

<style>
@layer components {
  /* A real range input, restyled — so arrow keys, Home / End, touch and forms all work as usual. */
  .er-slider {
    --er-slider-track: color-mix(in oklab, var(--er-primary) 15%, transparent);
    appearance: none;
    display: block;
    width: 100%;
    height: 1rem;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  .er-slider::-webkit-slider-runnable-track {
    height: 0.375rem;
    border-radius: 999px;
    background: linear-gradient(to right, var(--er-primary) var(--er-slider-fill), var(--er-slider-track) var(--er-slider-fill));
  }

  .er-slider::-moz-range-track {
    height: 0.375rem;
    border-radius: 999px;
    background: var(--er-slider-track);
  }

  .er-slider::-moz-range-progress {
    height: 0.375rem;
    border-radius: 999px;
    background: var(--er-primary);
  }

  .er-slider::-webkit-slider-thumb {
    appearance: none;
    width: 1rem;
    height: 1rem;
    margin-top: -0.3125rem;
    border: 1px solid var(--er-primary);
    border-radius: 50%;
    background: var(--er-background);
    box-shadow: var(--er-shadow-sm);
    transition: box-shadow var(--er-duration);
  }

  .er-slider::-moz-range-thumb {
    box-sizing: border-box;
    width: 1rem;
    height: 1rem;
    border: 1px solid var(--er-primary);
    border-radius: 50%;
    background: var(--er-background);
    box-shadow: var(--er-shadow-sm);
  }

  .er-slider:focus-visible {
    outline: none;
  }

  .er-slider:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--er-ring) 35%, transparent);
  }

  .er-slider:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--er-ring) 35%, transparent);
  }

  .er-slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
