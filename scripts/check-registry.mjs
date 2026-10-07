#!/usr/bin/env node
// Runs the real CLI once per component, each time into an empty folder, and checks that every
// relative import in what was copied points at a file that was also copied. This is what catches a
// component that works in this repo but arrives broken in someone's project because a file it
// needs was not counted as a dependency.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cli = join(root, 'cli', 'bin', 'ermine.mjs')
const registry = JSON.parse(readFileSync(join(root, 'cli', 'registry.json'), 'utf8'))
const work = mkdtempSync(join(tmpdir(), 'ermine-check-'))
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
const isFile = (path) => existsSync(path) && statSync(path).isFile()
const problems = []

// Nuxt can auto-import components by file name, so no two components may share one.
const owners = new Map()
for (const [name, component] of Object.entries(registry.components)) {
  for (const { file } of component.files) {
    if (!file.endsWith('.vue')) continue
    if (owners.has(file)) problems.push(`${file} exists in both "${owners.get(file)}" and "${name}"`)
    owners.set(file, name)
  }
}

try {
  for (const name of Object.keys(registry.components)) {
    const project = join(work, name)
    mkdirSync(project)
    execFileSync('node', [cli, 'init', '-y', '--cwd', project], { stdio: 'pipe' })
    execFileSync('node', [cli, 'add', name, '--cwd', project], { stdio: 'pipe' })

    for (const file of walk(join(project, 'src'))) {
      const source = readFileSync(file, 'utf8')
      const short = file.slice(project.length + 1)
      if (source.includes("'../../lib/")) problems.push(`add ${name}: ${short} still has an unrewritten helper import`)
      for (const match of source.matchAll(/(?:from|import)\s+'(\.[^']+)'/g)) {
        const target = resolve(dirname(file), match[1])
        if (!['', '.ts', '.vue', '/index.ts'].some((ending) => isFile(target + ending))) {
          problems.push(`add ${name}: ${short} imports ${match[1]}, which was not copied`)
        }
      }
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}

for (const problem of problems) console.error(problem)
console.log(`${Object.keys(registry.components).length} components installed one at a time, ${owners.size} .vue files: ${problems.length} problems`)
process.exit(problems.length ? 1 : 0)
