#!/usr/bin/env node
// Ermine UI command line: copies component source into your project. No dependencies.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative, resolve, sep } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const CONFIG_FILE = 'ermine.json'
const BUNDLED_REGISTRY = join(dirname(fileURLToPath(import.meta.url)), '..', 'registry.json')

const color = (code) => (text) => (process.stdout.isTTY ? `\u001b[${code}m${text}\u001b[0m` : text)
const bold = color(1)
const dim = color(2)
const green = color(32)
const yellow = color(33)
const red = color(31)

class UserError extends Error {}

// ---------- arguments ----------

function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('-')) {
      positional.push(arg)
      continue
    }
    const [name, inline] = arg.replace(/^--?/, '').split('=')
    if (['cwd', 'registry'].includes(name)) flags[name] = inline ?? argv[++i]
    else flags[{ y: 'yes', a: 'all', o: 'overwrite', h: 'help', v: 'version' }[name] ?? name] = true
  }
  return { flags, positional }
}

// ---------- registry and config ----------

async function loadRegistry(source) {
  if (!source) return JSON.parse(readFileSync(BUNDLED_REGISTRY, 'utf8'))
  try {
    if (/^https?:\/\//.test(source)) {
      const response = await fetch(source)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }
    return JSON.parse(readFileSync(resolve(source), 'utf8'))
  } catch (error) {
    throw new UserError(`Could not load the registry from ${source} (${error.message}).`)
  }
}

function loadConfig(cwd) {
  const path = join(cwd, CONFIG_FILE)
  if (!existsSync(path)) {
    throw new UserError(`No ${CONFIG_FILE} found in ${cwd}. Run "ermine init" first.`)
  }
  try {
    const config = JSON.parse(readFileSync(path, 'utf8'))
    for (const key of ['components', 'lib', 'styles']) {
      if (typeof config[key] !== 'string') throw new Error(`"${key}" must be a path`)
    }
    return config
  } catch (error) {
    throw new UserError(`${CONFIG_FILE} is not valid: ${error.message}.`)
  }
}

/** Sensible folders for the kind of project in `cwd`. */
function detectDefaults(cwd) {
  const has = (...names) => names.some((name) => existsSync(join(cwd, name)))
  if (has('nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs')) {
    // Nuxt 4 keeps app code in app/; Nuxt 3 keeps it at the project root.
    const base = has('app') ? 'app/' : ''
    return {
      framework: 'Nuxt',
      components: `${base}components/ui`,
      lib: `${base}lib/ermine`,
      styles: `${base}assets/css/ermine.css`,
    }
  }
  return {
    framework: has('astro.config.mjs', 'astro.config.ts', 'astro.config.js') ? 'Astro' : 'Vue',
    components: 'src/components/ui',
    lib: 'src/lib/ermine',
    styles: 'src/styles/ermine.css',
  }
}

// ---------- writing files ----------

function writeFile(cwd, path, content, { overwrite }) {
  const target = join(cwd, path)
  const exists = existsSync(target)
  if (exists && !overwrite) return 'skipped'
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content)
  return exists ? 'overwritten' : 'created'
}

/**
 * In the registry, components import helpers from "../../lib/<name>".
 * Point those imports at wherever this project keeps its helpers.
 */
function rewriteLibImports(content, componentDir, libDir) {
  let path = relative(componentDir, libDir).split(sep).join(posix.sep)
  if (!path.startsWith('.')) path = `./${path}`
  return content.replaceAll("'../../lib/", `'${path}/`)
}

/** In the registry, blocks import components from "../../ui/<name>". Point those at this project's components. */
function rewriteComponentImports(content, blockDir, componentsDir) {
  let path = relative(blockDir, componentsDir).split(sep).join(posix.sep)
  if (!path.startsWith('.')) path = `./${path}`
  return content.replaceAll("'../../ui/", `'${path}/`)
}

/** Where blocks go: the "blocks" path in ermine.json, or a blocks folder beside the components folder. */
function blocksDir(config) {
  return typeof config.blocks === 'string' ? config.blocks : posix.join(posix.dirname(config.components), 'blocks')
}

/**
 * The theme stylesheet belongs to the project and is never overwritten. But components added later
 * may rely on variables that did not exist when that file was copied in (chart colours, the type
 * scale). This finds the variables the registry's stylesheet defines that the project's file never
 * mentions, and appends just those, leaving everything already there exactly as it was.
 */
function missingVariables(registryCss, projectCss) {
  const root = registryCss.slice(registryCss.indexOf(':root {'), registryCss.indexOf('\n}', registryCss.indexOf(':root {')))
  const missing = []
  for (const match of root.matchAll(/^\s*(--er-[\w-]+):\s*([^;]+);/gm)) {
    const [, name, value] = match
    if (!new RegExp(`${name}\\s*:`).test(projectCss)) missing.push([name, value.trim()])
  }
  return missing
}

function addMissingVariables(cwd, path, registryCss) {
  const target = join(cwd, path)
  const current = readFileSync(target, 'utf8')
  const missing = missingVariables(registryCss, current)
  if (missing.length === 0) return 0
  const block =
    `\n/* Added by "ermine add": variables that newer components use and this file did not have yet.\n` +
    `   Move them into your own :root block, and change the values, as you like. */\n` +
    `:root {\n${missing.map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}\n`
  writeFileSync(target, current.replace(/\n*$/, '\n') + block)
  return missing.length
}

/** The requested components and blocks, plus every component and helper they depend on. */
function resolveDependencies(registry, names) {
  const components = new Set()
  const blocks = new Set()
  const lib = new Set()

  const addLib = (name) => {
    if (lib.has(name)) return
    lib.add(name)
    registry.lib[name].lib.forEach(addLib)
  }
  const addComponent = (name) => {
    if (components.has(name)) return
    components.add(name)
    registry.components[name].lib.forEach(addLib)
    registry.components[name].components.forEach(addComponent)
  }

  for (const name of names) {
    const block = registry.blocks?.[name]
    if (!block) {
      addComponent(name)
      continue
    }
    blocks.add(name)
    block.lib.forEach(addLib)
    block.components.forEach(addComponent)
  }
  return { components: [...components].sort(), blocks: [...blocks].sort(), lib: [...lib].sort() }
}

function report(results) {
  const symbol = { created: green('+'), overwritten: yellow('~'), skipped: dim('·') }
  return results.map(([path, status]) => `  ${symbol[status]} ${path}${status === 'skipped' ? dim('  exists, kept as is') : ''}`).join('\n')
}

/** The project's config if it has one, and the registry it names (or the one given, or the bundled one). */
async function projectRegistry(cwd, source) {
  const config = existsSync(join(cwd, CONFIG_FILE)) ? loadConfig(cwd) : null
  return { config, registry: await loadRegistry(source ?? config?.registry) }
}

// ---------- the work behind each command ----------
// These return text instead of printing it, because the MCP server's stdout carries its messages.

function checkNoConfig(cwd, overwrite) {
  if (existsSync(join(cwd, CONFIG_FILE)) && !overwrite) {
    throw new UserError(`${CONFIG_FILE} already exists. Use --overwrite to replace it.`)
  }
}

/** Writes ermine.json and the theme stylesheet (unless there is one already), and says what to do next. */
function setUp(cwd, registry, framework, config, { overwrite }) {
  writeFileSync(join(cwd, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`)
  const styles = writeFile(cwd, config.styles, registry.styles.content, { overwrite })
  const importPath = config.styles.replace(/^(app|src)\//, '')
  const next = {
    Nuxt: `Add the stylesheet to nuxt.config:  css: ['~/${importPath}']`,
    Astro: `Import the stylesheet in your layout:  import '../${importPath}'`,
    Vue: `Import the stylesheet in your entry file:  import './${importPath}'`,
  }[framework]
  return (
    report([
      [CONFIG_FILE, 'created'],
      [config.styles, styles],
    ]) + `\n\n${bold('Next')}\n  1. ${next}\n  2. Add components:  ermine add button dialog\n`
  )
}

/** Copies the named components and blocks, and everything they depend on, into the project. */
async function install(cwd, { names, all, overwrite, registry: source }) {
  const config = loadConfig(cwd)
  const registry = await loadRegistry(source ?? config.registry)
  const available = Object.keys(registry.components)
  const requested = all ? available : names

  if (requested.length === 0) {
    throw new UserError('Name at least one component or block, e.g. "ermine add button", or use --all.')
  }
  const unknown = requested.filter((name) => !registry.components[name] && !registry.blocks?.[name])
  if (unknown.length > 0) {
    throw new UserError(`Unknown component or block: ${unknown.join(', ')}. Run "ermine list" to see what is available.`)
  }

  const needed = resolveDependencies(registry, requested)
  const results = []
  const options = { overwrite }

  // The theme stylesheet is only written if it is missing — never overwritten, since it holds your theme.
  // If it is there but older than the components being added, the variables it lacks are appended to it.
  let addedVariables = 0
  if (!existsSync(join(cwd, config.styles))) {
    results.push([config.styles, writeFile(cwd, config.styles, registry.styles.content, options)])
  } else {
    addedVariables = addMissingVariables(cwd, config.styles, registry.styles.content)
  }
  for (const name of needed.lib) {
    const helper = registry.lib[name]
    const path = posix.join(config.lib, helper.file)
    results.push([path, writeFile(cwd, path, helper.content, options)])
  }
  for (const name of needed.components) {
    const dir = posix.join(config.components, name)
    for (const file of registry.components[name].files) {
      const content = rewriteLibImports(file.content, join(cwd, dir), join(cwd, config.lib))
      const path = posix.join(dir, file.file)
      results.push([path, writeFile(cwd, path, content, options)])
    }
  }

  for (const name of needed.blocks) {
    const dir = posix.join(blocksDir(config), name)
    for (const file of registry.blocks[name].files) {
      let content = rewriteLibImports(file.content, join(cwd, dir), join(cwd, config.lib))
      content = rewriteComponentImports(content, join(cwd, dir), join(cwd, config.components))
      const path = posix.join(dir, file.file)
      results.push([path, writeFile(cwd, path, content, options)])
    }
  }

  const lines = [report(results)]
  const extra = needed.components.filter((name) => !requested.includes(name))
  const skipped = results.filter(([, status]) => status === 'skipped').length
  const count = (number, word) => `${number} ${word}${number === 1 ? '' : 's'}`
  lines.push(
    `\n${green('Done.')} ` +
      (needed.blocks.length > 0 ? `${count(needed.blocks.length, 'block')} and ` : '') +
      count(needed.components.length, 'component') +
      (extra.length > 0 ? ` (including ${extra.join(', ')}, which the others need)` : '') +
      '.',
  )
  if (skipped > 0) lines.push(dim(`${skipped} existing file${skipped === 1 ? ' was' : 's were'} kept. Use --overwrite to replace them.`))
  if (addedVariables > 0) {
    lines.push(`${yellow('~')} ${config.styles}: added ${addedVariables} variable${addedVariables === 1 ? '' : 's'} that newer components use. Nothing already in the file was changed.`)
  }
  return lines.join('\n')
}

/** Every component and block with its summary, ticked where the project already has it. */
function catalog(cwd, config, registry) {
  const blocks = registry.blocks ?? {}
  const width = Math.max(...[...Object.keys(registry.components), ...Object.keys(blocks)].map((name) => name.length))
  const print = (entries, dir) =>
    Object.entries(entries).map(([name, entry]) => {
      const installed = config && existsSync(join(cwd, dir, name))
      const summary = entry.description.replace(/^.+? — /, '').replace(/^./, (first) => first.toUpperCase())
      return `  ${installed ? green('✓') : ' '} ${bold(name.padEnd(width))}  ${dim(summary)}`
    })

  const lines = print(registry.components, config?.components)
  if (Object.keys(blocks).length > 0) {
    lines.push(`\n${bold('Blocks')} ${dim('· sections of a page, built from the components above')}`, ...print(blocks, config && blocksDir(config)))
  }
  if (config) lines.push(dim(`\n  ✓ already in ${config.components} or ${blocksDir(config)}`))
  return lines.join('\n')
}

// ---------- commands ----------

async function init({ cwd, flags }) {
  const registry = await loadRegistry(flags.registry)
  const defaults = detectDefaults(cwd)
  checkNoConfig(cwd, flags.overwrite)

  const config = { components: defaults.components, lib: defaults.lib, styles: defaults.styles }
  if (!flags.yes && process.stdin.isTTY) {
    console.log(`${bold('Ermine UI')} ${dim(`· ${defaults.framework} project detected`)}\n`)
    const prompt = createInterface({ input: process.stdin, output: process.stdout })
    const ask = async (question, fallback) =>
      (await prompt.question(`${question} ${dim(`(${fallback})`)} `)).trim() || fallback
    config.components = await ask('Where should components go?', config.components)
    config.lib = await ask('Where should shared helpers go?', config.lib)
    config.styles = await ask('Where should the theme stylesheet go?', config.styles)
    prompt.close()
    console.log()
  }
  if (flags.registry) config.registry = flags.registry

  console.log(setUp(cwd, registry, defaults.framework, config, { overwrite: flags.overwrite }))
}

async function add({ cwd, flags, positional }) {
  console.log(await install(cwd, { names: positional, all: flags.all, overwrite: flags.overwrite, registry: flags.registry }))
}

async function list({ cwd, flags }) {
  const { config, registry } = await projectRegistry(cwd, flags.registry)
  console.log(catalog(cwd, config, registry))
}

// ---------- MCP server ----------
// "ermine mcp" lets AI coding tools (Claude Code, Codex, Cursor…) look components up and add them. It speaks the
// Model Context Protocol over stdio: one JSON-RPC message per line in each direction. Written by hand to keep the
// command line free of dependencies; it needs only initialize, ping, tools/list and tools/call.

const MCP_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']

const projectFolder = {
  type: 'string',
  description: "Absolute path of the project's root folder, where ermine.json is. Defaults to the folder the server was started in.",
}

const TOOLS = [
  {
    name: 'list_components',
    description: 'List every Ermine UI component and block with a one-line summary, ticking the ones the project already has.',
    inputSchema: { type: 'object', properties: { cwd: projectFolder } },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'get_component',
    description:
      'Get one component or block: what it does, what else it copies in, and its full source (props, slots, events and exports). Read this before writing code that uses it.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Name as list_components shows it, e.g. "date-picker".' }, cwd: projectFolder },
      required: ['name'],
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'init_project',
    description:
      "Set a Vue, Nuxt or Astro project up for Ermine UI: writes ermine.json with the usual folders for its framework and copies the theme stylesheet. Needed once, before add_components.",
    inputSchema: { type: 'object', properties: { cwd: projectFolder } },
  },
  {
    name: 'add_components',
    description:
      "Copy components or blocks into the project as source, with every component and helper they depend on, and imports pointed at the project's folders. Files already there are kept unless overwrite is true.",
    inputSchema: {
      type: 'object',
      properties: {
        names: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Components or blocks to add, e.g. ["button", "dialog"].' },
        overwrite: { type: 'boolean', description: 'Replace files that already exist. The theme stylesheet is never replaced.' },
        cwd: projectFolder,
      },
      required: ['names'],
    },
    annotations: { destructiveHint: true },
  },
]

const INSTRUCTIONS = `Ermine UI is a set of Vue 3 components that are copied into the project as source, not installed from npm.
Use get_component before writing code with a component, so you use its real props and parts. Import from the folder ermine.json names for components (by default "@/components/ui/<name>"; blocks in "@/components/blocks/<name>").
Styling: theme with the --er-* CSS variables in the theme stylesheet; component styles sit in @layer components, so plain CSS overrides them. Variants are props that become data-variant / data-size attributes.
If the project has no ermine.json, call init_project first.`

/** A fence longer than any run of backticks inside, so source that contains ``` does not end the block early. */
function fenced(code, language = '') {
  const fence = '`'.repeat(Math.max(2, ...[...code.matchAll(/`+/g)].map((match) => match[0].length)) + 1)
  return `${fence}${language}\n${code.trimEnd()}\n${fence}`
}

function componentDetails(registry, name) {
  const isBlock = !registry.components[name] && Boolean(registry.blocks?.[name])
  const entry = isBlock ? registry.blocks[name] : registry.components[name]
  if (!entry) throw new UserError(`Unknown component or block: ${name}. Call list_components to see what is available.`)

  const [title, ...rest] = entry.description.split(' — ')
  const parts = [`# ${title} (${isBlock ? 'block' : 'component'} "${name}")`, rest.join(' — ')]
  const brings = [
    entry.components.length > 0 && `components: ${entry.components.join(', ')}`,
    entry.lib.length > 0 && `helpers: ${entry.lib.join(', ')}`,
  ].filter(Boolean)
  if (brings.length > 0) parts.push(`Adding it also copies the ${brings.join('; ')}.`)
  parts.push(`Import from its folder, by default '@/components/${isBlock ? 'blocks' : 'ui'}/${name}'; index.ts lists what it exports.`)
  const languages = { vue: 'vue', ts: 'ts', css: 'css' }
  for (const file of entry.files) parts.push(`## ${file.file}\n\n${fenced(file.content, languages[file.file.split('.').pop()] ?? '')}`)
  return parts.join('\n\n')
}

const toolHandlers = {
  async list_components({ cwd }, source) {
    const { config, registry } = await projectRegistry(cwd, source)
    return (config ? '' : 'This project has no ermine.json yet, so nothing is ticked. Call init_project before adding components.\n\n') + catalog(cwd, config, registry)
  },
  async get_component({ cwd, name }, source) {
    const { registry } = await projectRegistry(cwd, source)
    return componentDetails(registry, String(name ?? ''))
  },
  async init_project({ cwd }, source) {
    const registry = await loadRegistry(source)
    const defaults = detectDefaults(cwd)
    checkNoConfig(cwd, false)
    const config = { components: defaults.components, lib: defaults.lib, styles: defaults.styles }
    if (source) config.registry = source
    return `${defaults.framework} project detected.\n${setUp(cwd, registry, defaults.framework, config, { overwrite: false })}`
  },
  async add_components({ cwd, names, overwrite }, source) {
    if (!Array.isArray(names)) throw new UserError('"names" must be a list of component or block names.')
    return install(cwd, { names: names.map(String), overwrite: overwrite === true, registry: source })
  },
}

async function respond({ method, params = {} }, source) {
  if (method === 'initialize') {
    const protocolVersion = MCP_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : MCP_VERSIONS[0]
    const version = JSON.parse(readFileSync(BUNDLED_REGISTRY, 'utf8')).version
    return { result: { protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'ermineui', version }, instructions: INSTRUCTIONS } }
  }
  if (method === 'ping') return { result: {} }
  if (method === 'tools/list') return { result: { tools: TOOLS } }
  if (method === 'tools/call') {
    const handler = toolHandlers[params.name]
    if (!handler) return { error: { code: -32602, message: `Unknown tool: ${params.name}` } }
    const args = params.arguments ?? {}
    try {
      const text = await handler({ ...args, cwd: resolve(args.cwd ?? process.cwd()) }, source)
      return { result: { content: [{ type: 'text', text }] } }
    } catch (error) {
      // A failed tool call is reported to the model as a result, so it can read the message and try again.
      return { result: { content: [{ type: 'text', text: error.message }], isError: true } }
    }
  }
  return { error: { code: -32601, message: `Method not found: ${method}` } }
}

async function serve({ flags }) {
  const send = (message) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`)
  for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
    if (!line.trim()) continue
    let message
    try {
      message = JSON.parse(line)
    } catch {
      send({ id: null, error: { code: -32700, message: 'Parse error' } })
      continue
    }
    // Notifications (no id) need no answer; "notifications/initialized" is the only one clients send here.
    if (message.id === undefined || message.id === null) continue
    send({ id: message.id, ...(await respond(message, flags.registry)) })
  }
}

const HELP = `${bold('ermine')} — copy Ermine UI components into your project

${bold('Usage')}
  ermine init                 Create ermine.json and the theme stylesheet
  ermine add <name...>        Copy components or blocks (and what they depend on) into your project
  ermine add --all            Copy every component
  ermine list                 Show available components and blocks
  ermine mcp                  Run as an MCP server, so AI coding tools can look components up and add them

${bold('Options')}
  -y, --yes                  Accept the suggested folders without asking
  -o, --overwrite            Replace files that already exist
      --cwd <dir>            Run as if started in <dir>
      --registry <url|path>  Use a different registry.json (your own fork, for example)
`

async function main() {
  const [command, ...rest] = process.argv.slice(2)
  const { flags, positional } = parseArgs(rest)
  const cwd = resolve(flags.cwd ?? process.cwd())
  const context = { cwd, flags, positional }

  if (command === 'init') return init(context)
  if (command === 'add') return add(context)
  if (command === 'list') return list(context)
  if (command === 'mcp') return serve(context)
  if (command === '--version' || command === '-v') {
    return console.log(JSON.parse(readFileSync(BUNDLED_REGISTRY, 'utf8')).version)
  }
  if (!command || command === 'help' || command === '--help' || command === '-h') return console.log(HELP)
  throw new UserError(`Unknown command "${command}". Run "ermine help" to see what is available.`)
}

main().catch((error) => {
  if (error instanceof UserError) {
    console.error(`${red('Error:')} ${error.message}`)
    process.exit(1)
  }
  throw error
})
