<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive'
  }>(),
  { variant: 'default' },
)
</script>

<template>
  <div role="alert" class="er-alert" :data-variant="variant">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-alert {
    --er-alert-color: var(--er-foreground);
    display: grid;
    gap: 0.25rem 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid color-mix(in oklab, var(--er-alert-color) 30%, var(--er-border));
    border-radius: var(--er-radius-lg);
    background: color-mix(in oklab, var(--er-alert-color) 5%, var(--er-card));
    color: var(--er-card-foreground);
    font-size: 0.875rem;
  }

  .er-alert[data-variant='default'] {
    border-color: var(--er-border);
    background: var(--er-card);
  }

  .er-alert[data-variant='info'] {
    --er-alert-color: var(--er-info);
  }

  .er-alert[data-variant='success'] {
    --er-alert-color: var(--er-success);
  }

  .er-alert[data-variant='warning'] {
    --er-alert-color: var(--er-warning);
  }

  .er-alert[data-variant='destructive'] {
    --er-alert-color: var(--er-destructive);
  }

  /* An svg placed first becomes the icon, in a column of its own beside the text. */
  .er-alert:has(> svg) {
    grid-template-columns: auto 1fr;
  }

  .er-alert > svg {
    grid-row: 1 / span 2;
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    color: var(--er-alert-color);
  }

  .er-alert-title {
    grid-column: -2;
    font-weight: var(--er-weight-medium);
    line-height: 1.25rem;
  }

  .er-alert-description {
    grid-column: -2;
    color: var(--er-muted-foreground);
    line-height: 1.5;
  }
}
</style>
