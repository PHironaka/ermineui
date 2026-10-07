/** Hue 0–360, saturation and value 0–1: the model the picker's square and slider work in. */
export interface Hsv {
  h: number
  s: number
  v: number
}

/** '#rrggbb' from '#rgb', '#rrggbb' or the same without the hash; undefined for anything else. */
export function normalizeHex(input: string): string | undefined {
  const text = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(text)) return `#${[...text].map((char) => char + char).join('')}`
  return /^[0-9a-f]{6}$/.test(text) ? `#${text}` : undefined
}

export function hexToHsv(hex: string): Hsv {
  const value = normalizeHex(hex) ?? '#000000'
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16) / 255) as [number, number, number]
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  let h = 0
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
  }
  return { h: (h * 60 + 360) % 360, s: max ? delta / max : 0, v: max }
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const channel = (offset: number) => {
    const k = (offset + h / 60) % 6
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(5)}${channel(3)}${channel(1)}`
}
