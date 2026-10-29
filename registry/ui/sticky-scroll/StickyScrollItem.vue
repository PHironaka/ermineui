<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStickyScroll } from './context'

const props = withDefaults(
  defineProps<{
    /** A picture for the sticky column. */
    image?: string
    /** What the picture shows. Leave it empty only if the copy says the same thing. */
    alt?: string
    /** Large text for the sticky column, used when there is no picture. */
    heading?: string
    /** The heading's tag: the next level down from the section's own heading. */
    headingAs?: string
    /**
     * How many screens of scrolling the step takes. Past 1, its copy stays put beside the media too, while
     * `progress` runs from 0 to 1: room for something in the media, such as a chart, to draw itself.
     */
    span?: number
  }>(),
  { alt: '', headingAs: 'h3', span: 1 },
)

defineSlots<{
  /**
   * Anything else for the sticky column, in place of the picture or heading. `progress` is how far the step's
   * copy has scrolled past the middle of the window, 0 to 1; `active` is whether this step is the one showing.
   */
  media?: (props: { progress: number; active: boolean }) => unknown
  /** The copy that scrolls past. */
  default?: () => unknown
}>()

const scroll = useStickyScroll()
const copy = ref<HTMLElement>()
const index = computed(() => (copy.value ? scroll.steps.value.indexOf(copy.value) : -1))
const isActive = computed(() => index.value !== -1 && index.value === scroll.active.value)
const progress = computed(() => scroll.progress.value[index.value] ?? 0)

onMounted(() => scroll.register(copy.value!))
onBeforeUnmount(() => scroll.unregister(copy.value!))

// Tabbing to a link in a step shows that step's media, even before the scroll gets there.
function show() {
  if (index.value !== -1) scroll.active.value = index.value
}
</script>

<template>
  <div class="er-sticky-scroll-item" :data-state="isActive ? 'active' : 'inactive'" @focusin="show">
    <div class="er-sticky-scroll-media">
      <slot name="media" :progress="progress" :active="isActive">
        <img v-if="image" :src="image" :alt="alt" loading="lazy" decoding="async" />
        <component :is="headingAs" v-else-if="heading" class="er-sticky-scroll-heading">{{ heading }}</component>
      </slot>
    </div>
    <div ref="copy" class="er-sticky-scroll-copy" :style="span === 1 ? undefined : { '--er-sticky-scroll-span': span }">
      <div class="er-sticky-scroll-copy-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
@layer components {
  /* No box of its own: its media and copy are placed straight into the section's grid. */
  .er-sticky-scroll-item {
    display: contents;
  }

  .er-sticky-scroll-media {
    position: sticky;
    top: var(--er-sticky-scroll-top, 0px);
    grid-row: 1;
    grid-column: 1;
    align-self: start;
    display: grid;
    place-items: center;
    height: var(--er-sticky-scroll-height);
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.75rem) scale(0.98);
    pointer-events: none;
    transition:
      opacity 0.45s ease,
      filter 0.45s ease,
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* As tall as the scrolling the step takes; its text sits in the middle of the window for all of it. */
  .er-sticky-scroll-copy {
    grid-column: 2;
    min-height: calc(var(--er-sticky-scroll-height) * var(--er-sticky-scroll-span, 1));
    max-width: 34rem;
    font-size: 1.125rem;
    line-height: 1.6;
  }

  .er-sticky-scroll-copy-inner {
    position: sticky;
    top: var(--er-sticky-scroll-top, 0px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: var(--er-sticky-scroll-height);
  }

  .er-sticky-scroll[data-side='end'] .er-sticky-scroll-media {
    grid-column: 2;
  }
  .er-sticky-scroll[data-side='end'] .er-sticky-scroll-copy {
    grid-column: 1;
  }

  /* Before the page has run its script, the first step's media shows. */
  .er-sticky-scroll-item[data-state='active'] > .er-sticky-scroll-media,
  .er-sticky-scroll:not([data-ready]) .er-sticky-scroll-item:first-child > .er-sticky-scroll-media {
    opacity: 1;
    filter: none;
    transform: none;
    pointer-events: auto;
  }

  .er-sticky-scroll-media > img {
    width: 100%;
    max-height: calc(100% - 3rem);
    aspect-ratio: 4 / 3;
    border-radius: var(--er-radius-xl);
    object-fit: cover;
  }

  .er-sticky-scroll-heading {
    margin: 0;
    font-size: clamp(2rem, 7cqi, 4.5rem);
    font-weight: var(--er-weight-semibold);
    line-height: 1.05;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  /* A narrow space: one column, each step's media above its copy, nothing sticks. */
  @container (max-width: 40rem) {
    .er-sticky-scroll-grid {
      grid-template-columns: 1fr;
    }
    .er-sticky-scroll .er-sticky-scroll-media,
    .er-sticky-scroll .er-sticky-scroll-copy {
      grid-row: auto;
      grid-column: 1;
    }
    .er-sticky-scroll .er-sticky-scroll-media {
      position: static;
      place-items: start;
      height: auto;
      margin-top: 2.5rem;
      opacity: 1;
      filter: none;
      transform: none;
      pointer-events: auto;
    }
    .er-sticky-scroll-media > img {
      max-height: none;
    }
    .er-sticky-scroll-copy {
      padding-top: 1rem;
    }
    .er-sticky-scroll-copy,
    .er-sticky-scroll-copy-inner {
      position: static;
      min-height: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .er-sticky-scroll-media {
      filter: none;
      transform: none;
      transition: opacity 0.2s ease;
    }
  }
}
</style>
