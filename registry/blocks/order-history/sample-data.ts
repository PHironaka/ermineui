/**
 * Made-up orders so the list has something to show. Replace this file with your own data,
 * or pass your own through the props of OrderHistory.vue.
 */

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface PastOrderItem {
  id: string
  title: string
  image?: string
  quantity: number
}

export interface PastOrder {
  /** The order's number, as the customer will quote it. */
  number: string
  /** When it was placed, as a date in ISO form: 2026-09-14. */
  date: string
  status: OrderStatus
  /** What was paid, in whole units of the currency. */
  total: number
  items: PastOrderItem[]
  /** A line about where things stand: "Arriving Friday", "Refunded to your card". */
  note?: string
  /** Where the carrier's tracking page is. */
  trackHref?: string
}

// Stand-in pictures drawn as SVG, so the block needs no image files and no network.
const picture = (background: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/></svg>`,
  )}`

export const sampleOrders: PastOrder[] = [
  {
    number: 'ER-10482',
    date: '2026-10-12',
    status: 'processing',
    total: 139.97,
    note: 'Arriving Friday, October 16.',
    items: [
      { id: 'mug-sand', title: 'Stoneware mug', quantity: 2, image: picture('#efe7da', '#c9b79c') },
      { id: 'throw-moss', title: 'Wool throw', quantity: 1, image: picture('#dde5d6', '#6f8a5b') },
    ],
  },
  {
    number: 'ER-10317',
    date: '2026-09-28',
    status: 'shipped',
    total: 148.5,
    note: 'Out for delivery today.',
    trackHref: '#track-ER-10317',
    items: [{ id: 'lamp-ink', title: 'Desk lamp', quantity: 1, image: picture('#dfe3ea', '#2f3a4f') }],
  },
  {
    number: 'ER-09951',
    date: '2026-08-03',
    status: 'delivered',
    total: 98,
    items: [
      { id: 'bowl', title: 'Serving bowl', quantity: 1, image: picture('#f1e4dc', '#b9735a') },
      { id: 'jug', title: 'Water jug', quantity: 1, image: picture('#dfe9ea', '#4f7a80') },
    ],
  },
  {
    number: 'ER-09604',
    date: '2026-06-19',
    status: 'cancelled',
    total: 38,
    note: 'Refunded to your card.',
    items: [{ id: 'cushion', title: 'Linen cushion', quantity: 1, image: picture('#e9e4d8', '#a39a7f') }],
  },
]
