<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <!-- The wrapper scrolls sideways, so a wide table never pushes the page wider on a phone. -->
  <div class="er-table-wrap">
    <table v-bind="$attrs" class="er-table"><slot /></table>
  </div>
</template>

<style>
@layer components {
  .er-table-wrap {
    /* Positioned, so anything visually hidden inside scrolls with the table instead of widening the page. */
    position: relative;
    width: 100%;
    overflow-x: auto;
  }

  .er-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    caption-side: bottom;
  }

  .er-table-caption {
    margin-top: 0.75rem;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-table-row {
    border-bottom: 1px solid var(--er-border);
    transition: background-color var(--er-duration);
  }

  .er-table-body .er-table-row:last-child {
    border-bottom: 0;
  }

  .er-table-body .er-table-row:hover {
    background: color-mix(in oklab, var(--er-muted) 50%, transparent);
  }

  .er-table-row[data-state='selected'],
  .er-table-body .er-table-row[data-state='selected']:hover {
    background: var(--er-muted);
  }

  .er-table-head,
  .er-table-cell {
    padding: 0.625rem 0.75rem;
    text-align: left;
    vertical-align: middle;
  }

  .er-table-head {
    height: 2.5rem;
    padding-block: 0;
    color: var(--er-muted-foreground);
    font-weight: var(--er-weight-medium);
    white-space: nowrap;
  }

  .er-table-head[data-align='right'],
  .er-table-cell[data-align='right'] {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .er-table-head[data-align='center'],
  .er-table-cell[data-align='center'] {
    text-align: center;
  }

  .er-table-footer {
    border-top: 1px solid var(--er-border);
    background: color-mix(in oklab, var(--er-muted) 50%, transparent);
    font-weight: var(--er-weight-medium);
  }

  .er-table-footer .er-table-row {
    border-bottom: 0;
  }
}
</style>
