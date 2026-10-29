<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="er-empty-state">
    <div v-if="$slots.icon" class="er-empty-state-icon" aria-hidden="true"><slot name="icon" /></div>
    <p class="er-empty-state-title">{{ title }}</p>
    <p v-if="description" class="er-empty-state-description">{{ description }}</p>
    <div v-if="$slots.default" class="er-empty-state-actions"><slot /></div>
  </div>
</template>

<style>
@layer components {
  .er-empty-state {
    display: grid;
    justify-items: center;
    gap: 0.375rem;
    width: 100%;
    padding: 2.5rem 1.5rem;
    border: 1px dashed var(--er-input);
    border-radius: var(--er-radius-lg);
    text-align: center;
  }

  .er-empty-state-icon {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    color: var(--er-muted-foreground);
  }

  .er-empty-state-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-empty-state-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: var(--er-weight-semibold);
  }

  .er-empty-state-description {
    max-width: 28rem;
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-wrap: balance;
  }

  .er-empty-state-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
}
</style>
