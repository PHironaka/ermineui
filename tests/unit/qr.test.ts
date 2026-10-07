import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { createQr, qrCapacity, type QrLevel } from '../../registry/ui/qr-code/qr.ts'

// The generator is checked the only way that counts: an independent QR reader has to get the text back.
const jsQR = createRequire(import.meta.url)('jsqr') as (data: Uint8ClampedArray, width: number, height: number) => { data: string; version: number } | null

/** Paints the grid as a black-and-white picture, with the blank border scanners need, and reads it back. */
function scan(modules: boolean[][], scale = 4, margin = 4) {
  const size = (modules.length + margin * 2) * scale
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255)
  modules.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (!dark) return
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const at = (((y + margin) * scale + dy) * size + (x + margin) * scale + dx) * 4
          pixels[at] = pixels[at + 1] = pixels[at + 2] = 0
        }
      }
    }),
  )
  return jsQR(pixels, size, size)
}

const levels: QrLevel[] = ['L', 'M', 'Q', 'H']
/** Text of an exact length in bytes, different at each length so a stale result cannot pass. */
const filler = (length: number) => Array.from({ length }, (_item, index) => String.fromCharCode(48 + ((index * 7 + length) % 75))).join('')

test('a link scans back as the same link, at every level', () => {
  for (const level of levels) {
    const result = scan(createQr('https://example.com/docs?ref=ermine', level))
    assert.equal(result?.data, 'https://example.com/docs?ref=ermine', `level ${level}`)
  }
})

test('the grid is square and the right size for its version', () => {
  const small = createQr('hi', 'L')
  assert.equal(small.length, 21, 'version 1 is 21 squares across')
  assert.ok(small.every((row) => row.length === 21))
  // 100 bytes at level M needs version 6, which is 41 squares across.
  assert.equal(createQr(filler(100), 'M').length, 41)
})

test('every version from 1 to 40 scans, at every level', () => {
  for (const level of levels) {
    let previous = 0
    for (let version = 1; version <= 40; version++) {
      // The longest text that fits in this version: grow until the grid gets bigger.
      let low = previous + 1
      let high = qrCapacity(level)
      const size = version * 4 + 17
      while (low < high) {
        const middle = Math.ceil((low + high) / 2)
        if (createQr(filler(middle), level).length <= size) low = middle
        else high = middle - 1
      }
      const text = filler(low)
      const modules = createQr(text, level)
      assert.equal(modules.length, size, `version ${version} level ${level} holds ${low} bytes`)
      previous = low
      // The reader used here has one wrong entry in its own tables: for version 23 it expects an alignment
      // square at 74 where the standard puts it at 78. Higher levels have enough error correction to absorb
      // that; level L does not. That one case is checked against the standard in the next test instead.
      if (version === 23 && level === 'L') continue
      const result = scan(modules, 3)
      assert.equal(result?.data, text, `version ${version} level ${level} (${low} bytes) scans`)
      assert.equal(result?.version, version)
    }
  }
})

test('alignment squares sit where the standard puts them', () => {
  // From the standard's table of alignment pattern positions.
  const expected: Record<number, number[]> = { 2: [6, 18], 7: [6, 22, 38], 14: [6, 26, 46, 66], 23: [6, 30, 54, 78, 102], 32: [6, 34, 60, 86, 112, 138], 40: [6, 30, 58, 86, 114, 142, 170] }
  for (const [version, centres] of Object.entries(expected)) {
    const size = Number(version) * 4 + 17
    let length = 1
    while (createQr(filler(length), 'L').length < size) length += 8
    const modules = createQr(filler(length), 'L')
    assert.equal(modules.length, size)
    const last = centres.length - 1
    centres.forEach((y, row) =>
      centres.forEach((x, column) => {
        // The three corners hold the big finder squares instead.
        if ((row === 0 && column === 0) || (row === 0 && column === last) || (row === last && column === 0)) return
        // A dark centre, a light ring round it, a dark ring round that.
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ring = Math.max(Math.abs(dx), Math.abs(dy))
            assert.equal(modules[y + dy]![x + dx], ring !== 1, `version ${version}: alignment square at ${x},${y}`)
          }
        }
      }),
    )
  }
})

test('text beyond plain letters survives: accents, emoji, other scripts, line breaks', () => {
  for (const text of ['Zoë Kovač — café ☕', '東京タワー', 'مرحبا', '🎉 Shipped!\nSee you there.', 'WIFI:T:WPA;S:Northwind Guest;P:s3cret;;']) {
    assert.equal(scan(createQr(text, 'M'))?.data, text)
  }
})

test('the same text always gives the same code', () => {
  assert.deepEqual(createQr('repeatable', 'Q'), createQr('repeatable', 'Q'))
})

test('a higher level makes a bigger code for the same text, since more of it is spare', () => {
  const text = filler(60)
  assert.ok(createQr(text, 'H').length > createQr(text, 'L').length)
})

test('too much text is refused, not truncated', () => {
  assert.throws(() => createQr(filler(qrCapacity('H') + 1), 'H'), RangeError)
  assert.doesNotThrow(() => createQr(filler(qrCapacity('H')), 'H'))
  assert.equal(qrCapacity('L'), 2953, 'the standard’s figure for the largest code')
})
