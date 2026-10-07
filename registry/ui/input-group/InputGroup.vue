<template>
  <!-- The frame draws the border; the input inside goes bare, so the whole thing reads as one field. -->
  <div class="sb-input-group">
    <span v-if="$slots.prefix" class="sb-input-group-addon"><slot name="prefix" /></span>
    <slot />
    <span v-if="$slots.suffix" class="sb-input-group-addon"><slot name="suffix" /></span>
  </div>
</template>

<style>
@layer components {
  .sb-input-group {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    height: 2.25rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    box-shadow: var(--sb-shadow-xs);
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  .sb-input-group:has(.sb-input:focus-visible) {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-input-group:has(.sb-input[aria-invalid='true']) {
    border-color: var(--sb-destructive);
  }

  .sb-input-group:has(.sb-input:disabled) {
    opacity: 0.5;
  }

  .sb-input-group .sb-input,
  .sb-input-group .sb-input:focus-visible {
    flex: 1;
    height: 100%;
    border: 0;
    background: transparent;
    box-shadow: none;
    outline: none;
    opacity: 1;
  }

  .sb-input-group-addon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.625rem;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .sb-input-group-addon:first-child {
    padding-right: 0;
  }

  .sb-input-group-addon:last-child {
    padding-left: 0;
  }

  .sb-input-group-addon svg {
    width: 1rem;
    height: 1rem;
  }

  /* Small buttons that live inside a field: show / hide, clear. */
  .sb-input-group-button {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    margin-right: -0.25rem;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-muted-foreground);
    cursor: pointer;
  }

  .sb-input-group-button:hover {
    background: var(--sb-accent);
    color: var(--sb-foreground);
  }

  .sb-input-group-button:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 1px;
  }

  /* The browser's own clear button would double up with ours. */
  .sb-input-group .sb-input[type='search']::-webkit-search-cancel-button {
    appearance: none;
  }
}
</style>
