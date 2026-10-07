<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  }>(),
  { variant: 'default' },
)
</script>

<template>
  <span class="sb-badge" :data-variant="variant"><slot /></span>
</template>

<style>
@layer components {
  .sb-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--sb-radius-sm);
    background: var(--sb-primary);
    color: var(--sb-primary-foreground);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1rem;
    white-space: nowrap;
  }

  .sb-badge svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .sb-badge[data-variant='secondary'] {
    background: var(--sb-secondary);
    color: var(--sb-secondary-foreground);
  }

  .sb-badge[data-variant='outline'] {
    border-color: var(--sb-border);
    background: transparent;
    color: var(--sb-foreground);
  }

  .sb-badge[data-variant='destructive'] {
    background: var(--sb-destructive);
    color: var(--sb-destructive-foreground);
  }
}
</style>
