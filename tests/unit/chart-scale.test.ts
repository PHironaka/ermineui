import assert from 'node:assert/strict'
import { test } from 'node:test'
import { arcPath, barPath, niceScale, textWidth, toNumber } from '../../registry/ui/chart/scale.ts'

test('niceScale lands on round numbers that cover the data', () => {
  assert.deepEqual(niceScale(0, 66800).ticks, [0, 20000, 40000, 60000, 80000])
  assert.deepEqual(niceScale(0, 110).ticks, [0, 50, 100, 150])
  assert.deepEqual(niceScale(0, 71).ticks, [0, 20, 40, 60, 80])
  const scale = niceScale(3, 97)
  assert.ok(scale.min <= 3 && scale.max >= 97)
})

test('niceScale handles negatives, decimals and a flat line', () => {
  const negative = niceScale(-30, 45)
  assert.ok(negative.min <= -30 && negative.max >= 45 && negative.ticks.includes(0))
  // No 0.30000000000000004 on the axis.
  assert.deepEqual(niceScale(0, 0.4).ticks, [0, 0.1, 0.2, 0.3, 0.4])
  const flat = niceScale(5, 5)
  assert.ok(flat.max > flat.min, 'a single value still gets an axis with some height')
})

test('toNumber treats blanks and non-numbers as missing', () => {
  assert.equal(toNumber(12), 12)
  assert.equal(toNumber('12.5'), 12.5)
  assert.equal(toNumber(0), 0)
  for (const missing of [null, undefined, '', 'abc', Number.NaN, Infinity]) assert.equal(toNumber(missing), null)
})

test('barPath rounds the data end and keeps the base square', () => {
  const up = barPath(10, 100, 40, 20)
  assert.ok(up.startsWith('M10,100V44'), 'rises from the baseline and stops a radius short of the top')
  assert.ok(up.endsWith('V100Z'), 'comes back down to the baseline')
  const down = barPath(10, 100, 160, 20)
  assert.ok(down.startsWith('M10,100V156'), 'a negative bar rounds at the bottom')
})

test('barPath never rounds more than the bar has room for', () => {
  // A bar 2px tall cannot have 4px corners.
  assert.ok(barPath(0, 100, 98, 20).includes('V100Q0,98 2,98'))
  assert.ok(barPath(0, 100, 50, 20, 0).includes('V50Q0,50 0,50'), 'radius 0 gives square corners')
})

test('arcPath draws rings, pie slices and a full circle', () => {
  const ring = arcPath(50, 50, 50, 30, 0, Math.PI / 2)
  assert.ok(ring.startsWith('M50,0A50,50 0 0 1 100,50'), 'starts at 12 o’clock and goes clockwise')
  assert.ok(ring.includes('A30,30 0 0 0'), 'returns along the inner edge')
  const slice = arcPath(50, 50, 50, 0, 0, Math.PI / 2)
  assert.ok(slice.endsWith('L50,50Z'), 'a pie slice closes at the centre')
  const whole = arcPath(50, 50, 50, 30, 0, Math.PI * 2)
  assert.ok(whole.includes(' 1 1 '), 'a complete circle is drawn as a large arc, not as nothing')
})

test('textWidth grows with the text', () => {
  assert.ok(textWidth('80K') < textWidth('Served from cache'))
})
