import assert from 'node:assert/strict'
import { test } from 'node:test'
import { iconNames, iconPath, icons, registerIcons } from '../../registry/ui/icon/icons.ts'

test('every built-in icon is a path that stays on the 24 by 24 grid', () => {
  for (const [name, path] of Object.entries(icons)) {
    assert.match(path, /^M[\dMmLlHhVvCcSsAaZz .\-]+$/, `${name} is path data only`)
    // Absolute coordinates are the ones that could put a shape off the grid.
    for (const [, x, y] of path.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) {
      assert.ok(Number(x) >= 1 && Number(x) <= 23 && Number(y) >= 1 && Number(y) <= 23, `${name} starts a line at ${x},${y}`)
    }
  }
})

test('names are lower case with hyphens, so they read the same everywhere', () => {
  for (const name of Object.keys(icons)) assert.match(name, /^[a-z]+(-[a-z]+)*$/)
})

test('registered icons are found by name, and can replace a built-in one', () => {
  assert.equal(iconPath('rocket'), undefined)
  registerIcons({ rocket: 'M5 19l14-14', check: 'M4 12l5 5' })
  assert.equal(iconPath('rocket'), 'M5 19l14-14')
  assert.equal(iconPath('check'), 'M4 12l5 5')
  assert.ok(iconNames().includes('rocket'))
  assert.equal(iconNames().filter((name) => name === 'check').length, 1)
})
