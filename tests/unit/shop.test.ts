import assert from 'node:assert/strict'
import { test } from 'node:test'
import { facetOptions } from '../../registry/ui/filter-bar/facets.ts'
import { applyMask, caretAfter, digitsOnly, masks, unmask } from '../../registry/ui/masked-input/mask.ts'
import { formatMoney, percentOff } from '../../registry/ui/price/money.ts'

test('applyMask adds a separator only once something follows it', () => {
  assert.equal(applyMask('', masks.expiry), '')
  assert.equal(applyMask('12', masks.expiry), '12')
  assert.equal(applyMask('123', masks.expiry), '12/3')
  assert.equal(applyMask('4242424242424242', masks.card), '4242 4242 4242 4242')
  assert.equal(applyMask('378282246310005', masks.amex), '3782 822463 10005')
  assert.equal(applyMask('5', masks.phoneUS), '(5')
  assert.equal(applyMask('5550100199', masks.phoneUS), '(555) 010-0199')
})

test('unmask keeps what fits the mask and stops when it is full', () => {
  assert.equal(unmask('4242 4242', masks.card), '42424242')
  assert.equal(unmask('42x4-2', masks.card), '4242')
  assert.equal(unmask('(555) 010-0199 ext 7', masks.phoneUS), '5550100199')
  assert.equal(unmask('ab12cd', 'AA## AA'), 'ab12cd')
  // A digit where a letter is wanted is skipped, not allowed to shift everything along.
  assert.equal(unmask('1ab12', 'AA##'), 'ab12')
  assert.equal(unmask('a1!', '***'), 'a1')
})

test('masking and unmasking undo each other', () => {
  for (const [raw, mask] of [['1227', masks.expiry], ['4242424242424242', masks.card], ['5550100199', masks.phoneUS], ['90210', masks.zipUS]] as const) {
    assert.equal(unmask(applyMask(raw, mask), mask), raw)
  }
})

test('caretAfter finds where a number of typed characters ends in the laid-out text', () => {
  assert.equal(caretAfter('1234 5678', masks.card, 0), 0)
  assert.equal(caretAfter('1234 5678', masks.card, 4), 4)
  assert.equal(caretAfter('1234 5678', masks.card, 5), 6)
  assert.equal(caretAfter('(555) 010', masks.phoneUS, 1), 2)
  assert.equal(caretAfter('12/3', masks.expiry, 9), 4)
})

test('digitsOnly tells a number-pad mask from one that needs letters', () => {
  assert.equal(digitsOnly(masks.card), true)
  assert.equal(digitsOnly('AA## ####'), false)
  assert.equal(digitsOnly('***-***'), false)
})

test('formatMoney follows the currency and the locale', () => {
  assert.equal(formatMoney(24.5), '$24.50')
  assert.equal(formatMoney(1299, 'JPY', 'en-US'), '¥1,299')
  assert.match(formatMoney(1299, 'EUR', 'de-DE'), /^1\.299,00\s€$/)
})

test('percentOff is a whole percentage, and zero unless the price really went down', () => {
  assert.equal(percentOff(96, 120), 20)
  assert.equal(percentOff(19.99, 29.99), 33)
  assert.equal(percentOff(120, 120), 0)
  assert.equal(percentOff(130, 120), 0)
  assert.equal(percentOff(10, undefined), 0)
  assert.equal(percentOff(10, 0), 0)
})

test('facetOptions counts each value and lists them in order', () => {
  const rows = [{ status: 'Ready' }, { status: 'Failed' }, { status: 'Ready' }, { status: null }, { status: '' }, {}]
  assert.deepEqual(facetOptions(rows, 'status'), [
    { value: 'Failed', count: 1 },
    { value: 'Ready', count: 2 },
  ])
  assert.deepEqual(facetOptions([{ version: 'v10' }, { version: 'v2' }], 'version').map((option) => option.value), ['v2', 'v10'])
})
