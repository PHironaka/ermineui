<script setup lang="ts">
import { computed, ref } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { toNumber } from './scale'

const props = withDefaults(
  defineProps<{
    /** Names of the rows, top to bottom. */
    rows: readonly string[]
    /** Names of the columns, left to right. */
    columns: readonly string[]
    /** One array per row, one number per column. Leave a cell null where there is no data. */
    values: ReadonlyArray<ReadonlyArray<number | null | undefined>>
    /** What the heatmap shows, for screen readers and as the table's caption. */
    label: string
    /** Heading for the corner of the table view, naming what the rows are. */
    rowLabel?: string
    /** How values are written in the readout and the table. */
    format?: (value: number) => string
  }>(),
  { rowLabel: '' },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const formatValue = (value: number | null) => (value === null ? '–' : (props.format ?? fullNumber.format)(value))

/** Five steps of one colour, light to dark. Few enough that neighbouring steps are easy to tell apart. */
const STEPS = [14, 32, 52, 74, 100]

/** The cell under the pointer or chosen with the arrow keys. */
const active = ref<{ row: number; column: number }>()
/** Read out by screen readers. Only set from the keyboard, so pointing with a mouse stays quiet. */
const announcement = ref('')

const cells = computed(() => props.rows.map((_row, row) => props.columns.map((_column, column) => toNumber(props.values[row]?.[column]))))
const extent = computed(() => {
  const all = cells.value.flat().filter((value): value is number => value !== null)
  return all.length ? { min: Math.min(...all), max: Math.max(...all) } : { min: 0, max: 0 }
})

function step(value: number | null): number | undefined {
  if (value === null) return undefined
  const { min, max } = extent.value
  return max === min ? STEPS.length - 1 : Math.min(STEPS.length - 1, Math.floor(((value - min) / (max - min)) * STEPS.length))
}
const fill = (index: number) => `color-mix(in oklab, var(--er-chart-1) ${STEPS[index]}%, var(--er-chart-surface))`

const activeCell = computed(() => {
  const at = active.value
  if (!at) return undefined
  return { row: props.rows[at.row] ?? '', column: props.columns[at.column] ?? '', value: cells.value[at.row]?.[at.column] ?? null }
})
/** The readout sits over the active cell, as a share of the grid, so it needs no measuring. */
const tooltipStyle = computed(() => {
  const at = active.value
  if (!at) return undefined
  return {
    left: `${((at.column + 0.5) / props.columns.length) * 100}%`,
    top: `${(at.row / props.rows.length) * 100}%`,
    transform: `translate(${at.column > props.columns.length / 2 ? '-90%' : '-10%'}, calc(-100% - 6px))`,
  }
})

const tableRows = computed(() => props.rows.map((name, row) => [name, ...cells.value[row]!.map(formatValue)]))

function onKeydown(event: KeyboardEvent) {
  const lastRow = props.rows.length - 1
  const lastColumn = props.columns.length - 1
  if (lastRow < 0 || lastColumn < 0) return
  const at = active.value ?? { row: 0, column: 0 }
  let next = at
  if (!active.value && event.key.startsWith('Arrow')) next = at
  else if (event.key === 'ArrowRight') next = { ...at, column: Math.min(lastColumn, at.column + 1) }
  else if (event.key === 'ArrowLeft') next = { ...at, column: Math.max(0, at.column - 1) }
  else if (event.key === 'ArrowDown') next = { ...at, row: Math.min(lastRow, at.row + 1) }
  else if (event.key === 'ArrowUp') next = { ...at, row: Math.max(0, at.row - 1) }
  else if (event.key === 'Home') next = { ...at, column: 0 }
  else if (event.key === 'End') next = { ...at, column: lastColumn }
  else if (event.key === 'Escape' && active.value) {
    active.value = undefined
    announcement.value = ''
    return
  } else return

  event.preventDefault()
  active.value = next
  announcement.value = `${props.rows[next.row]}, ${props.columns[next.column]}: ${formatValue(cells.value[next.row]?.[next.column] ?? null)}`
}
</script>

<template>
  <ChartFrame :label="label" :columns="[rowLabel, ...columns]" :rows="tableRows" :announcement="announcement" data-type="heatmap">
    <div class="er-heatmap">
      <div class="er-heatmap-columns" aria-hidden="true" :style="{ '--er-heatmap-columns': columns.length }">
        <span />
        <span v-for="column in columns" :key="column">{{ column }}</span>
      </div>
      <div class="er-heatmap-body">
        <div class="er-heatmap-rows" aria-hidden="true">
          <span v-for="row in rows" :key="row">{{ row }}</span>
        </div>
        <div
          class="er-chart-plot er-heatmap-grid"
          role="img"
          aria-roledescription="chart"
          tabindex="0"
          :aria-label="`${label}. Use the arrow keys to read values.`"
          :style="{ '--er-heatmap-columns': columns.length }"
          @pointerleave="active = undefined"
          @blur="active = undefined"
          @keydown="onKeydown"
        >
          <template v-for="(row, rowIndex) in cells" :key="rowIndex">
            <!-- The gap between cells is the page showing through, not a border drawn around them. -->
            <span
              v-for="(value, columnIndex) in row"
              :key="columnIndex"
              class="er-heatmap-cell"
              :data-empty="value === null ? '' : undefined"
              :data-active="active?.row === rowIndex && active.column === columnIndex ? '' : undefined"
              :style="{ background: step(value) === undefined ? undefined : fill(step(value)!) }"
              @pointermove="active = { row: rowIndex, column: columnIndex }"
              @pointerdown="active = { row: rowIndex, column: columnIndex }"
            />
          </template>
          <div v-if="activeCell" class="er-chart-tooltip" :style="tooltipStyle">
            <div class="er-chart-tooltip-title">{{ activeCell.row }} · {{ activeCell.column }}</div>
            <div class="er-chart-tooltip-row"><strong style="margin-left: 0; padding-left: 0">{{ formatValue(activeCell.value) }}</strong></div>
          </div>
        </div>
      </div>
      <!-- The key to the colours: which end is low and which is high, with the actual numbers. -->
      <div class="er-heatmap-scale">
        <span>{{ formatValue(extent.min) }}</span>
        <span v-for="(_step, index) in STEPS" :key="index" class="er-heatmap-swatch" :style="{ background: fill(index) }" />
        <span>{{ formatValue(extent.max) }}</span>
      </div>
    </div>
  </ChartFrame>
</template>

<style>
@layer components {
  .er-heatmap {
    display: grid;
    gap: 0.375rem;
    min-width: 0;
    color: var(--er-muted-foreground);
    font-variant-numeric: tabular-nums;
  }

  .er-heatmap-columns {
    display: grid;
    grid-template-columns: var(--er-heatmap-gutter, 2.5rem) repeat(var(--er-heatmap-columns), minmax(0, 1fr));
    gap: 2px;
    text-align: center;
  }

  .er-heatmap-columns span {
    overflow: hidden;
    white-space: nowrap;
  }

  .er-heatmap-body {
    display: grid;
    grid-template-columns: var(--er-heatmap-gutter, 2.5rem) minmax(0, 1fr);
    gap: 2px;
  }

  .er-heatmap-rows {
    display: grid;
    gap: 2px;
    align-items: center;
  }

  .er-heatmap-rows span {
    overflow: hidden;
    white-space: nowrap;
  }

  .er-heatmap-grid {
    display: grid;
    grid-template-columns: repeat(var(--er-heatmap-columns), minmax(0, 1fr));
    gap: 2px;
  }

  .er-heatmap-cell {
    min-height: 1.5rem;
    border-radius: 3px;
  }

  /* No data is not the same as a low value, so it gets an outline in place of a fill. */
  .er-heatmap-cell[data-empty] {
    box-shadow: inset 0 0 0 1px var(--er-border);
  }

  .er-heatmap-cell[data-active] {
    outline: 2px solid var(--er-foreground);
    outline-offset: 1px;
  }

  .er-heatmap-scale {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    margin-top: 0.25rem;
  }

  .er-heatmap-scale span:first-child {
    margin-right: 0.375rem;
  }

  .er-heatmap-scale span:last-child {
    margin-left: 0.375rem;
  }

  .er-heatmap-swatch {
    width: 1rem;
    height: 0.625rem;
    border-radius: 2px;
  }
}
</style>
