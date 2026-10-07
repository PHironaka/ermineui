<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive'
  }>(),
  { variant: 'default' },
)
</script>

<template>
  <div role="alert" class="sb-alert" :data-variant="variant">
    <slot />
  </div>
</template>

<style>
@layer components {
  .sb-alert {
    --sb-alert-color: var(--sb-foreground);
    display: grid;
    gap: 0.25rem 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid color-mix(in oklab, var(--sb-alert-color) 30%, var(--sb-border));
    border-radius: var(--sb-radius-lg);
    background: color-mix(in oklab, var(--sb-alert-color) 5%, var(--sb-card));
    color: var(--sb-card-foreground);
    font-size: 0.875rem;
  }

  .sb-alert[data-variant='default'] {
    border-color: var(--sb-border);
    background: var(--sb-card);
  }

  .sb-alert[data-variant='info'] {
    --sb-alert-color: var(--sb-info);
  }

  .sb-alert[data-variant='success'] {
    --sb-alert-color: var(--sb-success);
  }

  .sb-alert[data-variant='warning'] {
    --sb-alert-color: var(--sb-warning);
  }

  .sb-alert[data-variant='destructive'] {
    --sb-alert-color: var(--sb-destructive);
  }

  /* An svg placed first becomes the icon, in a column of its own beside the text. */
  .sb-alert:has(> svg) {
    grid-template-columns: auto 1fr;
  }

  .sb-alert > svg {
    grid-row: 1 / span 2;
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    color: var(--sb-alert-color);
  }

  .sb-alert-title {
    grid-column: -2;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .sb-alert-description {
    grid-column: -2;
    color: var(--sb-muted-foreground);
    line-height: 1.5;
  }
}
</style>
