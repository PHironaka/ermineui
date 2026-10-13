/**
 * Made-up products so the listing has something to show. Replace this file with your own data,
 * or pass your own through the props of ProductListing.vue.
 */

export interface ListingProduct {
  id: string
  title: string
  /** Where the product's own page is. */
  href?: string
  image: string
  /** Maker or collection. One of the things the list can be filtered by. */
  brand: string
  /** What kind of thing it is. The other thing the list can be filtered by. */
  category: string
  /** In whole units of the currency. */
  price: number
  /** The price before a reduction. */
  compareAt?: number
  /** Average score out of five. */
  rating?: number
  /** How many reviews the score is from. */
  reviews?: number
  /** A short label over the corner of the picture, e.g. "New". */
  badge?: string
}

export type ListingSort = 'featured' | 'price-asc' | 'price-desc' | 'rating'

// Stand-in pictures drawn as SVG, so the block needs no image files and no network.
const picture = (background: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/></svg>`,
  )}`

export const sampleProducts: ListingProduct[] = [
  { id: 'mug', title: 'Stoneware mug', brand: 'Hearth & Kiln', category: 'Kitchen', price: 24, compareAt: 30, rating: 4.6, reviews: 128, badge: 'Sale', image: picture('#efe7da', '#c9b79c') },
  { id: 'throw', title: 'Wool throw', brand: 'Northfold', category: 'Living', price: 96, rating: 4.8, reviews: 64, image: picture('#dde5d6', '#6f8a5b') },
  { id: 'lamp', title: 'Desk lamp', brand: 'Lumen Works', category: 'Lighting', price: 148.5, rating: 4.3, reviews: 41, badge: 'New', image: picture('#dfe3ea', '#2f3a4f') },
  { id: 'bowl', title: 'Serving bowl', brand: 'Hearth & Kiln', category: 'Kitchen', price: 42, rating: 4.7, reviews: 87, image: picture('#f1e4dc', '#b9735a') },
  { id: 'cushion', title: 'Linen cushion', brand: 'Northfold', category: 'Living', price: 38, rating: 4.1, reviews: 23, image: picture('#e9e4d8', '#a39a7f') },
  { id: 'pendant', title: 'Pendant light', brand: 'Lumen Works', category: 'Lighting', price: 210, compareAt: 260, rating: 4.9, reviews: 19, badge: 'Sale', image: picture('#e3e0ea', '#5b4f7a') },
  { id: 'jug', title: 'Water jug', brand: 'Hearth & Kiln', category: 'Kitchen', price: 56, rating: 4.4, reviews: 52, image: picture('#dfe9ea', '#4f7a80') },
  { id: 'rug', title: 'Flatweave rug', brand: 'Northfold', category: 'Living', price: 320, rating: 4.5, reviews: 34, image: picture('#ebdfd6', '#8a5b4a') },
  { id: 'candle', title: 'Beeswax candles', brand: 'Lumen Works', category: 'Lighting', price: 18, rating: 4.2, reviews: 210, image: picture('#f3ecd6', '#d1a93c') },
  { id: 'board', title: 'Oak chopping board', brand: 'Hearth & Kiln', category: 'Kitchen', price: 64, rating: 4.8, reviews: 73, badge: 'New', image: picture('#efe3d0', '#9c7447') },
]
