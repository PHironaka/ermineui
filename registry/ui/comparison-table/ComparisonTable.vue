<script setup lang="ts">
import { computed } from 'vue'
import type { ComparisonColumn, ComparisonGroup, ComparisonRow } from './types'

const props = withDefaults(
  defineProps<{
    /** What is being compared: one column each. */
    columns: readonly ComparisonColumn[]
    /** One row per property. Pass groups instead to put headings between sets of rows. */
    rows: ReadonlyArray<ComparisonRow | ComparisonGroup>
    /** Accessible name of the table, read out as its caption. */
    caption: string
    /** What the first column holds, for screen readers. */
    rowHeading?: string
    yesLabel?: string
    noLabel?: string
  }>(),
  { rowHeading: 'Feature', yesLabel: 'Yes', noLabel: 'No' },
)

const isGroup = (item: ComparisonRow | ComparisonGroup): item is ComparisonGroup => 'rows' in item

/** Rows on their own become one group with no heading, so the template only deals with groups. */
const groups = computed(() => {
  const result: Array<{ title?: string; rows: readonly ComparisonRow[] }> = []
  let loose: ComparisonRow[] = []
  for (const item of props.rows) {
    if (!isGroup(item)) {
      loose.push(item)
      continue
    }
    if (loose.length) result.push({ rows: loose })
    loose = []
    result.push(item)
  }
  if (loose.length) result.push({ rows: loose })
  return result
})
</script>

<template>
  <!-- A table wider than its space scrolls here rather than the page; it can be focused so the keyboard can scroll it too. -->
  <div class="er-comparison-table" role="region" :aria-label="caption" tabindex="0">
    <table>
      <caption class="er-comparison-table-hidden">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col"><span class="er-comparison-table-hidden">{{ rowHeading }}</span></th>
          <th v-for="column in columns" :key="column.key" scope="col" :data-highlight="column.highlight ? '' : undefined">
            <!-- The top of a column: replace it to add a picture or a badge. -->
            <slot name="header" :column="column">
              <span class="er-comparison-table-title">{{ column.title }}</span>
              <span v-if="column.subtitle" class="er-comparison-table-subtitle">{{ column.subtitle }}</span>
            </slot>
          </th>
        </tr>
      </thead>
      <tbody v-for="(group, index) in groups" :key="group.title ?? index">
        <tr v-if="group.title" class="er-comparison-table-group">
          <th :colspan="columns.length + 1" scope="colgroup">{{ group.title }}</th>
        </tr>
        <tr v-for="row in group.rows" :key="row.label">
          <th scope="row">
            {{ row.label }}
            <span v-if="row.hint" class="er-comparison-table-subtitle">{{ row.hint }}</span>
          </th>
          <td v-for="column in columns" :key="column.key" :data-highlight="column.highlight ? '' : undefined">
            <!-- One cell: replace it to show a value your own way. -->
            <slot name="cell" :column="column" :row="row" :value="row.values[column.key]">
              <template v-if="row.values[column.key] === true">
                <svg class="er-comparison-table-yes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                <span class="er-comparison-table-hidden">{{ yesLabel }}</span>
              </template>
              <template v-else-if="row.values[column.key] === false">
                <svg class="er-comparison-table-no" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 12h10" /></svg>
                <span class="er-comparison-table-hidden">{{ noLabel }}</span>
              </template>
              <template v-else>{{ row.values[column.key] }}</template>
            </slot>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="$slots.footer">
        <tr>
          <td />
          <!-- Under each column: usually a button to choose it. -->
          <td v-for="column in columns" :key="column.key" :data-highlight="column.highlight ? '' : undefined"><slot name="footer" :column="column" /></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style>
@layer components {
  .er-comparison-table {
    width: 100%;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    overflow-x: auto;
    /* Positioned, so the text hidden for screen readers inside is clipped with the rest; otherwise it would widen the page from cells scrolled out of view. */
    position: relative;
  }

  .er-comparison-table:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-comparison-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-comparison-table th,
  .er-comparison-table td {
    min-width: 7rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--er-border);
    text-align: center;
    vertical-align: middle;
  }

  .er-comparison-table tfoot td,
  .er-comparison-table tbody:last-of-type:not(:has(+ tfoot)) tr:last-child > * {
    border-bottom: 0;
  }

  .er-comparison-table thead th {
    vertical-align: bottom;
  }

  /* The names of the rows stay put while the columns scroll under them. */
  .er-comparison-table tr > :first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    min-width: 9rem;
    background: var(--er-background);
    font-weight: var(--er-weight-medium);
    text-align: left;
  }

  .er-comparison-table [data-highlight] {
    background: color-mix(in oklab, var(--er-primary) 5%, transparent);
  }

  .er-comparison-table-group th:first-child {
    background: var(--er-muted);
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    font-weight: var(--er-weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .er-comparison-table-title {
    display: block;
    font-weight: var(--er-weight-semibold);
  }

  .er-comparison-table-subtitle {
    display: block;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-weight: 400;
  }

  .er-comparison-table svg {
    display: inline-block;
    width: 1.125rem;
    height: 1.125rem;
    vertical-align: middle;
  }

  .er-comparison-table-yes {
    color: var(--er-success);
  }

  .er-comparison-table-no {
    color: var(--er-muted-foreground);
  }

  .er-comparison-table-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
