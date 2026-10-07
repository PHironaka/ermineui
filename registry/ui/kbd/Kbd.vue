<template>
  <kbd class="sb-kbd"><slot /></kbd>
</template>

<style>
@layer components {
  .sb-kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.375rem;
    height: 1.375rem;
    padding: 0 0.3125rem;
    border: 1px solid var(--sb-border);
    border-bottom-width: 2px;
    border-radius: var(--sb-radius-sm);
    background: var(--sb-muted);
    color: var(--sb-muted-foreground);
    font-family: var(--sb-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
  }
}
</style>
