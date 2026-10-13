/** A postal address. Every part is text; the ones not filled in are empty strings. */
export type Address = {
  name: string
  line1: string
  /** Flat, suite, floor. */
  line2: string
  city: string
  /** State, province, county or region. */
  region: string
  postcode: string
  country: string
}

export const emptyAddress = (): Address => ({ name: '', line1: '', line2: '', city: '', region: '', postcode: '', country: '' })
