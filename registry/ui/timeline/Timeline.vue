<template>
  <ol class="sb-timeline"><slot /></ol>
</template>

<style>
@layer components {
  .sb-timeline {
    display: grid;
    margin: 0;
    padding: 0;
    font-size: 0.875rem;
    list-style: none;
  }

  .sb-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    gap: 0 0.75rem;
    padding-bottom: 1.25rem;
  }

  .sb-timeline-item:last-child {
    padding-bottom: 0;
  }

  /* The line runs from under this marker to the next item's marker. */
  .sb-timeline-item:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 1.625rem;
    bottom: 0.125rem;
    left: calc(0.75rem - 0.5px);
    width: 1px;
    background: var(--sb-border);
  }

  .sb-timeline-marker {
    --sb-timeline-color: var(--sb-muted-foreground);
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: color-mix(in oklab, var(--sb-timeline-color) 14%, var(--sb-background));
    color: var(--sb-timeline-color);
  }

  .sb-timeline-item[data-tone='success'] .sb-timeline-marker {
    --sb-timeline-color: var(--sb-success);
  }

  .sb-timeline-item[data-tone='warning'] .sb-timeline-marker {
    --sb-timeline-color: var(--sb-warning);
  }

  .sb-timeline-item[data-tone='destructive'] .sb-timeline-marker {
    --sb-timeline-color: var(--sb-destructive);
  }

  .sb-timeline-marker svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  /* Without an icon the marker is a plain dot. */
  .sb-timeline-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: currentColor;
  }

  .sb-timeline-body {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
    padding-top: 0.125rem;
  }

  .sb-timeline-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0 0.75rem;
  }

  .sb-timeline-title {
    font-weight: 500;
  }

  .sb-timeline-time {
    color: var(--sb-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .sb-timeline-content {
    color: var(--sb-muted-foreground);
    line-height: 1.5;
  }
}
</style>
