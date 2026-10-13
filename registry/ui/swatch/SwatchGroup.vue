<script setup lang="ts">
import { computed, toRef, useId } from 'vue'
import { provideSwatchGroup } from './context'

const props = defineProps<{
  /** Accessible name: what is being chosen, e.g. "Colour" or "Size". */
  label: string
  /** Submit the choice with a form under this name. One is made up when you leave it out. */
  name?: string
  disabled?: boolean
}>()

const value = defineModel<string>()

const fallbackName = useId()

provideSwatchGroup({
  value,
  select: (next) => {
    value.value = next
  },
  name: computed(() => props.name ?? fallbackName),
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <div class="er-swatch-group" role="radiogroup" :aria-label="label">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-swatch-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .er-swatch {
    position: relative;
    display: inline-grid;
    place-items: center;
    min-width: 2.5rem;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--er-duration),
      border-color var(--er-duration),
      box-shadow var(--er-duration);
  }

  .er-swatch:hover {
    background: var(--er-accent);
  }

  .er-swatch[data-state='on'] {
    border-color: var(--er-primary);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  /* A real radio button covers the whole swatch, so forms, labels and the arrow keys work as usual. */
  .er-swatch input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .er-swatch:has(input:focus-visible) {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  /* A colour: a round dot. The chosen one gets a ring around it, so colour is not what marks the choice. */
  .er-swatch[data-color] {
    width: 2rem;
    min-width: 0;
    height: 2rem;
    padding: 0;
    border-color: color-mix(in oklab, var(--er-foreground) 20%, transparent);
    border-radius: 50%;
    background: var(--er-swatch-color);
  }

  .er-swatch[data-color][data-state='on'] {
    border-color: color-mix(in oklab, var(--er-foreground) 20%, transparent);
    background: var(--er-swatch-color);
    box-shadow:
      0 0 0 2px var(--er-background),
      0 0 0 4px var(--er-primary);
  }

  /* Not available: faded, with a line through it. */
  .er-swatch[data-unavailable] {
    color: var(--er-muted-foreground);
    cursor: not-allowed;
  }

  .er-swatch[data-unavailable]:hover {
    background: var(--er-input-background);
  }

  .er-swatch[data-unavailable]::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(to top right, transparent calc(50% - 1px), var(--er-muted-foreground) calc(50% - 1px), var(--er-muted-foreground) calc(50% + 1px), transparent calc(50% + 1px));
    pointer-events: none;
  }

  .er-swatch[data-color][data-unavailable] {
    background: color-mix(in oklab, var(--er-swatch-color) 35%, var(--er-background));
  }

  .er-swatch[data-color][data-unavailable]:hover {
    background: color-mix(in oklab, var(--er-swatch-color) 35%, var(--er-background));
  }
}
</style>
