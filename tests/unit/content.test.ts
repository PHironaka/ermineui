import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countComments, initials } from '../../registry/ui/comment-thread/types.ts'
import { diffHunks, diffLines, diffStats } from '../../registry/ui/diff-viewer/diff.ts'
import { emojiCategories, searchEmoji } from '../../registry/ui/emoji-picker/emoji.ts'
import { clampOffset, coverScale, sourceRect } from '../../registry/ui/image-cropper/crop.ts'
import { renderMarkdown, safeUrl } from '../../registry/ui/markdown/parse.ts'
import { formatTime, spokenTime } from '../../registry/ui/media-player/time.ts'
import { scorePassword } from '../../registry/ui/password-strength/strength.ts'
import { formatNational, parsePhone, phoneCountries, toE164 } from '../../registry/ui/phone-input/phone.ts'
import { findSize, formatMeasurement, toInches } from '../../registry/ui/size-guide/units.ts'

test('formatNational adds a separator only once something follows it', () => {
  assert.equal(formatNational('', '(###) ###-####'), '')
  assert.equal(formatNational('555', '(###) ###-####'), '(555')
  assert.equal(formatNational('5550100199', '(###) ###-####'), '(555) 010-0199')
  // More digits than the format has room for are kept.
  assert.equal(formatNational('55501001991', '(###) ###-####'), '(555) 010-01991')
  assert.equal(formatNational('07 700-900', undefined), '07700900')
})

test('toE164 drops the leading zero that is not dialled from abroad', () => {
  const uk = phoneCountries.find((country) => country.code === 'GB')!
  assert.equal(toE164(uk, '07700 900123'), '+447700900123')
  assert.equal(toE164(uk, ''), '')
})

test('parsePhone takes the longest calling code, and the preferred country among those that share one', () => {
  assert.equal(parsePhone('+353871234567').country?.code, 'IE')
  assert.equal(parsePhone('+353871234567').national, '871234567')
  assert.equal(parsePhone('+15550100199', phoneCountries, 'US').country?.code, 'US')
  assert.equal(parsePhone('+15550100199', phoneCountries, 'CA').country?.code, 'CA')
  assert.deepEqual(parsePhone('555 0100'), { national: '5550100' })
  assert.equal(parsePhone('+9990000').country, undefined)
})

test('scorePassword rewards length and variety, and marks down the tricks that only look strong', () => {
  assert.equal(scorePassword(''), 0)
  assert.equal(scorePassword('a'), 1)
  assert.equal(scorePassword('Password1!'), 1)
  assert.equal(scorePassword('abcd1234'), 1)
  assert.equal(scorePassword('aaaaaaaaaaaa'), 1)
  assert.equal(scorePassword('xK9#mQ2$vL'), 4)
  assert.equal(scorePassword('correct horse battery staple'), 4)
  assert.ok(scorePassword('hunter2') < scorePassword('hunter2-Quartz-Lamp'))
})

test('diffLines reports as few changes as it can, removals before the additions that replace them', () => {
  const lines = diffLines('a\nb\nc\n', 'a\nB\nc\nd')
  assert.deepEqual(lines.map((line) => `${line.type[0]}${line.text}`), ['sa', 'rb', 'aB', 'sc', 'ad'])
  assert.deepEqual(lines.map((line) => [line.before, line.after]), [[1, 1], [2, undefined], [undefined, 2], [3, 3], [undefined, 4]])
  assert.deepEqual(diffStats(lines), { added: 2, removed: 1 })
  assert.deepEqual(diffLines('', 'x').map((line) => line.type), ['added'])
  assert.deepEqual(diffLines('same\r\n', 'same'), [{ type: 'same', text: 'same', before: 1, after: 1 }])
})

test('diffHunks keeps a few lines around each change and splits changes that are far apart', () => {
  const before = Array.from({ length: 20 }, (_line, index) => `line ${index + 1}`)
  const after = [...before]
  after[1] = 'changed 2'
  after[17] = 'changed 18'
  const hunks = diffHunks(diffLines(before.join('\n'), after.join('\n')), 2)
  assert.equal(hunks.length, 2)
  assert.deepEqual([hunks[0].beforeStart, hunks[0].afterStart], [1, 1])
  assert.deepEqual([hunks[1].beforeStart, hunks[1].afterStart], [16, 16])
  assert.equal(hunks[0].lines.length, 5)
  assert.deepEqual(diffHunks(diffLines('a\nb', 'a\nb')), [])
})

test('renderMarkdown writes its own tags and escapes everything else', () => {
  assert.equal(renderMarkdown('# Hi'), '<h1>Hi</h1>')
  assert.equal(renderMarkdown('# Hi', { headingOffset: 2 }), '<h3>Hi</h3>')
  assert.equal(renderMarkdown('a **b** *c* _d_ ~~e~~ `f<g>`'), '<p>a <strong>b</strong> <em>c</em> <em>d</em> <del>e</del> <code>f&lt;g&gt;</code></p>')
  assert.equal(renderMarkdown('snake_case_name'), '<p>snake_case_name</p>')
  assert.equal(renderMarkdown('<script>alert(1)</script>'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>')
  assert.equal(renderMarkdown('<img src=x onerror=alert(1)>'), '<p>&lt;img src=x onerror=alert(1)&gt;</p>')
  assert.equal(renderMarkdown('```js\nconst a = "<b>"\n```'), '<pre><code class="language-js">const a = &quot;&lt;b&gt;&quot;\n</code></pre>')
})

test('renderMarkdown only links to addresses that are safe', () => {
  assert.equal(renderMarkdown('[a](https://example.com "T")'), '<p><a href="https://example.com" title="T">a</a></p>')
  assert.equal(renderMarkdown('[a](/local?x=1&y=2)'), '<p><a href="/local?x=1&amp;y=2">a</a></p>')
  assert.equal(renderMarkdown('[a](javascript:alert(1))'), '<p>[a](javascript:alert(1))</p>')
  assert.ok(!renderMarkdown('[a](JaVaScRiPt:alert`1`)').includes('<a'))
  assert.ok(!renderMarkdown('![x](data:text/html,<b>)').includes('<img'))
  // A quote in an address or a title cannot close the attribute it is in.
  assert.ok(!renderMarkdown('[a](https://x.test/"onmouseover="alert(1))').includes('"onmouseover'))
  assert.equal(safeUrl('mailto:a@b.co'), 'mailto:a@b.co')
  assert.equal(safeUrl(' vbscript:x'), undefined)
})

test('renderMarkdown handles lists, task lists, quotes and tables', () => {
  assert.equal(renderMarkdown('- a\n- b\n  - c'), '<ul><li>a</li><li>b\n<ul><li>c</li></ul></li></ul>')
  assert.equal(renderMarkdown('3. a\n4. b'), '<ol start="3"><li>a</li><li>b</li></ol>')
  assert.equal(renderMarkdown('- [x] done\n- [ ] todo'), '<ul><li data-task><input type="checkbox" disabled aria-label="Done" checked> done</li><li data-task><input type="checkbox" disabled aria-label="Not done"> todo</li></ul>')
  assert.equal(renderMarkdown('> a\n> b'), '<blockquote><p>a\nb</p></blockquote>')
  assert.equal(renderMarkdown('---'), '<hr>')
  assert.equal(
    renderMarkdown('| A | B |\n|---|--:|\n| 1 | 2 |'),
    '<div data-table tabindex="0"><table><thead><tr><th scope="col">A</th><th scope="col" data-align="right">B</th></tr></thead><tbody><tr><td>1</td><td data-align="right">2</td></tr></tbody></table></div>',
  )
})

test('toInches rounds to the nearest half, and a range is written with a dash', () => {
  assert.equal(toInches(2.54), 1)
  assert.equal(toInches(96), 38)
  assert.equal(toInches(91), 36)
  assert.equal(formatMeasurement([86, 91], 'cm'), '86–91')
  assert.equal(formatMeasurement([86, 91], 'in'), '34–36')
  assert.equal(formatMeasurement(undefined, 'cm'), '')
})

test('findSize picks the first size big enough', () => {
  const rows = [
    { size: 'S', measurements: { chest: [86, 91] as const } },
    { size: 'M', measurements: { chest: [96, 101] as const } },
  ]
  assert.equal(findSize(rows, 'chest', 88), 'S')
  // Between two sizes, the larger one.
  assert.equal(findSize(rows, 'chest', 93), 'M')
  assert.equal(findSize(rows, 'chest', 120), undefined)
  assert.equal(findSize(rows, 'waist', 80), undefined)
})

test('a crop never lets the edge of the picture inside the frame', () => {
  const image = { width: 600, height: 400 }
  const frame = { width: 200, height: 200 }
  assert.equal(coverScale(image, frame), 0.5)
  // At a zoom of 1 the picture is 300 by 200: it can slide 50 either way across, and not at all up or down.
  assert.deepEqual(clampOffset({ x: 400, y: 30, zoom: 1 }, image, frame), { x: 50, y: 0, zoom: 1 })
  assert.deepEqual(clampOffset({ x: -400, y: -30, zoom: 1 }, image, frame), { x: -50, y: -0, zoom: 1 })
  assert.deepEqual(sourceRect({ x: 0, y: 0, zoom: 1 }, image, frame), { x: 100, y: 0, width: 400, height: 400 })
  assert.deepEqual(sourceRect({ x: 50, y: 0, zoom: 1 }, image, frame), { x: 0, y: 0, width: 400, height: 400 })
  assert.deepEqual(sourceRect({ x: 0, y: 0, zoom: 2 }, image, frame), { x: 200, y: 100, width: 200, height: 200 })
})

test('formatTime writes seconds as a clock, and spokenTime as words', () => {
  assert.equal(formatTime(0), '0:00')
  assert.equal(formatTime(75.9), '1:15')
  assert.equal(formatTime(3725), '1:02:05')
  assert.equal(formatTime(Number.NaN), '0:00')
  assert.equal(spokenTime(0), '0 seconds')
  assert.equal(spokenTime(61), '1 minute 1 second')
  assert.equal(spokenTime(3600), '1 hour')
})

test('comments are counted with their replies, and names become initials', () => {
  assert.equal(countComments([{ id: 'a', author: 'A', body: '', replies: [{ id: 'b', author: 'B', body: '', replies: [{ id: 'c', author: 'C', body: '' }] }] }, { id: 'd', author: 'D', body: '' }]), 4)
  assert.equal(initials('Maya Robinson'), 'MR')
  assert.equal(initials('  ines  '), 'I')
  assert.equal(initials('Hearth & Kiln Studio'), 'HS')
})

test('searchEmoji matches every word typed, in any order', () => {
  assert.deepEqual(searchEmoji('').length, 0)
  assert.ok(searchEmoji('heart').length > 5)
  assert.deepEqual(searchEmoji('hands clapping').map((emoji) => emoji.name), ['clapping hands'])
  // No emoji is listed twice, or the picker would have two buttons with the same key.
  const all = emojiCategories.flatMap((category) => category.emoji.map((emoji) => emoji.char))
  assert.equal(new Set(all).size, all.length)
})
