<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Accessible name of the trail. */
    label?: string
  }>(),
  { label: 'Breadcrumb' },
)
</script>

<template>
  <nav class="er-breadcrumb" :aria-label="label">
    <ol><slot /></ol>
  </nav>
</template>

<style>
@layer components {
  .er-breadcrumb ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    list-style: none;
  }

  .er-breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
  }

  /* The separator is drawn in CSS, so screen readers hear a plain list of links. */
  .er-breadcrumb-item + .er-breadcrumb-item::before {
    content: '';
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
    background: currentColor;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")
      center / contain no-repeat;
    opacity: 0.7;
  }

  .er-breadcrumb-link {
    border-radius: var(--er-radius-sm);
    color: inherit;
    text-decoration: none;
    transition: color var(--er-duration);
  }

  a.er-breadcrumb-link:hover {
    color: var(--er-foreground);
  }

  .er-breadcrumb-link:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-breadcrumb-link[aria-current='page'] {
    color: var(--er-foreground);
    font-weight: 500;
  }
}
</style>
