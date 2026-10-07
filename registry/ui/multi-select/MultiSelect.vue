<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
import { useFloating } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { provideMultiSelect } from './context'

// Attributes such as id and aria-invalid go to the input, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Submit the values with a form under this name, one entry per choice. */
  name?: string
  disabled?: boolean
  /** Shown while nothing is chosen. */
  placeholder?: string
  /** Most choices allowed. Further options cannot be added until one is removed. */
  max?: number
}>()

const values = defineModel<string[]>({ default: () => [] })
const open = defineModel<boolean>('open', { default: false })

const anchor = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const listId = useId()
const labels = reactive(new Map<string, string>())
const activeId = ref<string>()
const text = ref('')

const query = computed(() => text.value.trim().toLowerCase())
const matches = (label: string) => label.toLowerCase().includes(query.value)
const empty = computed(() => ![...labels.values()].some(matches))
const full = computed(() => props.max !== undefined && values.value.length >= props.max)

/** Said aloud: tags appear and disappear, and the list shrinks as you type, all without focus moving. */
const status = ref('')
watch(query, (text) => {
  if (!open.value || !text) return
  const count = [...labels.values()].filter(matches).length
  status.value = count === 0 ? 'No results' : `${count} ${count === 1 ? 'result' : 'results'}`
})

function options(): HTMLElement[] {
  return Array.from(
    list.value?.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled]):not([data-hidden])') ?? [],
  )
}

function setActive(option: HTMLElement | undefined) {
  activeId.value = option?.id
  option?.scrollIntoView({ block: 'nearest' })
}

async function show() {
  if (props.disabled || open.value) return
  open.value = true
  await nextTick()
  setActive(options()[0])
}

function close() {
  if (!open.value) return
  open.value = false
  text.value = ''
  activeId.value = undefined
}

function toggle(value: string) {
  const name = labels.get(value) ?? value
  if (values.value.includes(value)) {
    values.value = values.value.filter((other) => other !== value)
    status.value = `${name} removed`
  } else if (!full.value) {
    values.value = [...values.value, value]
    status.value = `${name} added`
  }
  // The list stays open for the next choice; only what was typed is cleared.
  text.value = ''
  input.value?.focus()
}

function remove(value: string) {
  values.value = values.value.filter((other) => other !== value)
  status.value = `${labels.get(value) ?? value} removed`
  input.value?.focus()
}

async function onInput(event: Event) {
  text.value = (event.target as HTMLInputElement).value
  if (!props.disabled) open.value = true
  await nextTick()
  setActive(options()[0])
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      show()
      return
    }
    const items = options()
    const current = items.findIndex((item) => item.id === activeId.value)
    const last = items.length - 1
    if (event.key === 'ArrowDown') setActive(items[current === last ? 0 : current + 1])
    else setActive(items[current <= 0 ? last : current - 1])
  } else if (event.key === 'Enter' && open.value) {
    // Keeps Enter from submitting the form while the list is open.
    event.preventDefault()
    options()
      .find((item) => item.id === activeId.value)
      ?.click()
  } else if (event.key === 'Backspace' && text.value === '' && values.value.length) {
    // With nothing typed, Backspace takes off the last tag.
    remove(values.value[values.value.length - 1]!)
  }
}

provideMultiSelect({ values, toggle, labels, matches, activeId })

useFloating(anchor, list, open, { side: 'bottom', align: 'start', sideOffset: 4 })
useLayer(list, open, {
  ignore: () => [anchor.value],
  onDismiss: close,
  // Focus never leaves the input; the highlighted option is tracked with aria-activedescendant.
  initialFocus: () => false,
  restoreFocus: false,
})
</script>

<template>
  <!-- Pressing anywhere in the box puts the cursor in the input, as it would in a plain text field. -->
  <div ref="anchor" class="er-multi-select" :data-disabled="disabled ? '' : undefined" @mousedown="($event.target as HTMLElement).tagName !== 'INPUT' && $event.preventDefault()" @click="input?.focus()">
    <span v-for="value in values" :key="value" class="er-multi-select-tag">
      {{ labels.get(value) ?? value }}
      <button type="button" tabindex="-1" :aria-label="`Remove ${labels.get(value) ?? value}`" :disabled="disabled" @click.stop="remove(value)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </span>
    <input
      ref="input"
      v-bind="$attrs"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="open ? activeId : undefined"
      :placeholder="values.length ? undefined : placeholder"
      :disabled="disabled"
      :value="text"
      @input="onInput"
      @keydown="onKeydown"
      @click="show"
      @blur="close"
    />
    <span class="er-multi-select-status" role="status">{{ status }}</span>
  </div>

  <Portal>
    <!-- Stays mounted while closed so each item can register its label. Pressing here must not blur the input. -->
    <div
      :id="listId"
      ref="list"
      role="listbox"
      aria-multiselectable="true"
      class="er-floating er-multi-select-content"
      :data-state="open ? 'open' : 'closed'"
      :data-full="full ? '' : undefined"
      @mousedown.prevent
    >
      <slot />
      <div v-if="empty" class="er-multi-select-empty"><slot name="empty">No results.</slot></div>
    </div>
  </Portal>

  <template v-if="name">
    <input v-for="value in values" :key="value" type="hidden" :name="name" :value="value" :disabled="disabled" />
  </template>
</template>

<style>
@layer components {
  .er-multi-select {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    min-height: 2.25rem;
    padding: 0.25rem 0.375rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    cursor: text;
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-multi-select:focus-within {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-multi-select:has(input[aria-invalid='true']) {
    border-color: var(--er-destructive);
  }

  .er-multi-select[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-multi-select input {
    flex: 1;
    min-width: 6rem;
    height: 1.5rem;
    padding: 0 0.375rem;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    outline: none;
  }

  @media (min-width: 48rem) {
    .er-multi-select input {
      font-size: 0.875rem;
    }
  }

  .er-multi-select input::placeholder {
    color: var(--er-muted-foreground);
  }

  .er-multi-select-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    max-width: 100%;
    height: 1.5rem;
    padding: 0 0.125rem 0 0.5rem;
    border-radius: var(--er-radius-sm);
    background: var(--er-secondary);
    color: var(--er-secondary-foreground);
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .er-multi-select-tag button {
    display: grid;
    place-items: center;
    width: 1.125rem;
    height: 1.125rem;
    padding: 0;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-multi-select-tag button:hover {
    background: color-mix(in oklab, var(--er-foreground) 10%, transparent);
    color: var(--er-foreground);
  }

  .er-multi-select-tag svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .er-multi-select-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-multi-select-content {
    min-width: max(8rem, var(--er-anchor-width, 8rem));
    max-height: min(20rem, var(--er-available-size, 20rem));
    padding: 0.25rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--er-shadow-md);
    overflow-y: auto;
    /* Open/close animation in plain CSS: browsers without @starting-style simply skip it. */
    transition:
      opacity var(--er-duration) var(--er-ease),
      transform var(--er-duration) var(--er-ease),
      display var(--er-duration) allow-discrete;
  }

  .er-multi-select-content[data-state='closed'] {
    display: none;
    opacity: 0;
    transform: scale(0.96);
  }

  @starting-style {
    .er-multi-select-content[data-state='open'] {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  .er-multi-select-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    border-radius: var(--er-radius-sm);
    line-height: 1.25rem;
    cursor: default;
    user-select: none;
  }

  .er-multi-select-item[data-active] {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  /* At the limit, options not yet chosen fade: they cannot be added until one is removed. */
  .er-multi-select-item[data-disabled],
  .er-multi-select-content[data-full] .er-multi-select-item[aria-selected='false'] {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-multi-select-box {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1rem;
    height: 1rem;
    border: 1px solid var(--er-input);
    border-radius: 4px;
  }

  .er-multi-select-box svg {
    width: 0.75rem;
    height: 0.75rem;
    visibility: hidden;
  }

  .er-multi-select-item[aria-selected='true'] .er-multi-select-box {
    border-color: var(--er-primary);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  .er-multi-select-item[aria-selected='true'] .er-multi-select-box svg {
    visibility: visible;
  }

  .er-multi-select-empty {
    padding: 0.75rem 0.5rem;
    color: var(--er-muted-foreground);
    text-align: center;
  }
}
</style>
