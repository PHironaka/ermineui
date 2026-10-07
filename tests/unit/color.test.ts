import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hexToHsv, hsvToHex, normalizeHex } from '../../registry/ui/color-picker/color.ts'

test('normalizeHex accepts the usual ways of writing a colour', () => {
  assert.equal(normalizeHex('#2A78D6'), '#2a78d6')
  assert.equal(normalizeHex('2a78d6'), '#2a78d6')
  assert.equal(normalizeHex('#0f8'), '#00ff88')
  assert.equal(normalizeHex('  #fff '), '#ffffff')
  for (const bad of ['', '#12', '#12345', 'red', '#gggggg', '#1234567']) assert.equal(normalizeHex(bad), undefined)
})

test('known colours convert to the expected hue, saturation and value', () => {
  assert.deepEqual(hexToHsv('#ff0000'), { h: 0, s: 1, v: 1 })
  assert.deepEqual(hexToHsv('#00ff00'), { h: 120, s: 1, v: 1 })
  assert.deepEqual(hexToHsv('#0000ff'), { h: 240, s: 1, v: 1 })
  assert.deepEqual(hexToHsv('#000000'), { h: 0, s: 0, v: 0 })
  assert.deepEqual(hexToHsv('#ffffff'), { h: 0, s: 0, v: 1 })
})

test('converting to HSV and back gives the same colour', () => {
  for (const hex of ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#808080', '#010203']) {
    assert.equal(hsvToHex(hexToHsv(hex)), hex)
  }
})

test('hsvToHex covers the corners of the picker', () => {
  assert.equal(hsvToHex({ h: 213, s: 0, v: 1 }), '#ffffff', 'top left is white whatever the hue')
  assert.equal(hsvToHex({ h: 213, s: 1, v: 0 }), '#000000', 'the bottom edge is black')
  assert.equal(hsvToHex({ h: 0, s: 1, v: 1 }), '#ff0000')
  assert.equal(hsvToHex({ h: 360, s: 1, v: 1 }), '#ff0000', 'hue wraps round')
})
