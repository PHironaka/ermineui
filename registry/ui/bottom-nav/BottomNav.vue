<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Accessible name of the navigation. */
    label?: string
    /** Pin the bar to the bottom of the screen. Turn off to place it yourself. */
    fixed?: boolean
  }>(),
  { label: 'Main', fixed: true },
)
</script>

<template>
  <nav class="er-bottom-nav" :aria-label="label" :data-fixed="fixed ? '' : undefined">
    <slot />
  </nav>
</template>

<style>
@layer components {
  .er-bottom-nav {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    width: 100%;
    border-top: 1px solid var(--er-border);
    background: var(--er-background);
  }

  /* Clear of the home indicator on phones without a button; the page needs padding of its own to scroll past the bar. */
  .er-bottom-nav[data-fixed] {
    position: fixed;
    inset: auto 0 0;
    z-index: 10;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .er-bottom-nav-item {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.125rem;
    min-width: 0;
    padding: 0.5rem 0.25rem 0.375rem;
    border: 0;
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    font-size: 0.6875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1rem;
    text-decoration: none;
    cursor: pointer;
    transition: color var(--er-duration);
  }

  .er-bottom-nav-item:hover,
  .er-bottom-nav-item[aria-current] {
    color: var(--er-foreground);
  }

  /* The current page is marked by a bar as well as by colour. */
  .er-bottom-nav-item[aria-current]::before {
    content: '';
    position: absolute;
    top: -1px;
    width: 2rem;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background: var(--er-primary);
  }

  .er-bottom-nav-item:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-bottom-nav-icon {
    position: relative;
    display: grid;
    place-items: center;
    height: 1.5rem;
  }

  .er-bottom-nav-icon svg {
    width: 1.375rem;
    height: 1.375rem;
  }

  .er-bottom-nav-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-bottom-nav-badge {
    position: absolute;
    top: -0.25rem;
    left: calc(50% + 0.375rem);
    display: grid;
    place-items: center;
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.25rem;
    border-radius: 999px;
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .er-bottom-nav-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
