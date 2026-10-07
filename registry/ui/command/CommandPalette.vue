<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from 'vue'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { lockScroll } from '../../lib/scroll-lock'
import { provideCommand } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Letter that opens the palette together with ⌘ (Mac) or Ctrl. Pass false for no shortcut. */
    shortcut?: string | false
    placeholder?: string
    /** Accessible name of the palette. */
    label?: string
    /** Close after an item is chosen. */
    closeOnSelect?: boolean
  }>(),
  { shortcut: 'k', placeholder: 'Type a command or search…', label: 'Command palette', closeOnSelect: true },
)

const open = defineModel<boolean>('open', { default: false })

const content = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const listId = useId()
const entries = reactive(new Map<string, { text: string; group?: string }>())
const activeId = ref<string>()
const text = ref('')

const query = computed(() => text.value.trim().toLowerCase())
// Every word typed has to appear somewhere, in any order: "dep prod" finds "Promote deployment to production".
const matches = (candidate: string) => {
  const haystack = candidate.toLowerCase()
  return query.value.split(/\s+/).every((word) => haystack.includes(word))
}
const empty = computed(() => ![...entries.values()].some((entry) => matches(entry.text)))
/** Said aloud while typing: the list changes on screen, but focus stays in the search box. */
const status = computed(() => {
  if (!query.value) return ''
  const count = [...entries.values()].filter((entry) => matches(entry.text)).length
  return count === 0 ? 'No results' : `${count} ${count === 1 ? 'result' : 'results'}`
})

function items(): HTMLElement[] {
  return Array.from(list.value?.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled])') ?? [])
}

function setActive(item: HTMLElement | undefined) {
  activeId.value = item?.id
  item?.scrollIntoView({ block: 'nearest' })
}

provideCommand({
  entries,
  matches,
  activeId,
  ran: () => {
    if (props.closeOnSelect) open.value = false
  },
})

watch(
  open,
  async (isOpen, _previous, onCleanup) => {
    if (!isOpen) return
    onCleanup(lockScroll())
    text.value = ''
    await nextTick()
    setActive(items()[0])
  },
  { immediate: true },
)

// Whatever is typed, the first result is ready to run with Enter.
watch(query, async () => {
  await nextTick()
  setActive(items()[0])
})

function onKeydown(event: KeyboardEvent) {
  const all = items()
  const current = all.findIndex((item) => item.id === activeId.value)
  const last = all.length - 1
  if (event.key === 'ArrowDown') setActive(all[current === last ? 0 : current + 1])
  else if (event.key === 'ArrowUp') setActive(all[current <= 0 ? last : current - 1])
  else if (event.key === 'Home') setActive(all[0])
  else if (event.key === 'End') setActive(all[last])
  else if (event.key === 'Enter') all[current]?.click()
  else return
  event.preventDefault()
}

function onShortcut(event: KeyboardEvent) {
  if (!props.shortcut || event.key.toLowerCase() !== props.shortcut.toLowerCase()) return
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
  event.preventDefault()
  open.value = !open.value
}

onMounted(() => document.addEventListener('keydown', onShortcut))
onBeforeUnmount(() => document.removeEventListener('keydown', onShortcut))

useLayer(content, open, {
  modal: true,
  loopFocus: true,
  onDismiss: () => (open.value = false),
  initialFocus: () => input.value,
})
</script>

<template>
  <slot name="trigger" :open="() => (open = true)" />
  <Portal>
    <Transition name="sb-command">
      <div v-if="open" class="sb-command-overlay">
        <div ref="content" v-bind="$attrs" role="dialog" aria-modal="true" tabindex="-1" class="sb-command" :aria-label="label">
          <div class="sb-command-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref="input"
              v-model="text"
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              aria-autocomplete="list"
              aria-expanded="true"
              :aria-controls="listId"
              :aria-activedescendant="activeId"
              :aria-label="label"
              :placeholder="placeholder"
              @keydown="onKeydown"
            />
          </div>
          <!-- Pressing an item must not take focus out of the search box. -->
          <div :id="listId" ref="list" role="listbox" class="sb-command-list" :aria-label="label" @mousedown.prevent>
            <slot />
            <div v-if="empty" class="sb-command-empty"><slot name="empty">No results.</slot></div>
          </div>
          <span class="sb-command-status" role="status">{{ status }}</span>
        </div>
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .sb-command-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--sb-z-overlay);
    display: grid;
    /* Sits in the upper part of the window, so the list can grow downward without the box jumping. */
    align-items: start;
    justify-items: center;
    padding: min(15vh, 8rem) 1rem 1rem;
    background: var(--sb-overlay);
  }

  .sb-command {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 34rem;
    max-height: min(26rem, 100%);
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    box-shadow: var(--sb-shadow-lg);
    outline: none;
    overflow: hidden;
  }

  .sb-command-search {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.625rem;
    padding: 0 0.875rem;
    border-bottom: 1px solid var(--sb-border);
    color: var(--sb-muted-foreground);
  }

  .sb-command-search svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }

  .sb-command-search input {
    flex: 1;
    min-width: 0;
    height: 2.75rem;
    border: 0;
    background: transparent;
    color: var(--sb-foreground);
    font-family: inherit;
    font-size: 1rem;
    outline: none;
  }

  .sb-command-search input::placeholder {
    color: var(--sb-muted-foreground);
  }

  .sb-command-list {
    padding: 0.25rem;
    font-size: 0.875rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .sb-command-heading {
    padding: 0.5rem 0.5rem 0.25rem;
    color: var(--sb-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .sb-command-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem;
    border-radius: var(--sb-radius-sm);
    line-height: 1.25rem;
    cursor: default;
    user-select: none;
  }

  .sb-command-item[data-active] {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-command-item[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-command-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--sb-muted-foreground);
  }

  .sb-command-shortcut {
    margin-left: auto;
    padding-left: 1rem;
    color: var(--sb-muted-foreground);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
  }

  .sb-command-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .sb-command-empty {
    padding: 1.5rem 0.5rem;
    color: var(--sb-muted-foreground);
    text-align: center;
  }

  .sb-command-enter-active,
  .sb-command-leave-active,
  .sb-command-enter-active .sb-command,
  .sb-command-leave-active .sb-command {
    transition:
      opacity var(--sb-duration) var(--sb-ease),
      transform var(--sb-duration) var(--sb-ease);
  }

  .sb-command-enter-from,
  .sb-command-leave-to {
    opacity: 0;
  }

  .sb-command-enter-from .sb-command,
  .sb-command-leave-to .sb-command {
    transform: scale(0.97) translateY(-4px);
  }
}
</style>
