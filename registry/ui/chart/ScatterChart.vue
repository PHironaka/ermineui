<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { niceScale, textWidth, toNumber } from './scale'

const props = withDefaults(
  defineProps<{
    /** One object per point. Rows missing either number are left out. */
    data: readonly object[]
    /** Properties of each row that hold its two numbers. */
    x: string
    y: string
    /** What the chart shows, for screen readers and as the table's caption. */
    label: string
    /** Axis titles, also used in the readout and the table. Default to the property names. */
    xLabel?: string
    yLabel?: string
    /** Property that sorts points into coloured groups. The first three groups get a colour; any others share grey. */
    group?: string
    /** Property that names each point, shown in the readout and the table. */
    name?: string
    /** Height of the plot in px, including the axis labels. */
    height?: number
    /** How values are written in the readout and the table. */
    format?: (value: number) => string
    /** How values are written on the axes. Short by default: 12.5K, 3M. */
    tickFormat?: (value: number) => string
  }>(),
  { height: 280 },
)

// Fixed locale, so server and browser write numbers the same way.
const fullNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const shortNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const formatValue = (value: number) => (props.format ?? fullNumber.format)(value)
const formatTick = (value: number) => (props.tickFormat ?? shortNumber.format)(value)

/** Any two points can end up side by side, and only three of the series colours stay distinct in every pairing. */
const MAX_GROUPS = 3
const OTHER = 'Other'
/** How close the pointer must be to a point to select it, in px. Far more forgiving than the 8px dot. */
const REACH = 32

/** Names of the groups the reader has switched off in the legend. */
const hidden = defineModel<string[]>('hidden', { default: () => [] })

const plot = ref<HTMLElement | null>(null)
/** Measured after mount; the SVG is only drawn once the width is known. */
const width = ref(0)
/** Index (into `points`) of the point nearest the pointer or chosen with the arrow keys. */
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

const xTitle = computed(() => props.xLabel ?? props.x)
const yTitle = computed(() => props.yLabel ?? props.y)

const records = computed(() =>
  props.data.flatMap((row) => {
    const record = row as Record<string, unknown>
    const x = toNumber(record[props.x])
    const y = toNumber(record[props.y])
    if (x === null || y === null) return []
    return [{ x, y, name: props.name ? String(record[props.name] ?? '') : '', group: props.group ? String(record[props.group] ?? '') : '' }]
  }),
)

/** Groups in the order they first appear, so a group keeps its colour however the rows are sorted later. */
const groups = computed(() => {
  if (!props.group) return []
  const found = [...new Set(records.value.map((record) => record.group))]
  const named = found.slice(0, MAX_GROUPS).map((name, index) => ({ name, color: `var(--er-chart-${index + 1})` }))
  return found.length > MAX_GROUPS ? [...named, { name: OTHER, color: 'var(--er-muted-foreground)' }] : named
})

const points = computed(() =>
  records.value
    .map((record) => {
      const group = groups.value.find((item) => item.name === record.group) ?? groups.value.find((item) => item.name === OTHER)
      return { ...record, legend: group?.name ?? '', color: group?.color ?? 'var(--er-chart-1)' }
    })
    .filter((point) => !hidden.value.includes(point.legend))
    // Left to right, so the arrow keys walk across the chart.
    .sort((a, b) => a.x - b.x || a.y - b.y),
)

function toggle(index: number) {
  const name = groups.value[index]!.name
  if (hidden.value.includes(name)) hidden.value = hidden.value.filter((item) => item !== name)
  // The last one stays: an empty chart with every group struck out helps nobody.
  else if (groups.value.filter((group) => !hidden.value.includes(group.name)).length > 1) hidden.value = [...hidden.value, name]
}

const legend = computed(() =>
  groups.value.length > 1 ? groups.value.map((group) => ({ ...group, hidden: hidden.value.includes(group.name) })) : undefined,
)

const top = computed(() => (yTitle.value ? 28 : 10))
const bottom = computed(() => props.height - (xTitle.value ? 46 : 26))

const extent = (values: number[]) => (values.length ? [Math.min(...values), Math.max(...values)] : [0, 1])
const yScale = computed(() => {
  const [min, max] = extent(points.value.map((point) => point.y))
  return niceScale(min!, max!)
})
const yTicks = computed(() => yScale.value.ticks.map((value) => ({ value, y: py(value), text: formatTick(value) })))
const left = computed(() => Math.max(...yTicks.value.map((tick) => textWidth(tick.text))) + 10)
const right = 14

const xScale = computed(() => {
  const [min, max] = extent(points.value.map((point) => point.x))
  // Roughly one label every 90px, so they never crowd on a narrow screen.
  return niceScale(min!, max!, Math.max(2, Math.floor((width.value - left.value - right) / 90)))
})
const xTicks = computed(() => xScale.value.ticks.map((value) => ({ value, x: px(value), text: formatTick(value) })))

function px(value: number): number {
  const { min, max } = xScale.value
  return left.value + ((value - min) / (max - min)) * (width.value - left.value - right)
}
function py(value: number): number {
  const { min, max } = yScale.value
  return bottom.value - ((value - min) / (max - min)) * (bottom.value - top.value)
}

const dots = computed(() => points.value.map((point) => ({ ...point, cx: px(point.x), cy: py(point.y) })))
const activeDot = computed(() => (active.value === null ? undefined : dots.value[active.value]))
const tooltipStyle = computed(() => {
  const dot = activeDot.value
  if (!dot) return undefined
  // Sits beside the point, on whichever side has more room.
  const side = dot.cx > width.value / 2 ? 'calc(-100% - 12px)' : '12px'
  return { left: `${dot.cx}px`, top: `${dot.cy}px`, transform: `translate(${side}, -50%)` }
})

const columns = computed(() => [...(props.name ? ['Name'] : []), ...(props.group ? ['Group'] : []), xTitle.value, yTitle.value])
const tableRows = computed(() =>
  records.value.map((record) => [
    ...(props.name ? [record.name] : []),
    ...(props.group ? [record.group] : []),
    formatValue(record.x),
    formatValue(record.y),
  ]),
)

/** The pointer only has to be nearest a point, not on it. */
function onPointer(event: PointerEvent) {
  if (!plot.value) return
  const box = plot.value.getBoundingClientRect()
  const x = event.clientX - box.left
  const y = event.clientY - box.top
  let nearest: number | null = null
  let best = REACH
  dots.value.forEach((dot, index) => {
    const distance = Math.hypot(dot.cx - x, dot.cy - y)
    if (distance < best) {
      best = distance
      nearest = index
    }
  })
  active.value = nearest
}

function onKeydown(event: KeyboardEvent) {
  const last = dots.value.length - 1
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
  const dot = dots.value[next]!
  const heading = [dot.name, dot.legend].filter(Boolean).join(', ')
  announcement.value = `${heading ? `${heading}: ` : ''}${xTitle.value} ${formatValue(dot.x)}, ${yTitle.value} ${formatValue(dot.y)}`
}

function clear() {
  active.value = null
}
</script>

<template>
  <ChartFrame
    :label="label"
    :legend="legend"
    legend-shape="dot"
    :columns="columns"
    :rows="tableRows"
    :announcement="announcement"
    data-type="scatter"
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
      <p v-if="!records.length" class="er-chart-empty"><slot name="empty">No data</slot></p>
      <svg v-else-if="width" :width="width" :height="height" aria-hidden="true">
        <g class="er-chart-grid">
          <line v-for="tick in yTicks" :key="`y-${tick.value}`" :x1="left" :x2="width - right" :y1="tick.y" :y2="tick.y" />
          <line v-for="tick in xTicks" :key="`x-${tick.value}`" :x1="tick.x" :x2="tick.x" :y1="top" :y2="bottom" />
        </g>
        <g class="er-chart-axis">
          <text v-for="tick in yTicks" :key="`y-${tick.value}`" :x="left - 8" :y="tick.y" text-anchor="end" dominant-baseline="middle">{{ tick.text }}</text>
          <text v-for="tick in xTicks" :key="`x-${tick.value}`" :x="tick.x" :y="bottom + 18" text-anchor="middle">{{ tick.text }}</text>
          <text v-if="yTitle" :x="0" :y="12">{{ yTitle }}</text>
          <text v-if="xTitle" :x="(left + width - right) / 2" :y="height - 4" text-anchor="middle">{{ xTitle }}</text>
        </g>

        <!-- Each dot carries a ring in the surface colour, so overlapping points stay separate. -->
        <circle v-for="(dot, index) in dots" :key="index" class="er-chart-dot" :cx="dot.cx" :cy="dot.cy" r="4" :fill="dot.color" />
        <circle v-if="activeDot" class="er-chart-dot" :cx="activeDot.cx" :cy="activeDot.cy" r="6" :fill="activeDot.color" />
      </svg>

      <div v-if="activeDot && width" class="er-chart-tooltip" :style="tooltipStyle">
        <div v-if="activeDot.name || activeDot.legend" class="er-chart-tooltip-row">
          <span v-if="activeDot.legend" class="er-chart-key" data-shape="dot" :style="{ background: activeDot.color }" />
          <span>{{ [activeDot.name, activeDot.legend].filter(Boolean).join(' · ') }}</span>
        </div>
        <div class="er-chart-tooltip-row">
          <span>{{ xTitle }}</span>
          <strong>{{ formatValue(activeDot.x) }}</strong>
        </div>
        <div class="er-chart-tooltip-row">
          <span>{{ yTitle }}</span>
          <strong>{{ formatValue(activeDot.y) }}</strong>
        </div>
      </div>
    </div>
  </ChartFrame>
</template>
