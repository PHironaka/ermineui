<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  /** Measure progress through one element (an article) instead of the whole page: a CSS selector or an element. */
  target?: string | HTMLElement
}>()

/** How far through, from 0 to 1. */
const progress = ref(0)
let frame = 0

function measure() {
  const el = typeof props.target === 'string' ? document.querySelector<HTMLElement>(props.target) : props.target
  if (el) {
    // From the moment its top reaches the top of the window to the moment its bottom reaches the bottom.
    const box = el.getBoundingClientRect()
    const distance = box.height - window.innerHeight
    progress.value = distance > 0 ? Math.max(0, Math.min(-box.top / distance, 1)) : box.top <= 0 ? 1 : 0
    return
  }
  const distance = document.documentElement.scrollHeight - window.innerHeight
  progress.value = distance > 0 ? Math.max(0, Math.min(window.scrollY / distance, 1)) : 0
}

// At most once per frame, however often scroll events fire.
function schedule() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
})
</script>

<template>
  <!-- Decoration: the scrollbar already tells assistive technology where the reader is. -->
  <div class="er-scroll-progress" aria-hidden="true" :style="{ '--er-scroll-progress': progress }">
    <div />
  </div>
</template>

<style>
@layer components {
  .er-scroll-progress {
    position: fixed;
    inset: 0 0 auto;
    z-index: var(--er-z-overlay);
    height: 3px;
    pointer-events: none;
  }

  /* Scaled, not resized, so filling it never makes the browser lay the page out again. */
  .er-scroll-progress div {
    height: 100%;
    background: var(--er-primary);
    transform: scaleX(var(--er-scroll-progress, 0));
    transform-origin: left;
  }
}
</style>
