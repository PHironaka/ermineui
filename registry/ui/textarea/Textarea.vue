<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" class="er-textarea" />
</template>

<style>
@layer components {
  .er-textarea {
    display: block;
    width: 100%;
    min-height: 4.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    box-shadow: var(--er-shadow-xs);
    resize: vertical;
    /* Grows with its content where the browser supports it. */
    field-sizing: content;
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  @media (min-width: 48rem) {
    .er-textarea {
      font-size: 0.875rem;
    }
  }

  .er-textarea::placeholder {
    color: var(--er-muted-foreground);
  }

  .er-textarea:focus-visible {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-textarea[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }
}
</style>
