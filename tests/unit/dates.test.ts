import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addDays, addMonths, formatDate, parseDate, startOfMonth, toDateString, today, weekday } from '../../registry/ui/calendar/dates.ts'

test('parseDate accepts real dates only', () => {
  assert.equal(toDateString(parseDate('2024-02-29')!), '2024-02-29')
  assert.equal(parseDate('2026-02-31'), null, 'a day that does not exist')
  assert.equal(parseDate('2025-02-29'), null, 'not a leap year')
  assert.equal(parseDate('26-1-1'), null)
  assert.equal(parseDate(''), null)
  assert.equal(parseDate(undefined), null)
})

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(addDays('2026-03-01', -1), '2026-02-28')
  assert.equal(addDays('2024-03-01', -1), '2024-02-29')
  assert.equal(addDays('2026-10-06', 0), '2026-10-06')
})

test('addDays is not thrown off by daylight saving changes', () => {
  // Counted in UTC, so the days either side of a clock change are still one day apart.
  assert.equal(addDays('2026-03-08', 1), '2026-03-09')
  assert.equal(addDays('2026-11-01', 1), '2026-11-02')
})

test('addMonths keeps the day, or falls back to the last day of a shorter month', () => {
  assert.equal(addMonths('2026-01-15', 1), '2026-02-15')
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29')
  assert.equal(addMonths('2024-02-29', 12), '2025-02-28')
  assert.equal(addMonths('2026-01-15', -1), '2025-12-15')
  assert.equal(addMonths('2026-11-30', 3), '2027-02-28')
})

test('startOfMonth and weekday', () => {
  assert.equal(startOfMonth('2026-10-06'), '2026-10-01')
  assert.equal(weekday('2026-10-06'), 2, 'a Tuesday')
  assert.equal(weekday('2026-10-04'), 0, 'a Sunday')
})

test('date strings sort in date order', () => {
  assert.ok('2026-09-30' < '2026-10-01')
  assert.ok('2025-12-31' < '2026-01-01')
})

test('formatDate writes in the given locale and ignores the local time zone', () => {
  assert.equal(formatDate('2026-10-06', 'en-US', { dateStyle: 'medium' }), 'Oct 6, 2026')
  assert.equal(formatDate('2026-01-01', 'en-US', { dateStyle: 'full' }), 'Thursday, January 1, 2026')
  assert.equal(formatDate('not a date', 'en-US', {}), '')
  assert.equal(formatDate(undefined, 'en-US', {}), '')
})

test('today is a valid date string', () => {
  assert.match(today(), /^\d{4}-\d{2}-\d{2}$/)
  assert.notEqual(parseDate(today()), null)
})
