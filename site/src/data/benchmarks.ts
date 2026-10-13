import results from './benchmark-results.json'

// Measured on 13 October 2026: the same settings page (13 components) built with each library in a fresh
// Vite 8 + Vue 3.5 project and run in Chromium. See /benchmarks/ for the method and what it leaves out.
export const libraries = [
  { key: 'ermine', name: 'Ermine', version: '0.3.0', ours: true },
  { key: 'shadcn', name: 'shadcn-vue', version: '2.8 · reka-ui 2.11 · Tailwind 4.3' },
  { key: 'nuxtui', name: 'Nuxt UI', version: '4.11 · Tailwind 4.3' },
] as const

type Key = (typeof libraries)[number]['key'] | 'baseline'
const of = (key: Key) => results[key]
const kb = (bytes: number) => bytes / 1000

export interface Metric {
  id: string
  label: string
  detail: string
  unit: string
  digits: number
  values: Record<Key, number>
}

const metric = (id: string, label: string, detail: string, unit: string, digits: number, read: (r: (typeof results)['ermine']) => number): Metric => ({
  id,
  label,
  detail,
  unit,
  digits,
  values: { baseline: read(of('baseline')), ermine: read(of('ermine')), shadcn: read(of('shadcn')), nuxtui: read(of('nuxtui')) },
})

export const metrics: Metric[] = [
  metric('shipped', 'Shipped to the browser', 'JavaScript and CSS together, gzipped', 'kB', 1, (r) => kb(r.jsGzip + r.cssGzip)),
  metric('js', 'JavaScript', 'Gzipped', 'kB', 1, (r) => kb(r.jsGzip)),
  metric('css', 'CSS', 'Gzipped', 'kB', 1, (r) => kb(r.cssGzip)),
  metric('fcp', 'First contentful paint', 'Cold load, processor slowed four times', 'ms', 0, (r) => r.load.fcp),
  metric('script', 'Script time while loading', 'Cold load, processor slowed four times', 'ms', 0, (r) => r.load.script),
  metric('mount', 'Mount 1,000 rows', 'Five controls in each row, at full speed', 'ms', 0, (r) => r.stress.mount),
  metric('update', 'Update 1,000 rows', 'Every checkbox and switch flipped at once', 'ms', 0, (r) => r.stress.update),
  metric('heap', 'Memory with the rows mounted', 'JavaScript heap after garbage collection', 'MB', 1, (r) => r.stress.heap),
  metric('nodes', 'Elements in the rows', 'DOM elements for 1,000 rows', '', 0, (r) => r.stress.nodes),
]

export const metricById = (id: string) => metrics.find((item) => item.id === id)!
export const format = (value: number, item: Metric) => `${value.toLocaleString('en', { minimumFractionDigits: item.digits, maximumFractionDigits: item.digits })}${item.unit ? ` ${item.unit}` : ''}`
/** How many times bigger or slower the other library is than Ermine, to one decimal place. */
export const times = (item: Metric, key: Key) => (item.values[key] / item.values.ermine).toFixed(1)
