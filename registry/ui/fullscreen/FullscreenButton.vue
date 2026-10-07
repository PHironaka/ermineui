<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** What goes full screen: a CSS selector, an element, or a function returning one. Defaults to the whole page. */
    target?: string | HTMLElement | (() => HTMLElement | null | undefined)
    enterLabel?: string
    exitLabel?: string
  }>(),
  { enterLabel: 'Enter full screen', exitLabel: 'Exit full screen' },
)

const emit = defineEmits<{
  change: [active: boolean]
  /** The browser refused, or the target could not be found. */
  error: [error: unknown]
}>()

const supported = ref(false)
const active = ref(false)

// Safari on older systems still uses prefixed names.
type PrefixedDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void>; webkitFullscreenEnabled?: boolean }
type PrefixedElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }

function element(): HTMLElement | null {
  const target = props.target
  if (!target) return document.documentElement
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target)
  return (typeof target === 'function' ? target() : target) ?? null
}

const current = () => document.fullscreenElement ?? (document as PrefixedDocument).webkitFullscreenElement ?? null

function sync() {
  const next = current() !== null && current() === element()
  if (next !== active.value) emit('change', next)
  active.value = next
}

async function toggle() {
  try {
    if (current()) {
      await (document.exitFullscreen?.() ?? (document as PrefixedDocument).webkitExitFullscreen?.())
      return
    }
    const el = element() as PrefixedElement | null
    if (!el) throw new Error('The element to show full screen was not found.')
    await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())
  } catch (error) {
    emit('error', error)
  }
}

onMounted(() => {
  // iPhones do not allow page elements to go full screen at all; the button is left out there.
  supported.value = document.fullscreenEnabled ?? (document as PrefixedDocument).webkitFullscreenEnabled ?? false
  document.addEventListener('fullscreenchange', sync)
  document.addEventListener('webkitfullscreenchange', sync)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', sync)
  document.removeEventListener('webkitfullscreenchange', sync)
})
</script>

<template>
  <!-- The name says what a press will do, and changes with the state. Escape always leaves full screen too. -->
  <button v-if="supported" type="button" class="er-fullscreen-button" :aria-label="active ? exitLabel : enterLabel" :title="active ? exitLabel : enterLabel" :data-state="active ? 'on' : 'off'" @click="toggle">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path v-if="active" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      <path v-else d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  </button>
</template>

<style>
@layer components {
  .er-fullscreen-button {
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-fullscreen-button:hover {
    background: var(--er-accent);
  }

  .er-fullscreen-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-fullscreen-button svg {
    width: 1rem;
    height: 1rem;
  }

  /* An element shown full screen gets the page's own background, not the browser's black. */
  :fullscreen {
    background: var(--er-background);
    overflow: auto;
  }
}
</style>
