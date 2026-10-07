import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

// Runs the real command line in throwaway folders. `npm run registry` must have been run first,
// since the CLI reads the packed registry (npm test does this before the unit tests).
const cli = join(import.meta.dirname, '..', '..', 'cli', 'bin', 'ermine.mjs')
const ermine = (cwd: string, ...args: string[]) => execFileSync('node', [cli, ...args, '--cwd', cwd], { encoding: 'utf8' })
const fails = (cwd: string, ...args: string[]) => {
  try {
    execFileSync('node', [cli, ...args, '--cwd', cwd], { encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    return String((error as { stderr: string }).stderr)
  }
  assert.fail(`"ermine ${args.join(' ')}" should have failed`)
}

function project(run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'ermine-cli-'))
  try {
    run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('init writes the config and the stylesheet, and refuses to do it twice', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    assert.deepEqual(JSON.parse(readFileSync(join(dir, 'ermine.json'), 'utf8')), {
      components: 'src/components/ui',
      lib: 'src/lib/ermine',
      styles: 'src/styles/ermine.css',
    })
    assert.ok(readFileSync(join(dir, 'src/styles/ermine.css'), 'utf8').includes('--er-primary'))
    assert.match(fails(dir, 'init', '-y'), /already exists/)
  })
})

test('init picks Nuxt’s folders when it sees a Nuxt project', () => {
  project((dir) => {
    writeFileSync(join(dir, 'nuxt.config.ts'), 'export default {}')
    ermine(dir, 'init', '-y')
    assert.equal(JSON.parse(readFileSync(join(dir, 'ermine.json'), 'utf8')).components, 'components/ui')
  })
})

test('add copies a component with what it depends on, and points its imports at the project’s helpers', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    const output = ermine(dir, 'add', 'sheet')
    assert.match(output, /including button, dialog|including dialog/)
    for (const file of ['sheet/SheetContent.vue', 'dialog/DialogContent.vue', 'dialog/context.ts']) {
      assert.ok(existsSync(join(dir, 'src/components/ui', file)), `${file} was copied`)
    }
    assert.ok(existsSync(join(dir, 'src/lib/ermine/layer.ts')))
    const source = readFileSync(join(dir, 'src/components/ui/sheet/SheetContent.vue'), 'utf8')
    assert.ok(source.includes("from '../../../lib/ermine/layer'"), 'helper imports are rewritten')
    assert.ok(!source.includes("'../../lib/"))
  })
})

test('add keeps files that are already there unless told to overwrite', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    ermine(dir, 'add', 'badge')
    const file = join(dir, 'src/components/ui/badge/Badge.vue')
    writeFileSync(file, '<!-- mine -->')
    assert.match(ermine(dir, 'add', 'badge'), /kept/)
    assert.equal(readFileSync(file, 'utf8'), '<!-- mine -->')
    ermine(dir, 'add', 'badge', '--overwrite')
    assert.notEqual(readFileSync(file, 'utf8'), '<!-- mine -->')
  })
})

test('an older stylesheet gains the variables newer components need, and keeps everything it had', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    const file = join(dir, 'src/styles/ermine.css')
    // A stylesheet from before charts and fluid type existed, with the owner's own primary colour.
    const older = readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => !/--er-chart-|--er-type-/.test(line))
      .join('\n')
      .replace(/--er-primary:[^;]+;/, '--er-primary: rebeccapurple;')
    writeFileSync(file, older)
    assert.ok(!older.includes('--er-chart-1'))

    const output = ermine(dir, 'add', 'chart')
    const updated = readFileSync(file, 'utf8')
    assert.match(output, /added 14 variables/)
    assert.ok(updated.startsWith(older.trimEnd()), 'nothing already in the file was touched')
    assert.ok(updated.includes('--er-primary: rebeccapurple;'))
    assert.match(updated, /--er-chart-1: light-dark\(#2a78d6, #3987e5\);/)
    assert.match(updated, /--er-type-ratio-max: 1\.3;/)

    // Running again adds nothing more.
    assert.doesNotMatch(ermine(dir, 'add', 'chart'), /added \d+ variable/)
    assert.equal(readFileSync(file, 'utf8'), updated)
  })
})

test('a stylesheet that is already up to date is left byte for byte alone', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    const file = join(dir, 'src/styles/ermine.css')
    const before = readFileSync(file, 'utf8')
    ermine(dir, 'add', 'button', 'chart')
    assert.equal(readFileSync(file, 'utf8'), before)
  })
})

test('mistakes get a clear message and a failing exit code', () => {
  project((dir) => {
    assert.match(fails(dir, 'add', 'button'), /Run "ermine init" first/)
    ermine(dir, 'init', '-y')
    assert.match(fails(dir, 'add', 'buton'), /Unknown component: buton/)
    assert.match(fails(dir, 'add'), /Name at least one component/)
    assert.match(fails(dir, 'frobnicate'), /Unknown command/)
  })
})

test('list marks what is installed', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    ermine(dir, 'add', 'badge')
    const lines = ermine(dir, 'list').split('\n')
    assert.ok(lines.find((line) => line.includes('badge'))!.includes('✓'))
    assert.ok(!lines.find((line) => /^\s+\S*\s*button\s/.test(line) || line.trim().startsWith('button'))!.includes('✓'))
  })
})
