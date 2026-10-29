<template>
  <label class="er-label"><slot /></label>
</template>

<style>
@layer components {
  .er-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--er-foreground);
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1.25;
    user-select: none;
  }

  /* Dim the label when the control it wraps is disabled. */
  .er-label:has(:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
