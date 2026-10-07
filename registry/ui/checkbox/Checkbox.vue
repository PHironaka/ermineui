<script setup lang="ts">
defineProps<{
  /** Show the "partially selected" dash, e.g. for a select-all box. */
  indeterminate?: boolean
}>()

const model = defineModel<boolean>()
</script>

<template>
  <input v-model="model" type="checkbox" class="er-checkbox" :indeterminate.prop="indeterminate" />
</template>

<style>
@layer components {
  /* A real checkbox, restyled — so forms, labels and the keyboard all work as usual. */
  .er-checkbox {
    appearance: none;
    display: inline-grid;
    place-content: center;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    margin: 0;
    border: 1px solid var(--er-input);
    border-radius: 4px;
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      border-color var(--er-duration);
  }

  .er-checkbox::before {
    content: '';
    width: 0.75rem;
    height: 0.75rem;
    background: var(--er-primary-foreground);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")
      center / contain no-repeat;
    transform: scale(0);
    transition: transform var(--er-duration) var(--er-ease);
  }

  .er-checkbox:indeterminate::before {
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E");
  }

  .er-checkbox:checked,
  .er-checkbox:indeterminate {
    border-color: var(--er-primary);
    background: var(--er-primary);
  }

  .er-checkbox:checked::before,
  .er-checkbox:indeterminate::before {
    transform: scale(1);
  }

  .er-checkbox:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-checkbox:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-checkbox[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }
}
</style>
