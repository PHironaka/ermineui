<template>
  <div class="er-card"><slot /></div>
</template>

<style>
@layer components {
  .er-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 0;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-xl);
    background: var(--er-card);
    color: var(--er-card-foreground);
    box-shadow: var(--er-shadow-sm);
  }

  .er-card-header {
    display: grid;
    gap: 0.375rem;
    padding: 0 1.5rem;
  }

  .er-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: var(--er-weight-semibold);
    line-height: 1.25;
  }

  .er-card-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.45;
  }

  .er-card-content {
    padding: 0 1.5rem;
  }

  .er-card-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1.5rem;
  }
}
</style>
