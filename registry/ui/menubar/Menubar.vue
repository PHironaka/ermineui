<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { provideMenubar } from './context'

defineProps<{
  /** Accessible name of the bar. */
  label?: string
}>()

const root = ref<HTMLElement | null>(null)
const openId = ref<string>()
const tabStop = ref<string>()

const triggers = () => Array.from(root.value?.querySelectorAll<HTMLElement>('.er-menubar-trigger:not([disabled])') ?? [])

provideMenubar({
  openId,
  tabStop,
  move: (from, direction, open) => {
    const list = triggers()
    const index = list.findIndex((trigger) => trigger.dataset.menu === from)
    const next = list[(index + direction + list.length) % list.length]
    if (!next) return
    tabStop.value = next.dataset.menu
    next.focus()
    // With a menu open, moving sideways opens the neighbouring menu, as desktop menu bars do.
    if (open) next.dispatchEvent(new CustomEvent('er-open-menu'))
    else openId.value = undefined
  },
})

onMounted(() => {
  tabStop.value = triggers()[0]?.dataset.menu
})
</script>

<template>
  <div ref="root" role="menubar" class="er-menubar" :aria-label="label">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-menubar {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    max-width: 100%;
    padding: 0.25rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-background);
    box-shadow: var(--er-shadow-xs);
  }

  .er-menubar-trigger {
    display: inline-flex;
    align-items: center;
    height: 1.75rem;
    padding: 0 0.625rem;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    white-space: nowrap;
    cursor: default;
    outline: none;
  }

  .er-menubar-trigger:hover,
  .er-menubar-trigger:focus-visible,
  .er-menubar-trigger[data-state='open'] {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-menubar-trigger:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-menubar-trigger:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
