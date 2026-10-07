<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from 'vue'
import { Checkbox } from '../checkbox'
import { Pagination } from '../pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../table'
import type { DataTableColumn, DataTableSort } from './types'

const props = withDefaults(
  defineProps<{
    rows: readonly T[]
    columns: ReadonlyArray<DataTableColumn<T>>
    /** Property that is different for every row, such as an id. Selection is remembered by it. */
    rowKey: string
    /** Rows per page. Pass 0 to show every row on one page. */
    pageSize?: number
    /** Add a checkbox to each row, and one in the heading for the whole page. */
    selectable?: boolean
    /** What the table lists, for screen readers. */
    label?: string
  }>(),
  { pageSize: 10 },
)

defineSlots<{
  /** #cell-<key> replaces the contents of that column's cells. */
  [name: `cell-${string}`]: (props: { row: T; value: unknown }) => unknown
  /** Shown in place of the rows when there are none. */
  empty?: () => unknown
}>()

/** The column being sorted by. Unset shows the rows in the order they were given. */
const sort = defineModel<DataTableSort | undefined>('sort')
/** The current page, starting at 1. */
const page = defineModel<number>('page', { default: 1 })
/** Row keys of the ticked rows — kept across pages and sorting. */
const selected = defineModel<string[]>('selected', { default: () => [] })

// Fixed locale, so server and browser put rows in the same order. Numbers inside text sort by value: "v2" before "v10".
const collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' })

const cell = (row: T, key: string) => (row as Record<string, unknown>)[key]
const keyOf = (row: T) => String(cell(row, props.rowKey))

function compare(a: unknown, b: unknown): number {
  // Empty cells go last whichever way the column is sorted.
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return collator.compare(String(a), String(b))
}

const sorted = computed(() => {
  const current = sort.value
  if (!current) return props.rows
  const flip = current.direction === 'desc' ? -1 : 1
  return [...props.rows].sort((a, b) => {
    const order = compare(cell(a, current.key), cell(b, current.key))
    const empty = [cell(a, current.key), cell(b, current.key)].some((value) => value === null || value === undefined || value === '')
    return empty ? order : order * flip
  })
})

const pageCount = computed(() => (props.pageSize > 0 ? Math.max(1, Math.ceil(props.rows.length / props.pageSize)) : 1))
const first = computed(() => (props.pageSize > 0 ? (page.value - 1) * props.pageSize : 0))
const visible = computed(() => (props.pageSize > 0 ? sorted.value.slice(first.value, first.value + props.pageSize) : sorted.value))

// If rows are removed (or filtered) while on a late page, step back to the last page that still exists.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

/** Said aloud after a heading is pressed: the rows move, but nothing else would tell a screen reader user so. */
const sortMessage = ref('')

/** Pressing a heading goes ascending, then descending, then back to the original order. */
function toggleSort(key: string) {
  const current = sort.value
  const name = props.columns.find((column) => column.key === key)?.label ?? key
  if (current?.key !== key) sort.value = { key, direction: 'asc' }
  else if (current.direction === 'asc') sort.value = { key, direction: 'desc' }
  else sort.value = undefined
  const next = current?.key !== key ? 'ascending' : current.direction === 'asc' ? 'descending' : undefined
  sortMessage.value = next ? `Sorted by ${name}, ${next}.` : 'Sorting removed.'
  page.value = 1
}

function ariaSort(key: string) {
  if (sort.value?.key !== key) return 'none'
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

const pageKeys = computed(() => visible.value.map(keyOf))
const allOnPage = computed(() => pageKeys.value.length > 0 && pageKeys.value.every((key) => selected.value.includes(key)))
const someOnPage = computed(() => !allOnPage.value && pageKeys.value.some((key) => selected.value.includes(key)))

function toggleRow(key: string) {
  selected.value = selected.value.includes(key) ? selected.value.filter((other) => other !== key) : [...selected.value, key]
}

function togglePage() {
  const keys = pageKeys.value
  selected.value = allOnPage.value
    ? selected.value.filter((key) => !keys.includes(key))
    : [...selected.value, ...keys.filter((key) => !selected.value.includes(key))]
}

function text(row: T, column: DataTableColumn<T>): string {
  const value = cell(row, column.key)
  if (column.format) return column.format(value, row)
  return value === null || value === undefined ? '' : String(value)
}

const summary = computed(() => {
  const total = props.rows.length
  if (props.selectable && selected.value.length) return `${selected.value.length} of ${total} selected`
  if (!total) return ''
  return `${first.value + 1}–${first.value + visible.value.length} of ${total}`
})
</script>

<template>
  <div class="er-data-table">
    <Table>
      <TableCaption v-if="label" class="er-data-table-caption">{{ label }}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead v-if="selectable" class="er-data-table-check">
            <Checkbox :model-value="allOnPage" :indeterminate="someOnPage" aria-label="Select every row on this page" @update:model-value="togglePage" />
          </TableHead>
          <TableHead v-for="column in columns" :key="column.key" :align="column.align" :aria-sort="column.sortable ? ariaSort(column.key) : undefined">
            <button v-if="column.sortable" type="button" class="er-data-table-sort" :data-direction="sort?.key === column.key ? sort.direction : undefined" @click="toggleSort(column.key)">
              {{ column.label }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path class="er-data-table-up" d="m7 9 5-5 5 5" />
                <path class="er-data-table-down" d="m7 15 5 5 5-5" />
              </svg>
            </button>
            <template v-else>{{ column.label }}</template>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in visible" :key="keyOf(row)" :selected="selectable && selected.includes(keyOf(row))">
          <TableCell v-if="selectable" class="er-data-table-check">
            <Checkbox :model-value="selected.includes(keyOf(row))" :aria-label="`Select row ${keyOf(row)}`" @update:model-value="toggleRow(keyOf(row))" />
          </TableCell>
          <TableCell v-for="column in columns" :key="column.key" :align="column.align">
            <slot :name="`cell-${column.key}`" :row="row" :value="cell(row, column.key)">{{ text(row, column) }}</slot>
          </TableCell>
        </TableRow>
        <TableRow v-if="!visible.length">
          <TableCell class="er-data-table-empty" :colspan="columns.length + (selectable ? 1 : 0)">
            <slot name="empty">No results.</slot>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="er-data-table-footer">
      <!-- Announced when it changes, so paging and ticking rows are confirmed aloud. -->
      <p role="status">{{ summary }}</p>
      <p class="er-data-table-caption" role="status">{{ sortMessage }}</p>
      <Pagination v-if="pageCount > 1" v-model="page" :page-count="pageCount" :label="label ? `${label} pages` : undefined" />
    </div>
  </div>
</template>

<style>
@layer components {
  .er-data-table {
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
  }

  .er-data-table > .er-table-wrap {
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
  }

  /* The caption is for screen readers; the page's own heading names the table for everyone else. */
  .er-data-table-caption {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .er-data-table-check {
    width: 2.25rem;
    padding-right: 0;
  }

  .er-data-table-check .er-checkbox {
    display: grid;
  }

  .er-data-table-sort {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    height: 1.75rem;
    margin: 0 -0.5rem;
    padding: 0 0.5rem;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-data-table-sort:hover,
  .er-data-table-sort[data-direction] {
    color: var(--er-foreground);
  }

  .er-data-table-sort:hover {
    background: var(--er-accent);
  }

  .er-data-table-sort:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-data-table-sort svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* Both arrows are faint until the column is sorted; then the one in play goes solid. */
  .er-data-table-sort path {
    opacity: 0.4;
  }

  .er-data-table-sort[data-direction='asc'] .er-data-table-up,
  .er-data-table-sort[data-direction='desc'] .er-data-table-down {
    opacity: 1;
  }

  .er-data-table-sort[data-direction='asc'] .er-data-table-down,
  .er-data-table-sort[data-direction='desc'] .er-data-table-up {
    opacity: 0.15;
  }

  .er-data-table-empty {
    height: 6rem;
    color: var(--er-muted-foreground);
    text-align: center;
  }

  .er-data-table-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    min-height: 2rem;
  }

  .er-data-table-footer p {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }
}
</style>
