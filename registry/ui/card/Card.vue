<template>
  <div class="sb-card"><slot /></div>
</template>

<style>
@layer components {
  .sb-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 0;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-xl);
    background: var(--sb-card);
    color: var(--sb-card-foreground);
    box-shadow: var(--sb-shadow-sm);
  }

  .sb-card-header {
    display: grid;
    gap: 0.375rem;
    padding: 0 1.5rem;
  }

  .sb-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.25;
  }

  .sb-card-description {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.45;
  }

  .sb-card-content {
    padding: 0 1.5rem;
  }

  .sb-card-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1.5rem;
  }
}
</style>
