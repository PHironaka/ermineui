// The remote MCP server at /mcp, for clients that connect over the web (claude.ai connectors, for one). It reads the
// same registry as the command line but cannot reach anyone's project, so its tools look things up and hand back
// source, stylesheets and commands, instead of writing files. It speaks MCP's Streamable HTTP transport without
// sessions: every POST is answered on its own, with plain JSON.
import registry from '../../../cli/registry.json' with { type: 'json' }
import { THEME_KINDS, UserError, catalog, componentDetails, fenced, mcpResponder, pickThemes, resolveDependencies, themeCatalog, withThemes } from '../../../cli/bin/ermine.mjs'

const tools = [
  {
    name: 'list_components',
    description: 'List every Ermine UI component and block (sections of a page built from components), each with a one-line summary.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'get_component',
    description:
      "Get a component's or block's full source, every file, plus the components and helpers it depends on. Read it before writing code that uses it, so you use its real props and parts.",
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'A name from list_components, e.g. "dialog" or "product-detail".' } },
      required: ['name'],
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'get_theme',
    description:
      'With no names, list the themes: styles (type, weights, shape and control sizes), bases (surfaces, text and lines) and accents (primary colour and focus ring). With names (at most one of each kind), get the CSS that applies them and the command that does the same in a project.',
    inputSchema: {
      type: 'object',
      properties: {
        names: { type: 'array', items: { type: 'string' }, description: 'e.g. ["editorial", "stone", "blue"]. Leave out to list the themes.' },
        whole_stylesheet: {
          type: 'boolean',
          description: 'Return the complete Ermine stylesheet with the themes in it, for a new project or a single-file page, instead of only the blocks to add.',
        },
      },
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'install_instructions',
    description:
      'For the components and blocks named, say what adding them copies into a project (with everything they depend on) and the commands that do it. Use get_component for the source itself.',
    inputSchema: {
      type: 'object',
      properties: { names: { type: 'array', items: { type: 'string' }, description: 'e.g. ["button", "dialog"].' } },
      required: ['names'],
    },
    annotations: { readOnlyHint: true },
  },
]

const instructions = `Ermine UI is a set of Vue 3 components that are copied into a project as source (with the ermineui command line), not installed from npm. The only runtime dependency is Vue 3.5+.
This server cannot see or change the user's project: it looks components up and hands back their source, theme CSS and the commands to run. Call get_component before writing code with a component, so you use its real props and parts.
Styling is plain CSS: every colour, radius, font and size is an --er-* variable in one stylesheet, ermine.css; component styles sit in @layer components, so plain CSS overrides them. Variants are props that become data-variant / data-size attributes. To change the colours or the overall look, use get_theme rather than inventing variables.`

const handlers = {
  list_components: () => catalog(null, null, registry),
  get_component: ({ name }) => componentDetails(registry, String(name ?? '')),
  get_theme({ names = [], whole_stylesheet: whole }) {
    if (!Array.isArray(names)) throw new UserError('"names" must be a list of theme names.')
    if (names.length === 0) return themeCatalog(null, null, registry)
    const chosen = pickThemes(registry, names.map(String))
    const command = `npx ermineui theme ${Object.keys(THEME_KINDS).filter((kind) => chosen[kind]).map((kind) => chosen[kind]).join(' ')}`
    if (whole) {
      return `The complete Ermine stylesheet with these themes, to save as ermine.css. In a project set up with ermineui, \`${command}\` does the same to the existing file.\n\n${fenced(withThemes(registry.styles.content, chosen, registry.themes), 'css')}`
    }
    const css = withThemes('', chosen, registry.themes)
    const fonts = css.includes('/* ermine theme fonts */')
      ? ' The "ermine theme fonts" block holds @import lines, which CSS only allows at the very top of a file, so put that part first.'
      : ''
    return `In a project set up with ermineui, run:\n\n${fenced(command, 'sh')}\n\nOr add this to the end of the Ermine stylesheet (ermine.css) by hand.${fonts} To fine-tune a value, set it again in a rule after these blocks.\n\n${fenced(css, 'css')}`
  },
  install_instructions({ names }) {
    if (!Array.isArray(names) || names.length === 0) throw new UserError('"names" must be a list of component or block names, e.g. ["button"].')
    const requested = names.map(String)
    const unknown = requested.filter((name) => !registry.components[name] && !registry.blocks?.[name])
    if (unknown.length > 0) throw new UserError(`Unknown component or block: ${unknown.join(', ')}. Call list_components to see what is available.`)
    const needed = resolveDependencies(registry, requested)
    const listed = (label, items, folder) => (items.length > 0 ? `- ${label} (into ${folder}): ${items.join(', ')}` : '')
    return [
      'In the project (once: `npx ermineui init`, which writes ermine.json and the stylesheet), then:',
      fenced(`npx ermineui add ${requested.join(' ')}`, 'sh'),
      'That copies these, into these folders in a Vue or Astro project (Nuxt uses components/ and lib/ermine, under app/ in Nuxt 4):',
      [
        listed('Blocks', needed.blocks, 'src/components/blocks/<name>'),
        listed('Components', needed.components, 'src/components/ui/<name>'),
        listed('Helpers', needed.lib, 'src/lib/ermine'),
      ]
        .filter(Boolean)
        .join('\n'),
      `Import each from its folder, e.g. \`import { ${pascal(requested[0])} } from '@/components/${registry.blocks?.[requested[0]] ? 'blocks' : 'ui'}/${requested[0]}'\`, and import the stylesheet once in the entry file.`,
      'Without the command line, get_component gives every file; its imports of helpers ("../../lib/<helper>") and of other components ("../<name>") must point at wherever those files go.',
    ].join('\n\n')
  },
}

const pascal = (name) => name.replace(/(^|-)(\w)/g, (_, __, letter) => letter.toUpperCase())

const respond = mcpResponder({ tools, handlers, instructions, version: registry.version })

// Any web page may call it: it only hands out what the website already publishes.
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-session-id',
}
const json = (body, status = 200) => Response.json(body, { status, headers: cors })

export default async function handler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  // No server-to-client stream is offered, which the transport allows: GET is refused and the client carries on.
  if (request.method !== 'POST') return new Response('Method not allowed: send MCP messages with POST.', { status: 405, headers: { ...cors, allow: 'POST, OPTIONS' } })

  let body
  try {
    body = await request.json()
  } catch {
    return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400)
  }
  const messages = Array.isArray(body) ? body : [body]
  const replies = []
  for (const message of messages) {
    // Notifications and responses have no id and need no answer.
    if (message?.id === undefined || message?.id === null) continue
    if (typeof message.method !== 'string') {
      replies.push({ jsonrpc: '2.0', id: message.id, error: { code: -32600, message: 'Invalid request' } })
      continue
    }
    replies.push({ jsonrpc: '2.0', id: message.id, ...(await respond(message)) })
  }
  if (replies.length === 0) return new Response(null, { status: 202, headers: cors })
  return json(Array.isArray(body) ? replies : replies[0])
}

export const config = { path: '/mcp' }
