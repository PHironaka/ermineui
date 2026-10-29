<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Accessible name, and the words shown with `showLabel`. Name the product when there are several on the page: "Save Wool throw". */
    label?: string
    /** The words shown once it is saved. The accessible name stays the same; being pressed says the rest. */
    savedLabel?: string
    /** Show the words beside the heart. */
    showLabel?: boolean
    size?: 'sm' | 'md'
    disabled?: boolean
  }>(),
  { label: 'Save for later', savedLabel: 'Saved', size: 'md' },
)

/** Whether it is saved. */
const saved = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    type="button"
    class="er-wishlist-button"
    :data-state="saved ? 'on' : 'off'"
    :data-size="size"
    :data-labelled="showLabel ? '' : undefined"
    :aria-pressed="saved"
    :aria-label="label"
    :disabled="disabled"
    @click="saved = !saved"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20s-7.5-4.6-7.5-10.200A4.300 4.300 0 0 1 12 7.300a4.300 4.300 0 0 1 7.500 2.500C19.500 15.400 12 20 12 20Z" />
    </svg>
    <span v-if="showLabel">{{ saved ? savedLabel : label }}</span>
  </button>
</template>

<style>
@layer components {
  .er-wishlist-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: var(--er-control-md);
    height: var(--er-control-md);
    padding: 0;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-pill);
    background: var(--er-background);
    color: var(--er-foreground);
    font: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-wishlist-button[data-size='sm'] {
    width: 1.875rem;
    height: 1.875rem;
  }

  .er-wishlist-button[data-labelled] {
    width: auto;
    padding: 0 0.875rem;
    border-radius: var(--er-radius-control);
  }

  .er-wishlist-button:hover {
    background: var(--er-accent);
  }

  .er-wishlist-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-wishlist-button:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-wishlist-button svg {
    width: 1.125rem;
    height: 1.125rem;
    transition: fill var(--er-duration);
  }

  .er-wishlist-button[data-size='sm'] svg {
    width: 1rem;
    height: 1rem;
  }

  /* Saved: the heart fills. Its shape changing, not only its colour, is what marks the state. */
  .er-wishlist-button[data-state='on'] svg {
    fill: var(--er-destructive);
    stroke: var(--er-destructive);
    animation: er-wishlist-pop 300ms var(--er-ease);
  }

  @keyframes er-wishlist-pop {
    40% {
      transform: scale(1.25);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .er-wishlist-button[data-state='on'] svg {
      animation: none;
    }
  }
}
</style>
