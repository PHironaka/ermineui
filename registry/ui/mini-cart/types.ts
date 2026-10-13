export interface MiniCartItem {
  /** Different for every line: a product id, or product and variant together. */
  id: string
  title: string
  /** Where the product's own page is. */
  href?: string
  image?: string
  /** The variant that was chosen, e.g. "Sand / Large". */
  options?: string
  /** Price of one, in whole units of the currency. */
  price: number
  /** The price of one before a reduction. */
  compareAt?: number
  quantity: number
  /** The most that can be bought, e.g. what is left in stock. */
  max?: number
}
