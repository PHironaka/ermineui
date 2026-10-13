/**
 * A small Markdown renderer: headings, paragraphs, emphasis, code, links, pictures, lists (nested, numbered,
 * task lists), quotes, rules and tables. Everything in the source is escaped and only the tags written out
 * below are ever produced, so the result is safe to put in the page even when the text came from a stranger.
 * It does not pass HTML through, and it is not a full CommonMark implementation; swap in a library for that.
 */

export interface MarkdownOptions {
  /** Added to every heading's level, so "#" can come out as h2 or h3 on a page that already has an h1. */
  headingOffset?: number
}

export const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** An address that is safe to link to: an ordinary web, mail or phone link, or one within the site. Anything else, such as javascript:, is refused. */
export function safeUrl(url: string): string | undefined {
  const trimmed = url.trim()
  const scheme = trimmed.match(/^([a-z][a-z\d+.-]*):/i)?.[1]!.toLowerCase()
  return !scheme || ['http', 'https', 'mailto', 'tel'].includes(scheme) ? trimmed : undefined
}

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/
const QUOTE = /^ {0,3}>\s?(.*)$/
const ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

/** Emphasis, code, links and pictures within one block of text. */
function inline(text: string): string {
  // Finished pieces of HTML are set aside under a marker, so later steps cannot mistake them for Markdown.
  const held: string[] = []
  const hold = (html: string) => `\u0000${held.push(html) - 1}\u0000`

  let out = text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_match, _ticks, code: string) => hold(`<code>${escapeHtml(code.trim())}</code>`))
  out = out.replace(/\\([\\`*_{}[\]()#+\-.!|~<>])/g, (_match, character: string) => hold(escapeHtml(character)))
  out = escapeHtml(out)

  out = out.replace(/!\[([^\]]*)\]\(([^()\s]+)(?:\s+&quot;(.*?)&quot;)?\)/g, (match, alt: string, url: string, title?: string) => {
    const safe = safeUrl(url)
    return safe ? hold(`<img src="${safe}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy">`) : match
  })
  out = out.replace(/\[([^\]]+)\]\(([^()\s]+)(?:\s+&quot;(.*?)&quot;)?\)/g, (match, label: string, url: string, title?: string) => {
    const safe = safeUrl(url)
    // Only the tags are set aside: the words of the link can still be made bold or italic.
    return safe ? `${hold(`<a href="${safe}"${title ? ` title="${title}"` : ''}>`)}${label}${hold('</a>')}` : match
  })
  out = out.replace(/&lt;((?:https?:\/\/|mailto:)[^\s<>]+?)&gt;/g, (_match, url: string) => hold(`<a href="${url}">${url.replace(/^mailto:/, '')}</a>`))

  out = out
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    // Underscores only count at the edges of words, so snake_case_names are left alone.
    .replace(/(^|[^\w\\])__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/\*(?=\S)([^*]*?\S)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w\\])_(?=\S)([^_]*?\S)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    // Two spaces, or a backslash, at the end of a line break it there.
    .replace(/(?: {2,}|\\)\n/g, '<br>\n')

  // Put back what was set aside. A picture's description can itself hold a marker, hence the loop.
  while (/\u0000\d+\u0000/.test(out)) out = out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => held[Number(index)]!)
  return out
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'))

function table(lines: string[], start: number): [string, number] {
  const aligns = cells(lines[start + 1]!).map((cell) => (cell.startsWith(':') && cell.endsWith(':') ? 'center' : cell.endsWith(':') ? 'right' : undefined))
  const attribute = (index: number) => (aligns[index] ? ` data-align="${aligns[index]}"` : '')
  const head = cells(lines[start]!).map((cell, index) => `<th scope="col"${attribute(index)}>${inline(cell)}</th>`)
  const rows: string[] = []
  let i = start + 2
  for (; i < lines.length && lines[i]!.trim() && lines[i]!.includes('|'); i++) {
    const row = cells(lines[i]!)
    // A short row is padded and a long one cut, so every row has as many cells as the header.
    rows.push(`<tr>${head.map((_cell, index) => `<td${attribute(index)}>${inline(row[index] ?? '')}</td>`).join('')}</tr>`)
  }
  // The wrapper is what scrolls when the table is wider than the page; it can be focused so the keyboard can scroll it.
  return [`<div data-table tabindex="0"><table><thead><tr>${head.join('')}</tr></thead>${rows.length ? `<tbody>${rows.join('')}</tbody>` : ''}</table></div>`, i]
}

function list(lines: string[], start: number, options: MarkdownOptions): [string, number] {
  const first = lines[start]!.match(ITEM)!
  const indent = first[1]!.length
  const ordered = /\d/.test(first[2]!)
  const items: string[][] = []
  // A blank line between items makes the list "loose": each item's text is then a paragraph of its own.
  let loose = false
  let contentIndent = indent + 2
  let i = start

  while (i < lines.length) {
    const line = lines[i]!
    const match = line.match(ITEM)
    const spaces = line.match(/^\s*/)![0].length

    if (match && match[1]!.length <= indent + 1 && !RULE.test(line)) {
      // A marker of the other kind, or one further out, belongs to a different list.
      if (match[1]!.length < indent || /\d/.test(match[2]!) !== ordered) break
      contentIndent = indent + match[2]!.length + 1
      items.push([match[3]!])
    } else if (!line.trim()) {
      // A blank line ends the list unless what follows still belongs to it.
      let next = i + 1
      while (next < lines.length && !lines[next]!.trim()) next++
      const after = lines[next]
      const afterItem = after?.match(ITEM)
      const continues = after !== undefined && ((afterItem && afterItem[1]!.length >= indent && afterItem[1]!.length <= indent + 1 && /\d/.test(afterItem[2]!) === ordered) || after.match(/^\s*/)![0].length >= indent + 2)
      if (!continues) break
      loose = loose || Boolean(afterItem && afterItem[1]!.length <= indent + 1)
      items[items.length - 1]!.push('')
    } else if (spaces >= indent + 2 || lines[i - 1]?.trim()) {
      // Indented under the item, or simply carrying its paragraph on to another line.
      items[items.length - 1]!.push(line.slice(Math.min(spaces, contentIndent)))
    } else {
      break
    }
    i++
  }

  const html = items.map((item) => {
    const task = item[0]!.match(/^\[([ xX])\]\s+(.*)$/)
    if (task) item[0] = task[2]!
    let body = blocks(item, options)
    if (!loose) body = body.replace(/^<p>([\s\S]*?)<\/p>/, '$1')
    const box = task ? `<input type="checkbox" disabled aria-label="${task[1] === ' ' ? 'Not done' : 'Done'}"${task[1] === ' ' ? '' : ' checked'}> ` : ''
    return `<li${task ? ' data-task' : ''}>${box}${body}</li>`
  })
  const number = Number.parseInt(first[2]!, 10)
  const tag = ordered ? 'ol' : 'ul'
  return [`<${tag}${ordered && number !== 1 ? ` start="${number}"` : ''}>${html.join('')}</${tag}>`, i]
}

function blocks(lines: string[], options: MarkdownOptions): string {
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!
    if (!line.trim()) {
      i++
      continue
    }

    const fence = line.match(FENCE)
    if (fence) {
      const closing = new RegExp(`^ {0,3}${fence[1]![0]}{${fence[1]!.length},}\\s*$`)
      const body: string[] = []
      for (i++; i < lines.length && !closing.test(lines[i]!); i++) body.push(lines[i]!)
      i++
      out.push(`<pre><code${fence[2] ? ` class="language-${escapeHtml(fence[2])}"` : ''}>${escapeHtml(body.join('\n'))}\n</code></pre>`)
      continue
    }

    const heading = line.match(HEADING)
    if (heading) {
      const level = Math.min(6, heading[1]!.length + (options.headingOffset ?? 0))
      out.push(`<h${level}>${inline(heading[2]!)}</h${level}>`)
      i++
      continue
    }

    if (RULE.test(line)) {
      out.push('<hr>')
      i++
      continue
    }

    if (QUOTE.test(line)) {
      const inner: string[] = []
      for (; i < lines.length && QUOTE.test(lines[i]!); i++) inner.push(lines[i]!.match(QUOTE)![1]!)
      out.push(`<blockquote>${blocks(inner, options)}</blockquote>`)
      continue
    }

    if (ITEM.test(line)) {
      const [html, next] = list(lines, i, options)
      out.push(html)
      i = next
      continue
    }

    if (line.includes('|') && lines[i + 1]?.includes('-') && TABLE_RULE.test(lines[i + 1]!)) {
      const [html, next] = table(lines, i)
      out.push(html)
      i = next
      continue
    }

    // Anything else is a paragraph, running on until a blank line or the start of another kind of block.
    const paragraph: string[] = []
    for (; i < lines.length && lines[i]!.trim(); i++) {
      if (paragraph.length && (FENCE.test(lines[i]!) || HEADING.test(lines[i]!) || RULE.test(lines[i]!) || QUOTE.test(lines[i]!) || ITEM.test(lines[i]!))) break
      paragraph.push(lines[i]!.replace(/^\s+/, ''))
    }
    out.push(`<p>${inline(paragraph.join('\n'))}</p>`)
  }

  return out.join('\n')
}

/** Markdown in, HTML out. */
export function renderMarkdown(source: string, options: MarkdownOptions = {}): string {
  // Tabs become spaces so indentation can be counted; the marker character is ours, so it is not allowed in.
  const lines = source.replace(/\u0000/g, '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n')
  return blocks(lines, options)
}
