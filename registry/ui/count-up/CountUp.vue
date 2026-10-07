<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The number to arrive at. */
    value: number
    /** Where to start counting from. */
    from?: number
    /** How long the count takes, in ms. */
    duration?: number
    /** How the number is written at each moment. */
    format?: (value: number) => string
  }>(),
  { from: 0, duration: 1200 },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const write = (value: number) => (props.format ?? fullNumber.format)(value)

const root = ref<HTMLElement | null>(null)
/** The number on screen right now. Starts at the final value, which is what a server renders. */
const shown = ref(props.value)
let frame = 0
let observer: IntersectionObserver | undefined
let started = false

function run(from: number) {
  cancelAnimationFrame(frame)
  const begin = performance.now()
  const step = (now: number) => {
    const elapsed = Math.min((now - begin) / props.duration, 1)
    // Fast at first, slowing as it arrives, so the last digits can be read as they settle.
    const eased = 1 - (1 - elapsed) ** 3
    shown.value = from + (props.value - from) * eased
    if (elapsed < 1) frame = requestAnimationFrame(step)
    else shown.value = props.value
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  // With reduced motion, or no way to tell when it is on screen, the number is simply shown.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined' || !root.value) return
  shown.value = props.from
  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    started = true
    observer?.disconnect()
    run(props.from)
  })
  observer.observe(root.value)
})

// A value that changes later counts on from wherever it is.
watch(
  () => props.value,
  (next) => {
    if (started) run(shown.value)
    else if (!observer) shown.value = next
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<template>
  <span ref="root" class="er-count-up">
    <!-- Screen readers get the real number once, not a stream of every number on the way to it. -->
    <span class="er-count-up-value">{{ write(value) }}</span>
    <span aria-hidden="true">{{ write(shown) }}</span>
  </span>
</template>

<style>
@layer components {
  .er-count-up {
    position: relative;
    /* Every digit the same width, so the number does not jitter as it counts. */
    font-variant-numeric: tabular-nums;
  }

  .er-count-up-value {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
