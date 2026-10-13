export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Nothing is left. */
  done: boolean
}

/** A length of time in milliseconds, split into days, hours, minutes and seconds. Below zero counts as zero. */
export function timeLeft(milliseconds: number): TimeLeft {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total === 0,
  }
}

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`

/** The time left in words, leaving out leading units that are zero: "2 days, 0 hours, 5 minutes, 9 seconds". */
export function timeLeftInWords(left: TimeLeft): string {
  const parts = [plural(left.days, 'day'), plural(left.hours, 'hour'), plural(left.minutes, 'minute'), plural(left.seconds, 'second')]
  const first = [left.days, left.hours, left.minutes].findIndex((count) => count > 0)
  return parts.slice(first === -1 ? 3 : first).join(', ')
}
