const formatters = new Map<string, Intl.NumberFormat>()

/**
 * An amount written as money: formatMoney(24.5) gives "$24.50". Amounts are in whole units of the
 * currency (dollars, not cents). The locale is fixed unless you pass one, so server and browser write the same text.
 */
export function formatMoney(amount: number, currency = 'USD', locale = 'en-US'): string {
  const key = `${locale}/${currency}`
  let formatter = formatters.get(key)
  if (!formatter) formatters.set(key, (formatter = new Intl.NumberFormat(locale, { style: 'currency', currency })))
  return formatter.format(amount)
}

/** How much cheaper `amount` is than `compareAt`, as a whole percentage. 0 when it is not cheaper. */
export function percentOff(amount: number, compareAt: number | undefined): number {
  if (compareAt === undefined || compareAt <= 0 || amount >= compareAt) return 0
  return Math.round((1 - amount / compareAt) * 100)
}
