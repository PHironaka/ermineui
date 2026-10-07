/**
 * Dates are plain 'YYYY-MM-DD' strings, the format <input type="date"> uses: no time
 * and no time zone, so a date never shifts by a day between server and browser.
 * Strings in this format sort in date order, so they can be compared with < and >.
 */

const DAY = 86_400_000

/** The date as a Date at UTC midnight, or null if the string is not a real date. */
export function parseDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return null
  const date = new Date(0)
  date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  // Rejects overflow such as 2026-02-31, which Date would roll into March.
  return toDateString(date) === value ? date : null
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Today in the visitor's own time zone. */
export function today(): string {
  const now = new Date()
  return toDateString(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value)
  return date ? toDateString(new Date(date.getTime() + days * DAY)) : value
}

/** Same day in another month, pulled back to the last day when that month is shorter. */
export function addMonths(value: string, months: number): string {
  const date = parseDate(value)
  if (!date) return value
  const first = new Date(0)
  first.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  first.setUTCDate(Math.min(date.getUTCDate(), daysInMonth))
  return toDateString(first)
}

export function startOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`
}

/** Day of the week, 0 (Sunday) to 6 (Saturday). */
export function weekday(value: string): number {
  return parseDate(value)?.getUTCDay() ?? 0
}

/** Formats a date string for display. Returns '' for anything that is not a date. */
export function formatDate(value: string | null | undefined, locale: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseDate(value)
  return date ? new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date) : ''
}
