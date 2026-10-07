<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  }>(),
  { variant: 'default' },
)
</script>

<template>
  <span class="er-badge" :data-variant="variant"><slot /></span>
</template>

<style>
@layer components {
  .er-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--er-radius-sm);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1rem;
    white-space: nowrap;
  }

  .er-badge svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .er-badge[data-variant='secondary'] {
    background: var(--er-secondary);
    color: var(--er-secondary-foreground);
  }

  .er-badge[data-variant='outline'] {
    border-color: var(--er-border);
    background: transparent;
    color: var(--er-foreground);
  }

  .er-badge[data-variant='destructive'] {
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
  }
}
</style>
