<script setup lang="ts">
import { ref } from 'vue'
import type { ChartLegendItem } from './scale'

/** What every chart has around its drawing: the legend, the table view and the screen-reader readout. */
withDefaults(
  defineProps<{
    /** What the chart shows. Used as the table's caption. */
    label: string
    /** Shown above the chart. Leave out when there is nothing to tell apart. */
    legend?: readonly ChartLegendItem[]
    /** Matches the marks: a short stroke for lines, a square for bars and areas, a dot for points. */
    legendShape?: 'line' | 'box' | 'dot'
    columns: readonly string[]
    rows: ReadonlyArray<readonly string[]>
    /** Read out by screen readers when it changes. */
    announcement?: string
  }>(),
  { legendShape: 'box', announcement: '' },
)

defineEmits<{
  /** A legend entry was pressed, to hide or show what it names. */
  toggle: [index: number]
}>()

const showTable = ref(false)
</script>

<template>
  <figure class="sb-chart">
    <div class="sb-chart-header">
      <ul v-if="legend?.length" class="sb-chart-legend">
        <li v-for="(item, index) in legend" :key="index">
          <button
            type="button"
            class="sb-chart-legend-item"
            :aria-pressed="!item.hidden"
            :title="item.hidden ? `Show ${item.name}` : `Hide ${item.name}`"
            @click="$emit('toggle', index)"
          >
            <span class="sb-chart-key" :data-shape="legendShape" :style="{ background: item.color }" />
            {{ item.name }}
          </button>
        </li>
      </ul>
      <button type="button" class="sb-chart-toggle" :aria-pressed="showTable" @click="showTable = !showTable">
        {{ showTable ? 'Show chart' : 'Show table' }}
      </button>
    </div>

    <div v-show="!showTable" class="sb-chart-body"><slot /></div>

    <div role="status" class="sb-chart-announcer">{{ announcement }}</div>

    <!-- Always in the page: screen readers get the numbers as a table even while the chart is showing. -->
    <div class="sb-chart-table" :data-visible="showTable ? '' : undefined">
      <table>
        <caption>{{ label }}</caption>
        <thead>
          <tr>
            <th v-for="(column, index) in columns" :key="index" scope="col">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <template v-for="(cell, index) in row" :key="index">
              <th v-if="index === 0" scope="row">{{ cell }}</th>
              <td v-else>{{ cell }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style>
@layer components {
  .sb-chart {
    /* The colour behind the chart. Gaps between marks and rings around dots are drawn in it. */
    --sb-chart-surface: var(--sb-background);
    position: relative;
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
    margin: 0;
    font-size: 0.75rem;
  }

  .sb-card .sb-chart {
    --sb-chart-surface: var(--sb-card);
  }

  .sb-chart-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .sb-chart-body {
    min-width: 0;
  }

  .sb-chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sb-chart-legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-muted-foreground);
    font: inherit;
    cursor: pointer;
  }

  .sb-chart-legend-item:hover {
    color: var(--sb-foreground);
  }

  .sb-chart-legend-item[aria-pressed='false'] {
    text-decoration: line-through;
    opacity: 0.55;
  }

  /* The colour sits beside the name; the name itself stays in the text colour so it is always readable. */
  .sb-chart-key {
    flex-shrink: 0;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 2px;
  }

  .sb-chart-key[data-shape='line'] {
    width: 0.75rem;
    height: 2px;
    border-radius: 1px;
  }

  .sb-chart-key[data-shape='dot'] {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .sb-chart-legend-item[aria-pressed='false'] .sb-chart-key {
    background: var(--sb-muted-foreground) !important;
  }

  .sb-chart-toggle {
    flex-shrink: 0;
    margin-left: auto;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-muted-foreground);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .sb-chart-toggle:hover {
    color: var(--sb-foreground);
  }

  .sb-chart-toggle:focus-visible,
  .sb-chart-legend-item:focus-visible,
  .sb-chart-plot:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-chart-plot {
    position: relative;
    border-radius: var(--sb-radius-sm);
    touch-action: pan-y;
  }

  .sb-chart-plot svg {
    display: block;
    overflow: visible;
  }

  .sb-chart-empty {
    display: grid;
    place-items: center;
    height: 100%;
    margin: 0;
    color: var(--sb-muted-foreground);
  }

  .sb-chart-grid line {
    stroke: var(--sb-border);
    stroke-width: 1;
  }

  .sb-chart-baseline {
    stroke: var(--sb-input);
    stroke-width: 1;
  }

  .sb-chart-axis text,
  .sb-chart-ends text {
    fill: var(--sb-muted-foreground);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .sb-chart-ends text {
    fill: var(--sb-foreground);
  }

  .sb-chart-line {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .sb-chart-area {
    opacity: 0.1;
  }

  .sb-chart-dot {
    stroke: var(--sb-chart-surface);
    stroke-width: 2;
  }

  .sb-chart-crosshair {
    stroke: var(--sb-input);
    stroke-width: 1;
  }

  .sb-chart-band {
    fill: var(--sb-accent);
    opacity: 0.6;
  }

  .sb-chart-tooltip {
    position: absolute;
    top: 0;
    z-index: 1;
    display: grid;
    gap: 0.25rem;
    min-width: 8rem;
    padding: 0.5rem 0.625rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-md);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    box-shadow: var(--sb-shadow-md);
    white-space: nowrap;
    pointer-events: none;
  }

  .sb-chart-tooltip-title {
    color: var(--sb-muted-foreground);
  }

  .sb-chart-tooltip-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--sb-muted-foreground);
  }

  /* The number is what the reader came for, so it carries the weight and the name stays quiet. */
  .sb-chart-tooltip-row strong {
    margin-left: auto;
    padding-left: 0.75rem;
    color: var(--sb-popover-foreground);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .sb-chart-announcer,
  .sb-chart-table:not([data-visible]) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .sb-chart-table {
    overflow-x: auto;
  }

  .sb-chart-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .sb-chart-table caption {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .sb-chart-table th,
  .sb-chart-table td {
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid var(--sb-border);
    text-align: right;
    white-space: nowrap;
  }

  .sb-chart-table th:first-child {
    padding-left: 0;
    text-align: left;
  }

  .sb-chart-table th {
    color: var(--sb-muted-foreground);
    font-weight: 500;
  }

  .sb-chart-table tbody th {
    color: var(--sb-foreground);
    font-weight: 400;
  }
}
</style>
