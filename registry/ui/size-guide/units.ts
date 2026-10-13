export type SizeUnit = 'cm' | 'in'

export interface SizeGuideMeasure {
  key: string
  label: string
}

export interface SizeGuideRow {
  /** What the size is called: "M", "38", "UK 10". */
  size: string
  /** Each measurement in centimetres, by measure key. A pair is a range: [88, 92]. */
  measurements: Record<string, number | readonly [number, number]>
}

/** Centimetres as inches, to the nearest half: tape measures and size charts do not go finer than that. */
export function toInches(cm: number): number {
  return Math.round((cm / 2.54) * 2) / 2
}

/** One measurement written out in a unit: "92", "36", or "88–92" for a range. */
export function formatMeasurement(value: number | readonly [number, number] | undefined, unit: SizeUnit): string {
  if (value === undefined) return ''
  const one = (cm: number) => String(unit === 'in' ? toInches(cm) : Math.round(cm * 10) / 10)
  return typeof value === 'number' ? one(value) : `${one(value[0])}–${one(value[1])}`
}

/** The first size whose range holds a measurement taken in centimetres, or the first that is big enough. */
export function findSize(rows: readonly SizeGuideRow[], key: string, cm: number): string | undefined {
  for (const row of rows) {
    const value = row.measurements[key]
    if (value === undefined) continue
    const top = typeof value === 'number' ? value : value[1]
    if (cm <= top) return row.size
  }
  return undefined
}
