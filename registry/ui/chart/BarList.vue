<script setup lang="ts">
import { computed } from 'vue'
import { toNumber } from './scale'

const props = withDefaults(
  defineProps<{
    /** One object per bar. */
    data: readonly object[]
    /** Property of each row that names its bar. */
    name: string
    /** Property of each row that holds its number. */
    value: string
    /** What the list shows, for screen readers. */
    label: string
    /** Put the biggest first. Turn off when the rows already have a meaningful order. */
    sort?: boolean
    /** Show only this many rows. */
    limit?: number
    /** How values are written. */
    format?: (value: number) => string
  }>(),
  { sort: true },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const formatValue = (value: number) => (props.format ?? fullNumber.format)(value)

const rows = computed(() => {
  let list = props.data.flatMap((row) => {
    const record = row as Record<string, unknown>
    const value = toNumber(record[props.value])
    return value === null ? [] : [{ name: String(record[props.name] ?? ''), value }]
  })
  if (props.sort) list = [...list].sort((a, b) => b.value - a.value)
  if (props.limit !== undefined) list = list.slice(0, props.limit)
  const max = Math.max(0, ...list.map((row) => row.value))
  return list.map((row) => ({ ...row, share: max > 0 ? Math.max(0, row.value) / max : 0 }))
})
</script>

<template>
  <!-- A plain list: every bar has its name and its number written beside it, so nothing needs a tooltip or a legend. -->
  <ul class="sb-bar-list" :aria-label="label">
    <li v-for="row in rows" :key="row.name">
      <span class="sb-bar-list-name">{{ row.name }}</span>
      <span class="sb-bar-list-value">{{ formatValue(row.value) }}</span>
      <span class="sb-bar-list-track" aria-hidden="true"><span :style="{ width: `${row.share * 100}%` }" /></span>
    </li>
  </ul>
</template>

<style>
@layer components {
  .sb-bar-list {
    display: grid;
    gap: 0.625rem;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    font-size: 0.8125rem;
    list-style: none;
  }

  .sb-bar-list li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.25rem 1rem;
    min-width: 0;
  }

  .sb-bar-list-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sb-bar-list-value {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .sb-bar-list-track {
    grid-column: 1 / -1;
    height: 0.375rem;
  }

  /* One series, so one colour for every bar: length carries the value, not shade. */
  .sb-bar-list-track span {
    display: block;
    min-width: 2px;
    height: 100%;
    border-radius: 0 4px 4px 0;
    background: var(--sb-chart-1);
  }
}
</style>
