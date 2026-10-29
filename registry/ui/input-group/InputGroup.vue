<template>
  <!-- The frame draws the border; the input inside goes bare, so the whole thing reads as one field. -->
  <div class="er-input-group">
    <span v-if="$slots.prefix" class="er-input-group-addon"><slot name="prefix" /></span>
    <slot />
    <span v-if="$slots.suffix" class="er-input-group-addon"><slot name="suffix" /></span>
  </div>
</template>

<style>
@layer components {
  .er-input-group {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    height: var(--er-control-md);
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-control);
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-input-group:has(.er-input:focus-visible) {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-input-group:has(.er-input[aria-invalid='true']) {
    border-color: var(--er-destructive);
  }

  .er-input-group:has(.er-input:disabled) {
    opacity: 0.5;
  }

  .er-input-group .er-input,
  .er-input-group .er-input:focus-visible {
    flex: 1;
    height: 100%;
    border: 0;
    background: transparent;
    box-shadow: none;
    outline: none;
    opacity: 1;
  }

  .er-input-group-addon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.625rem;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .er-input-group-addon:first-child {
    padding-right: 0;
  }

  .er-input-group-addon:last-child {
    padding-left: 0;
  }

  .er-input-group-addon svg {
    width: 1rem;
    height: 1rem;
  }

  /* Small buttons that live inside a field: show / hide, clear. */
  .er-input-group-button {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    margin-right: -0.25rem;
    padding: 0;
    border: 0;
    border-radius: calc(var(--er-radius-control) - 2px);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-input-group-button:hover {
    background: var(--er-accent);
    color: var(--er-foreground);
  }

  .er-input-group-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  /* The browser's own clear button would double up with ours. */
  .er-input-group .er-input[type='search']::-webkit-search-cancel-button {
    appearance: none;
  }
}
</style>
