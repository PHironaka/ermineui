<script setup lang="ts" generic="T extends object">
import { computed, ref, useId, useSlots, watch } from 'vue'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu'
import { SearchInput } from '../input-group'
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
    /** Add a search field above the table. It looks through the text of every column. */
    searchable?: boolean
    searchPlaceholder?: string
    /** Add a "Columns" menu above the table for showing and hiding columns. */
    columnToggle?: boolean
    /** Scroll the rows inside a box this tall (any CSS length), with the headings staying in view. */
    maxHeight?: string
    /**
     * The rows come from a server that has already searched, filtered, sorted and cut them into pages.
     * The table then shows `rows` as they are; watch `sort`, `page`, `search` and `filters` and fetch to match.
     */
    manual?: boolean
    /** With `manual`: how many rows there are across every page. */
    total?: number
    /** Rows are on their way: the ones on show are dimmed and screen readers are told the table is busy. */
    loading?: boolean
    /** What the table lists, for screen readers. */
    label?: string
  }>(),
  { pageSize: 10, searchPlaceholder: 'Search' },
)

defineSlots<{
  /** #cell-<key> replaces the contents of that column's cells. */
  [name: `cell-${string}`]: (props: { row: T; value: unknown }) => unknown
  /** Shown in place of the rows when there are none. */
  empty?: () => unknown
  /** More controls beside the search field, such as a FilterBar. */
  toolbar?: () => unknown
  /** Buttons that act on the ticked rows. Shown above the table while any row is ticked. */
  bulk?: (props: { selected: string[]; clear: () => void }) => unknown
  /** More about one row. Giving this slot adds a button to each row that opens it underneath. */
  expanded?: (props: { row: T }) => unknown
}>()

const slots = useSlots()
const id = useId()

/** The column being sorted by. Unset shows the rows in the order they were given. */
const sort = defineModel<DataTableSort | undefined>('sort')
/** The current page, starting at 1. */
const page = defineModel<number>('page', { default: 1 })
/** Row keys of the ticked rows — kept across pages and sorting. */
const selected = defineModel<string[]>('selected', { default: () => [] })
/** What is typed in the search field. */
const search = defineModel<string>('search', { default: '' })
/** For each column key, the values to keep. A column with no values listed is not filtered. Pairs with FilterBar. */
const filters = defineModel<Record<string, string[]>>('filters', { default: () => ({}) })
/** Keys of the columns that are hidden. */
const hidden = defineModel<string[]>('hidden', { default: () => [] })
/** Row keys of the rows whose details are open. */
const expanded = defineModel<string[]>('expanded', { default: () => [] })

// Fixed locale, so server and browser put rows in the same order. Numbers inside text sort by value: "v2" before "v10".
const collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' })

const cell = (row: T, key: string) => (row as Record<string, unknown>)[key]
const keyOf = (row: T) => String(cell(row, props.rowKey))

function text(row: T, column: DataTableColumn<T>): string {
  const value = cell(row, column.key)
  if (column.format) return column.format(value, row)
  return value === null || value === undefined ? '' : String(value)
}

const shownColumns = computed(() => props.columns.filter((column) => !hidden.value.includes(column.key)))
const expandable = computed(() => !!slots.expanded)
const span = computed(() => shownColumns.value.length + (props.selectable ? 1 : 0) + (expandable.value ? 1 : 0))

/** The rows left after the filters and the search. Hidden columns are still searched: hiding is about space, not about what counts. */
const matching = computed(() => {
  if (props.manual) return props.rows
  const active = Object.entries(filters.value).filter(([, values]) => values.length)
  const query = search.value.trim().toLowerCase()
  if (!active.length && !query) return props.rows
  return props.rows.filter(
    (row) =>
      active.every(([key, values]) => values.includes(String(cell(row, key) ?? ''))) &&
      (!query || props.columns.some((column) => text(row, column).toLowerCase().includes(query))),
  )
})

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
  if (!current || props.manual) return matching.value
  const flip = current.direction === 'desc' ? -1 : 1
  return [...matching.value].sort((a, b) => {
    const order = compare(cell(a, current.key), cell(b, current.key))
    const empty = [cell(a, current.key), cell(b, current.key)].some((value) => value === null || value === undefined || value === '')
    return empty ? order : order * flip
  })
})

const count = computed(() => (props.manual ? (props.total ?? props.rows.length) : matching.value.length))
const pageCount = computed(() => (props.pageSize > 0 ? Math.max(1, Math.ceil(count.value / props.pageSize)) : 1))
const first = computed(() => (props.pageSize > 0 ? (page.value - 1) * props.pageSize : 0))
const visible = computed(() => (props.pageSize > 0 && !props.manual ? sorted.value.slice(first.value, first.value + props.pageSize) : sorted.value))

// If rows are removed (or filtered) while on a late page, step back to the last page that still exists.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

// A new search or filter starts again from the first page of what it found.
watch([search, filters], () => {
  page.value = 1
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

const without = (list: string[], key: string) => list.filter((other) => other !== key)
const toggled = (list: string[], key: string) => (list.includes(key) ? without(list, key) : [...list, key])

function togglePage() {
  const keys = pageKeys.value
  selected.value = allOnPage.value
    ? selected.value.filter((key) => !keys.includes(key))
    : [...selected.value, ...keys.filter((key) => !selected.value.includes(key))]
}

const summary = computed(() => {
  const total = count.value
  if (props.selectable && selected.value.length) return `${selected.value.length} of ${total} selected`
  if (!total) return ''
  return `${first.value + 1}–${first.value + visible.value.length} of ${total}`
})
</script>

<template>
  <div class="er-data-table" :data-sticky="maxHeight ? '' : undefined" :data-loading="loading ? '' : undefined" :aria-busy="loading || undefined" :style="maxHeight ? { '--er-data-table-height': maxHeight } : undefined">
    <div v-if="searchable || columnToggle || $slots.toolbar" class="er-data-table-toolbar">
      <div v-if="searchable" class="er-data-table-search">
        <SearchInput v-model="search" :placeholder="searchPlaceholder" :aria-label="label ? `Search ${label}` : 'Search'" />
      </div>
      <slot name="toolbar" />
      <DropdownMenu v-if="columnToggle">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="er-data-table-columns">Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <!-- The last column on show cannot be hidden: an empty table has no way back. -->
          <DropdownMenuCheckboxItem
            v-for="column in columns.filter((column) => column.hideable !== false)"
            :key="column.key"
            :model-value="!hidden.includes(column.key)"
            :disabled="shownColumns.length === 1 && !hidden.includes(column.key)"
            @update:model-value="hidden = toggled(hidden, column.key)"
          >
            {{ column.label }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div v-if="$slots.bulk && selected.length" class="er-data-table-bulk" role="group" aria-label="Actions for the selected rows">
      <span>{{ selected.length }} selected</span>
      <slot name="bulk" :selected="selected" :clear="() => (selected = [])" />
      <Button variant="ghost" size="sm" @click="selected = []">Clear selection</Button>
    </div>

    <Table>
      <TableCaption v-if="label" class="er-data-table-caption">{{ label }}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead v-if="expandable" class="er-data-table-check"><span class="er-data-table-caption">Details</span></TableHead>
          <TableHead v-if="selectable" class="er-data-table-check">
            <Checkbox :model-value="allOnPage" :indeterminate="someOnPage" aria-label="Select every row on this page" @update:model-value="togglePage" />
          </TableHead>
          <TableHead v-for="column in shownColumns" :key="column.key" :align="column.align" :aria-sort="column.sortable ? ariaSort(column.key) : undefined">
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
        <template v-for="row in visible" :key="keyOf(row)">
          <TableRow :selected="selectable && selected.includes(keyOf(row))">
            <TableCell v-if="expandable" class="er-data-table-check">
              <button
                type="button"
                class="er-data-table-expand"
                :aria-expanded="expanded.includes(keyOf(row))"
                :aria-controls="expanded.includes(keyOf(row)) ? `${id}-${keyOf(row)}` : undefined"
                :aria-label="`Details for row ${keyOf(row)}`"
                @click="expanded = toggled(expanded, keyOf(row))"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
              </button>
            </TableCell>
            <TableCell v-if="selectable" class="er-data-table-check">
              <Checkbox :model-value="selected.includes(keyOf(row))" :aria-label="`Select row ${keyOf(row)}`" @update:model-value="selected = toggled(selected, keyOf(row))" />
            </TableCell>
            <TableCell v-for="column in shownColumns" :key="column.key" :align="column.align">
              <slot :name="`cell-${column.key}`" :row="row" :value="cell(row, column.key)">{{ text(row, column) }}</slot>
            </TableCell>
          </TableRow>
          <TableRow v-if="expandable && expanded.includes(keyOf(row))" :id="`${id}-${keyOf(row)}`" class="er-data-table-detail">
            <TableCell :colspan="span"><slot name="expanded" :row="row" /></TableCell>
          </TableRow>
        </template>
        <TableRow v-if="!visible.length">
          <TableCell class="er-data-table-empty" :colspan="span">
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

  .er-data-table-toolbar,
  .er-data-table-bulk {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .er-data-table-search {
    flex: 1 1 12rem;
    max-width: 20rem;
  }

  .er-data-table-search .er-input-group {
    height: var(--er-control-sm);
  }

  /* Pushed to the far end, whatever else is in the toolbar. */
  .er-data-table-columns {
    margin-left: auto;
  }

  .er-data-table-bulk {
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-muted);
    font-size: 0.8125rem;
  }

  .er-data-table-bulk > span:first-child {
    margin-right: auto;
    font-weight: var(--er-weight-medium);
    font-variant-numeric: tabular-nums;
  }

  .er-data-table-expand {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-data-table-expand:hover {
    background: var(--er-accent);
    color: var(--er-foreground);
  }

  .er-data-table-expand:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-data-table-expand svg {
    width: 1rem;
    height: 1rem;
    transition: rotate var(--er-duration);
  }

  .er-data-table-expand[aria-expanded='true'] svg {
    rotate: 90deg;
  }

  .er-data-table .er-data-table-detail,
  .er-data-table .er-table-body .er-data-table-detail:hover {
    background: color-mix(in oklab, var(--er-muted) 50%, transparent);
  }

  /* The box scrolls and the headings stay put. They need a solid colour of their own to hide the rows passing
     underneath: set --er-data-table-surface when the table sits on something other than the page background. */
  .er-data-table[data-sticky] > .er-table-wrap {
    max-height: var(--er-data-table-height);
    overflow-y: auto;
  }

  .er-data-table[data-sticky] .er-table-head {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--er-data-table-surface, var(--er-background));
    box-shadow: inset 0 -1px 0 var(--er-border);
  }

  .er-data-table[data-loading] .er-table-body {
    opacity: 0.5;
    transition: opacity var(--er-duration);
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
