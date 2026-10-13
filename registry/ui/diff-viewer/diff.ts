export interface DiffLine {
  type: 'same' | 'added' | 'removed'
  text: string
  /** The line's number in the old text. Added lines have none. */
  before?: number
  /** The line's number in the new text. Removed lines have none. */
  after?: number
}

export interface DiffHunk {
  /** Where the hunk starts in each text, as line numbers. */
  beforeStart: number
  afterStart: number
  lines: DiffLine[]
}

const split = (text: string) => (text === '' ? [] : text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n'))

/**
 * Compares two texts line by line and says which lines stayed, which were taken out and which were put in.
 * It finds the longest run of lines the two have in common, so the changes it reports are as few as can be.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = split(before)
  const b = split(after)

  // Lines the two share at the start and the end need no comparing, which keeps the table below small.
  let head = 0
  while (head < a.length && head < b.length && a[head] === b[head]) head++
  let tail = 0
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++

  const middleA = a.slice(head, a.length - tail)
  const middleB = b.slice(head, b.length - tail)
  const rows = middleA.length
  const columns = middleB.length

  // lengths[i][j]: how many lines the rest of each text, from line i and line j on, have in common.
  const lengths = Array.from({ length: rows + 1 }, () => new Uint32Array(columns + 1))
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = columns - 1; j >= 0; j--) {
      lengths[i][j] = middleA[i] === middleB[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }

  const lines: DiffLine[] = []
  let beforeNumber = 1
  let afterNumber = 1
  const same = (text: string) => lines.push({ type: 'same', text, before: beforeNumber++, after: afterNumber++ })

  for (let index = 0; index < head; index++) same(a[index])
  let i = 0
  let j = 0
  while (i < rows || j < columns) {
    if (i < rows && j < columns && middleA[i] === middleB[j]) {
      same(middleA[i])
      i++
      j++
    } else if (i < rows && (j === columns || lengths[i + 1][j] >= lengths[i][j + 1])) {
      // Removals are listed before the additions that replace them, as readers expect.
      lines.push({ type: 'removed', text: middleA[i++], before: beforeNumber++ })
    } else {
      lines.push({ type: 'added', text: middleB[j++], after: afterNumber++ })
    }
  }
  for (let index = a.length - tail; index < a.length; index++) same(a[index])

  return lines
}

/** Cuts a diff down to its changes, each with a few unchanged lines around it. Changes close together share a hunk. */
export function diffHunks(lines: readonly DiffLine[], context = 3): DiffHunk[] {
  const keep = new Uint8Array(lines.length)
  lines.forEach((line, index) => {
    if (line.type === 'same') return
    for (let near = Math.max(0, index - context); near <= Math.min(lines.length - 1, index + context); near++) keep[near] = 1
  })

  const hunks: DiffHunk[] = []
  let current: DiffHunk | undefined
  let beforeNext = 1
  let afterNext = 1
  lines.forEach((line, index) => {
    if (keep[index]) {
      current ??= hunks[hunks.push({ beforeStart: line.before ?? beforeNext, afterStart: line.after ?? afterNext, lines: [] }) - 1]
      current.lines.push(line)
    } else {
      current = undefined
    }
    if (line.before !== undefined) beforeNext = line.before + 1
    if (line.after !== undefined) afterNext = line.after + 1
  })
  return hunks
}

/** How many lines were put in and taken out. */
export function diffStats(lines: readonly DiffLine[]): { added: number; removed: number } {
  return { added: lines.filter((line) => line.type === 'added').length, removed: lines.filter((line) => line.type === 'removed').length }
}
