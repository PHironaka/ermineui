// Plain-text versions of the catalog for AI tools: /llms.txt indexes everything, and each component or block has
// a Markdown page beside its HTML one (/components/button.md) with its usage and full source.
import { type CatalogEntry, blocks, categories, components, lib, themes, version } from './catalog'

const languages: Record<string, string> = { vue: 'vue', ts: 'ts', css: 'css' }

/** A fence longer than any run of backticks inside, so source that contains ``` does not end the block early. */
function fenced(code: string, language = '') {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((match) => match[0].length))
  const fence = '`'.repeat(longest + 1)
  return `${fence}${language}\n${code.trimEnd()}\n${fence}`
}

const markdownHref = (entry: CatalogEntry) => entry.href.replace(/\/$/, '.md')

export function llmsIndex(site?: URL) {
  const url = (path: string) => (site ? new URL(path, site).href : path)
  const line = (entry: CatalogEntry) => `- [${entry.title}](${url(markdownHref(entry))}): ${entry.summary}`
  const sections = categories.map((category) => {
    const entries = components.filter((entry) => entry.category === category)
    return `## ${category}\n\n${entries.map(line).join('\n')}`
  })

  return `# Ermine UI

> Vue 3 components you copy into your project and own, in the spirit of shadcn/ui. Styled with plain CSS variables (no Tailwind, no CSS-in-JS); the only dependency is Vue 3.5 or newer. Version ${version}.

Components are not imported from node_modules. The \`ermineui\` command line copies their source into the project:

${fenced('npx ermineui init                 # writes ermine.json and the theme stylesheet\nnpx ermineui add button dialog     # copies components and everything they depend on\nnpx ermineui list                 # shows what is available and installed', 'sh')}

Conventions to follow when writing code that uses them:

- Import from the folder \`init\` chose, by default \`@/components/ui/<name>\` (blocks: \`@/components/blocks/<name>\`). Each folder's index exports every part, e.g. \`import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'\`.
- Compound components are built from parts (\`Dialog\`, \`DialogTrigger\`, \`DialogContent\`…). Overlay triggers (dialog, sheet, popover, tooltip, dropdown menu…) accept \`as-child\` to render your own element, such as a \`Button\`, instead.
- Theme with the \`--er-*\` CSS variables in \`ermine.css\`. Component styles sit in \`@layer components\`, so unlayered CSS overrides them without \`!important\`. Variants and state are data attributes: \`data-variant\`, \`data-size\`, \`data-state\`, \`data-side\`.
- Dark mode follows the operating system; force it with \`class="dark"\` or \`class="light"\` on any ancestor.
- Themes: \`npx ermineui theme <style> <base> <accent>\` writes ready-made sets of variables into the stylesheet, any of the three. Styles (type, weights, shape, control sizes): ${themes.filter((theme) => theme.kind === 'style').map((theme) => theme.name).join(', ')}. Bases: ${themes.filter((theme) => theme.kind === 'base').map((theme) => theme.name).join(', ')}. Accents: ${themes.filter((theme) => theme.kind === 'accent').map((theme) => theme.name).join(', ')}.
- Works in Vue + Vite, Nuxt and Astro (as Vue islands).
- MCP: \`npx ermineui mcp\` is a local server that can set a project up and add components; https://ermineui.netlify.app/mcp is a read-only remote one (Streamable HTTP) for web clients such as claude.ai.

Each link below is a Markdown page with the component's exports, an example and its full source.

${sections.join('\n\n')}

## Blocks

Whole sections of a page, put together from the components above.

${blocks.map(line).join('\n')}

## Optional

- [Installation](${url('/docs/installation/')}): setup for Vue + Vite, Nuxt and Astro
- [Themes](${url('/themes/')}): preview the colour themes and copy their CSS
- [Playground](${url('/playground/')}): every component running on one page
`
}

export function entryMarkdown(entry: CatalogEntry) {
  const parts = [`# ${entry.title}`, entry.summary, fenced(`npx ermineui add ${entry.name}`, 'sh')]

  const brings = [
    entry.components.length && `components: ${entry.components.join(', ')}`,
    entry.lib.length && `helpers: ${entry.lib.map((name) => lib[name]?.file ?? name).join(', ')}`,
  ].filter(Boolean)
  if (brings.length) parts.push(`Also copies the ${brings.join('; ')}.`)

  const folder = entry.kind === 'block' ? 'blocks' : 'ui'
  if (entry.exports.length) parts.push(`## Exports\n\n${fenced(`import { ${entry.exports.join(', ')} } from '@/components/${folder}/${entry.name}'`, 'ts')}`)
  if (entry.example) parts.push(`## Example\n\n${fenced(entry.example, 'vue')}`)

  const files = entry.files.map((file) => `### ${file.file}\n\n${fenced(file.content, languages[file.file.split('.').pop() ?? ''])}`)
  parts.push(`## Source\n\n${files.join('\n\n')}`)

  return `${parts.join('\n\n')}\n`
}

export const markdownResponse = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
