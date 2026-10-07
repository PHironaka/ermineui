<script setup lang="ts">
const model = defineModel<string | number>()
</script>

<template>
  <input v-model="model" class="sb-input" />
</template>

<style>
@layer components {
  .sb-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    line-height: 1.25rem;
    box-shadow: var(--sb-shadow-xs);
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  @media (min-width: 48rem) {
    .sb-input {
      font-size: 0.875rem;
    }
  }

  .sb-input::placeholder {
    color: var(--sb-muted-foreground);
  }

  .sb-input:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-input[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }

  .sb-input[aria-invalid='true']:focus-visible {
    outline-color: color-mix(in oklab, var(--sb-destructive) 35%, transparent);
  }

  .sb-input[type='file'] {
    padding: 0.3125rem 0.75rem;
    color: var(--sb-muted-foreground);
  }

  .sb-input::file-selector-button {
    margin-right: 0.75rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--sb-foreground);
    font: inherit;
    font-weight: 500;
  }
}
</style>
