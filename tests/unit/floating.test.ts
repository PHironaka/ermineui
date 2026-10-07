import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computePlacement } from '../../registry/lib/floating.ts'

const viewport = { width: 1000, height: 800 }
const box = (left: number, top: number, width = 100, height = 40) => ({ left, top, width, height, right: left + width, bottom: top + height })

test('sits below the anchor, centred, by default', () => {
  const placed = computePlacement(box(400, 100), 200, 150, viewport, { sideOffset: 6 })
  assert.deepEqual({ x: placed.x, y: placed.y, side: placed.side }, { x: 350, y: 146, side: 'bottom' })
})

test('start and end alignment line up with the anchor’s edges', () => {
  assert.equal(computePlacement(box(400, 100), 200, 150, viewport, { align: 'start' }).x, 400)
  assert.equal(computePlacement(box(400, 100), 200, 150, viewport, { align: 'end' }).x, 300)
})

test('flips to the other side when there is no room, but only if that side is better', () => {
  const nearBottom = computePlacement(box(400, 700), 200, 150, viewport, { side: 'bottom' })
  assert.equal(nearBottom.side, 'top')
  assert.equal(nearBottom.y, 550)
  // Too tall for either side: stays where there is more space instead of flipping back and forth.
  const tall = computePlacement(box(400, 500), 200, 600, viewport, { side: 'bottom' })
  assert.equal(tall.side, 'top')
  const tallNearTop = computePlacement(box(400, 100), 200, 900, viewport, { side: 'bottom' })
  assert.equal(tallNearTop.side, 'bottom')
})

test('shifts along the edge to stay inside the window', () => {
  assert.equal(computePlacement(box(10, 100), 300, 100, viewport).x, 8, 'kept 8px from the left edge')
  assert.equal(computePlacement(box(950, 100, 40), 300, 100, viewport).x, 692, 'kept 8px from the right edge')
})

test('left and right sides work the same way', () => {
  const right = computePlacement(box(100, 300), 200, 100, viewport, { side: 'right', sideOffset: 4 })
  assert.deepEqual({ x: right.x, y: right.y, side: right.side }, { x: 204, y: 270, side: 'right' })
  assert.equal(computePlacement(box(880, 300), 200, 100, viewport, { side: 'right' }).side, 'left')
})

test('reports the space available on the chosen side', () => {
  const placed = computePlacement(box(400, 100), 200, 150, viewport, { sideOffset: 4 })
  assert.equal(placed.available, 800 - 140 - 8 - 4)
})
