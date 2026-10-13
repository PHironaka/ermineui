<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'
import { arrowTarget } from '../../lib/collection'

const props = withDefaults(
  defineProps<{
    /** Accessible name: what the controls act on, e.g. "Text formatting". */
    label: string
    orientation?: 'horizontal' | 'vertical'
  }>(),
  { orientation: 'horizontal' },
)

const root = ref<HTMLElement | null>(null)

const ITEMS = 'button, a[href], input, select, [tabindex]'
const items = () => Array.from(root.value?.querySelectorAll<HTMLElement>(ITEMS) ?? []).filter((el) => !el.matches(':disabled') && !el.closest('[hidden]'))

/** Only one control can be tabbed to: the one last used, or the first. The arrow keys reach the rest. */
function setStop(target?: HTMLElement) {
  const all = items()
  const stop = target ?? all.find((el) => el.tabIndex === 0) ?? all[0]
  for (const el of all) el.tabIndex = el === stop ? 0 : -1
}

onMounted(() => setStop())
// Controls come and go (a button is disabled, a group is added); the tab stop must still be on one of them.
onUpdated(() => setStop(items().find((el) => el.tabIndex === 0)))

function onFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement
  if (items().includes(target)) setStop(target)
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  // A text field needs its arrow keys, Home and End for itself.
  if (target.matches('input:not([type="checkbox"], [type="radio"], [type="button"]), textarea, select, [contenteditable]')) return
  const next = arrowTarget(event, items(), props.orientation)
  if (!next) return
  event.preventDefault()
  next.focus()
}
</script>

<template>
  <div ref="root" class="er-toolbar" role="toolbar" :aria-label="label" :aria-orientation="orientation" :data-orientation="orientation" @focusin="onFocusIn" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-toolbar {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.125rem;
    max-width: 100%;
    padding: 0.25rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-background);
  }

  .er-toolbar[data-orientation='vertical'] {
    flex-direction: column;
    align-items: stretch;
  }

  .er-toolbar-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-toolbar-button:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-toolbar-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-toolbar-button:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  /* Switched on: filled in, as well as saying so to screen readers. */
  .er-toolbar-button[aria-pressed='true'] {
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  .er-toolbar-button svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }

  .er-toolbar-separator {
    align-self: stretch;
    width: 1px;
    margin: 0.25rem;
    background: var(--er-border);
  }

  .er-toolbar[data-orientation='vertical'] .er-toolbar-separator {
    width: auto;
    height: 1px;
  }
}
</style>
