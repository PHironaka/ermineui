import registryJson from '../../../cli/registry.json'
import readme from '../../../README.md?raw'
import playgroundApp from '../../../playground/src/App.vue?raw'

interface RegistryFile {
  file: string
  content: string
}
interface RegistryEntry {
  description: string
  files: RegistryFile[]
  lib: string[]
  components: string[]
}
interface Registry {
  version: string
  lib: Record<string, RegistryFile>
  components: Record<string, RegistryEntry>
  blocks: Record<string, RegistryEntry>
}

const registry = registryJson as unknown as Registry

export const version = registry.version

export interface CatalogEntry {
  kind: 'component' | 'block'
  name: string
  title: string
  summary: string
  category: string
  files: RegistryFile[]
  /** Helper files copied along with it. */
  lib: string[]
  /** Other components copied along with it. */
  components: string[]
  /** What its index file exports, in order. */
  exports: string[]
  /** An example from the README, when it has one. */
  example?: string
  /** Where to see it running in the playground. */
  demo?: string
  href: string
}

// Which group each component is listed under. Anything new and not yet placed lands in "More".
const groups: Record<string, string[]> = {
  'Forms and inputs': [
    'button', 'input', 'textarea', 'label', 'field', 'input-group', 'checkbox', 'switch', 'radio-group', 'select', 'multi-select', 'combobox',
    'slider', 'range-slider', 'number-input', 'pin-input', 'masked-input', 'phone-input', 'password-strength', 'tags-input', 'toggle',
    'toggle-group', 'segmented-control', 'rating', 'calendar', 'date-picker', 'date-range-picker', 'date-time-picker', 'time-picker',
    'color-picker', 'file-upload', 'signature-pad', 'image-cropper', 'emoji-picker', 'rich-text-editor', 'questionnaire', 'stepper',
  ],
  Overlays: ['dialog', 'alert-dialog', 'sheet', 'popover', 'tooltip', 'hover-card', 'dropdown-menu', 'context-menu', 'command', 'toast', 'tour', 'lightbox', 'action-sheet'],
  Navigation: ['tabs', 'breadcrumb', 'pagination', 'navigation-menu', 'menubar', 'sidebar', 'toolbar', 'app-bar', 'bottom-nav', 'fab'],
  'Layout and content': ['card', 'separator', 'accordion', 'collapsible', 'carousel', 'resizable', 'scroll-area', 'typography', 'image-fan', 'marquee', 'markdown', 'code-block', 'media-player'],
  'Data and charts': ['table', 'data-table', 'filter-bar', 'chart', 'stat', 'meter', 'tree', 'kanban', 'event-calendar', 'virtual-list', 'timeline', 'description-list', 'json-viewer', 'diff-viewer', 'comparison-table'],
  'Status and feedback': ['alert', 'badge', 'banner', 'progress', 'spinner', 'skeleton', 'empty-state', 'status', 'avatar', 'kbd', 'icon', 'copy-button', 'count-up', 'countdown', 'reveal', 'scroll-progress'],
  Commerce: [
    'price', 'swatch', 'product-card', 'product-gallery', 'option-card', 'cart-line-item', 'order-summary', 'quantity-stepper', 'wishlist-button',
    'shipping-method', 'order-tracker', 'mini-cart', 'pricing-table', 'size-guide', 'payment-card-input', 'promo-code', 'address-form',
    'stock-indicator', 'rating-breakdown', 'review',
  ],
  Conversation: ['chat', 'comment-thread', 'notification-center'],
  'Device and app': [
    'haptics', 'sound', 'view-transition', 'share-button', 'qr-code', 'offline-banner', 'wake-lock', 'fullscreen', 'notification-prompt',
    'swipe-actions', 'pull-to-refresh', 'infinite-scroll', 'install-prompt', 'update-prompt',
  ],
}
const groupOf = new Map(Object.entries(groups).flatMap(([group, names]) => names.map((name) => [name, group] as const)))

/** "Accordion — stacked sections…" becomes a title and a sentence. */
function describe(description: string): { title: string; summary: string } {
  const [title, ...rest] = description.split(' — ')
  const text = rest.join(' — ')
  return { title: title ?? description, summary: text ? text.charAt(0).toUpperCase() + text.slice(1) : '' }
}

function exportsOf(files: RegistryFile[]): string[] {
  const index = files.find((file) => file.file === 'index.ts')?.content ?? ''
  const names: string[] = []
  for (const [, type, list] of index.matchAll(/^export (type )?\{([^}]+)\}/gm)) {
    if (type) continue
    for (const part of list!.split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()
      if (name && !name.startsWith('type ')) names.push(name)
    }
  }
  return names
}

// The README's "Patterns" section holds worked examples under bold headings such as "**Select**" or
// "**Sheet** has the same parts…". A component gets the example from the section named after it, or failing
// that one that opens with its own tag. An example that merely mentions it in passing is not used.
const patterns = readme.slice(readme.indexOf('## Patterns'), readme.indexOf('## How the project is laid out'))
const sections = patterns.split(/\n(?=\*\*[^*\n]+\*\*)/).map((section) => ({
  heading: (section.match(/^\*\*([^*\n]+)\*\*/)?.[1] ?? '').toLowerCase(),
  examples: [...section.matchAll(/```vue\n([\s\S]*?)```/g)].map((match) => match[1]!.trimEnd()),
}))
function exampleFor(name: string, title: string, tags: string[]) {
  const main = tags.find((tag) => /^[A-Z]/.test(tag))
  if (!main) return undefined
  const uses = (example: string) => new RegExp(`<${main}[\\s>/]`).test(example)
  const words = [title.toLowerCase(), name.replace(/-/g, ' ')]
  const named = sections.filter((section) => words.some((word) => new RegExp(`(^|[\\s,:])${word}([\\s,:.]|$)`).test(section.heading)))
  for (const section of named) {
    const example = section.examples.find(uses)
    if (example) return example
  }
  return sections.flatMap((section) => section.examples).find((example) => example.match(/<([A-Z]\w*)/)?.[1] === main)
}

// The playground has one section per demo. A component is linked to the section named after it, or, when it
// shares a section with others (the spinner sits in the progress demo), to the first section that uses its tag.
const demoSources = import.meta.glob('../../../playground/src/demos/*.vue', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const demos = [playgroundApp, ...Object.values(demoSources)].flatMap((source) =>
  [...source.matchAll(/<Demo name="([a-z-]+)"[\s\S]*?<\/Demo>/g)].map((match) => ({ name: match[1]!, body: match[0] })),
)
function demoFor(name: string, tags: string[]) {
  const main = tags.find((tag) => /^[A-Z]/.test(tag))
  const found = demos.find((demo) => demo.name === name) ?? (main ? demos.find((demo) => new RegExp(`<${main}[\\s>/]`).test(demo.body)) : undefined)
  return found ? `/playground/#${found.name}` : undefined
}

function entry(kind: 'component' | 'block', name: string, item: RegistryEntry): CatalogEntry {
  const exported = exportsOf(item.files)
  return {
    kind,
    name,
    ...describe(item.description),
    category: kind === 'block' ? 'Blocks' : (groupOf.get(name) ?? 'More'),
    files: item.files,
    lib: item.lib,
    components: item.components,
    exports: exported,
    example: exampleFor(name, describe(item.description).title, exported),
    demo: demoFor(name, exported),
    href: `/${kind === 'block' ? 'blocks' : 'components'}/${name}/`,
  }
}

export const components = Object.entries(registry.components).map(([name, item]) => entry('component', name, item))
export const blocks = Object.entries(registry.blocks).map(([name, item]) => entry('block', name, item))
export const categories = [...Object.keys(groups), ...(components.some((item) => item.category === 'More') ? ['More'] : [])]
export const lib = registry.lib
export const find = (name: string) => components.find((item) => item.name === name) ?? blocks.find((item) => item.name === name)
