<script setup lang="ts">
import { computed, ref } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { arcPath, toNumber } from './scale'

const props = withDefaults(
  defineProps<{
    /** One object per slice. Rows with no value, zero or a negative value are left out. */
    data: readonly object[]
    /** Property of each row that names its slice. */
    name: string
    /** Property of each row that holds its number. */
    value: string
    /** What the chart shows, for screen readers and as the table's caption. */
    label: string
    /** Headings for the table view. Default to the property names. */
    nameLabel?: string
    valueLabel?: string
    /** Draw a full pie instead of a ring. */
    pie?: boolean
    /** Diameter in px. */
    size?: number
    /** Most slices to draw. Past this, the last rows are added together as "Other". */
    maxSlices?: number
    /** Written under the total in the middle of the ring. */
    totalLabel?: string
    /** How values are written. */
    format?: (value: number) => string
  }>(),
  { size: 180, maxSlices: 6, totalLabel: 'Total' },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })
const formatValue = (value: number) => (props.format ?? fullNumber.format)(value)

/** Index of the slice under the pointer or chosen with the arrow keys. */
const active = ref<number | null>(null)
/** Read out by screen readers. Only set from the keyboard, so pointing with a mouse stays quiet. */
const announcement = ref('')

const slices = computed(() => {
  const rows = props.data.flatMap((row) => {
    const record = row as Record<string, unknown>
    const value = toNumber(record[props.value])
    return value !== null && value > 0 ? [{ name: String(record[props.name] ?? ''), value }] : []
  })
  // Many thin slices cannot be compared by eye, so the tail is folded into one grey "Other".
  const keep = rows.length > props.maxSlices ? props.maxSlices - 1 : rows.length
  const shown = rows.slice(0, keep).map((row, index) => ({ ...row, color: `var(--er-chart-${index + 1})` }))
  const rest = rows.slice(keep).reduce((sum, row) => sum + row.value, 0)
  if (rest > 0) shown.push({ name: 'Other', value: rest, color: 'var(--er-muted-foreground)' })

  const total = shown.reduce((sum, slice) => sum + slice.value, 0)
  const radius = props.size / 2
  const inner = props.pie ? 0 : radius * 0.62
  let angle = 0
  return shown.map((slice) => {
    const from = angle
    angle += (slice.value / total) * Math.PI * 2
    const middle = (from + angle) / 2
    const reach = (radius + inner) / 2
    return {
      ...slice,
      share: slice.value / total,
      d: arcPath(radius, radius, radius, inner, from, angle),
      // Where the readout points: the middle of the slice.
      x: radius + reach * Math.sin(middle),
      y: radius - reach * Math.cos(middle),
    }
  })
})

const total = computed(() => slices.value.reduce((sum, slice) => sum + slice.value, 0))
const activeSlice = computed(() => (active.value === null ? undefined : slices.value[active.value]))
const tableRows = computed(() => slices.value.map((slice) => [slice.name, formatValue(slice.value), percent.format(slice.share)]))

function onKeydown(event: KeyboardEvent) {
  const count = slices.value.length
  if (!count) return
  let next: number
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = active.value === null ? 0 : (active.value + 1) % count
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = active.value === null ? count - 1 : (active.value - 1 + count) % count
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = count - 1
  else if (event.key === 'Escape' && active.value !== null) {
    active.value = null
    announcement.value = ''
    return
  } else return

  event.preventDefault()
  active.value = next
  const slice = slices.value[next]!
  announcement.value = `${slice.name}: ${formatValue(slice.value)}, ${percent.format(slice.share)}`
}
</script>

<template>
  <ChartFrame
    :label="label"
    :columns="[nameLabel ?? name, valueLabel ?? value, 'Share']"
    :rows="tableRows"
    :announcement="announcement"
    :data-type="pie ? 'pie' : 'donut'"
  >
    <div class="er-chart-donut">
      <div
        class="er-chart-plot"
        role="img"
        aria-roledescription="chart"
        tabindex="0"
        :aria-label="`${label}. Use the arrow keys to read values.`"
        :style="{ width: `${size}px`, height: `${size}px` }"
        @pointerleave="active = null"
        @blur="active = null"
        @keydown="onKeydown"
      >
        <p v-if="!slices.length" class="er-chart-empty"><slot name="empty">No data</slot></p>
        <svg v-else :width="size" :height="size" aria-hidden="true">
          <!-- The outline is drawn in the surface colour: it reads as a gap between slices, not a border. -->
          <path
            v-for="(slice, index) in slices"
            :key="index"
            class="er-chart-slice"
            :d="slice.d"
            :fill="slice.color"
            :data-dimmed="active !== null && active !== index ? '' : undefined"
            @pointermove="active = index"
            @pointerdown="active = index"
          />
        </svg>
        <div v-if="!pie && slices.length" class="er-chart-donut-center">
          <strong>{{ formatValue(total) }}</strong>
          <span>{{ totalLabel }}</span>
        </div>
        <div v-if="activeSlice" class="er-chart-tooltip er-chart-donut-tooltip" :style="{ left: `${activeSlice.x}px`, top: `${activeSlice.y}px` }">
          <div class="er-chart-tooltip-row">
            <span class="er-chart-key" :style="{ background: activeSlice.color }" />
            <span>{{ activeSlice.name }}</span>
            <strong>{{ formatValue(activeSlice.value) }}</strong>
          </div>
          <div class="er-chart-tooltip-title">{{ percent.format(activeSlice.share) }} of {{ formatValue(total) }}</div>
        </div>
      </div>

      <!-- Every slice is named with its value beside the chart, so nothing depends on telling colours apart. -->
      <ul class="er-chart-donut-legend">
        <li
          v-for="(slice, index) in slices"
          :key="index"
          :data-active="active === index ? '' : undefined"
          @pointerenter="active = index"
          @pointerleave="active = null"
        >
          <span class="er-chart-key" :style="{ background: slice.color }" />
          <span>{{ slice.name }}</span>
          <strong>{{ formatValue(slice.value) }}</strong>
          <span>{{ percent.format(slice.share) }}</span>
        </li>
      </ul>
    </div>
  </ChartFrame>
</template>

<style>
@layer components {
  .er-chart-donut {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 2rem;
  }

  .er-chart-donut .er-chart-plot {
    flex-shrink: 0;
    border-radius: 50%;
  }

  .er-chart-slice {
    stroke: var(--er-chart-surface);
    stroke-width: 2;
    stroke-linejoin: round;
    transition: opacity var(--er-duration);
  }

  .er-chart-slice[data-dimmed] {
    opacity: 0.45;
  }

  .er-chart-donut-center {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    color: var(--er-muted-foreground);
    pointer-events: none;
  }

  .er-chart-donut-center strong {
    color: var(--er-foreground);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .er-chart-donut-tooltip {
    transform: translate(-50%, calc(-100% - 10px));
  }

  .er-chart-donut-legend {
    display: grid;
    flex: 1;
    grid-template-columns: auto 1fr auto auto;
    gap: 0.375rem 0.625rem;
    align-items: center;
    min-width: 12rem;
    margin: 0;
    padding: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    list-style: none;
  }

  .er-chart-donut-legend li {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
  }

  .er-chart-donut-legend li > :last-child {
    text-align: right;
  }

  .er-chart-donut-legend strong {
    color: var(--er-foreground);
    font-weight: 600;
    text-align: right;
  }

  .er-chart-donut-legend li[data-active] > span:nth-child(2) {
    color: var(--er-foreground);
  }
}
</style>
