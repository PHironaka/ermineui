<script setup lang="ts">
import { ref } from 'vue'

// Attributes such as id and aria-invalid go to the input, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Submit the tags with a form under this name, one entry per tag. */
    name?: string
    disabled?: boolean
    /** Shown while there are no tags. */
    placeholder?: string
    /** Most tags allowed. */
    max?: number
    /** Return a message to turn a tag away, or nothing to accept it. */
    validate?: (tag: string) => string | undefined | null | false
    /** Characters that finish a tag as they are typed. Enter always does. */
    delimiters?: readonly string[]
  }>(),
  { delimiters: () => [','] },
)

const tags = defineModel<string[]>({ default: () => [] })

const input = ref<HTMLInputElement | null>(null)
const text = ref('')
/** Why the last attempt was turned away. Announced to screen readers and shown under the field. */
const problem = ref('')
/** Said aloud when a tag is added or removed: the tag appears, but the input just empties and focus stays put. */
const status = ref('')

/** Adds what it can from `raw`, which may hold several tags (a pasted list). Returns what could not be added. */
function add(raw: string): string {
  const next = [...tags.value]
  let rejected = ''
  problem.value = ''
  for (const tag of raw.split(new RegExp(`[\\n${props.delimiters.map((char) => `\\${char}`).join('')}]`)).map((part) => part.trim())) {
    if (!tag) continue
    const message =
      next.some((other) => other.toLowerCase() === tag.toLowerCase()) ? `${tag} is already added.`
      : props.max !== undefined && next.length >= props.max ? `Only ${props.max} allowed.`
      : props.validate?.(tag)
    if (message) {
      problem.value = message
      rejected = tag
    } else next.push(tag)
  }
  const added = next.slice(tags.value.length)
  if (added.length) status.value = `${added.join(', ')} added`
  tags.value = next
  return rejected
}

function commit() {
  // A tag that was turned away stays in the box, ready to be corrected.
  text.value = add(text.value)
}

function remove(index: number) {
  status.value = `${tags.value[index]} removed`
  tags.value = tags.value.filter((_tag, other) => other !== index)
  problem.value = ''
  input.value?.focus()
}

function onInput(event: Event) {
  text.value = (event.target as HTMLInputElement).value
  problem.value = ''
  if (props.delimiters.some((char) => text.value.includes(char))) commit()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && text.value.trim()) {
    // Keeps Enter from submitting the form while a tag is being typed.
    event.preventDefault()
    commit()
  } else if (event.key === 'Backspace' && text.value === '' && tags.value.length) {
    remove(tags.value.length - 1)
  }
}

function onPaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text') ?? ''
  if (!/[\n,]/.test(pasted) && !props.delimiters.some((char) => pasted.includes(char))) return
  event.preventDefault()
  text.value = add(text.value + pasted)
}
</script>

<template>
  <div class="sb-tags-input-wrap">
    <!-- Pressing anywhere in the box puts the cursor in the input, as it would in a plain text field. -->
    <div class="sb-tags-input" :data-disabled="disabled ? '' : undefined" @mousedown="($event.target as HTMLElement).tagName !== 'INPUT' && $event.preventDefault()" @click="input?.focus()">
      <span v-for="(tag, index) in tags" :key="tag" class="sb-tags-input-tag">
        {{ tag }}
        <button type="button" tabindex="-1" :aria-label="`Remove ${tag}`" :disabled="disabled" @click.stop="remove(index)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </span>
      <input
        ref="input"
        v-bind="$attrs"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        :placeholder="tags.length ? undefined : placeholder"
        :disabled="disabled"
        :value="text"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
        @blur="commit"
      />
    </div>
    <!-- Always in the page, empty until a tag is turned away, so the reason is reliably announced. -->
    <p class="sb-tags-input-problem" role="alert">{{ problem }}</p>
    <span class="sb-tags-input-status" role="status">{{ status }}</span>
    <template v-if="name">
      <input v-for="tag in tags" :key="tag" type="hidden" :name="name" :value="tag" :disabled="disabled" />
    </template>
  </div>
</template>

<style>
@layer components {
  .sb-tags-input-wrap {
    position: relative;
    display: grid;
    gap: 0.375rem;
    width: 100%;
    min-width: 0;
  }

  .sb-tags-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.375rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    box-shadow: var(--sb-shadow-xs);
    cursor: text;
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  .sb-tags-input:focus-within {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-tags-input:has(input[aria-invalid='true']) {
    border-color: var(--sb-destructive);
  }

  .sb-tags-input[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-tags-input input {
    flex: 1;
    min-width: 6rem;
    height: 1.5rem;
    padding: 0 0.375rem;
    border: 0;
    background: transparent;
    color: var(--sb-foreground);
    font-family: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    outline: none;
  }

  @media (min-width: 48rem) {
    .sb-tags-input input {
      font-size: 0.875rem;
    }
  }

  .sb-tags-input input::placeholder {
    color: var(--sb-muted-foreground);
  }

  .sb-tags-input-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    max-width: 100%;
    height: 1.5rem;
    padding: 0 0.125rem 0 0.5rem;
    border-radius: var(--sb-radius-sm);
    background: var(--sb-secondary);
    color: var(--sb-secondary-foreground);
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
  }

  .sb-tags-input-tag button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.125rem;
    height: 1.125rem;
    padding: 0;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: var(--sb-muted-foreground);
    cursor: pointer;
  }

  .sb-tags-input-tag button:hover {
    background: color-mix(in oklab, var(--sb-foreground) 10%, transparent);
    color: var(--sb-foreground);
  }

  .sb-tags-input-tag svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .sb-tags-input-problem {
    margin: 0;
    color: var(--sb-destructive);
    font-size: 0.8125rem;
  }

  .sb-tags-input-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .sb-tags-input-problem:empty {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
}
</style>
