export interface CalendarEvent {
  id: string
  title: string
  /** First day, as 'YYYY-MM-DD'. */
  start: string
  /** Last day, as 'YYYY-MM-DD'. Leave out for a one-day event. */
  end?: string
  /** Which chart colour (1 to 8) marks it. Keep the same number for the same kind of event. */
  color?: number
}
