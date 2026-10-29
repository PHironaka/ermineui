<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'outline'
    size?: 'sm' | 'md'
  }>(),
  { variant: 'default', size: 'md' },
)

const pressed = defineModel<boolean>({ default: false })
</script>

<template>
  <button type="button" class="er-toggle" :aria-pressed="pressed" :data-state="pressed ? 'on' : 'off'" :data-variant="variant" :data-size="size" @click="pressed = !pressed">
    <slot :pressed="pressed" />
  </button>
</template>

<style>
@layer components {
  .er-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: var(--er-control-md);
    height: var(--er-control-md);
    padding: 0 0.625rem;
    border: 1px solid transparent;
    border-radius: var(--er-radius-control);
    background: transparent;
    color: var(--er-muted-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration),
      border-color var(--er-duration);
  }

  .er-toggle[data-size='sm'] {
    min-width: var(--er-control-sm);
    height: var(--er-control-sm);
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }

  .er-toggle[data-variant='outline'] {
    border-color: var(--er-input);
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
  }

  .er-toggle:hover {
    background: color-mix(in oklab, var(--er-accent) 60%, transparent);
    color: var(--er-foreground);
  }

  .er-toggle[data-state='on'] {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-toggle:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-toggle:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-toggle svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
