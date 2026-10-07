<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'

withDefaults(
  defineProps<{
    /** Accessible name: what the slides are. */
    label: string
    /** Show the row of dots under the slides. */
    dots?: boolean
  }>(),
  { dots: true },
)

/** The slide in view, starting at 1. */
const slide = defineModel<number>({ default: 1 })

const track = ref<HTMLElement | null>(null)
const count = ref(0)

const slides = () => Array.from(track.value?.children ?? []) as HTMLElement[]

function measure() {
  count.value = slides().length
}

/** The slide whose left edge is nearest the left edge of the track. */
function nearest(): number {
  const el = track.value
  if (!el) return 1
  let best = 0
  let distance = Infinity
  slides().forEach((item, index) => {
    const gap = Math.abs(item.offsetLeft - el.offsetLeft - el.scrollLeft)
    if (gap < distance) {
      distance = gap
      best = index
    }
  })
  return best + 1
}

let frame = 0
/** The slide a button, dot or key press is scrolling towards. While set, slides passed on the way are not reported. */
let heading: number | undefined

function onScroll() {
  // Swiping and scrolling move the slides natively; this only keeps the dots and buttons in step.
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const current = nearest()
    if (heading !== undefined) {
      if (current === heading) heading = undefined
      return
    }
    if (current !== slide.value) slide.value = current
  })
}

function scrollToSlide(number: number, smooth = true) {
  const el = track.value
  const target = slides()[number - 1]
  if (!el || !target) return
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  heading = number
  el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: smooth && !calm ? 'smooth' : 'auto' })
}

function go(number: number) {
  const next = Math.max(1, Math.min(number, count.value))
  slide.value = next
  scrollToSlide(next)
}

// Follows a change made from outside (v-model), without fighting a scroll that is already heading there.
watch(slide, (next) => {
  if (next !== nearest()) scrollToSlide(next)
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') go(slide.value + 1)
  else if (event.key === 'ArrowLeft') go(slide.value - 1)
  else if (event.key === 'Home') go(1)
  else if (event.key === 'End') go(count.value)
  else return
  event.preventDefault()
}

onMounted(() => {
  measure()
  if (slide.value > 1) scrollToSlide(slide.value, false)
})
onUpdated(measure)
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <section class="er-carousel" aria-roledescription="carousel" :aria-label="label">
    <!-- Focusable so the arrow keys work; the slides themselves scroll with touch, trackpad or wheel.
         Any of those taking over cancels a scroll that a button started. -->
    <div
      ref="track"
      class="er-carousel-track"
      tabindex="0"
      @scroll.passive="onScroll"
      @scrollend="heading = undefined"
      @pointerdown="heading = undefined"
      @wheel.passive="heading = undefined"
      @touchstart.passive="heading = undefined"
      @keydown="onKeydown"
    >
      <slot />
    </div>
    <!-- Buttons and dots move the slides without moving focus, so the new position is said aloud. -->
    <p class="er-carousel-status" role="status">{{ count > 1 ? `Slide ${slide} of ${count}` : '' }}</p>
    <!-- The controls sit under the slides, so they never cover what a slide shows. -->
    <div v-if="count > 1" class="er-carousel-controls">
      <button type="button" class="er-carousel-button" aria-label="Previous slide" :disabled="slide <= 1" @click="go(slide - 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <div v-if="dots" class="er-carousel-dots">
        <button
          v-for="number in count"
          :key="number"
          type="button"
          :aria-label="`Go to slide ${number} of ${count}`"
          :aria-current="number === slide ? 'true' : undefined"
          @click="go(number)"
        />
      </div>
      <button type="button" class="er-carousel-button" aria-label="Next slide" :disabled="slide >= count" @click="go(slide + 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  </section>
</template>

<style>
@layer components {
  .er-carousel {
    position: relative;
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
  }

  .er-carousel-track {
    display: flex;
    gap: var(--er-carousel-gap, 1rem);
    border-radius: var(--er-radius-lg);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .er-carousel-track::-webkit-scrollbar {
    display: none;
  }

  .er-carousel-track:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  /* One slide fills the view by default. Set --er-carousel-size (e.g. 50%) to show several side by side. */
  .er-carousel-slide {
    flex: 0 0 var(--er-carousel-size, 100%);
    min-width: 0;
    scroll-snap-align: start;
  }

  .er-carousel-status {
    margin: 0;
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-carousel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .er-carousel-button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 1px solid var(--er-input);
    border-radius: 50%;
    background: var(--er-input-background);
    color: var(--er-foreground);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      opacity var(--er-duration);
  }

  .er-carousel-button:hover {
    background: var(--er-accent);
  }

  .er-carousel-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-carousel-button:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .er-carousel-button svg {
    width: 1rem;
    height: 1rem;
  }

  .er-carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.125rem;
  }

  /* The dot is small, but the button around it is a comfortable 24px target. */
  .er-carousel-dots button {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  .er-carousel-dots button::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--er-input);
    transition: background-color var(--er-duration);
  }

  .er-carousel-dots button[aria-current]::before {
    background: var(--er-foreground);
  }

  .er-carousel-dots button:focus-visible {
    outline: 2px solid var(--er-ring);
  }
}
</style>
