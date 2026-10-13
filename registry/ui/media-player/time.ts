/** Seconds as a clock: 75 is "1:15", 3725 is "1:02:05". Something that is not a time yet is "0:00". */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const rest = String(whole % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}

/** The same, in words, for a screen reader: "1 minute 15 seconds". */
export function spokenTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0 seconds'
  const whole = Math.floor(seconds)
  const parts: Array<[number, string]> = [
    [Math.floor(whole / 3600), 'hour'],
    [Math.floor((whole % 3600) / 60), 'minute'],
    [whole % 60, 'second'],
  ]
  const said = parts.filter(([amount], index) => amount > 0 || (index === 2 && whole < 60)).map(([amount, unit]) => `${amount} ${unit}${amount === 1 ? '' : 's'}`)
  return said.join(' ')
}
