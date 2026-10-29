<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { provideNavigationMenu } from './context'

withDefaults(
  defineProps<{
    /** Accessible name of the navigation. */
    label?: string
  }>(),
  { label: 'Main' },
)

const root = ref<HTMLElement | null>(null)
const openId = ref<string>()
let timer: ReturnType<typeof setTimeout> | undefined

function cancelClose() {
  clearTimeout(timer)
}

function open(id: string, immediate = false) {
  cancelClose()
  // With a panel already showing, moving along the bar switches at once; from closed there is a short pause.
  if (immediate || openId.value !== undefined) openId.value = id
  else timer = setTimeout(() => (openId.value = id), 120)
}

function close(immediate = false) {
  cancelClose()
  if (immediate) openId.value = undefined
  else timer = setTimeout(() => (openId.value = undefined), 180)
}

provideNavigationMenu({ openId, open, close, cancelClose })

function onPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) close(true)
}

// Listened for on the whole page: a panel opened by hovering has to close with Escape wherever focus is.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || openId.value === undefined) return
  const trigger = root.value?.querySelector<HTMLElement>('.er-navigation-menu-trigger[aria-expanded="true"]')
  const focusInside = root.value?.contains(document.activeElement)
  close(true)
  // Focus goes back to the button only if it was in the menu; a hover should not steal it from elsewhere.
  if (focusInside) trigger?.focus()
}

watch(openId, (id, _previous, onCleanup) => {
  if (id === undefined) return
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('keydown', onKeydown)
  onCleanup(() => {
    document.removeEventListener('pointerdown', onPointerDown, true)
    document.removeEventListener('keydown', onKeydown)
  })
})

function onFocusOut(event: FocusEvent) {
  // Tabbing out of the bar and its panel closes the panel.
  if (event.relatedTarget instanceof Node && !root.value?.contains(event.relatedTarget)) close(true)
}

onBeforeUnmount(cancelClose)
</script>

<template>
  <nav ref="root" class="er-navigation-menu" :aria-label="label" @focusout="onFocusOut">
    <ul><slot /></ul>
  </nav>
</template>

<style>
@layer components {
  .er-navigation-menu > ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.125rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-navigation-menu-item {
    position: relative;
  }

  .er-navigation-menu-trigger,
  .er-navigation-menu-item > .er-navigation-menu-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    height: var(--er-control-md);
    padding: 0 0.75rem;
    border: 0;
    border-radius: var(--er-radius-control);
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-navigation-menu-trigger:hover,
  .er-navigation-menu-trigger[aria-expanded='true'],
  .er-navigation-menu-item > .er-navigation-menu-link:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-navigation-menu-link[aria-current='page'] {
    font-weight: var(--er-weight-semibold);
  }

  .er-navigation-menu-trigger:focus-visible,
  .er-navigation-menu-link:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-navigation-menu-trigger svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--er-muted-foreground);
    transition: transform var(--er-duration) var(--er-ease);
  }

  .er-navigation-menu-trigger[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }

  /* The panel sits in the page right after its button, so Tab moves from the button straight into it. */
  .er-navigation-menu-content {
    position: absolute;
    top: calc(100% + 0.375rem);
    left: 0;
    z-index: var(--er-z-overlay);
    width: max-content;
    max-width: min(32rem, calc(100vw - 2rem));
    padding: 0.5rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    box-shadow: var(--er-shadow-lg);
  }

  .er-navigation-menu-content[data-align='end'] {
    right: 0;
    left: auto;
  }

  /* A bridge across the gap, so the pointer does not "leave" on its way from the button to the panel. */
  .er-navigation-menu-content::before {
    content: '';
    position: absolute;
    inset: -0.5rem 0 auto;
    height: 0.5rem;
  }

  .er-navigation-menu-content .er-navigation-menu-link {
    display: grid;
    gap: 0.125rem;
    padding: 0.5rem 0.625rem;
    border-radius: var(--er-radius-md);
    color: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    text-decoration: none;
  }

  .er-navigation-menu-content .er-navigation-menu-link:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-navigation-menu-description {
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    white-space: normal;
  }
}
</style>
