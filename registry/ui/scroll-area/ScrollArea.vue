<script setup lang="ts">
withDefaults(
  defineProps<{
    orientation?: 'vertical' | 'horizontal' | 'both'
    /** What the box holds. Needed because it can be focused, to scroll with the keyboard. */
    label: string
  }>(),
  { orientation: 'vertical' },
)
</script>

<template>
  <!-- Native scrolling throughout — touch, wheel, keyboard and find-in-page behave as usual. Only the bars are restyled. -->
  <div class="er-scroll-area" role="region" tabindex="0" :aria-label="label" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-scroll-area {
    max-width: 100%;
    max-height: 100%;
    border-radius: var(--er-radius-md);
    overflow: hidden auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--er-input) transparent;
  }

  .er-scroll-area[data-orientation='horizontal'] {
    overflow: auto hidden;
  }

  .er-scroll-area[data-orientation='both'] {
    overflow: auto;
  }

  .er-scroll-area:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  /* Browsers without scrollbar-color (older Safari) get the same look from these. */
  @supports not (scrollbar-color: auto) {
    .er-scroll-area::-webkit-scrollbar {
      width: 0.5rem;
      height: 0.5rem;
    }

    .er-scroll-area::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      border-radius: 999px;
      background: var(--er-input);
      background-clip: content-box;
    }
  }
}
</style>
