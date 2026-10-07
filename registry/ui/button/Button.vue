<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'

withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    /** Tag or component to render, e.g. "a" or NuxtLink. */
    as?: string | Component
    /** Pass the button's styling and behavior to the single child instead of rendering a tag. */
    asChild?: boolean
  }>(),
  { variant: 'default', size: 'md', as: 'button' },
)
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    class="sb-button"
    :data-variant="variant"
    :data-size="size"
  >
    <slot />
  </Primitive>
</template>

<style>
@layer components {
  .sb-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 1rem;
    border: 1px solid transparent;
    border-radius: var(--sb-radius-md);
    background: var(--sb-primary);
    color: var(--sb-primary-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--sb-duration),
      color var(--sb-duration),
      border-color var(--sb-duration),
      box-shadow var(--sb-duration);
  }

  .sb-button:hover {
    background: color-mix(in oklab, var(--sb-primary) 88%, var(--sb-background));
  }

  .sb-button:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-button:disabled,
  .sb-button[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-button svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
  }

  /* Variants */
  .sb-button[data-variant='secondary'] {
    background: var(--sb-secondary);
    color: var(--sb-secondary-foreground);
  }

  .sb-button[data-variant='secondary']:hover {
    background: color-mix(in oklab, var(--sb-secondary) 80%, var(--sb-foreground) 6%);
  }

  .sb-button[data-variant='outline'] {
    border-color: var(--sb-input);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    box-shadow: var(--sb-shadow-xs);
  }

  .sb-button[data-variant='outline']:hover,
  .sb-button[data-variant='ghost']:hover,
  .sb-button[data-variant='outline'][data-state='open'],
  .sb-button[data-variant='ghost'][data-state='open'] {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-button[data-variant='ghost'] {
    background: transparent;
    color: var(--sb-foreground);
  }

  .sb-button[data-variant='destructive'] {
    background: var(--sb-destructive);
    color: var(--sb-destructive-foreground);
  }

  .sb-button[data-variant='destructive']:hover {
    background: color-mix(in oklab, var(--sb-destructive) 88%, var(--sb-background));
  }

  .sb-button[data-variant='link'] {
    height: auto;
    padding: 0;
    background: transparent;
    color: var(--sb-foreground);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
  }

  .sb-button[data-variant='link']:hover {
    text-decoration-color: currentColor;
  }

  /* Sizes */
  .sb-button[data-size='sm'] {
    gap: 0.375rem;
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.8125rem;
  }

  .sb-button[data-size='lg'] {
    height: 2.5rem;
    padding: 0 1.5rem;
  }

  .sb-button[data-size='icon'] {
    width: 2.25rem;
    padding: 0;
  }
}
</style>
