import assert from 'node:assert/strict'
import { test } from 'node:test'
// @ts-expect-error: a plain JavaScript module with no type declarations
import handler from '../../site/netlify/functions/mcp.mjs'

// The website's remote MCP server, called the way Netlify calls it: a web Request in, a Response out.
const post = (body: unknown) =>
  handler(new Request('https://ermineui.test/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify(body) }))
const call = async (name: string, args: object = {}) => {
  const response = await post({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } })
  const { result } = await response.json()
  return { text: result.content[0].text as string, isError: result.isError === true }
}

test('the remote server answers the handshake, lists read-only tools, and needs no session', async () => {
  const response = await post({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } } })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type')!, /application\/json/)
  assert.equal(response.headers.get('mcp-session-id'), null)
  const { result } = await response.json()
  assert.equal(result.protocolVersion, '2025-06-18')
  assert.equal(result.serverInfo.name, 'ermineui')
  assert.match(result.instructions, /cannot see or change the user's project/)

  assert.equal((await post({ jsonrpc: '2.0', method: 'notifications/initialized' })).status, 202, 'a notification gets no body')
  const { result: list } = await (await post({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).json()
  assert.deepEqual(list.tools.map((tool: { name: string }) => tool.name), ['list_components', 'get_component', 'get_theme', 'install_instructions'])
  assert.ok(list.tools.every((tool: { annotations: { readOnlyHint: boolean } }) => tool.annotations.readOnlyHint))
})

test('the remote tools look components up and give back source, without any ANSI colour codes', async () => {
  const list = await call('list_components')
  assert.match(list.text, /^ +button +/m)
  assert.match(list.text, /Blocks/)
  assert.ok(!list.text.includes('\u001b['))

  const button = await call('get_component', { name: 'button' })
  assert.match(button.text, /^# Button \(component "button"\)/)
  assert.match(button.text, /## Button\.vue/)

  const missing = await call('get_component', { name: 'nope' })
  assert.equal(missing.isError, true)
  assert.match(missing.text, /Unknown component or block: nope/)

  const install = await call('install_instructions', { names: ['product-detail'] })
  assert.match(install.text, /npx ermineui add product-detail/)
  assert.match(install.text, /Components \(into src\/components\/ui\/<name>\): .*button/, 'it lists what the block brings with it')
  assert.match(install.text, /import \{ ProductDetail \} from '@\/components\/blocks\/product-detail'/)
})

test('get_theme lists the themes, and gives the CSS and command for a choice, fonts first', async () => {
  assert.match((await call('get_theme')).text, /Styles[\s\S]*editorial[\s\S]*Bases[\s\S]*slate[\s\S]*Accents[\s\S]*blue/)

  const { text } = await call('get_theme', { names: ['blue', 'editorial', 'stone'] })
  assert.match(text, /npx ermineui theme editorial stone blue/, 'the command names them style, base, accent')
  const css = text.slice(text.indexOf('```css'))
  assert.ok(css.indexOf('@import') < css.indexOf('ermine theme style: editorial'))
  assert.ok(css.indexOf('ermine theme base: stone') < css.indexOf('ermine theme accent: blue'))

  const whole = (await call('get_theme', { names: ['soft'], whole_stylesheet: true })).text
  assert.match(whole, /```css\n\/\* ermine theme fonts \*\/\n@import/, 'the complete file starts with the fonts')
  assert.match(whole, /--er-background:[\s\S]*ermine theme style: soft/, 'and has the defaults before the style')

  assert.match((await call('get_theme', { names: ['editorial', 'soft'] })).text, /Pick one style theme/)
})

test('the remote server turns away what is not an MCP message', async () => {
  const get = await handler(new Request('https://ermineui.test/mcp'))
  assert.equal(get.status, 405)
  assert.equal(get.headers.get('allow'), 'POST, OPTIONS')

  const options = await handler(new Request('https://ermineui.test/mcp', { method: 'OPTIONS' }))
  assert.equal(options.status, 204)
  assert.equal(options.headers.get('access-control-allow-origin'), '*')

  const garbled = await handler(new Request('https://ermineui.test/mcp', { method: 'POST', body: '{not json' }))
  assert.equal(garbled.status, 400)
  assert.equal((await garbled.json()).error.code, -32700)

  assert.equal((await (await post({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'toString' } })).json()).error.code, -32602)
  assert.equal((await (await post({ jsonrpc: '2.0', id: 1, method: 'resources/list' })).json()).error.code, -32601)
})
