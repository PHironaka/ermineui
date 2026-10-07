import { addDays, startOfMonth, today } from '../calendar'

/** Both ends are 'YYYY-MM-DD' strings and are part of the range. */
export interface DateRange {
  start: string
  end: string
}

export interface DateRangePreset {
  label: string
  /** Worked out when the picker opens, so "last 7 days" is always counted from today. */
  range: () => DateRange
}

const lastDays = (days: number) => () => ({ start: addDays(today(), 1 - days), end: today() })

/** The presets shown when none are passed. */
export const defaultPresets: DateRangePreset[] = [
  { label: 'Last 7 days', range: lastDays(7) },
  { label: 'Last 30 days', range: lastDays(30) },
  { label: 'Last 90 days', range: lastDays(90) },
  { label: 'Month to date', range: () => ({ start: startOfMonth(today()), end: today() }) },
]
