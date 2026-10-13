export interface FilterBarOption {
  value: string
  /** What to call the value. The value itself is shown when there is none. */
  label?: string
  /** How many rows have this value, shown beside it. */
  count?: number
}

export interface FilterBarFacet {
  /** The property being filtered on. With a DataTable, the column's key. */
  key: string
  label: string
  options: ReadonlyArray<string | FilterBarOption>
}

/** For each facet key, the values that are ticked. */
export type FilterBarValue = Record<string, string[]>
