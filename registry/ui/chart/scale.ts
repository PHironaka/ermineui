export interface ChartSeries {
  /** Property of each data row that holds this series' number. */
  key: string
  /** Name shown in the legend, the readout and the table. Defaults to the key. */
  label?: string
  /** Any CSS colour. Defaults to the next --er-chart-N variable, in order. */
  color?: string
}

function niceStep(rough: number): number {
  const power = 10 ** Math.floor(Math.log10(rough))
  const fraction = rough / power
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
  return nice * power
}

/** A value axis that covers min..max and lands on round numbers (0, 500, 1,000 ...). */
export function niceScale(min: number, max: number, count = 4): { min: number; max: number; ticks: number[] } {
  if (min === max) max = min + 1
  const step = niceStep((max - min) / count)
  const low = Math.floor(min / step) * step
  const high = Math.ceil(max / step) * step
  const ticks: number[] = []
  // Rounded on the way in, so 0.1 + 0.2 does not become a tick labelled 0.30000000000000004.
  for (let index = 0; low + index * step <= high + step / 2; index++) ticks.push(Number((low + index * step).toFixed(10)))
  return { min: low, max: high, ticks }
}

/** A number from a data row, or null when the cell is empty or not a number. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** Rough width of a short label at the chart's 12px text size — enough to reserve room for it. */
export function textWidth(text: string): number {
  return text.length * 6.6
}

/**
 * A bar from `base` to `end` with its data end rounded and its base square.
 * Works in both directions, so negative bars round at the bottom.
 */
export function barPath(x: number, base: number, end: number, width: number, radius = 4): string {
  const r = Math.min(radius, width / 2, Math.abs(base - end))
  const turn = end < base ? r : -r
  return `M${x},${base}V${end + turn}Q${x},${end} ${x + r},${end}H${x + width - r}Q${x + width},${end} ${x + width},${end + turn}V${base}Z`
}

/** One entry in a chart's legend. */
export interface ChartLegendItem {
  name: string
  color: string
  /** Switched off by the reader. Still listed, so it can be switched back on. */
  hidden?: boolean
}

/** A ring segment (or a pie slice when `inner` is 0) between two angles, in radians from 12 o'clock. */
export function arcPath(cx: number, cy: number, outer: number, inner: number, from: number, to: number): string {
  // A complete circle has the same start and end point, which draws nothing; stop a hair short.
  const end = Math.min(to, from + Math.PI * 2 - 0.0001)
  const point = (radius: number, angle: number) => `${cx + radius * Math.sin(angle)},${cy - radius * Math.cos(angle)}`
  const large = end - from > Math.PI ? 1 : 0
  const outerArc = `M${point(outer, from)}A${outer},${outer} 0 ${large} 1 ${point(outer, end)}`
  return inner > 0
    ? `${outerArc}L${point(inner, end)}A${inner},${inner} 0 ${large} 0 ${point(inner, from)}Z`
    : `${outerArc}L${cx},${cy}Z`
}
