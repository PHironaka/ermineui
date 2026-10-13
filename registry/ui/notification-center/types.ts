export interface NotificationItem {
  id: string
  title: string
  /** A line or two more. */
  body?: string
  /** When it happened, already written out the way it should read: "2 hours ago", "Oct 6". */
  time?: string
  /** For machines: the same moment as an ISO date. */
  datetime?: string
  /** Where pressing it goes. Without one it is a button that emits `select`. */
  href?: string
  read?: boolean
}
