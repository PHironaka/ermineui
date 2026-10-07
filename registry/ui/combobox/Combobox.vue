<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
import { useFloating } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { provideCombobox } from './context'

// Attributes such as id and aria-invalid go to the input, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Submit the value with a form under this name. */
  name?: string
  disabled?: boolean
  placeholder?: string
}>()

const value = defineModel<string>()
const open = defineModel<boolean>('open', { default: false })

const anchor = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const listId = useId()
const labels = reactive(new Map<string, string>())
const activeId = ref<string>()

/** What is in the input: the chosen option's label, or whatever the user is typing. */
const text = ref('')
/** Only filter once the user types — opening the list with a value chosen shows every option. */
const filtering = ref(false)

const selectedLabel = computed(() =>
  value.value === undefined || value.value === '' ? '' : (labels.get(value.value) ?? value.value),
)
const query = computed(() => (filtering.value ? text.value.trim().toLowerCase() : ''))
const matches = (label: string) => label.toLowerCase().includes(query.value)
const empty = computed(() => ![...labels.values()].some(matches))
/** Said aloud while typing: the list changes on screen, but focus stays in the input and nothing else reports it. */
const status = computed(() => {
  if (!open.value || !filtering.value) return ''
  const count = [...labels.values()].filter(matches).length
  return count === 0 ? 'No results' : `${count} ${count === 1 ? 'result' : 'results'}`
})

watch(
  selectedLabel,
  (label) => {
    if (!open.value) text.value = label
  },
  { immediate: true },
)

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
  const items = options()
  setActive(items.find((item) => item.getAttribute('aria-selected') === 'true') ?? items[0])
}

function select(next: string) {
  value.value = next
  text.value = labels.get(next) ?? next
  open.value = false
  filtering.value = false
  activeId.value = undefined
}

/** Close without choosing: an emptied input clears the value, anything else goes back to the chosen label. */
function close() {
  if (!open.value) return
  const cleared = text.value.trim() === ''
  if (cleared) value.value = undefined
  text.value = cleared ? '' : selectedLabel.value
  open.value = false
  filtering.value = false
  activeId.value = undefined
}

async function onInput(event: Event) {
  text.value = (event.target as HTMLInputElement).value
  filtering.value = true
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
  }
}

provideCombobox({ value, select, labels, matches, activeId })

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
  <div ref="anchor" class="er-combobox">
    <input
      v-bind="$attrs"
      type="text"
      role="combobox"
      class="er-combobox-input"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="open ? activeId : undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="text"
      @input="onInput"
      @keydown="onKeydown"
      @click="show"
      @blur="close"
    />
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
    <span class="er-combobox-status" role="status">{{ status }}</span>
  </div>

  <Portal>
    <!-- Stays mounted while closed so each item can register its label. Pressing here must not blur the input. -->
    <div
      :id="listId"
      ref="list"
      role="listbox"
      class="er-floating er-combobox-content"
      :data-state="open ? 'open' : 'closed'"
      @mousedown.prevent
    >
      <slot />
      <div v-if="empty" class="er-combobox-empty"><slot name="empty">No results.</slot></div>
    </div>
  </Portal>

  <input v-if="name" type="hidden" :name="name" :value="value ?? ''" :disabled="disabled" />
</template>

<style>
@layer components {
  .er-combobox {
    position: relative;
    width: 100%;
  }

  .er-combobox-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 2.25rem;
    padding: 0 2.25rem 0 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    font-family: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    line-height: 1.25rem;
    text-overflow: ellipsis;
    box-shadow: var(--er-shadow-xs);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  @media (min-width: 48rem) {
    .er-combobox-input {
      font-size: 0.875rem;
    }
  }

  .er-combobox-input::placeholder {
    color: var(--er-muted-foreground);
  }

  .er-combobox-input:focus-visible {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-combobox-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-combobox-input[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }

  .er-combobox > svg {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    width: 1rem;
    height: 1rem;
    color: var(--er-muted-foreground);
    transform: translateY(-50%);
    pointer-events: none;
  }

  .er-combobox-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-combobox-content {
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

  .er-combobox-content[data-state='closed'] {
    display: none;
    opacity: 0;
    transform: scale(0.96);
  }

  @starting-style {
    .er-combobox-content[data-state='open'] {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  .er-combobox-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.375rem 0.5rem;
    border-radius: var(--er-radius-sm);
    line-height: 1.25rem;
    cursor: default;
    user-select: none;
  }

  .er-combobox-item[data-active] {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-combobox-item[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-combobox-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    visibility: hidden;
  }

  .er-combobox-item[aria-selected='true'] svg {
    visibility: visible;
  }

  .er-combobox-empty {
    padding: 0.75rem 0.5rem;
    color: var(--er-muted-foreground);
    text-align: center;
  }
}
</style>
