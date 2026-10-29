<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from 'vue'
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../toolbar'
import { cleanHtml, safeHref } from './clean'

const props = withDefaults(
  defineProps<{
    /** Accessible name of the writing area, e.g. "Description". */
    label: string
    placeholder?: string
    disabled?: boolean
    /** Height of the writing area before it grows, as a CSS length. */
    minHeight?: string
  }>(),
  { minHeight: '8rem' },
)

/** What was written, as HTML limited to the formatting on the toolbar. Empty when nothing has been typed. */
const model = defineModel<string>({ default: '' })

const editor = ref<HTMLElement | null>(null)
const linkInput = ref<HTMLInputElement | null>(null)
const linkId = useId()

/** Which formats apply where the caret is, so their buttons can show as pressed. */
const active = reactive({ bold: false, italic: false, underline: false, strikeThrough: false, insertUnorderedList: false, insertOrderedList: false, block: '', link: false })
const empty = ref(true)

const linking = ref(false)
const linkUrl = ref('')
const linkError = ref('')
/** Where the caret was when the link field opened; typing an address moves focus away, and the link must still land here. */
let savedRange: Range | undefined
/** The HTML last sent out, to tell a value set from outside from one that came from typing. */
let emitted = ''

const inEditor = (node: Node | null | undefined) => Boolean(node && editor.value?.contains(node))

// document.execCommand is marked as obsolete, but it is still the only way to edit rich text that keeps
// the browser's own undo history, and every browser supports it. Replacing it means bringing an editor library.
function command(name: string, value?: string) {
  editor.value?.focus()
  document.execCommand(name, false, value)
  sync()
}

function block(tag: string) {
  command('formatBlock', active.block === tag ? 'p' : tag)
}

function refresh() {
  const selection = document.getSelection()
  if (!selection || !inEditor(selection.anchorNode)) return
  for (const name of ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'] as const) active[name] = document.queryCommandState(name)
  active.block = String(document.queryCommandValue('formatBlock')).toLowerCase()
  const at = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement
  active.link = Boolean(at?.closest('a') && inEditor(at.closest('a')))
}

function sync() {
  const el = editor.value
  if (!el) return
  // A box cleared by hand still holds an empty paragraph or a line break; that counts as nothing written.
  empty.value = !el.textContent?.trim() && !el.querySelector('li')
  emitted = empty.value ? '' : el.innerHTML
  model.value = emitted
  refresh()
}

function setContent(html: string) {
  if (!editor.value) return
  editor.value.innerHTML = cleanHtml(html)
  empty.value = !editor.value.textContent?.trim()
  emitted = html
}

watch(model, (value) => {
  if (value !== emitted) setContent(value)
})

onMounted(() => {
  setContent(model.value)
  // Enter starts a new paragraph, rather than a div in some browsers and a line break in others.
  document.execCommand('defaultParagraphSeparator', false, 'p')
  document.addEventListener('selectionchange', refresh)
})

onBeforeUnmount(() => document.removeEventListener('selectionchange', refresh))

/** What is pasted is cut down to the formatting this editor offers, so a page's fonts and colours do not come with it. */
function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const html = event.clipboardData?.getData('text/html')
  if (html) command('insertHTML', cleanHtml(html))
  else command('insertText', event.clipboardData?.getData('text/plain') ?? '')
}

async function openLink() {
  const selection = document.getSelection()
  savedRange = selection && selection.rangeCount && inEditor(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : undefined
  const at = selection?.anchorNode instanceof Element ? selection.anchorNode : selection?.anchorNode?.parentElement
  linkUrl.value = at?.closest('a')?.getAttribute('href') ?? ''
  linkError.value = ''
  linking.value = true
  await nextTick()
  linkInput.value?.focus()
}

function restoreSelection() {
  editor.value?.focus()
  if (!savedRange) return
  const selection = document.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(savedRange)
}

function applyLink() {
  const typed = linkUrl.value.trim()
  // "example.com" is what people type; it only works as a link with a scheme in front.
  const href = safeHref(/^([a-z][a-z\d+.-]*:|[/#?])/i.test(typed) ? typed : typed && `https://${typed}`)
  if (!href) {
    linkError.value = 'Enter a web address, such as https://example.com.'
    return
  }
  linking.value = false
  restoreSelection()
  // With nothing selected there is nothing to turn into a link, so the address itself is written in.
  if (savedRange?.collapsed && !active.link) command('insertHTML', `<a href="${href.replace(/"/g, '&quot;')}">${href.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>`)
  else command('createLink', href)
}

function removeLink() {
  linking.value = false
  restoreSelection()
  command('unlink')
}

function cancelLink() {
  linking.value = false
  restoreSelection()
}
</script>

<template>
  <div class="er-rich-text-editor" :data-disabled="disabled ? '' : undefined">
    <!-- A press on a button would take the caret out of the text; stopping the mousedown keeps it where the format is wanted. -->
    <Toolbar class="er-rich-text-editor-toolbar" :label="`${label} formatting`" @mousedown.prevent>
      <ToolbarButton label="Bold" :pressed="active.bold" :disabled="disabled" @click="command('bold')"><b>B</b></ToolbarButton>
      <ToolbarButton label="Italic" :pressed="active.italic" :disabled="disabled" @click="command('italic')"><i>I</i></ToolbarButton>
      <ToolbarButton label="Underline" :pressed="active.underline" :disabled="disabled" @click="command('underline')"><u>U</u></ToolbarButton>
      <ToolbarButton label="Strikethrough" :pressed="active.strikeThrough" :disabled="disabled" @click="command('strikeThrough')"><s>S</s></ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton label="Heading" :pressed="active.block === 'h2'" :disabled="disabled" @click="block('h2')">H</ToolbarButton>
      <ToolbarButton label="Quote" :pressed="active.block === 'blockquote'" :disabled="disabled" @click="block('blockquote')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5v14M10 8h9M10 12h9M10 16h6" /></svg>
      </ToolbarButton>
      <ToolbarButton label="Bulleted list" :pressed="active.insertUnorderedList" :disabled="disabled" @click="command('insertUnorderedList')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4.500 6v.01M4.500 12v.01M4.500 18v.01" /></svg>
      </ToolbarButton>
      <ToolbarButton label="Numbered list" :pressed="active.insertOrderedList" :disabled="disabled" @click="command('insertOrderedList')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 6h10M10 12h10M10 18h10M4 5l1.500-1v5M4 15.500c0-1 2.500-1 2.500.500S4 18 4 19.500h2.500" /></svg>
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton label="Link" :pressed="active.link" :disabled="disabled" :aria-expanded="linking" :aria-controls="linking ? linkId : undefined" @click="linking ? cancelLink() : openLink()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />
        </svg>
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton label="Undo" :disabled="disabled" @click="command('undo')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5L4 9l4 4M4 9h10a5 5 0 0 1 0 10h-3" /></svg>
      </ToolbarButton>
      <ToolbarButton label="Redo" :disabled="disabled" @click="command('redo')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 5l4 4-4 4M20 9H10a5 5 0 0 0 0 10h3" /></svg>
      </ToolbarButton>
    </Toolbar>

    <!-- A field in the page rather than the browser's prompt box, which cannot be styled and blocks everything else. -->
    <form v-if="linking" :id="linkId" class="er-rich-text-editor-link" novalidate @submit.prevent="applyLink" @keydown.esc.stop="cancelLink">
      <input ref="linkInput" v-model="linkUrl" type="url" inputmode="url" placeholder="https://" aria-label="Link address" :aria-invalid="linkError ? true : undefined" :aria-describedby="linkError ? `${linkId}-error` : undefined" />
      <button type="submit">Apply</button>
      <button v-if="active.link" type="button" @click="removeLink">Remove</button>
      <button type="button" @click="cancelLink">Cancel</button>
      <p v-if="linkError" :id="`${linkId}-error`" class="er-rich-text-editor-error">{{ linkError }}</p>
    </form>

    <div
      ref="editor"
      class="er-rich-text-editor-content"
      role="textbox"
      aria-multiline="true"
      :aria-label="label"
      :aria-disabled="disabled || undefined"
      :contenteditable="!disabled"
      :data-empty="empty ? '' : undefined"
      :data-placeholder="placeholder"
      :style="{ minHeight }"
      @input="sync"
      @paste="onPaste"
    />
  </div>
</template>

<style>
@layer components {
  .er-rich-text-editor {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-rich-text-editor:has(.er-rich-text-editor-content:focus-visible) {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-rich-text-editor[data-disabled] {
    opacity: 0.5;
  }

  .er-rich-text-editor .er-rich-text-editor-toolbar {
    display: flex;
    border: 0;
    border-bottom: 1px solid var(--er-input);
    border-radius: calc(var(--er-radius-md) - 1px) calc(var(--er-radius-md) - 1px) 0 0;
    background: transparent;
  }

  .er-rich-text-editor-link {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.5rem;
    border-bottom: 1px solid var(--er-input);
    font-size: 0.875rem;
  }

  .er-rich-text-editor-link input {
    flex: 1;
    min-width: 10rem;
    height: 2rem;
    padding: 0 0.5rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-sm);
    background: var(--er-background);
    color: var(--er-foreground);
    font: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
  }

  .er-rich-text-editor-link button {
    height: 2rem;
    padding: 0 0.625rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-weight: var(--er-weight-medium);
    cursor: pointer;
  }

  .er-rich-text-editor-link button[type='submit'] {
    border-color: var(--er-primary);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  .er-rich-text-editor-link :is(input, button):focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-rich-text-editor-link input[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }

  .er-rich-text-editor-error {
    flex-basis: 100%;
    margin: 0;
    color: var(--er-destructive);
    font-size: 0.8125rem;
  }

  .er-rich-text-editor-content {
    position: relative;
    padding: 0.625rem 0.75rem;
    color: var(--er-foreground);
    font-size: 1rem;
    line-height: 1.6;
    outline: none;
    overflow-wrap: anywhere;
  }

  @media (min-width: 48rem) {
    .er-rich-text-editor-content {
      font-size: 0.9375rem;
    }
  }

  .er-rich-text-editor-content[data-empty]::before {
    content: attr(data-placeholder);
    position: absolute;
    color: var(--er-muted-foreground);
    pointer-events: none;
  }

  .er-rich-text-editor-content > * {
    margin-block: 0;
  }

  .er-rich-text-editor-content > * + * {
    margin-block-start: 0.6em;
  }

  .er-rich-text-editor-content :is(h2, h3) {
    font-size: 1.25em;
    font-weight: var(--er-weight-heading);
    line-height: 1.3;
  }

  .er-rich-text-editor-content :is(ul, ol) {
    padding-inline-start: 1.5em;
  }

  .er-rich-text-editor-content blockquote {
    margin-inline: 0;
    padding-inline-start: 0.875em;
    border-inline-start: 3px solid var(--er-border);
    color: var(--er-muted-foreground);
  }

  .er-rich-text-editor-content a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
}
</style>
