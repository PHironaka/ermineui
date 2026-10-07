<script setup lang="ts">
defineProps<{
  /** Show the "partially selected" dash, e.g. for a select-all box. */
  indeterminate?: boolean
}>()

const model = defineModel<boolean>()
</script>

<template>
  <input v-model="model" type="checkbox" class="sb-checkbox" :indeterminate.prop="indeterminate" />
</template>

<style>
@layer components {
  /* A real checkbox, restyled — so forms, labels and the keyboard all work as usual. */
  .sb-checkbox {
    appearance: none;
    display: inline-grid;
    place-content: center;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    margin: 0;
    border: 1px solid var(--sb-input);
    border-radius: 4px;
    background: var(--sb-input-background);
    box-shadow: var(--sb-shadow-xs);
    cursor: pointer;
    transition:
      background-color var(--sb-duration),
      border-color var(--sb-duration);
  }

  .sb-checkbox::before {
    content: '';
    width: 0.75rem;
    height: 0.75rem;
    background: var(--sb-primary-foreground);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")
      center / contain no-repeat;
    transform: scale(0);
    transition: transform var(--sb-duration) var(--sb-ease);
  }

  .sb-checkbox:indeterminate::before {
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E");
  }

  .sb-checkbox:checked,
  .sb-checkbox:indeterminate {
    border-color: var(--sb-primary);
    background: var(--sb-primary);
  }

  .sb-checkbox:checked::before,
  .sb-checkbox:indeterminate::before {
    transform: scale(1);
  }

  .sb-checkbox:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-checkbox:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-checkbox[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }
}
</style>
