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
  <div class="sb-scroll-area" role="region" tabindex="0" :aria-label="label" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer components {
  .sb-scroll-area {
    max-width: 100%;
    max-height: 100%;
    border-radius: var(--sb-radius-md);
    overflow: hidden auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--sb-input) transparent;
  }

  .sb-scroll-area[data-orientation='horizontal'] {
    overflow: auto hidden;
  }

  .sb-scroll-area[data-orientation='both'] {
    overflow: auto;
  }

  .sb-scroll-area:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  /* Browsers without scrollbar-color (older Safari) get the same look from these. */
  @supports not (scrollbar-color: auto) {
    .sb-scroll-area::-webkit-scrollbar {
      width: 0.5rem;
      height: 0.5rem;
    }

    .sb-scroll-area::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      border-radius: 999px;
      background: var(--sb-input);
      background-clip: content-box;
    }
  }
}
</style>
