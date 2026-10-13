/**
 * A made-up product so the page has something to show. Replace this file with your own data,
 * or pass your own through the props of ProductDetail.vue.
 */

export interface ProductOptionValue {
  value: string
  /** What to call it. The value itself is shown when there is none. */
  label?: string
  /** Any CSS colour. With one, the choice is drawn as a round dot of that colour. */
  color?: string
  /** Sold out, or not made: shown struck through and cannot be chosen. */
  unavailable?: boolean
}

export interface ProductOption {
  /** What is being chosen: "Colour", "Size". */
  name: string
  values: ProductOptionValue[]
}

export interface ProductReview {
  id: string
  author: string
  /** The score given, out of five. */
  rating: number
  title?: string
  body: string
  /** When it was written, as a date in ISO form: 2026-09-14. */
  date?: string
  verified?: boolean
}

export interface ProductDetailData {
  id: string
  title: string
  /** Maker or collection, shown small above the title. */
  brand?: string
  /** In whole units of the currency. */
  price: number
  /** The price before a reduction. */
  compareAt?: number
  /** How many are left. */
  stock: number
  images: Array<{ src: string; alt: string }>
  options: ProductOption[]
  description: string
  /** Facts about the product, as labels and values: material, size, care. */
  details: Array<{ label: string; value: string }>
  /** A line about delivery and returns. */
  shipping?: string
  /** How many reviews gave each score, lowest first: [1 star, 2 stars, 3 stars, 4 stars, 5 stars]. */
  ratingCounts: number[]
  reviews: ProductReview[]
}

/** What is handed over when "Add to cart" is pressed. */
export interface ProductSelection {
  id: string
  /** The choice made for each option, by the option's name. */
  options: Record<string, string>
  quantity: number
}

// Stand-in pictures drawn as SVG, so the block needs no image files and no network.
const picture = (background: string, shape: string, extra = '') =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/>${extra}</svg>`,
  )}`

export const sampleProduct: ProductDetailData = {
  id: 'mug',
  title: 'Stoneware mug',
  brand: 'Hearth & Kiln',
  price: 24,
  compareAt: 30,
  stock: 4,
  images: [
    { src: picture('#efe7da', '#c9b79c'), alt: 'The mug from the front' },
    { src: picture('#e6dccb', '#c9b79c', '<path d="M86 44h8a10 10 0 0 1 0 20h-8" fill="none" stroke="#c9b79c" stroke-width="6"/>'), alt: 'The mug from the side, showing its handle' },
    { src: picture('#f4eee4', '#b9a585', '<circle cx="60" cy="60" r="18" fill="#a8946f"/>'), alt: 'The glaze up close' },
  ],
  options: [
    {
      name: 'Colour',
      values: [
        { value: 'sand', label: 'Sand', color: '#c9b79c' },
        { value: 'moss', label: 'Moss', color: '#6f8a5b' },
        { value: 'ink', label: 'Ink', color: '#2f3a4f' },
        { value: 'chalk', label: 'Chalk', color: '#f5f3ee', unavailable: true },
      ],
    },
    {
      name: 'Size',
      values: [
        { value: '250', label: '250 ml' },
        { value: '350', label: '350 ml' },
        { value: '500', label: '500 ml', unavailable: true },
      ],
    },
  ],
  description: 'Thrown by hand and glazed twice, so no two are quite alike. It holds its heat, sits well in the hand, and goes in the dishwasher.',
  details: [
    { label: 'Material', value: 'Stoneware, lead-free glaze' },
    { label: 'Made in', value: 'Portugal' },
    { label: 'Care', value: 'Dishwasher and microwave safe' },
  ],
  shipping: 'Free delivery over $50. Returns within 30 days.',
  ratingCounts: [1, 2, 6, 31, 88],
  reviews: [
    { id: 'r1', author: 'Maya R.', rating: 5, title: 'My everyday mug now', body: 'Heavier than it looks, in a good way. The glaze has real depth to it.', date: '2026-09-14', verified: true },
    { id: 'r2', author: 'Tomás L.', rating: 4, title: 'Lovely, a little small', body: 'I would go up a size next time. Beautifully made all the same.', date: '2026-08-30', verified: true },
    { id: 'r3', author: 'Ines K.', rating: 5, body: 'Bought four. Each one is slightly different, which is the charm.', date: '2026-08-02' },
  ],
}
