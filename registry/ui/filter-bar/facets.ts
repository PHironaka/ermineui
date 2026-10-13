import type { FilterBarOption } from './types'

// Fixed locale, so server and browser list the values in the same order.
const collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' })

/** The different values one property takes across some rows, each with how many rows have it: ready to use as a facet's options. */
export function facetOptions(rows: readonly object[], key: string): FilterBarOption[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = (row as Record<string, unknown>)[key]
    if (value === null || value === undefined || value === '') continue
    counts.set(String(value), (counts.get(String(value)) ?? 0) + 1)
  }
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => collator.compare(a.value, b.value))
}
