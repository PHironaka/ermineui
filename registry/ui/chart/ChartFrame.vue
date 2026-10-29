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
  <figure class="er-chart">
    <div class="er-chart-header">
      <ul v-if="legend?.length" class="er-chart-legend">
        <li v-for="(item, index) in legend" :key="index">
          <button
            type="button"
            class="er-chart-legend-item"
            :aria-pressed="!item.hidden"
            :title="item.hidden ? `Show ${item.name}` : `Hide ${item.name}`"
            @click="$emit('toggle', index)"
          >
            <span class="er-chart-key" :data-shape="legendShape" :style="{ background: item.color }" />
            {{ item.name }}
          </button>
        </li>
      </ul>
      <button type="button" class="er-chart-toggle" :aria-pressed="showTable" @click="showTable = !showTable">
        {{ showTable ? 'Show chart' : 'Show table' }}
      </button>
    </div>

    <div v-show="!showTable" class="er-chart-body"><slot /></div>

    <div role="status" class="er-chart-announcer">{{ announcement }}</div>

    <!-- Always in the page: screen readers get the numbers as a table even while the chart is showing. -->
    <div class="er-chart-table" :data-visible="showTable ? '' : undefined">
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
  .er-chart {
    /* The colour behind the chart. Gaps between marks and rings around dots are drawn in it. */
    --er-chart-surface: var(--er-background);
    position: relative;
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
    margin: 0;
    font-size: 0.75rem;
  }

  .er-card .er-chart {
    --er-chart-surface: var(--er-card);
  }

  .er-chart-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .er-chart-body {
    min-width: 0;
  }

  .er-chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-chart-legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    cursor: pointer;
  }

  .er-chart-legend-item:hover {
    color: var(--er-foreground);
  }

  .er-chart-legend-item[aria-pressed='false'] {
    text-decoration: line-through;
    opacity: 0.55;
  }

  /* The colour sits beside the name; the name itself stays in the text colour so it is always readable. */
  .er-chart-key {
    flex-shrink: 0;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 2px;
  }

  .er-chart-key[data-shape='line'] {
    width: 0.75rem;
    height: 2px;
    border-radius: 1px;
  }

  .er-chart-key[data-shape='dot'] {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .er-chart-legend-item[aria-pressed='false'] .er-chart-key {
    background: var(--er-muted-foreground) !important;
  }

  .er-chart-toggle {
    flex-shrink: 0;
    margin-left: auto;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .er-chart-toggle:hover {
    color: var(--er-foreground);
  }

  .er-chart-toggle:focus-visible,
  .er-chart-legend-item:focus-visible,
  .er-chart-plot:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-chart-plot {
    position: relative;
    border-radius: var(--er-radius-sm);
    touch-action: pan-y;
  }

  .er-chart-plot svg {
    display: block;
    overflow: visible;
  }

  .er-chart-empty {
    display: grid;
    place-items: center;
    height: 100%;
    margin: 0;
    color: var(--er-muted-foreground);
  }

  .er-chart-grid line {
    stroke: var(--er-border);
    stroke-width: 1;
  }

  .er-chart-baseline {
    stroke: var(--er-input);
    stroke-width: 1;
  }

  .er-chart-axis text,
  .er-chart-ends text {
    fill: var(--er-muted-foreground);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .er-chart-ends text {
    fill: var(--er-foreground);
  }

  .er-chart-line {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .er-chart-area {
    opacity: 0.1;
  }

  /* A partly drawn line: the way still to come. */
  .er-chart-line[data-part='ahead'] {
    stroke-width: 1.5;
    stroke-dasharray: 0 5;
    opacity: 0.55;
  }

  .er-chart-point {
    fill: var(--er-chart-surface);
    stroke-width: 1.5;
    transition: fill 0.15s ease;
  }

  .er-chart-dot {
    stroke: var(--er-chart-surface);
    stroke-width: 2;
  }

  .er-chart-crosshair {
    stroke: var(--er-input);
    stroke-width: 1;
  }

  .er-chart-band {
    fill: var(--er-accent);
    opacity: 0.6;
  }

  .er-chart-tooltip {
    position: absolute;
    top: 0;
    z-index: 1;
    display: grid;
    gap: 0.25rem;
    min-width: 8rem;
    padding: 0.5rem 0.625rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    box-shadow: var(--er-shadow-md);
    white-space: nowrap;
    pointer-events: none;
  }

  .er-chart-tooltip-title {
    color: var(--er-muted-foreground);
  }

  .er-chart-tooltip-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--er-muted-foreground);
  }

  /* The number is what the reader came for, so it carries the weight and the name stays quiet. */
  .er-chart-tooltip-row strong {
    margin-left: auto;
    padding-left: 0.75rem;
    color: var(--er-popover-foreground);
    font-weight: var(--er-weight-semibold);
    font-variant-numeric: tabular-nums;
  }

  .er-chart-announcer,
  .er-chart-table:not([data-visible]) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-chart-table {
    overflow-x: auto;
  }

  .er-chart-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .er-chart-table caption {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .er-chart-table th,
  .er-chart-table td {
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid var(--er-border);
    text-align: right;
    white-space: nowrap;
  }

  .er-chart-table th:first-child {
    padding-left: 0;
    text-align: left;
  }

  .er-chart-table th {
    color: var(--er-muted-foreground);
    font-weight: var(--er-weight-medium);
  }

  .er-chart-table tbody th {
    color: var(--er-foreground);
    font-weight: 400;
  }
}
</style>
