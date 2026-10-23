<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { barPath, niceScale, textWidth, toNumber, type ChartSeries } from './scale'

const props = withDefaults(
  defineProps<{
    /** One object per position along the bottom axis, e.g. one per month. */
    data: readonly object[]
    /** Property of each row used as its label on the bottom axis. */
    x: string
    /** Heading for that column in the table view. Defaults to the property name. */
    xLabel?: string
    /** What to plot. Colours are handed out in this order, so keep the order stable. */
    series: readonly ChartSeries[]
    /** What the chart shows, for screen readers and as the table's caption. */
    label: string
    type?: 'line' | 'area' | 'bar'
    /** Bars only: stack the series on top of each other instead of side by side. */
    stacked?: boolean
    /** Height of the plot in px, including the labels along the bottom. */
    height?: number
    /** Lines only: name each line at its right-hand end when there is room (two to four series). */
    endLabels?: boolean
    /** How values are written in the readout and the table. */
    format?: (value: number) => string
    /** How values are written on the axis. Short by default: 12.5K, 3M. */
    tickFormat?: (value: number) => string
    /**
     * Lines and areas only: how much to draw, 0 to 1, from the left. What is still to come shows faintly as a
     * dotted line with open points. For a chart that draws itself as the page scrolls, e.g. in a sticky scroll.
     */
    reveal?: number
  }>(),
  { type: 'line', height: 240, endLabels: true },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const shortNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const formatValue = (value: number | null) => (value === null ? '–' : (props.format ?? fullNumber.format)(value))
const formatTick = (value: number) => (props.tickFormat ?? shortNumber.format)(value)

const TOP = 10
const BOTTOM = 26
const BAR_MAX = 24
const GAP = 2

/** Keys of the series the reader has switched off in the legend. */
const hidden = defineModel<string[]>('hidden', { default: () => [] })

const plot = ref<HTMLElement | null>(null)
/** Measured after mount; the SVG is only drawn once the width is known. */
const width = ref(0)
/** Index of the row under the pointer or chosen with the arrow keys. */
const active = ref<number | null>(null)
/** Read out by screen readers. Only set from the keyboard, so pointing with a mouse stays quiet. */
const announcement = ref('')

let observer: ResizeObserver | undefined
onMounted(() => {
  if (!plot.value) return
  width.value = plot.value.clientWidth
  observer = new ResizeObserver(([entry]) => {
    // Hidden behind the table view it measures 0; keep the last real width for when it comes back.
    if (entry && entry.contentRect.width > 0) width.value = entry.contentRect.width
  })
  observer.observe(plot.value)
})
onBeforeUnmount(() => observer?.disconnect())

const names = computed(() => props.series.map((series) => series.label ?? series.key))
// Eight colours are defined. Past that, series go grey rather than repeating a colour that is already taken.
const colors = computed(() =>
  props.series.map((series, index) => series.color ?? (index < 8 ? `var(--er-chart-${index + 1})` : 'var(--er-muted-foreground)')),
)
const rows = computed(() =>
  props.data.map((row) => {
    const record = row as Record<string, unknown>
    return { label: String(record[props.x] ?? ''), values: props.series.map((series) => toNumber(record[series.key])) }
  }),
)
/** Indexes of the series being drawn. Colours go by position in `series`, so hiding one never repaints the rest. */
const plotted = computed(() => props.series.flatMap((series, index) => (hidden.value.includes(series.key) ? [] : [index])))

function toggle(index: number) {
  const key = props.series[index]!.key
  if (hidden.value.includes(key)) hidden.value = hidden.value.filter((item) => item !== key)
  // The last one stays: an empty chart with every series struck out helps nobody.
  else if (plotted.value.length > 1) hidden.value = [...hidden.value, key]
}

const legend = computed(() =>
  props.series.length > 1
    ? names.value.map((name, index) => ({ name, color: colors.value[index]!, hidden: !plotted.value.includes(index) }))
    : undefined,
)
const tableRows = computed(() => rows.value.map((row) => [row.label, ...row.values.map(formatValue)]))

const isBar = computed(() => props.type === 'bar')
const isStacked = computed(() => isBar.value && props.stacked)

/** The value axis always includes zero, so bar lengths and line heights can be compared honestly. */
const scale = computed(() => {
  let min = 0
  let max = 0
  for (const row of rows.value) {
    if (isStacked.value) {
      max = Math.max(max, plotted.value.reduce((sum, index) => sum + Math.max(0, row.values[index] ?? 0), 0))
      continue
    }
    for (const index of plotted.value) {
      const value = row.values[index] ?? null
      if (value === null) continue
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  }
  return niceScale(min, max)
})

const bottom = computed(() => props.height - BOTTOM)
function y(value: number): number {
  const { min, max } = scale.value
  return bottom.value - ((value - min) / (max - min)) * (bottom.value - TOP)
}
const baseline = computed(() => y(0))

const ticks = computed(() => scale.value.ticks.map((value) => ({ value, y: y(value), text: formatTick(value) })))

/** Names at the right-hand end of each line — dropped entirely if any two would sit on top of each other. */
const ends = computed(() => {
  const count = plotted.value.length
  const last = rows.value.length - 1
  if (isBar.value || !props.endLabels || count < 2 || count > 4 || last < 0) return []
  const values = rows.value[last]!.values
  if (plotted.value.some((index) => values[index] === null)) return []
  const labels = plotted.value.map((index) => ({ y: y(values[index]!), text: names.value[index]! }))
  const sorted = labels.map((label) => label.y).sort((a, b) => a - b)
  return sorted.some((position, index) => index > 0 && position - sorted[index - 1]! < 14) ? [] : labels
})

const left = computed(() => Math.max(...ticks.value.map((tick) => textWidth(tick.text))) + 10)
const right = computed(() => (ends.value.length ? Math.max(...ends.value.map((end) => textWidth(end.text))) + 16 : 10))
const band = computed(() => Math.max(0, width.value - left.value - right.value) / Math.max(1, rows.value.length))
const center = (index: number) => left.value + band.value * (index + 0.5)

/** Bottom-axis labels, thinned out so neighbours never touch. */
const xLabels = computed(() => {
  const widest = Math.max(0, ...rows.value.map((row) => textWidth(row.label)))
  const every = band.value > 0 ? Math.max(1, Math.ceil((widest + 12) / band.value)) : 1
  return rows.value.flatMap((row, index) => (index % every === 0 ? [{ x: center(index), text: row.label }] : []))
})

const lines = computed(() => {
  if (isBar.value) return []
  return plotted.value.map((seriesIndex) => {
    let line = ''
    let area = ''
    let run: number[] = []
    let end: { x: number; y: number } | undefined
    const points: Array<{ x: number; y: number }> = []
    // A gap in the data breaks the line instead of drawing straight across it.
    const closeRun = () => {
      if (run.length) area += `L${center(run[run.length - 1]!)},${baseline.value}L${center(run[0]!)},${baseline.value}Z`
      run = []
    }
    rows.value.forEach((row, index) => {
      const value = row.values[seriesIndex]
      if (value === null || value === undefined) return closeRun()
      const point = `${center(index)},${y(value)}`
      line += `${run.length ? 'L' : 'M'}${point}`
      area += `${run.length ? 'L' : 'M'}${point}`
      run.push(index)
      end = { x: center(index), y: y(value) }
      points.push(end)
    })
    closeRun()
    return { line, area, end, points, color: colors.value[seriesIndex]! }
  })
})

const bars = computed(() => {
  if (!isBar.value) return []
  const count = plotted.value.length
  const result: Array<{ d: string; color: string; key: string }> = []
  rows.value.forEach((row, rowIndex) => {
    if (isStacked.value) {
      const barWidth = Math.min(BAR_MAX, band.value * 0.7)
      const x = center(rowIndex) - barWidth / 2
      const top = plotted.value.reduce((last, index) => ((row.values[index] ?? 0) > 0 ? index : last), -1)
      let total = 0
      plotted.value.forEach((index) => {
        const value = row.values[index] ?? null
        if (value === null || value <= 0) return
        // Each segment stops 2px short of the one below it: the gap separates them, not an outline.
        // A very small segment gives up some of its gap instead, so it never shrinks to a hairline.
        const start = y(total)
        total += value
        const end = y(total)
        const base = start - (start < baseline.value ? Math.min(GAP, Math.max(0, start - end - 2)) : 0)
        result.push({ d: barPath(x, base, end, barWidth, index === top ? 4 : 0), color: colors.value[index]!, key: `${rowIndex}-${index}` })
      })
      return
    }
    const barWidth = Math.max(1, Math.min(BAR_MAX, (band.value * 0.7 - GAP * (count - 1)) / count))
    const groupWidth = barWidth * count + GAP * (count - 1)
    plotted.value.forEach((index, position) => {
      const value = row.values[index] ?? null
      if (value === null || value === 0) return
      const x = center(rowIndex) - groupWidth / 2 + position * (barWidth + GAP)
      result.push({ d: barPath(x, baseline.value, y(value), barWidth), color: colors.value[index]!, key: `${rowIndex}-${index}` })
    })
  })
  return result
})

/** With `reveal`: how far across the line is drawn, in px, and the clip that stops it there. */
const revealX = computed(() => {
  if (props.reveal === undefined || isBar.value || !rows.value.length) return undefined
  const first = center(0)
  return first + Math.min(1, Math.max(0, props.reveal)) * (center(rows.value.length - 1) - first)
})
const clipId = `er-chart-reveal-${useId()}`
// A point counts as reached a hair before the line gets to it, so it fills as the line arrives.
const reached = (x: number) => revealX.value !== undefined && x <= revealX.value + 0.5

const activeRow = computed(() => (active.value === null ? undefined : rows.value[active.value]))
/** The readout for the active row: one entry per series being drawn. */
const readout = computed(() =>
  activeRow.value ? plotted.value.map((index) => ({ index, value: activeRow.value!.values[index] ?? null })) : [],
)
const tooltipStyle = computed(() => {
  if (active.value === null) return undefined
  const x = center(active.value)
  // Sits beside the hovered position, on whichever side has more room.
  return { left: `${x}px`, transform: x > width.value / 2 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }
})

function indexAt(event: PointerEvent): number | null {
  if (!plot.value || !rows.value.length || band.value <= 0) return null
  const x = event.clientX - plot.value.getBoundingClientRect().left
  return Math.max(0, Math.min(rows.value.length - 1, Math.floor((x - left.value) / band.value)))
}

function onPointer(event: PointerEvent) {
  active.value = indexAt(event)
}

function onKeydown(event: KeyboardEvent) {
  const last = rows.value.length - 1
  if (last < 0) return
  let next: number
  if (event.key === 'ArrowRight') next = active.value === null ? 0 : Math.min(last, active.value + 1)
  else if (event.key === 'ArrowLeft') next = active.value === null ? last : Math.max(0, active.value - 1)
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  else if (event.key === 'Escape' && active.value !== null) {
    active.value = null
    announcement.value = ''
    return
  } else return

  event.preventDefault()
  active.value = next
  const row = rows.value[next]!
  announcement.value = `${row.label}: ${plotted.value.map((index) => `${names.value[index]} ${formatValue(row.values[index] ?? null)}`).join(', ')}`
}

function clear() {
  active.value = null
}
</script>

<template>
  <!-- One series gets no legend: the chart's own heading already says what is plotted. -->
  <ChartFrame
    :label="label"
    :legend="legend"
    :legend-shape="type === 'line' ? 'line' : 'box'"
    :columns="[xLabel ?? x, ...names]"
    :rows="tableRows"
    :announcement="announcement"
    :data-type="type"
    @toggle="toggle"
  >
    <div
      ref="plot"
      class="er-chart-plot"
      role="img"
      aria-roledescription="chart"
      tabindex="0"
      :aria-label="`${label}. Use the left and right arrow keys to read values.`"
      :style="{ height: `${height}px` }"
      @pointermove="onPointer"
      @pointerdown="onPointer"
      @pointerleave="clear"
      @blur="clear"
      @keydown="onKeydown"
    >
      <p v-if="!rows.length" class="er-chart-empty"><slot name="empty">No data</slot></p>
      <svg v-else-if="width" :width="width" :height="height" aria-hidden="true">
        <g class="er-chart-grid">
          <line v-for="tick in ticks" :key="tick.value" :x1="left" :x2="width - right" :y1="tick.y" :y2="tick.y" />
        </g>
        <g class="er-chart-axis">
          <text v-for="tick in ticks" :key="tick.value" :x="left - 8" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ tick.text }}</text>
          <text v-for="item in xLabels" :key="item.x" :x="item.x" :y="height - 6" text-anchor="middle">{{ item.text }}</text>
        </g>

        <!-- Bars: the whole column behind the hovered group lights up, so the target is far bigger than a bar. -->
        <rect
          v-if="isBar && active !== null"
          class="er-chart-band"
          :x="left + band * active"
          :y="TOP"
          :width="band"
          :height="bottom - TOP"
        />

        <path v-for="bar in bars" :key="bar.key" :d="bar.d" :fill="bar.color" />

        <template v-if="!isBar">
          <!-- Partly drawn: the part still to come is a faint dotted line, and the drawn part is clipped at revealX. -->
          <clipPath v-if="revealX !== undefined" :id="clipId">
            <rect x="0" y="0" :width="revealX" :height="height" />
          </clipPath>
          <template v-if="type === 'area'">
            <path
              v-for="(item, index) in lines"
              :key="`area-${index}`"
              class="er-chart-area"
              :d="item.area"
              :fill="item.color"
              :clip-path="revealX !== undefined ? `url(#${clipId})` : undefined"
            />
          </template>
          <line v-if="active !== null" class="er-chart-crosshair" :x1="center(active)" :x2="center(active)" :y1="TOP" :y2="bottom" />
          <template v-if="revealX !== undefined">
            <path v-for="(item, index) in lines" :key="`ahead-${index}`" class="er-chart-line" data-part="ahead" :d="item.line" :stroke="item.color" />
          </template>
          <path
            v-for="(item, index) in lines"
            :key="`line-${index}`"
            class="er-chart-line"
            :d="item.line"
            :stroke="item.color"
            :clip-path="revealX !== undefined ? `url(#${clipId})` : undefined"
          />
          <template v-if="revealX !== undefined">
            <template v-for="(item, index) in lines" :key="`points-${index}`">
              <circle
                v-for="point in item.points"
                :key="point.x"
                class="er-chart-point"
                :data-state="reached(point.x) ? 'reached' : 'ahead'"
                :cx="point.x"
                :cy="point.y"
                r="3.5"
                :stroke="item.color"
                :style="reached(point.x) ? { fill: item.color } : undefined"
              />
            </template>
          </template>
          <template v-else>
            <template v-for="(item, index) in lines" :key="`end-${index}`">
              <circle v-if="item.end" class="er-chart-dot" :cx="item.end.x" :cy="item.end.y" r="4" :fill="item.color" />
            </template>
          </template>
          <template v-for="item in readout" :key="`dot-${item.index}`">
            <circle v-if="item.value !== null" class="er-chart-dot" :cx="center(active!)" :cy="y(item.value)" r="4" :fill="colors[item.index]" />
          </template>
          <g class="er-chart-ends">
            <text v-for="end in ends" :key="end.text" :x="width - right + 10" :y="end.y" dominant-baseline="middle">{{ end.text }}</text>
          </g>
        </template>

        <!-- Drawn last so it sits over the bars: the line every bar grows from. -->
        <line class="er-chart-baseline" :x1="left" :x2="width - right" :y1="baseline" :y2="baseline" />
      </svg>

      <div v-if="activeRow && width" class="er-chart-tooltip" :style="tooltipStyle">
        <div class="er-chart-tooltip-title">{{ activeRow.label }}</div>
        <div v-for="item in readout" :key="item.index" class="er-chart-tooltip-row">
          <span class="er-chart-key" data-shape="line" :style="{ background: colors[item.index] }" />
          <span>{{ names[item.index] }}</span>
          <strong>{{ formatValue(item.value) }}</strong>
        </div>
      </div>
    </div>
  </ChartFrame>
</template>

