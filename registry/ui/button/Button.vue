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
    class="er-button"
    :data-variant="variant"
    :data-size="size"
  >
    <slot />
  </Primitive>
</template>

<style>
@layer components {
  .er-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 1rem;
    border: 1px solid transparent;
    border-radius: var(--er-radius-md);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--er-duration),
      color var(--er-duration),
      border-color var(--er-duration),
      box-shadow var(--er-duration);
  }

  .er-button:hover {
    background: color-mix(in oklab, var(--er-primary) 88%, var(--er-background));
  }

  .er-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-button:disabled,
  .er-button[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-button svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
  }

  /* Variants */
  .er-button[data-variant='secondary'] {
    background: var(--er-secondary);
    color: var(--er-secondary-foreground);
  }

  .er-button[data-variant='secondary']:hover {
    background: color-mix(in oklab, var(--er-secondary) 80%, var(--er-foreground) 6%);
  }

  .er-button[data-variant='outline'] {
    border-color: var(--er-input);
    background: var(--er-input-background);
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-xs);
  }

  .er-button[data-variant='outline']:hover,
  .er-button[data-variant='ghost']:hover,
  .er-button[data-variant='outline'][data-state='open'],
  .er-button[data-variant='ghost'][data-state='open'] {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-button[data-variant='ghost'] {
    background: transparent;
    color: var(--er-foreground);
  }

  .er-button[data-variant='destructive'] {
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
  }

  .er-button[data-variant='destructive']:hover {
    background: color-mix(in oklab, var(--er-destructive) 88%, var(--er-background));
  }

  .er-button[data-variant='link'] {
    height: auto;
    padding: 0;
    background: transparent;
    color: var(--er-foreground);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
  }

  .er-button[data-variant='link']:hover {
    text-decoration-color: currentColor;
  }

  /* Sizes */
  .er-button[data-size='sm'] {
    gap: 0.375rem;
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.8125rem;
  }

  .er-button[data-size='lg'] {
    height: 2.5rem;
    padding: 0 1.5rem;
  }

  .er-button[data-size='icon'] {
    width: 2.25rem;
    padding: 0;
  }
}
</style>
