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

/** The requested components plus every component and helper they depend on. */
function resolveDependencies(registry, names) {
  const components = new Set()
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

  names.forEach(addComponent)
  return { components: [...components].sort(), lib: [...lib].sort() }
}

function report(results) {
  const symbol = { created: green('+'), overwritten: yellow('~'), skipped: dim('·') }
  for (const [path, status] of results) {
    console.log(`  ${symbol[status]} ${path}${status === 'skipped' ? dim('  exists, kept as is') : ''}`)
  }
}

// ---------- commands ----------

async function init({ cwd, flags }) {
  const registry = await loadRegistry(flags.registry)
  const defaults = detectDefaults(cwd)
  const configPath = join(cwd, CONFIG_FILE)

  if (existsSync(configPath) && !flags.overwrite) {
    throw new UserError(`${CONFIG_FILE} already exists. Use --overwrite to replace it.`)
  }

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

  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  const styles = writeFile(cwd, config.styles, registry.styles.content, { overwrite: flags.overwrite })
  report([
    [CONFIG_FILE, 'created'],
    [config.styles, styles],
  ])

  const importPath = config.styles.replace(/^(app|src)\//, '')
  const next = {
    Nuxt: `Add the stylesheet to nuxt.config:  css: ['~/${importPath}']`,
    Astro: `Import the stylesheet in your layout:  import '../${importPath}'`,
    Vue: `Import the stylesheet in your entry file:  import './${importPath}'`,
  }[defaults.framework]
  console.log(`\n${bold('Next')}\n  1. ${next}\n  2. Add components:  ermine add button dialog\n`)
}

async function add({ cwd, flags, positional }) {
  const config = loadConfig(cwd)
  const registry = await loadRegistry(flags.registry ?? config.registry)
  const available = Object.keys(registry.components)
  const requested = flags.all ? available : positional

  if (requested.length === 0) {
    throw new UserError('Name at least one component, e.g. "ermine add button", or use --all.')
  }
  const unknown = requested.filter((name) => !registry.components[name])
  if (unknown.length > 0) {
    throw new UserError(`Unknown component: ${unknown.join(', ')}. Run "ermine list" to see what is available.`)
  }

  const needed = resolveDependencies(registry, requested)
  const results = []
  const options = { overwrite: flags.overwrite }

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

  report(results)
  const extra = needed.components.filter((name) => !requested.includes(name))
  const skipped = results.filter(([, status]) => status === 'skipped').length
  console.log(
    `\n${green('Done.')} ${needed.components.length} component${needed.components.length === 1 ? '' : 's'}` +
      (extra.length > 0 ? ` (including ${extra.join(', ')}, which the others need)` : '') +
      '.',
  )
  if (skipped > 0) console.log(dim(`${skipped} existing file${skipped === 1 ? ' was' : 's were'} kept. Use --overwrite to replace them.`))
  if (addedVariables > 0) {
    console.log(`${yellow('~')} ${config.styles}: added ${addedVariables} variable${addedVariables === 1 ? '' : 's'} that newer components use. Nothing already in the file was changed.`)
  }
}

async function list({ cwd, flags }) {
  const configPath = join(cwd, CONFIG_FILE)
  const config = existsSync(configPath) ? loadConfig(cwd) : null
  const registry = await loadRegistry(flags.registry ?? config?.registry)
  const width = Math.max(...Object.keys(registry.components).map((name) => name.length))

  for (const [name, component] of Object.entries(registry.components)) {
    const installed = config && existsSync(join(cwd, config.components, name))
    const summary = component.description.replace(/^.+? — /, '').replace(/^./, (first) => first.toUpperCase())
    console.log(`  ${installed ? green('✓') : ' '} ${bold(name.padEnd(width))}  ${dim(summary)}`)
  }
  if (config) console.log(dim(`\n  ✓ already in ${config.components}`))
}

const HELP = `${bold('ermine')} — copy Ermine UI components into your project

${bold('Usage')}
  ermine init                 Create ermine.json and the theme stylesheet
  ermine add <name...>        Copy components (and what they depend on) into your project
  ermine add --all            Copy every component
  ermine list                 Show available components

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
