export type Orientation = 'horizontal' | 'vertical'

/**
 * Arrow-key navigation for a list of items (tabs, menu items, options).
 * Returns the item the key should move to, or null if the key is not a navigation key.
 */
export function arrowTarget(
  event: KeyboardEvent,
  items: HTMLElement[],
  orientation: Orientation = 'vertical',
  loop = true,
): HTMLElement | null {
  if (items.length === 0) return null

  const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
  const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
  const current = items.indexOf(document.activeElement as HTMLElement)
  const last = items.length - 1

  switch (event.key) {
    case 'Home':
      return items[0] ?? null
    case 'End':
      return items[last] ?? null
    case nextKey: {
      if (current === -1) return items[0] ?? null
      if (current === last) return loop ? (items[0] ?? null) : null
      return items[current + 1] ?? null
    }
    case previousKey: {
      if (current === -1) return items[last] ?? null
      if (current === 0) return loop ? (items[last] ?? null) : null
      return items[current - 1] ?? null
    }
    default:
      return null
  }
}

/**
 * Type-to-select: returns a function that, given a keydown and the current items,
 * returns the item whose text starts with what the user has typed recently.
 */
export function createTypeahead(resetAfter = 500) {
  let buffer = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  return (event: KeyboardEvent, items: HTMLElement[]): HTMLElement | null => {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return null
    // A lone space activates the focused item; it only extends a search already in progress.
    if (event.key === ' ' && buffer === '') return null

    buffer += event.key.toLowerCase()
    clearTimeout(timer)
    timer = setTimeout(() => {
      buffer = ''
    }, resetAfter)

    // Repeating one letter cycles through the items that start with it.
    const repeated = buffer.split('').every((char) => char === buffer[0])
    const query = repeated ? (buffer[0] ?? '') : buffer
    const start = items.indexOf(document.activeElement as HTMLElement)
    const offset = repeated || buffer.length === 1 ? 1 : 0
    const ordered = [...items.slice(start + offset), ...items.slice(0, start + offset)]

    return ordered.find((item) => (item.textContent ?? '').trim().toLowerCase().startsWith(query)) ?? null
  }
}
