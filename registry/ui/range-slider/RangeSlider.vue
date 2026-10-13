<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    /** The least distance the two ends may be apart. */
    minGap?: number
    disabled?: boolean
    /** Accessible names of the two thumbs. */
    lowLabel?: string
    highLabel?: string
    /** Submit both ends with a form: the lower as <name>-min, the higher as <name>-max. */
    name?: string
  }>(),
  { min: 0, max: 100, step: 1, minGap: 0, lowLabel: 'Minimum', highLabel: 'Maximum' },
)

/** The lower and higher end, in that order. */
const model = defineModel<[number, number]>({ default: () => [0, 100] })

const root = ref<HTMLElement | null>(null)

const span = computed(() => props.max - props.min)
const fraction = (value: number) => (span.value > 0 ? Math.max(0, Math.min((value - props.min) / span.value, 1)) : 0)

function setLow(value: number) {
  model.value = [Math.max(props.min, Math.min(value, model.value[1] - props.minGap)), model.value[1]]
}

function setHigh(value: number) {
  model.value = [model.value[0], Math.min(props.max, Math.max(value, model.value[0] + props.minGap))]
}

/** A thumb cannot pass the other one. The input is put back straight away, so its thumb does not wander off. */
function onInput(event: Event, end: 'low' | 'high') {
  const input = event.target as HTMLInputElement
  if (end === 'low') setLow(input.valueAsNumber)
  else setHigh(input.valueAsNumber)
  input.value = String(model.value[end === 'low' ? 0 : 1])
}

/** A press on the bare track moves whichever thumb is nearer. The thumbs handle their own presses. */
function onTrackPress(event: PointerEvent) {
  const el = root.value
  if (!el || props.disabled || event.target !== el) return
  const box = el.getBoundingClientRect()
  const raw = props.min + ((event.clientX - box.left) / box.width) * span.value
  const value = Number((Math.round((raw - props.min) / props.step) * props.step + props.min).toFixed(10))
  const [low, high] = model.value
  if (Math.abs(value - low) <= Math.abs(value - high)) setLow(value)
  else setHigh(value)
}
</script>

<template>
  <!-- Two real range inputs share one track, so arrow keys, Home / End, touch and forms all work as usual. -->
  <div
    ref="root"
    class="er-range-slider"
    role="group"
    :data-disabled="disabled ? '' : undefined"
    :style="{ '--er-range-from': fraction(model[0]), '--er-range-to': fraction(model[1]) }"
    @pointerdown="onTrackPress"
  >
    <!-- When both thumbs sit at the far end, the lower one has to be on top or neither could be dragged back. -->
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="model[0]"
      :disabled="disabled"
      :name="name ? `${name}-min` : undefined"
      :aria-label="lowLabel"
      :style="{ zIndex: fraction(model[0]) > 0.5 ? 2 : 1 }"
      @input="onInput($event, 'low')"
    />
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="model[1]"
      :disabled="disabled"
      :name="name ? `${name}-max` : undefined"
      :aria-label="highLabel"
      style="z-index: 1"
      @input="onInput($event, 'high')"
    />
  </div>
</template>

<style>
@layer components {
  .er-range-slider {
    --er-range-thumb: 1rem;
    position: relative;
    width: 100%;
    height: 1rem;
    cursor: pointer;
  }

  /* The track, and the filled part between the two thumbs. A thumb's centre travels from half a thumb
     in from one end to half a thumb in from the other, so the fill is measured the same way. */
  .er-range-slider::before,
  .er-range-slider::after {
    content: '';
    position: absolute;
    top: 50%;
    height: 0.375rem;
    border-radius: 999px;
    translate: 0 -50%;
    pointer-events: none;
  }

  .er-range-slider::before {
    inset-inline: 0;
    background: color-mix(in oklab, var(--er-primary) 15%, transparent);
  }

  .er-range-slider::after {
    left: calc(var(--er-range-thumb) / 2 + var(--er-range-from) * (100% - var(--er-range-thumb)));
    right: calc(var(--er-range-thumb) / 2 + (1 - var(--er-range-to)) * (100% - var(--er-range-thumb)));
    background: var(--er-primary);
  }

  /* The inputs lie on top of each other and let presses through; only their thumbs take them. */
  .er-range-slider input {
    appearance: none;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    background: transparent;
    pointer-events: none;
  }

  .er-range-slider input::-webkit-slider-runnable-track {
    height: 1rem;
    background: transparent;
  }

  .er-range-slider input::-moz-range-track {
    height: 1rem;
    background: transparent;
  }

  .er-range-slider input::-webkit-slider-thumb {
    appearance: none;
    width: var(--er-range-thumb);
    height: var(--er-range-thumb);
    border: 1px solid var(--er-primary);
    border-radius: 50%;
    background: var(--er-background);
    box-shadow: var(--er-shadow-sm);
    cursor: pointer;
    pointer-events: auto;
    transition: box-shadow var(--er-duration);
  }

  .er-range-slider input::-moz-range-thumb {
    box-sizing: border-box;
    width: var(--er-range-thumb);
    height: var(--er-range-thumb);
    border: 1px solid var(--er-primary);
    border-radius: 50%;
    background: var(--er-background);
    box-shadow: var(--er-shadow-sm);
    cursor: pointer;
    pointer-events: auto;
  }

  .er-range-slider input:focus-visible {
    outline: none;
  }

  .er-range-slider input:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--er-ring) 35%, transparent);
  }

  .er-range-slider input:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--er-ring) 35%, transparent);
  }

  .er-range-slider[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
