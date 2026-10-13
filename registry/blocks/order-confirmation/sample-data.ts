/**
 * A made-up order so the page has something to show. Replace this file with your own data,
 * or pass your own through the props of OrderConfirmation.vue.
 */

export interface ConfirmedOrderItem {
  id: string
  title: string
  image?: string
  /** The variant that was chosen, e.g. "Sand / Large". */
  options?: string
  /** Price of one, in whole units of the currency. */
  price: number
  quantity: number
}

export interface ConfirmedOrder {
  /** The order's number, as the customer will quote it. */
  number: string
  /** Where the receipt was sent. */
  email: string
  /** When it was placed, already written out: "October 12, 2026". */
  placed: string
  items: ConfirmedOrderItem[]
  /** Money taken off, as a positive number. */
  discount?: number
  discountLabel?: string
  shipping: number
  tax?: number
  /** Who and where it is going to, one line each. */
  address: string[]
  /** How it is being sent, e.g. "Standard, 3 to 5 working days". */
  shippingMethod: string
  /** How it was paid for, e.g. "Visa ending 4242". */
  payment: string
  /** When it should arrive, already written out: "Friday, October 16". */
  arriving?: string
}

// Stand-in pictures drawn as SVG, so the block needs no image files and no network.
const picture = (background: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/></svg>`,
  )}`

export const sampleOrder: ConfirmedOrder = {
  number: 'ER-10482',
  email: 'maya@example.com',
  placed: 'October 12, 2026',
  items: [
    { id: 'mug-sand', title: 'Stoneware mug', options: 'Sand / 350 ml', price: 24, quantity: 2, image: picture('#efe7da', '#c9b79c') },
    { id: 'throw-moss', title: 'Wool throw', options: 'Moss / 130 × 180 cm', price: 96, quantity: 1, image: picture('#dde5d6', '#6f8a5b') },
  ],
  discount: 14.4,
  discountLabel: 'SAVE10',
  shipping: 0,
  tax: 10.37,
  address: ['Maya Robinson', '18 Alder Row', 'Portland, OR 97205', 'United States'],
  shippingMethod: 'Standard, 3 to 5 working days',
  payment: 'Visa ending 4242',
  arriving: 'Friday, October 16',
}
