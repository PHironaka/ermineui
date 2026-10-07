<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLayer } from '../../lib/layer'
import { lockScroll } from '../../lib/scroll-lock'
import { provideSidebar } from './context'

const props = withDefaults(
  defineProps<{
    /** Accessible name of the navigation. */
    label?: string
    /** On a narrow screen, keep the sidebar off screen and slide it in over the page when `open` is set. */
    offCanvas?: boolean
  }>(),
  { label: 'Main' },
)

/** Shrunk to a narrow rail that shows icons only. Ignored while the sidebar is off-canvas. */
const collapsed = defineModel<boolean>('collapsed', { default: false })
/** Off-canvas only: whether the sidebar is slid in over the page. */
const open = defineModel<boolean>('open', { default: false })

const root = ref<HTMLElement | null>(null)
/** True while the screen is narrow enough for the off-canvas layout. Must match the media query in the styles. */
const narrow = ref(false)
const floating = computed(() => props.offCanvas && narrow.value)
const drawerOpen = computed(() => floating.value && open.value)

let media: MediaQueryList | undefined
const onMediaChange = () => {
  narrow.value = media?.matches ?? false
  // Growing past the breakpoint with the drawer open would leave the page locked behind nothing.
  if (!narrow.value) open.value = false
}
onMounted(() => {
  media = window.matchMedia('(max-width: 47.999rem)')
  media.addEventListener('change', onMediaChange)
  narrow.value = media.matches
})
onBeforeUnmount(() => media?.removeEventListener('change', onMediaChange))

provideSidebar({
  collapsed: computed(() => collapsed.value && !floating.value),
  navigate: () => {
    if (floating.value) open.value = false
  },
})

// Slid in over the page it behaves like a dialog: focus stays inside, Escape and a press outside close it.
useLayer(root, drawerOpen, {
  modal: true,
  loopFocus: true,
  onDismiss: () => (open.value = false),
})

watch(
  drawerOpen,
  (isOpen, _previous, onCleanup) => {
    if (isOpen) onCleanup(lockScroll())
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="offCanvas" class="er-sidebar-overlay" :data-open="drawerOpen ? '' : undefined" />
  <aside
    ref="root"
    class="er-sidebar"
    tabindex="-1"
    :data-collapsed="collapsed && !floating ? '' : undefined"
    :data-off-canvas="offCanvas ? '' : undefined"
    :data-open="drawerOpen ? '' : undefined"
    :role="drawerOpen ? 'dialog' : undefined"
    :aria-modal="drawerOpen ? 'true' : undefined"
    :aria-label="drawerOpen ? label : undefined"
  >
    <div v-if="$slots.header" class="er-sidebar-header"><slot name="header" :collapsed="collapsed && !floating" /></div>
    <nav class="er-sidebar-nav" :aria-label="label"><slot :collapsed="collapsed && !floating" /></nav>
    <div v-if="$slots.footer" class="er-sidebar-footer"><slot name="footer" :collapsed="collapsed && !floating" /></div>
  </aside>
</template>

<style>
@layer components {
  .er-sidebar {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 15rem;
    min-height: 0;
    border-right: 1px solid var(--er-border);
    background: var(--er-card);
    color: var(--er-card-foreground);
    font-size: 0.875rem;
    transition: width var(--er-duration) var(--er-ease);
  }

  .er-sidebar[data-collapsed] {
    width: 3.25rem;
  }

  .er-sidebar:focus {
    outline: none;
  }

  .er-sidebar-overlay {
    display: none;
  }

  /* Off-canvas: below this width the sidebar leaves the layout and waits off screen until it is opened.
     The script reads the same width (47.999rem), so change both together. */
  @media (max-width: 47.999rem) {
    .er-sidebar[data-off-canvas] {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: var(--er-z-overlay);
      width: min(17rem, calc(100% - 3rem));
      box-shadow: var(--er-shadow-lg);
      transform: translateX(-100%);
      /* Hidden once it has slid away, so nothing in it can be tabbed to while it is off screen. */
      visibility: hidden;
      transition:
        transform calc(var(--er-duration) * 1.5) var(--er-ease),
        visibility 0s linear calc(var(--er-duration) * 1.5);
    }

    .er-sidebar[data-off-canvas][data-open] {
      transform: none;
      visibility: visible;
      transition:
        transform calc(var(--er-duration) * 1.5) var(--er-ease),
        visibility 0s;
    }

    .er-sidebar-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--er-z-overlay);
      display: block;
      background: var(--er-overlay);
      opacity: 0;
      pointer-events: none;
      transition: opacity calc(var(--er-duration) * 1.5) var(--er-ease);
    }

    .er-sidebar-overlay[data-open] {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .er-sidebar-header,
  .er-sidebar-footer {
    flex-shrink: 0;
    padding: 0.5rem;
  }

  .er-sidebar-header {
    border-bottom: 1px solid var(--er-border);
  }

  .er-sidebar-footer {
    border-top: 1px solid var(--er-border);
  }

  .er-sidebar-nav {
    display: grid;
    flex: 1;
    align-content: start;
    gap: 1rem;
    min-height: 0;
    padding: 0.5rem;
    overflow: hidden auto;
  }

  .er-sidebar-group {
    display: grid;
    gap: 2px;
  }

  .er-sidebar-group ul {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-sidebar-group-label {
    padding: 0.25rem 0.5rem;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .er-sidebar-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    height: 2.25rem;
    padding: 0 0.625rem;
    border: 0;
    border-radius: var(--er-radius-md);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    font-weight: 500;
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-sidebar-item:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-sidebar-item[aria-current='page'] {
    background: var(--er-accent);
    color: var(--er-foreground);
  }

  .er-sidebar-item:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-sidebar-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }

  .er-sidebar-item-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Collapsed, the words are hidden from sight only: screen readers still read each link by name. */
  .er-sidebar[data-collapsed] .er-sidebar-item-label,
  .er-sidebar[data-collapsed] .er-sidebar-group-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
}
</style>
