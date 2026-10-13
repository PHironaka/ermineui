<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    /** The name of the screen. */
    title?: string
    /** Heading level of the title. */
    titleAs?: string
    /** Where the title sits. Centred is the iOS habit, start the Android one. */
    align?: 'center' | 'start'
    /** Show a back button. With `backHref` it is a link; without, it emits `back`. */
    back?: boolean
    backHref?: string
    backLabel?: string
    /** Tag or component for the back link, e.g. NuxtLink. */
    linkAs?: string | Component
    /** Keep the bar at the top while the page scrolls under it. */
    sticky?: boolean
  }>(),
  { titleAs: 'h1', align: 'center', backLabel: 'Back', linkAs: 'a', sticky: true },
)

defineEmits<{
  /** The back button was pressed and there is no `backHref`. Go back yourself: router.back(), say. */
  back: []
}>()
</script>

<template>
  <header class="er-app-bar" :data-align="align" :data-sticky="sticky ? '' : undefined">
    <div class="er-app-bar-start">
      <!-- In place of the back button: a menu button, a close button. -->
      <slot name="start">
        <component
          :is="backHref ? linkAs : 'button'"
          v-if="back || backHref"
          :href="backHref"
          :type="backHref ? undefined : 'button'"
          class="er-app-bar-button"
          :aria-label="backLabel"
          @click="!backHref && $emit('back')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </component>
      </slot>
    </div>
    <component :is="titleAs" class="er-app-bar-title"><slot>{{ title }}</slot></component>
    <!-- One or two actions. Give each the class er-app-bar-button for the same size and shape as the back button. -->
    <div class="er-app-bar-end"><slot name="end" /></div>
  </header>
</template>

<style>
@layer components {
  .er-app-bar {
    display: grid;
    grid-template-columns: minmax(2.5rem, 1fr) auto minmax(2.5rem, 1fr);
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    min-height: 3.25rem;
    /* Clear of the notch, and of the rounded corners when the phone is on its side. */
    padding: env(safe-area-inset-top) max(0.5rem, env(safe-area-inset-right)) 0 max(0.5rem, env(safe-area-inset-left));
    border-bottom: 1px solid var(--er-border);
    background: var(--er-background);
    color: var(--er-foreground);
  }

  .er-app-bar[data-sticky] {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .er-app-bar[data-align='start'] {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .er-app-bar-start,
  .er-app-bar-end {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    min-width: 0;
  }

  .er-app-bar-end {
    justify-content: flex-end;
  }

  .er-app-bar-title {
    min-width: 0;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5rem;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-app-bar[data-align='start'] .er-app-bar-title {
    padding-inline: 0.5rem;
    text-align: left;
  }

  /* 2.75rem is 44px: the smallest target a thumb hits reliably. */
  .er-app-bar-button {
    position: relative;
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-app-bar-button:hover {
    background: var(--er-accent);
  }

  .er-app-bar-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-app-bar-button svg {
    width: 1.375rem;
    height: 1.375rem;
  }
}
</style>
