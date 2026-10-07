<script setup lang="ts">
const model = defineModel<boolean>()
</script>

<template>
  <input v-model="model" type="checkbox" role="switch" class="er-switch" />
</template>

<style>
@layer components {
  /* A native checkbox announced as a switch, so it submits with forms and needs no JavaScript. */
  .er-switch {
    appearance: none;
    position: relative;
    flex-shrink: 0;
    width: 2rem;
    height: 1.15rem;
    margin: 0;
    border: 1px solid transparent;
    border-radius: 999px;
    background: var(--er-input);
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-switch::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--er-background);
    box-shadow: var(--er-shadow-sm);
    transition: translate var(--er-duration) var(--er-ease);
  }

  .er-switch:checked {
    background: var(--er-primary);
  }

  .er-switch:checked::before {
    translate: calc(2rem - 2px - 100%) 0;
  }

  .er-switch:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
