<template>
  <kbd class="er-kbd"><slot /></kbd>
</template>

<style>
@layer components {
  .er-kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.375rem;
    height: 1.375rem;
    padding: 0 0.3125rem;
    border: 1px solid var(--er-border);
    border-bottom-width: 2px;
    border-radius: var(--er-radius-sm);
    background: var(--er-muted);
    color: var(--er-muted-foreground);
    font-family: var(--er-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
  }
}
</style>
