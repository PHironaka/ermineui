#!/usr/bin/env node
// Packs everything under registry/ into cli/registry.json, the single file the CLI reads.
// Dependencies are worked out from the import statements, so there is no manifest to keep in sync.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registryDir = join(root, 'registry')
const read = (path) => readFileSync(path, 'utf8')
const sorted = (set) => [...set].sort()

function importsMatching(source, pattern) {
  return new Set([...source.matchAll(pattern)].map((match) => match[1]))
}

// Shared behavior helpers: registry/lib/<name>.ts
const lib = {}
for (const file of readdirSync(join(registryDir, 'lib')).sort()) {
  const content = read(join(registryDir, 'lib', file))
  lib[file.replace(/\.ts$/, '')] = {
    file,
    content,
    lib: sorted(importsMatching(content, /from '\.\/([\w-]+)'/g)),
  }
}

// Components: registry/ui/<name>/*
const components = {}
for (const name of readdirSync(join(registryDir, 'ui')).sort()) {
  const dir = join(registryDir, 'ui', name)
  const files = readdirSync(dir)
    .sort()
    .map((file) => ({ file, content: read(join(dir, file)) }))
  const source = files.map((file) => file.content).join('\n')
  const index = files.find((file) => file.file === 'index.ts')?.content ?? ''

  components[name] = {
    description: index.match(/\/\*\*\s*(.+?)\s*\*\//s)?.[1] ?? '',
    files,
    lib: sorted(importsMatching(source, /from '\.\.\/\.\.\/lib\/([\w-]+)'/g)),
    components: sorted(importsMatching(source, /from '\.\.\/([\w-]+)(?:\/[\w.-]+)?'/g)),
  }
}

for (const [name, component] of Object.entries(components)) {
  for (const dep of component.lib) if (!lib[dep]) throw new Error(`${name} imports unknown helper "${dep}"`)
  for (const dep of component.components) if (!components[dep]) throw new Error(`${name} imports unknown component "${dep}"`)
}

const pkg = JSON.parse(read(join(root, 'cli', 'package.json')))
const registry = {
  name: 'sable',
  version: pkg.version,
  styles: { file: 'sable.css', content: read(join(registryDir, 'styles', 'sable.css')) },
  lib,
  components,
}

writeFileSync(join(root, 'cli', 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`)
console.log(
  `registry.json: ${Object.keys(components).length} components, ${Object.keys(lib).length} helpers, v${registry.version}`,
)
