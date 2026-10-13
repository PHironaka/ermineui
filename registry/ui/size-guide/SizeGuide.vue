<script setup lang="ts">
import { SegmentedControl, SegmentedControlItem } from '../segmented-control'
import { formatMeasurement, type SizeGuideMeasure, type SizeGuideRow, type SizeUnit } from './units'

withDefaults(
  defineProps<{
    /** What is measured, one column each: chest, waist, hips. */
    measures: readonly SizeGuideMeasure[]
    /** One row per size, with measurements in centimetres. */
    sizes: readonly SizeGuideRow[]
    /** Accessible name of the table, read out as its caption. */
    caption?: string
    /** A size to mark out, e.g. the one chosen on the product page. */
    selected?: string
    /** What the first column is called. */
    sizeLabel?: string
  }>(),
  { caption: 'Size guide', sizeLabel: 'Size' },
)

/** The unit the measurements are shown in. */
const unit = defineModel<SizeUnit>('unit', { default: 'cm' })
</script>

<template>
  <div class="er-size-guide">
    <div class="er-size-guide-top">
      <!-- A line of advice: how to measure, or how the cut runs. -->
      <p class="er-size-guide-note"><slot>Measurements are of the body, not the garment.</slot></p>
      <SegmentedControl v-model="unit" label="Units" size="sm">
        <SegmentedControlItem value="cm">cm</SegmentedControlItem>
        <SegmentedControlItem value="in">in</SegmentedControlItem>
      </SegmentedControl>
    </div>
    <div class="er-size-guide-scroll" role="region" :aria-label="caption" tabindex="0">
      <table>
        <caption class="er-size-guide-hidden">{{ caption }}, in {{ unit === 'cm' ? 'centimetres' : 'inches' }}</caption>
        <thead>
          <tr>
            <th scope="col">{{ sizeLabel }}</th>
            <th v-for="measure in measures" :key="measure.key" scope="col">{{ measure.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sizes" :key="row.size" :data-selected="row.size === selected ? '' : undefined">
            <th scope="row">{{ row.size }}<span v-if="row.size === selected" class="er-size-guide-hidden"> (selected)</span></th>
            <td v-for="measure in measures" :key="measure.key">{{ formatMeasurement(row.measurements[measure.key], unit) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-size-guide {
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
  }

  .er-size-guide-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
  }

  .er-size-guide-note {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .er-size-guide-scroll {
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    overflow-x: auto;
    /* Positioned, so the text hidden for screen readers inside is clipped with the rest; otherwise it would widen the page from cells scrolled out of view. */
    position: relative;
  }

  .er-size-guide-scroll:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-size-guide table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
  }

  .er-size-guide th,
  .er-size-guide td {
    padding: 0.5rem 0.875rem;
    border-bottom: 1px solid var(--er-border);
    text-align: right;
    white-space: nowrap;
  }

  .er-size-guide tr > :first-child {
    text-align: left;
  }

  .er-size-guide tbody tr:last-child > * {
    border-bottom: 0;
  }

  .er-size-guide thead th {
    background: var(--er-muted);
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .er-size-guide tbody th {
    font-weight: 600;
  }

  /* The chosen size: tinted, with a bar down its leading edge so colour is not the only mark. */
  .er-size-guide tr[data-selected] > * {
    background: color-mix(in oklab, var(--er-primary) 7%, transparent);
  }

  .er-size-guide tr[data-selected] > :first-child {
    box-shadow: inset 3px 0 0 var(--er-primary);
  }

  .er-size-guide-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
