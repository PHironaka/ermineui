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
    assert.match(fails(dir, 'add', 'buton'), /Unknown component or block: buton/)
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

test('add copies a block beside the components, with the components it is built from', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    const output = ermine(dir, 'add', 'sign-in')
    assert.match(output, /1 block and \d+ components/)
    assert.ok(existsSync(join(dir, 'src/components/blocks/sign-in/SignIn.vue')))
    for (const name of ['card', 'field', 'input', 'input-group', 'button']) {
      assert.ok(existsSync(join(dir, 'src/components/ui', name, 'index.ts')), `${name} was copied`)
    }
    const lines = ermine(dir, 'list').split('\n')
    assert.ok(lines.some((line) => line.includes('Blocks')))
    assert.ok(lines.find((line) => line.includes('sign-in'))!.includes('✓'))
    assert.ok(!lines.find((line) => line.includes('dashboard'))!.includes('✓'))
  })
})

test('a block’s imports follow the folders named in ermine.json', () => {
  project((dir) => {
    writeFileSync(
      join(dir, 'ermine.json'),
      JSON.stringify({ components: 'app/ui', lib: 'app/helpers', styles: 'app/ermine.css', blocks: 'app/pages/parts' }),
    )
    ermine(dir, 'add', 'dashboard')
    const shell = readFileSync(join(dir, 'app/pages/parts/dashboard/DashboardShell.vue'), 'utf8')
    assert.ok(shell.includes("from '../../../ui/sidebar'"), 'component imports are rewritten')
    assert.ok(!shell.includes("'../../ui/"))
    assert.ok(existsSync(join(dir, 'app/ui/sidebar/Sidebar.vue')))
    assert.ok(existsSync(join(dir, 'app/ui/icon/icons.ts')))
  })
})

// Talks to "ermine mcp" the way an AI coding tool would: one JSON-RPC message per line on stdin, answers on stdout.
function mcp(cwd: string, ...calls: [string, Record<string, unknown>?][]) {
  const messages = [
    { jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    ...calls.map(([method, params], index) => ({ jsonrpc: '2.0', id: index + 1, method, params })),
  ]
  const output = execFileSync('node', [cli, 'mcp'], { cwd, encoding: 'utf8', input: messages.map((message) => JSON.stringify(message)).join('\n') })
  return output.trim().split('\n').map((line) => JSON.parse(line))
}
const call = (name: string, args: Record<string, unknown>) => ['tools/call', { name, arguments: args }] as [string, Record<string, unknown>]
const text = (response: { result: { content: { text: string }[] } }) => response.result.content[0]!.text

test('the MCP server answers the handshake and lists its tools', () => {
  project((dir) => {
    const [hello, tools, unknown] = mcp(dir, ['tools/list'], ['resources/list'])
    assert.equal(hello.result.protocolVersion, '2025-06-18', 'agrees to the version the client asked for')
    assert.deepEqual(hello.result.capabilities, { tools: {} })
    assert.deepEqual(
      tools.result.tools.map((tool: { name: string }) => tool.name),
      ['list_components', 'get_component', 'init_project', 'add_components', 'set_theme'],
    )
    assert.equal(unknown.error.code, -32601)
  })
})

test('through the MCP server, a project is set up, components are added and read', () => {
  project((dir) => {
    const [, before, init, add, again, details, list, missing] = mcp(
      dir,
      call('add_components', { names: ['button'] }),
      call('init_project', {}),
      call('add_components', { names: ['dialog'] }),
      call('add_components', { names: ['dialog'] }),
      call('get_component', { name: 'select' }),
      call('list_components', {}),
      call('get_component', { name: 'buton' }),
    )
    assert.equal(before.result.isError, true)
    assert.match(text(before), /ermine init/, 'says the project needs setting up first')
    assert.match(text(init), /Vue project detected/)
    assert.ok(existsSync(join(dir, 'ermine.json')))
    assert.match(text(add), /Done\./)
    assert.ok(existsSync(join(dir, 'src/components/ui/dialog/DialogContent.vue')))
    assert.match(text(again), /kept/)
    assert.doesNotMatch(text(add), /\u001b\[/, 'no terminal colour codes in what the model reads')
    assert.match(text(details), /## SelectTrigger\.vue/)
    assert.match(text(details), /helpers: .*floating/)
    assert.ok(text(list).split('\n').find((line) => /^  . dialog /.test(line))!.includes('✓'))
    assert.equal(missing.result.isError, true)
  })
})

test('theme writes a base and an accent into the stylesheet, swaps them, and removes them', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    const stylesheet = join(dir, 'src/styles/ermine.css')
    const original = readFileSync(stylesheet, 'utf8')

    assert.match(ermine(dir, 'theme', 'blue'), /accent blue/)
    assert.match(ermine(dir, 'theme', 'stone'), /base stone, accent blue/, 'picking a base keeps the accent')
    let css = readFileSync(stylesheet, 'utf8')
    assert.ok(css.startsWith(original.trimEnd()), 'what was there is untouched')
    assert.ok(css.indexOf('ermine theme base: stone') < css.indexOf('ermine theme accent: blue'), 'the base comes first, so the accent wins')

    ermine(dir, 'theme', 'zinc', 'rose')
    css = readFileSync(stylesheet, 'utf8')
    assert.equal(css.match(/ermine theme base:/g)?.length, 1, 'the old base block is replaced, not added to')
    assert.ok(css.includes('ermine theme base: zinc') && css.includes('ermine theme accent: rose'))
    assert.ok(ermine(dir, 'theme').split('\n').find((line) => /\srose\s/.test(line))!.includes('✓'))

    assert.match(fails(dir, 'theme', 'blue', 'rose'), /Pick one accent theme/)
    assert.match(fails(dir, 'theme', 'purple'), /Unknown theme: purple\. Bases: .*slate.*Accents: .*blue/)

    ermine(dir, 'theme', '--reset')
    assert.equal(readFileSync(stylesheet, 'utf8'), original, 'reset gives back the file as it was')
  })
})

test('init --theme applies themes straight away, and they survive variables being appended', () => {
  project((dir) => {
    ermine(dir, 'init', '-y', '--theme', 'slate,green')
    const stylesheet = join(dir, 'src/styles/ermine.css')
    writeFileSync(stylesheet, readFileSync(stylesheet, 'utf8').replace(/^\s*--er-chart-1:.*\n/m, ''))
    ermine(dir, 'add', 'chart')
    ermine(dir, 'theme', 'violet')
    const css = readFileSync(stylesheet, 'utf8')
    assert.ok(css.includes('ermine theme base: slate') && css.includes('ermine theme accent: violet'))
    assert.match(css, /Added by "ermine add"[\s\S]*--er-chart-1/)
  })
})

test('through the MCP server, themes are listed and applied', () => {
  project((dir) => {
    ermine(dir, 'init', '-y')
    const [, list, set, wrong] = mcp(dir, call('set_theme', {}), call('set_theme', { names: ['stone', 'orange'] }), call('set_theme', { names: ['teal'] }))
    assert.match(text(list), /Bases[\s\S]*slate[\s\S]*Accents[\s\S]*orange/)
    assert.match(text(set), /base stone, accent orange/)
    assert.ok(readFileSync(join(dir, 'src/styles/ermine.css'), 'utf8').includes('ermine theme accent: orange'))
    assert.equal(wrong.result.isError, true)
  })
})
