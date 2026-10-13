export interface DataTableColumn<T = object> {
  /** Property of each row shown in this column. Also names the slot: #cell-<key>. */
  key: string
  /** Column heading. */
  label: string
  /** Let the reader sort by this column by pressing its heading. */
  sortable?: boolean
  /** Use "right" for numbers, so the digits line up. */
  align?: 'left' | 'center' | 'right'
  /** How the value is written. Sorting still uses the raw value. */
  format?: (value: unknown, row: T) => string
  /** Set to false to keep this column out of the "Columns" menu, so it can never be hidden. */
  hideable?: boolean
}

export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}
