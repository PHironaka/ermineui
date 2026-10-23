/**
 * Made-up products so the cart has something to show. Replace this file with your own data,
 * or pass your own through the props of Cart.vue.
 */

export interface CartItem {
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

// Stand-in pictures drawn as SVG, so the block needs no image files and no network.
const picture = (background: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/></svg>`,
  )}`

export const sampleCart: CartItem[] = [
  { id: 'mug-sand', title: 'Stoneware mug', options: 'Sand', price: 24, quantity: 2, image: picture('#efe7da', '#c9b79c') },
  { id: 'throw-moss', title: 'Wool throw', options: 'Moss / 130 × 180 cm', price: 96, compareAt: 120, quantity: 1, max: 3, image: picture('#dde5d6', '#6f8a5b') },
  { id: 'lamp-ink', title: 'Desk lamp', options: 'Ink', price: 148.5, quantity: 1, image: picture('#dfe3ea', '#2f3a4f') },
]

/** The same made-up products as a catalogue, for looking up the lines of a shared cart link. */
export const sampleProducts = sampleCart.map(({ quantity: _quantity, ...product }) => product)
