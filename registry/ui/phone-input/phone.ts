export interface PhoneCountry {
  /** Two-letter country code: "US", "GB". */
  code: string
  name: string
  /** The calling code, without the plus: "1", "44". */
  dial: string
  /** How a national number is laid out, `#` for each digit. Numbers are left as typed when there is none. */
  format?: string
}

/** A starting list. Add the countries you sell to, or replace it with your own. */
export const phoneCountries: readonly PhoneCountry[] = [
  { code: 'AU', name: 'Australia', dial: '61', format: '### ### ###' },
  { code: 'AT', name: 'Austria', dial: '43' },
  { code: 'BE', name: 'Belgium', dial: '32', format: '### ## ## ##' },
  { code: 'BR', name: 'Brazil', dial: '55', format: '## #####-####' },
  { code: 'CA', name: 'Canada', dial: '1', format: '(###) ###-####' },
  { code: 'CN', name: 'China', dial: '86', format: '### #### ####' },
  { code: 'DK', name: 'Denmark', dial: '45', format: '## ## ## ##' },
  { code: 'FI', name: 'Finland', dial: '358' },
  { code: 'FR', name: 'France', dial: '33', format: '# ## ## ## ##' },
  { code: 'DE', name: 'Germany', dial: '49' },
  { code: 'IN', name: 'India', dial: '91', format: '##### #####' },
  { code: 'IE', name: 'Ireland', dial: '353', format: '## ### ####' },
  { code: 'IT', name: 'Italy', dial: '39', format: '### ### ####' },
  { code: 'JP', name: 'Japan', dial: '81', format: '##-####-####' },
  { code: 'MX', name: 'Mexico', dial: '52', format: '## #### ####' },
  { code: 'NL', name: 'Netherlands', dial: '31', format: '# ########' },
  { code: 'NZ', name: 'New Zealand', dial: '64' },
  { code: 'NO', name: 'Norway', dial: '47', format: '### ## ###' },
  { code: 'PL', name: 'Poland', dial: '48', format: '### ### ###' },
  { code: 'PT', name: 'Portugal', dial: '351', format: '### ### ###' },
  { code: 'SG', name: 'Singapore', dial: '65', format: '#### ####' },
  { code: 'ZA', name: 'South Africa', dial: '27', format: '## ### ####' },
  { code: 'KR', name: 'South Korea', dial: '82', format: '##-####-####' },
  { code: 'ES', name: 'Spain', dial: '34', format: '### ### ###' },
  { code: 'SE', name: 'Sweden', dial: '46', format: '##-### ## ##' },
  { code: 'CH', name: 'Switzerland', dial: '41', format: '## ### ## ##' },
  { code: 'GB', name: 'United Kingdom', dial: '44', format: '#### ######' },
  { code: 'US', name: 'United States', dial: '1', format: '(###) ###-####' },
]

const digits = (text: string) => text.replace(/\D/g, '')

/** Lays digits out in a format, adding each separator only once something follows it. */
export function formatNational(national: string, format?: string): string {
  const raw = digits(national)
  if (!format) return raw
  let out = ''
  let used = 0
  for (const character of format) {
    if (used >= raw.length) break
    out += character === '#' ? raw[used++] : character
  }
  // More digits than the format has room for are kept, not dropped: formats here are a guide, not a rule.
  return out + raw.slice(used)
}

/** A country and a national number as one international number: "+15550100199". Empty while there are no digits. */
export function toE164(country: PhoneCountry, national: string): string {
  // The leading zero some countries write in front of a national number is not dialled from abroad.
  const raw = digits(national).replace(/^0+/, '')
  return raw ? `+${country.dial}${raw}` : ''
}

/**
 * Splits an international number into its country and the rest. Several countries share a calling code
 * (the US and Canada both have +1), so say which one you would rather have with `prefer`.
 */
export function parsePhone(value: string, countries: readonly PhoneCountry[] = phoneCountries, prefer?: string): { country?: PhoneCountry; national: string } {
  const raw = digits(value)
  if (!value.trim().startsWith('+')) return { national: raw }
  // The longest calling code that fits wins: +353 is Ireland, not a +3 country followed by 53.
  const matches = countries.filter((country) => raw.startsWith(country.dial)).sort((a, b) => b.dial.length - a.dial.length)
  const longest = matches.filter((country) => country.dial.length === matches[0]?.dial.length)
  const country = longest.find((item) => item.code === prefer) ?? longest[0]
  return country ? { country, national: raw.slice(country.dial.length) } : { national: raw }
}
