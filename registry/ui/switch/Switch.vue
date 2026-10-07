<script setup lang="ts">
const model = defineModel<boolean>()
</script>

<template>
  <input v-model="model" type="checkbox" role="switch" class="sb-switch" />
</template>

<style>
@layer components {
  /* A native checkbox announced as a switch, so it submits with forms and needs no JavaScript. */
  .sb-switch {
    appearance: none;
    position: relative;
    flex-shrink: 0;
    width: 2rem;
    height: 1.15rem;
    margin: 0;
    border: 1px solid transparent;
    border-radius: 999px;
    background: var(--sb-input);
    box-shadow: var(--sb-shadow-xs);
    cursor: pointer;
    transition: background-color var(--sb-duration);
  }

  .sb-switch::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--sb-background);
    box-shadow: var(--sb-shadow-sm);
    transition: translate var(--sb-duration) var(--sb-ease);
  }

  .sb-switch:checked {
    background: var(--sb-primary);
  }

  .sb-switch:checked::before {
    translate: calc(2rem - 2px - 100%) 0;
  }

  .sb-switch:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
