<script setup lang="ts">
const model = defineModel<string | number>()
</script>

<template>
  <input v-model="model" class="er-input" />
</template>

<style>
@layer components {
  .er-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    font-family: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    line-height: 1.25rem;
    box-shadow: var(--er-shadow-xs);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  @media (min-width: 48rem) {
    .er-input {
      font-size: 0.875rem;
    }
  }

  .er-input::placeholder {
    color: var(--er-muted-foreground);
  }

  .er-input:focus-visible {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-input[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }

  .er-input[aria-invalid='true']:focus-visible {
    outline-color: color-mix(in oklab, var(--er-destructive) 35%, transparent);
  }

  .er-input[type='file'] {
    padding: 0.3125rem 0.75rem;
    color: var(--er-muted-foreground);
  }

  .er-input::file-selector-button {
    margin-right: 0.75rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-weight: 500;
  }
}
</style>
