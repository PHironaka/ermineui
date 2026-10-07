<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" class="sb-textarea" />
</template>

<style>
@layer components {
  .sb-textarea {
    display: block;
    width: 100%;
    min-height: 4.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    box-shadow: var(--sb-shadow-xs);
    resize: vertical;
    /* Grows with its content where the browser supports it. */
    field-sizing: content;
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  @media (min-width: 48rem) {
    .sb-textarea {
      font-size: 0.875rem;
    }
  }

  .sb-textarea::placeholder {
    color: var(--sb-muted-foreground);
  }

  .sb-textarea:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-textarea[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }
}
</style>
