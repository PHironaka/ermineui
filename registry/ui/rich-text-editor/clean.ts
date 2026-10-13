/** The only tags the editor keeps. Everything else is unwrapped: its text stays, the tag goes. */
const ALLOWED = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'STRIKE', 'A', 'UL', 'OL', 'LI', 'H2', 'H3', 'BLOCKQUOTE', 'CODE', 'PRE', 'DIV'])
/** Tags whose contents go too. */
const DROPPED = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH', 'HEAD', 'TITLE', 'META', 'LINK'])

/** An address that is safe to link to. Anything with a scheme other than these, such as javascript:, is refused. */
export function safeHref(href: string): string | undefined {
  const trimmed = href.trim()
  const scheme = trimmed.match(/^([a-z][a-z\d+.-]*):/i)?.[1]!.toLowerCase()
  return trimmed && (!scheme || ['http', 'https', 'mailto', 'tel'].includes(scheme)) ? trimmed : undefined
}

function walk(parent: Node) {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove()
      continue
    }
    const el = child as Element
    const tag = el.tagName.toUpperCase()
    if (DROPPED.has(tag)) {
      el.remove()
      continue
    }
    walk(el)
    if (!ALLOWED.has(tag)) {
      el.replaceWith(...Array.from(el.childNodes))
      continue
    }
    // No attribute survives except a link's address: no styles, no classes, no event handlers.
    for (const attribute of Array.from(el.attributes)) {
      if (!(tag === 'A' && attribute.name === 'href')) el.removeAttribute(attribute.name)
    }
    if (tag === 'A') {
      const href = safeHref(el.getAttribute('href') ?? '')
      if (href) el.setAttribute('rel', 'noopener noreferrer')
      else el.removeAttribute('href')
    }
  }
}

/**
 * Strips HTML down to the formatting the editor offers. Used on what is pasted in and on the value given
 * to the editor. It needs a browser: on a server it returns nothing, and the editor fills in once mounted.
 * Clean the HTML again on your server before storing it; a request can be made without this page.
 */
export function cleanHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return ''
  // Parsed into a document of its own, where scripts do not run and pictures do not load.
  const body = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body
  walk(body)
  return body.innerHTML
}
