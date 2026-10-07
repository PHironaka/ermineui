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
  <input v-model.number="model" type="range" class="sb-slider" :min="min" :max="max" :step="step" :style="{ '--sb-slider-fill': fill }" />
</template>

<style>
@layer components {
  /* A real range input, restyled — so arrow keys, Home / End, touch and forms all work as usual. */
  .sb-slider {
    --sb-slider-track: color-mix(in oklab, var(--sb-primary) 15%, transparent);
    appearance: none;
    display: block;
    width: 100%;
    height: 1rem;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  .sb-slider::-webkit-slider-runnable-track {
    height: 0.375rem;
    border-radius: 999px;
    background: linear-gradient(to right, var(--sb-primary) var(--sb-slider-fill), var(--sb-slider-track) var(--sb-slider-fill));
  }

  .sb-slider::-moz-range-track {
    height: 0.375rem;
    border-radius: 999px;
    background: var(--sb-slider-track);
  }

  .sb-slider::-moz-range-progress {
    height: 0.375rem;
    border-radius: 999px;
    background: var(--sb-primary);
  }

  .sb-slider::-webkit-slider-thumb {
    appearance: none;
    width: 1rem;
    height: 1rem;
    margin-top: -0.3125rem;
    border: 1px solid var(--sb-primary);
    border-radius: 50%;
    background: var(--sb-background);
    box-shadow: var(--sb-shadow-sm);
    transition: box-shadow var(--sb-duration);
  }

  .sb-slider::-moz-range-thumb {
    box-sizing: border-box;
    width: 1rem;
    height: 1rem;
    border: 1px solid var(--sb-primary);
    border-radius: 50%;
    background: var(--sb-background);
    box-shadow: var(--sb-shadow-sm);
  }

  .sb-slider:focus-visible {
    outline: none;
  }

  .sb-slider:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--sb-ring) 35%, transparent);
  }

  .sb-slider:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--sb-ring) 35%, transparent);
  }

  .sb-slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
