/**
 * A link to a cart: the address of a page with the cart's lines in one query parameter, e.g.
 * https://shop.example/cart?cart=mug-sand:2,lamp-ink:1
 *
 * The link carries product ids and quantities only. Titles, pictures and prices are looked up again by whoever opens
 * it, from your own catalogue, so a link that has been edited cannot change a price, and an old link shows today's.
 */
import type { CartItem } from './sample-data'

/** What a cart line is, apart from how many: what your catalogue knows about a product. */
export type CartProduct = Omit<CartItem, 'quantity'>

export interface SharedCart {
  /** The lines that could be put back, in the order the link lists them. */
  items: CartItem[]
  /** Ids in the link that the catalogue does not have, or lines that were not written properly. */
  skipped: string[]
  /** Titles of the lines that asked for more than `max` and were brought down to it. */
  limited: string[]
}

/** More lines than any real cart holds: a link with more is cut short rather than read in full. */
const MOST_LINES = 100
/** The most of one thing a link can ask for. */
const MOST_OF_ONE = 999

/**
 * The link to share: `base` (by default the page's own address) with the cart's lines in the `param` query
 * parameter, replacing any lines already there. Other parameters and the #fragment are kept.
 */
export function cartLink(items: readonly Pick<CartItem, 'id' | 'quantity'>[], base: string | URL, param = 'cart'): string {
  const url = new URL(base)
  url.searchParams.delete(param)
  const lines = items
    .filter((item) => item.quantity > 0)
    .map((item) => {
      // A comma would read back as the start of the next line.
      if (item.id.includes(',')) throw new Error(`[ermine] A cart link cannot hold the id "${item.id}": ids must not contain a comma.`)
      return `${encodeURIComponent(item.id)}:${Math.round(item.quantity)}`
    })
  if (lines.length === 0) return url.href
  // Written by hand rather than through searchParams, which would turn every comma and colon into %2C and %3A.
  url.search = `${url.search ? `${url.search}&` : '?'}${encodeURIComponent(param)}=${lines.join(',')}`
  return url.href
}

/**
 * The cart a link holds, with each line looked up by `find`, or null when the link has no cart in it.
 * Lines `find` does not know, and lines that are not an id and a whole number, are left out and listed in
 * `skipped`; an id listed twice is one line with both quantities; a quantity over the product's `max` is lowered.
 */
export function readCartLink(link: string | URL, find: (id: string) => CartProduct | undefined, param = 'cart'): SharedCart | null {
  let value: string | null
  try {
    value = new URL(link).searchParams.get(param)
  } catch {
    return null
  }
  if (value === null) return null

  const quantities = new Map<string, number>()
  const skipped: string[] = []
  for (const line of value.split(',').slice(0, MOST_LINES)) {
    if (!line) continue
    // The quantity is after the last colon, so an id may have colons of its own.
    const split = line.lastIndexOf(':')
    const id = split > 0 ? line.slice(0, split) : line
    const count = split > 0 ? line.slice(split + 1) : ''
    if (!/^\d{1,4}$/.test(count) || Number(count) === 0) {
      skipped.push(id)
      continue
    }
    quantities.set(id, Math.min(MOST_OF_ONE, (quantities.get(id) ?? 0) + Number(count)))
  }

  const items: CartItem[] = []
  const limited: string[] = []
  for (const [id, wanted] of quantities) {
    const product = find(id)
    if (!product) {
      skipped.push(id)
      continue
    }
    const quantity = product.max === undefined ? wanted : Math.min(wanted, product.max)
    // Sold out: there is nothing of it to put in the cart.
    if (quantity < 1) {
      skipped.push(id)
      continue
    }
    if (quantity < wanted) limited.push(product.title)
    items.push({ ...product, id, quantity })
  }
  return { items, skipped, limited }
}
