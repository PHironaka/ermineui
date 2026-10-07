<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="sb-empty-state">
    <div v-if="$slots.icon" class="sb-empty-state-icon" aria-hidden="true"><slot name="icon" /></div>
    <p class="sb-empty-state-title">{{ title }}</p>
    <p v-if="description" class="sb-empty-state-description">{{ description }}</p>
    <div v-if="$slots.default" class="sb-empty-state-actions"><slot /></div>
  </div>
</template>

<style>
@layer components {
  .sb-empty-state {
    display: grid;
    justify-items: center;
    gap: 0.375rem;
    width: 100%;
    padding: 2.5rem 1.5rem;
    border: 1px dashed var(--sb-input);
    border-radius: var(--sb-radius-lg);
    text-align: center;
  }

  .sb-empty-state-icon {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--sb-radius-lg);
    background: var(--sb-muted);
    color: var(--sb-muted-foreground);
  }

  .sb-empty-state-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .sb-empty-state-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .sb-empty-state-description {
    max-width: 28rem;
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
    text-wrap: balance;
  }

  .sb-empty-state-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
}
</style>
