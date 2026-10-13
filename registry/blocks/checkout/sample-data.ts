/**
 * Made-up items and delivery choices so the checkout has something to show. Replace this file with
 * your own data, or pass your own through the props of Checkout.vue.
 */

export interface CheckoutItem {
  id: string
  title: string
  image?: string
  /** The variant that was chosen, e.g. "Sand / Large". */
  options?: string
  /** Price of one, in whole units of the currency. */
  price: number
  quantity: number
}

export interface CheckoutShippingMethod {
  id: string
  title: string
  /** How long it takes, or anything else worth knowing. */
  description?: string
  /** 0 is written as "Free". */
  price: number
}

/** What the form hands over once it has passed its checks. */
export interface CheckoutValues {
  email: string
  name: string
  address: string
  /** Flat, suite, floor. May be empty. */
  address2: string
  city: string
  region: string
  postcode: string
  country: string
  /** The id of the delivery choice. */
  shippingMethod: string
  /** Missing when the #payment slot is used: your payment provider then holds the card details. */
  card?: { name: string; number: string; expiry: string; cvc: string }
}

// Stand-in pictures drawn as SVG, so the block needs no image files and no network.
const picture = (background: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/></svg>`,
  )}`

export const sampleCheckoutItems: CheckoutItem[] = [
  { id: 'mug-sand', title: 'Stoneware mug', options: 'Sand', price: 24, quantity: 2, image: picture('#efe7da', '#c9b79c') },
  { id: 'throw-moss', title: 'Wool throw', options: 'Moss / 130 × 180 cm', price: 96, quantity: 1, image: picture('#dde5d6', '#6f8a5b') },
]

export const sampleShippingMethods: CheckoutShippingMethod[] = [
  { id: 'standard', title: 'Standard', description: '3 to 5 working days', price: 0 },
  { id: 'express', title: 'Express', description: '1 to 2 working days', price: 12 },
  { id: 'pickup', title: 'Collect in store', description: 'Ready in about two hours', price: 0 },
]

export const sampleCountries = ['Australia', 'Canada', 'France', 'Germany', 'Japan', 'United Kingdom', 'United States']
