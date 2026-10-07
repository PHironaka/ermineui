<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <!-- The wrapper scrolls sideways, so a wide table never pushes the page wider on a phone. -->
  <div class="sb-table-wrap">
    <table v-bind="$attrs" class="sb-table"><slot /></table>
  </div>
</template>

<style>
@layer components {
  .sb-table-wrap {
    /* Positioned, so anything visually hidden inside scrolls with the table instead of widening the page. */
    position: relative;
    width: 100%;
    overflow-x: auto;
  }

  .sb-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    caption-side: bottom;
  }

  .sb-table-caption {
    margin-top: 0.75rem;
    color: var(--sb-muted-foreground);
    font-size: 0.8125rem;
  }

  .sb-table-row {
    border-bottom: 1px solid var(--sb-border);
    transition: background-color var(--sb-duration);
  }

  .sb-table-body .sb-table-row:last-child {
    border-bottom: 0;
  }

  .sb-table-body .sb-table-row:hover {
    background: color-mix(in oklab, var(--sb-muted) 50%, transparent);
  }

  .sb-table-row[data-state='selected'],
  .sb-table-body .sb-table-row[data-state='selected']:hover {
    background: var(--sb-muted);
  }

  .sb-table-head,
  .sb-table-cell {
    padding: 0.625rem 0.75rem;
    text-align: left;
    vertical-align: middle;
  }

  .sb-table-head {
    height: 2.5rem;
    padding-block: 0;
    color: var(--sb-muted-foreground);
    font-weight: 500;
    white-space: nowrap;
  }

  .sb-table-head[data-align='right'],
  .sb-table-cell[data-align='right'] {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .sb-table-head[data-align='center'],
  .sb-table-cell[data-align='center'] {
    text-align: center;
  }

  .sb-table-footer {
    border-top: 1px solid var(--sb-border);
    background: color-mix(in oklab, var(--sb-muted) 50%, transparent);
    font-weight: 500;
  }

  .sb-table-footer .sb-table-row {
    border-bottom: 0;
  }
}
</style>
