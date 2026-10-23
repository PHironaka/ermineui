import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

// Every base theme with every accent (and with none) must keep text readable and the focus ring visible, in light
// and dark. The values are worked out here the way the stylesheet stacks them: ermine.css, then the base, then the accent.
const registry = join(import.meta.dirname, '..', '..', 'registry')
type Oklch = [number, number, number]
type Tokens = Record<string, { light: Oklch; dark: Oklch }>

const oklch = (text: string): Oklch | undefined => {
  const match = text.trim().match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/)
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined
}
/** The opaque oklch tokens in a stylesheet; translucent ones (dark borders) and hex colours are left out. */
function tokens(css: string): Tokens {
  const found: Tokens = {}
  for (const [, name, light, dark] of css.matchAll(/--er-([\w-]+): light-dark\((oklch\([^)]*\)), (oklch\([^)]*\))\);/g)) {
    const [l, d] = [oklch(light!), oklch(dark!)]
    if (l && d) found[name!] = { light: l, dark: d }
  }
  return found
}

function linearSrgb([L, C, H]: Oklch) {
  const hue = (H * Math.PI) / 180
  const [a, b] = [C * Math.cos(hue), C * Math.sin(hue)]
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}
const luminance = (color: Oklch) => {
  const [r, g, b] = linearSrgb(color).map((value) => Math.min(1, Math.max(0, value)))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const contrast = (x: Oklch, y: Oklch) => {
  const [high, low] = [luminance(x), luminance(y)].sort((p, q) => q - p)
  return (high! + 0.05) / (low! + 0.05)
}

const defaults = tokens(readFileSync(join(registry, 'styles', 'ermine.css'), 'utf8'))
const load = (kind: string) =>
  Object.fromEntries(readdirSync(join(registry, 'themes', kind)).map((file) => [file.replace('.css', ''), tokens(readFileSync(join(registry, 'themes', kind, file), 'utf8'))]))
const bases = load('base')
const accents = load('accent')

// [text or line, what it sits on, the ratio it needs]: 4.5 for text, 3 for the focus ring (WCAG 1.4.3 and 1.4.11).
const pairs: [string, string, number][] = [
  ['foreground', 'background', 4.5],
  ['card-foreground', 'card', 4.5],
  ['popover-foreground', 'popover', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['secondary-foreground', 'secondary', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'muted', 4.5],
  ['muted-foreground', 'card', 4.5],
  ['primary', 'background', 4.5], // links and the active tab's text
  ['primary', 'card', 4.5],
  ['ring', 'background', 3],
  ['ring', 'card', 3],
]

test('the neutral base is exactly the default stylesheet', () => {
  for (const [name, value] of Object.entries(bases.neutral!)) assert.deepEqual(value, defaults[name], `--er-${name}`)
})

test('base and accent themes set only the variables they are meant to', () => {
  for (const [name, theme] of Object.entries(accents)) assert.deepEqual(Object.keys(theme).sort(), ['primary', 'primary-foreground', 'ring'], name)
  for (const [name, theme] of Object.entries(bases)) assert.deepEqual(Object.keys(theme).sort(), Object.keys(bases.neutral!).sort(), name)
})

test('every base with every accent keeps text readable and the focus ring visible, in light and dark', () => {
  const failures: string[] = []
  for (const [base, baseTokens] of Object.entries(bases)) {
    for (const [accent, accentTokens] of [['none', {}], ...Object.entries(accents)] as [string, Tokens][]) {
      const resolved: Tokens = { ...defaults, ...baseTokens, ...accentTokens }
      for (const scheme of ['light', 'dark'] as const) {
        for (const [front, back, needed] of pairs) {
          const ratio = contrast(resolved[front]![scheme], resolved[back]![scheme])
          if (ratio < needed) failures.push(`${base} + ${accent}, ${scheme}: ${front} on ${back} is ${ratio.toFixed(2)}:1, needs ${needed}:1`)
        }
      }
    }
  }
  assert.deepEqual(failures, [])
})

test('every theme colour can be shown on an ordinary (sRGB) screen', () => {
  for (const [name, theme] of Object.entries({ ...bases, ...accents })) {
    for (const [token, { light, dark }] of Object.entries(theme)) {
      for (const color of [light, dark]) {
        assert.ok(linearSrgb(color).every((channel) => channel > -0.001 && channel < 1.001), `${name}: --er-${token} oklch(${color.join(' ')})`)
      }
    }
  }
})
