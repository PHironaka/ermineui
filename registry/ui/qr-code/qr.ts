/**
 * A QR code generator, written out in full so there is nothing to install and no service to call.
 * It encodes text as bytes (UTF-8), which covers links, Wi-Fi details, contact cards and plain text.
 *
 * The steps, in the order the code runs them:
 *   1. pick the smallest size ("version" 1 to 40) the text fits in
 *   2. turn the text into data bytes, padded to fill that size
 *   3. add error-correction bytes, so a scuffed or partly covered code still scans
 *   4. draw the fixed patterns every QR code has (the three corner squares and so on)
 *   5. lay the bytes into the remaining squares in a zigzag
 *   6. try the eight standard "masks" and keep the one that scans most reliably
 */

/** How much damage the code survives: L about 7%, M 15%, Q 25%, H 30%. Higher levels hold less text. */
export type QrLevel = 'L' | 'M' | 'Q' | 'H'

const LEVELS: Record<QrLevel, { index: number; formatBits: number }> = {
  L: { index: 0, formatBits: 1 },
  M: { index: 1, formatBits: 0 },
  Q: { index: 2, formatBits: 3 },
  H: { index: 3, formatBits: 2 },
}

// From the QR code standard: for each level and version, how many error-correction bytes go in each
// block, and how many blocks the data is split into. Index 0 is unused (versions start at 1).
// prettier-ignore
const ECC_BYTES_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
]
// prettier-ignore
const BLOCK_COUNT = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
]

/** How many squares in a code of this version are free to hold data, once the fixed patterns are drawn. */
function rawModuleCount(version: number): number {
  let count = (16 * version + 128) * version + 64
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2
    count -= (25 * align - 10) * align - 55
    if (version >= 7) count -= 36
  }
  return count
}

/** How many bytes of actual content fit, after error correction takes its share. */
function dataByteCount(version: number, level: QrLevel): number {
  const index = LEVELS[level].index
  return Math.floor(rawModuleCount(version) / 8) - ECC_BYTES_PER_BLOCK[index]![version]! * BLOCK_COUNT[index]![version]!
}

/** The largest text, in bytes, that fits at this level. Accented letters, emoji and non-Latin scripts take more than one byte each. */
export function qrCapacity(level: QrLevel): number {
  return dataByteCount(40, level) - 3
}

// ---------- error correction (Reed–Solomon over GF(256)) ----------

function multiply(x: number, y: number): number {
  let z = 0
  for (let bit = 7; bit >= 0; bit--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> bit) & 1) * x
  }
  return z & 0xff
}

function divisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = multiply(result[j]!, root)
      if (j + 1 < degree) result[j]! ^= result[j + 1]!
    }
    root = multiply(root, 2)
  }
  return result
}

function remainder(data: number[], generator: number[]): number[] {
  const result = generator.map(() => 0)
  for (const byte of data) {
    const factor = byte ^ result.shift()!
    result.push(0)
    generator.forEach((coefficient, index) => (result[index]! ^= multiply(coefficient, factor)))
  }
  return result
}

/** Splits the data into blocks, gives each its error-correction bytes, and deals them out in turn. */
function withErrorCorrection(data: number[], version: number, level: QrLevel): number[] {
  const index = LEVELS[level].index
  const blockCount = BLOCK_COUNT[index]![version]!
  const eccLength = ECC_BYTES_PER_BLOCK[index]![version]!
  const total = Math.floor(rawModuleCount(version) / 8)
  const shortBlocks = blockCount - (total % blockCount)
  const shortLength = Math.floor(total / blockCount)
  const generator = divisor(eccLength)

  const blocks: number[][] = []
  for (let block = 0, offset = 0; block < blockCount; block++) {
    const length = shortLength - eccLength + (block < shortBlocks ? 0 : 1)
    const chunk = data.slice(offset, offset + length)
    offset += length
    const ecc = remainder(chunk, generator)
    // Short blocks get a placeholder so every block is the same length; it is skipped when dealing out.
    if (block < shortBlocks) chunk.push(0)
    blocks.push(chunk.concat(ecc))
  }

  const result: number[] = []
  for (let position = 0; position < blocks[0]!.length; position++) {
    blocks.forEach((block, number) => {
      if (position !== shortLength - eccLength || number >= shortBlocks) result.push(block[position]!)
    })
  }
  return result
}

// ---------- drawing ----------

/**
 * Makes a QR code. Returns a square grid: `modules[row][column]` is true for a dark square.
 * Throws if the text is too long for a QR code at this level.
 */
export function createQr(text: string, level: QrLevel = 'M'): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text))

  // 1. The smallest version that fits. Larger versions spend 16 bits on the length instead of 8.
  let version = 1
  for (; ; version++) {
    if (version > 40) throw new RangeError('This is too much text for a QR code.')
    const needed = 4 + (version <= 9 ? 8 : 16) + bytes.length * 8
    if (needed <= dataByteCount(version, level) * 8) break
  }

  // 2. Mode marker ("bytes"), the length, the bytes, then padding out to the full capacity.
  const capacity = dataByteCount(version, level) * 8
  const bits: number[] = []
  const append = (value: number, length: number) => {
    for (let bit = length - 1; bit >= 0; bit--) bits.push((value >>> bit) & 1)
  }
  append(0b0100, 4)
  append(bytes.length, version <= 9 ? 8 : 16)
  for (const byte of bytes) append(byte, 8)
  append(0, Math.min(4, capacity - bits.length))
  append(0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) append(pad, 8)

  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((byte, bit) => (byte << 1) | bit, 0))

  // 3.
  const codewords = withErrorCorrection(data, version, level)

  const size = version * 4 + 17
  const modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  /** Squares that belong to a fixed pattern. Data is laid around them and masks leave them alone. */
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const set = (x: number, y: number, dark: boolean) => {
    modules[y]![x] = dark
    reserved[y]![x] = true
  }

  // 4. Timing lines: alternating squares that let a scanner count rows and columns.
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }

  // The three big corner squares a scanner looks for first.
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, distance !== 2 && distance !== 4)
      }
    }
  }

  // Smaller squares spread through larger codes, to correct for a bent or tilted surface.
  const alignment: number[] = []
  if (version > 1) {
    const count = Math.floor(version / 7) + 2
    const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2
    alignment.push(6)
    for (let position = size - 7; alignment.length < count; position -= step) alignment.splice(1, 0, position)
  }
  alignment.forEach((cy, row) => {
    alignment.forEach((cx, column) => {
      const last = alignment.length - 1
      // Not where the three corner squares already are.
      if ((row === 0 && column === 0) || (row === 0 && column === last) || (row === last && column === 0)) return
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    })
  })

  /** Writes the level and mask next to the corner squares (twice, in case one copy is damaged). */
  const drawFormat = (mask: number) => {
    const value = (LEVELS[level].formatBits << 3) | mask
    let rem = value
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const format = ((value << 10) | rem) ^ 0x5412
    const bit = (i: number) => ((format >>> i) & 1) !== 0

    for (let i = 0; i <= 5; i++) set(8, i, bit(i))
    set(8, 7, bit(6))
    set(8, 8, bit(7))
    set(7, 8, bit(8))
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i))

    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i))
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i))
    set(8, size - 8, true)
  }
  drawFormat(0)

  // Larger codes also state their version, beside two of the corner squares.
  if (version >= 7) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const info = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const dark = ((info >>> i) & 1) !== 0
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      set(a, b, dark)
      set(b, a, dark)
    }
  }

  // 5. The data, two columns at a time, snaking up and down from the bottom-right corner.
  let index = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let step = 0; step < size; step++) {
      for (let column = 0; column < 2; column++) {
        const x = right - column
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - step : step
        if (!reserved[y]![x] && index < codewords.length * 8) {
          modules[y]![x] = ((codewords[index >>> 3]! >>> (7 - (index & 7))) & 1) !== 0
          index++
        }
      }
    }
  }

  // 6. A mask flips some data squares in a regular pattern, to break up large blank areas and shapes
  // that could be mistaken for a corner square. Applying the same mask twice undoes it.
  const MASKS: Array<(x: number, y: number) => boolean> = [
    (x, y) => (x + y) % 2 === 0,
    (_x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ]
  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!reserved[y]![x] && MASKS[mask]!(x, y)) modules[y]![x] = !modules[y]![x]
  }

  /** The standard's score for how hard a pattern is to scan. Lower is better. */
  const penalty = (): number => {
    let score = 0
    // Long runs of one colour, and anything resembling a corner square, in rows then in columns.
    for (const line of [modules, modules.map((_row, x) => modules.map((row) => row[x]!))].flat()) {
      let run = 1
      for (let i = 1; i <= size; i++) {
        if (i < size && line[i] === line[i - 1]) run++
        else {
          if (run >= 5) score += run - 2
          run = 1
        }
      }
      const text = line.map((dark) => (dark ? '1' : '0')).join('')
      for (const pattern of ['10111010000', '00001011101']) for (let at = text.indexOf(pattern); at !== -1; at = text.indexOf(pattern, at + 1)) score += 40
    }
    // Solid 2 × 2 blocks.
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const dark = modules[y]![x]
        if (dark === modules[y]![x + 1] && dark === modules[y + 1]![x] && dark === modules[y + 1]![x + 1]) score += 3
      }
    }
    // Being far from half dark, half light.
    const dark = modules.flat().filter(Boolean).length
    const total = size * size
    score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10
    return score
  }

  let best = 0
  let lowest = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask)
    drawFormat(mask)
    const score = penalty()
    if (score < lowest) [best, lowest] = [mask, score]
    applyMask(mask)
  }
  applyMask(best)
  drawFormat(best)

  return modules
}
