<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { provideStickyScroll } from './context'

const props = withDefaults(
  defineProps<{
    /** Which column stays put: the media at the start (left) or at the end (right). */
    side?: 'start' | 'end'
    /** How far from the top of the window the media sticks, e.g. the height of a sticky header: px, or any CSS length. */
    top?: number | string
  }>(),
  { side: 'start', top: 0 },
)

/** Index of the step whose media is showing. It follows the scroll, and can be set to show a step. */
const active = defineModel<number>('active', { default: 0 })

const steps = shallowRef<HTMLElement[]>([])
const ready = ref(false)
let observer: IntersectionObserver | undefined

function register(copy: HTMLElement) {
  // Kept in page order, whatever order the steps mount in.
  steps.value = [...steps.value, copy].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  observer?.observe(copy)
}

function unregister(copy: HTMLElement) {
  steps.value = steps.value.filter((step) => step !== copy)
  observer?.unobserve(copy)
}

provideStickyScroll({ steps, active, register, unregister })

onMounted(() => {
  // The step crossing the middle of the window is the one shown. Above the first step or past the last, the
  // nearest one stays.
  observer = new IntersectionObserver(
    (entries) => {
      const crossing = entries.find((entry) => entry.isIntersecting)
      const index = crossing ? steps.value.indexOf(crossing.target as HTMLElement) : -1
      if (index !== -1) active.value = index
    },
    { rootMargin: '-50% 0px -50% 0px' },
  )
  for (const step of steps.value) observer.observe(step)
  ready.value = true
})

onBeforeUnmount(() => observer?.disconnect())

// A step removed from the end takes the index with it.
watch(steps, (list) => {
  if (list.length > 0 && active.value > list.length - 1) active.value = list.length - 1
})

const length = (value: number | string) => (typeof value === 'number' ? `${value}px` : value)
</script>

<template>
  <div class="er-sticky-scroll" :data-side="side" :data-ready="ready ? '' : undefined" :style="{ '--er-sticky-scroll-top': length(props.top) }">
    <div class="er-sticky-scroll-grid">
      <slot />
    </div>
  </div>
</template>

<style>
@layer components {
  .er-sticky-scroll {
    /* The media fills the window below the offset, and each step's copy takes as long to scroll past. */
    --er-sticky-scroll-height: calc(100dvh - var(--er-sticky-scroll-top, 0px));
    container-type: inline-size;
    width: 100%;
  }

  /*
   * Every step's media sits in the same cell of the first row, stacked, and sticks for the whole section: a sticky
   * element is held inside its containing block, which here is the grid, not its own row. The copy runs down the
   * other column, one row per step. Each step keeps its media and copy together, so they read in order.
   */
  .er-sticky-scroll-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: clamp(1.5rem, 5cqi, 4rem);
  }
}
</style>
