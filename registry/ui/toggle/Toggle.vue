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
  <button type="button" class="sb-toggle" :aria-pressed="pressed" :data-state="pressed ? 'on' : 'off'" :data-variant="variant" :data-size="size" @click="pressed = !pressed">
    <slot :pressed="pressed" />
  </button>
</template>

<style>
@layer components {
  .sb-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 0.625rem;
    border: 1px solid transparent;
    border-radius: var(--sb-radius-md);
    background: transparent;
    color: var(--sb-muted-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--sb-duration),
      color var(--sb-duration),
      border-color var(--sb-duration);
  }

  .sb-toggle[data-size='sm'] {
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }

  .sb-toggle[data-variant='outline'] {
    border-color: var(--sb-input);
    background: var(--sb-input-background);
    box-shadow: var(--sb-shadow-xs);
  }

  .sb-toggle:hover {
    background: color-mix(in oklab, var(--sb-accent) 60%, transparent);
    color: var(--sb-foreground);
  }

  .sb-toggle[data-state='on'] {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-toggle:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-toggle:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-toggle svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
