<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive'
    /** Show a close button. */
    dismissible?: boolean
    dismissLabel?: string
    /** Accessible name of the strip. */
    label?: string
  }>(),
  { variant: 'default', dismissLabel: 'Dismiss', label: 'Announcement' },
)

/** Whether the banner is showing. Bind it to remember that it was dismissed. */
const open = defineModel<boolean>('open', { default: true })
</script>

<template>
  <div v-if="open" role="region" class="er-banner" :aria-label="label" :data-variant="variant">
    <div class="er-banner-text"><slot /></div>
    <div v-if="$slots.action" class="er-banner-action"><slot name="action" /></div>
    <button v-if="dismissible" type="button" class="er-banner-close" :aria-label="dismissLabel" @click="open = false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </button>
  </div>
</template>

<style>
@layer components {
  .er-banner {
    --er-banner-color: var(--er-foreground);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem 1rem;
    width: 100%;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid color-mix(in oklab, var(--er-banner-color) 25%, var(--er-border));
    background: color-mix(in oklab, var(--er-banner-color) 8%, var(--er-background));
    color: var(--er-foreground);
    font-size: 0.875rem;
  }

  .er-banner[data-variant='default'] {
    border-color: var(--er-border);
    background: var(--er-muted);
  }

  .er-banner[data-variant='info'] {
    --er-banner-color: var(--er-info);
  }

  .er-banner[data-variant='success'] {
    --er-banner-color: var(--er-success);
  }

  .er-banner[data-variant='warning'] {
    --er-banner-color: var(--er-warning);
  }

  .er-banner[data-variant='destructive'] {
    --er-banner-color: var(--er-destructive);
  }

  .er-banner-text {
    min-width: 0;
    text-align: center;
    text-wrap: balance;
  }

  .er-banner-text a,
  .er-banner-action a {
    color: inherit;
    font-weight: 500;
    text-underline-offset: 3px;
  }

  .er-banner-action {
    flex-shrink: 0;
  }

  .er-banner-close {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    margin-left: auto;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-banner-close:hover {
    color: var(--er-foreground);
  }

  .er-banner-close:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-banner-close svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
