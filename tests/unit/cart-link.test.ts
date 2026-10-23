import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cartLink, readCartLink, type CartProduct } from '../../registry/blocks/cart/share.ts'

const catalogue: CartProduct[] = [
  { id: 'mug-sand', title: 'Stoneware mug', price: 24 },
  { id: 'throw-moss', title: 'Wool throw', price: 96, max: 3 },
  { id: 'lamp:ink', title: 'Desk lamp', price: 148.5 },
  { id: 'vase', title: 'Vase', price: 40, max: 0 },
]
const find = (id: string) => catalogue.find((product) => product.id === id)

test('a link holds ids and quantities only, readably, and keeps the rest of the address', () => {
  const link = cartLink(
    [
      { id: 'mug-sand', quantity: 2 },
      { id: 'throw-moss', quantity: 1 },
    ],
    'https://shop.example/cart?ref=mail#top',
  )
  assert.equal(link, 'https://shop.example/cart?ref=mail&cart=mug-sand:2,throw-moss:1#top')
})

test('making a link again replaces the old lines, and an empty cart leaves none', () => {
  const once = cartLink([{ id: 'mug-sand', quantity: 2 }], 'https://shop.example/')
  assert.equal(cartLink([{ id: 'vase', quantity: 1 }], once), 'https://shop.example/?cart=vase:1')
  assert.equal(cartLink([], once), 'https://shop.example/')
  assert.equal(cartLink([{ id: 'mug-sand', quantity: 0 }], once), 'https://shop.example/')
})

test('a link reads back to the same cart, with each product looked up again', () => {
  const link = cartLink(
    [
      { id: 'mug-sand', quantity: 2 },
      { id: 'lamp:ink', quantity: 1 },
    ],
    'https://shop.example/',
    'basket',
  )
  assert.deepEqual(readCartLink(link, find, 'basket'), {
    items: [
      { id: 'mug-sand', title: 'Stoneware mug', price: 24, quantity: 2 },
      { id: 'lamp:ink', title: 'Desk lamp', price: 148.5, quantity: 1 },
    ],
    skipped: [],
    limited: [],
  })
})

test('prices always come from the catalogue, never from the link', () => {
  const shared = readCartLink('https://shop.example/?cart=mug-sand:1&price=0.01', find)
  assert.equal(shared?.items[0]?.price, 24)
})

test('a link with no cart in it, or no link at all, gives null', () => {
  assert.equal(readCartLink('https://shop.example/', find), null)
  assert.equal(readCartLink('not a link', find), null)
  assert.deepEqual(readCartLink('https://shop.example/?cart=', find), { items: [], skipped: [], limited: [] })
})

test('unknown ids, bad quantities and sold-out products are skipped and listed', () => {
  const shared = readCartLink('https://shop.example/?cart=mug-sand:1,gone:2,throw-moss:many,throw-moss:-1,lamp:ink:0,vase:1,mug-sand,,x:12345', find)
  assert.deepEqual(
    shared?.items.map((item) => [item.id, item.quantity]),
    [['mug-sand', 1]],
  )
  assert.deepEqual(shared?.skipped, ['throw-moss', 'throw-moss', 'lamp:ink', 'mug-sand', 'x', 'gone', 'vase'])
})

test('an id listed twice is one line, and nothing goes over what is in stock', () => {
  const shared = readCartLink('https://shop.example/?cart=mug-sand:2,throw-moss:2,mug-sand:3,throw-moss:5', find)
  assert.deepEqual(
    shared?.items.map((item) => [item.id, item.quantity]),
    [
      ['mug-sand', 5],
      ['throw-moss', 3],
    ],
  )
  assert.deepEqual(shared?.limited, ['Wool throw'])
})

test('a link that was re-encoded on the way, with %2C and %3A for the commas and colons, still reads', () => {
  const shared = readCartLink('https://shop.example/?cart=mug-sand%3A2%2Cthrow-moss%3A1', find)
  assert.deepEqual(
    shared?.items.map((item) => [item.id, item.quantity]),
    [
      ['mug-sand', 2],
      ['throw-moss', 1],
    ],
  )
})

test('a huge link is cut short, and an id with a comma cannot be written', () => {
  const long = `https://shop.example/?cart=${Array.from({ length: 500 }, (_, index) => `p${index}:1`).join(',')}`
  assert.equal(readCartLink(long, find)?.skipped.length, 100)
  assert.throws(() => cartLink([{ id: 'a,b', quantity: 1 }], 'https://shop.example/'), /must not contain a comma/)
})
