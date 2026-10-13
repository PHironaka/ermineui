export interface ComparisonColumn {
  key: string
  title: string
  /** A line under the title, e.g. the price. */
  subtitle?: string
  /** Mark this column out as the one being recommended, or the one being looked at. */
  highlight?: boolean
}

/** true and false are drawn as a tick and a dash; null or a missing key leaves the cell empty. */
export type ComparisonValue = boolean | string | number | null

export interface ComparisonRow {
  label: string
  /** A line of explanation under the label. */
  hint?: string
  /** What each column has for this row, by column key. */
  values: Record<string, ComparisonValue | undefined>
}

export interface ComparisonGroup {
  /** A heading over the rows that follow, e.g. "Materials". */
  title: string
  rows: readonly ComparisonRow[]
}
