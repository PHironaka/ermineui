<template>
  <label class="sb-label"><slot /></label>
</template>

<style>
@layer components {
  .sb-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--sb-foreground);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25;
    user-select: none;
  }

  /* Dim the label when the control it wraps is disabled. */
  .sb-label:has(:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
