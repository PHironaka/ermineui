<template>
  <ol class="er-timeline"><slot /></ol>
</template>

<style>
@layer components {
  .er-timeline {
    display: grid;
    margin: 0;
    padding: 0;
    font-size: 0.875rem;
    list-style: none;
  }

  .er-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    gap: 0 0.75rem;
    padding-bottom: 1.25rem;
  }

  .er-timeline-item:last-child {
    padding-bottom: 0;
  }

  /* The line runs from under this marker to the next item's marker. */
  .er-timeline-item:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 1.625rem;
    bottom: 0.125rem;
    left: calc(0.75rem - 0.5px);
    width: 1px;
    background: var(--er-border);
  }

  .er-timeline-marker {
    --er-timeline-color: var(--er-muted-foreground);
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: color-mix(in oklab, var(--er-timeline-color) 14%, var(--er-background));
    color: var(--er-timeline-color);
  }

  .er-timeline-item[data-tone='success'] .er-timeline-marker {
    --er-timeline-color: var(--er-success);
  }

  .er-timeline-item[data-tone='warning'] .er-timeline-marker {
    --er-timeline-color: var(--er-warning);
  }

  .er-timeline-item[data-tone='destructive'] .er-timeline-marker {
    --er-timeline-color: var(--er-destructive);
  }

  .er-timeline-marker svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  /* Without an icon the marker is a plain dot. */
  .er-timeline-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: currentColor;
  }

  .er-timeline-body {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
    padding-top: 0.125rem;
  }

  .er-timeline-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0 0.75rem;
  }

  .er-timeline-title {
    font-weight: 500;
  }

  .er-timeline-time {
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .er-timeline-content {
    color: var(--er-muted-foreground);
    line-height: 1.5;
  }
}
</style>
