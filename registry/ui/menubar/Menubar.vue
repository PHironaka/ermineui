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

const triggers = () => Array.from(root.value?.querySelectorAll<HTMLElement>('.sb-menubar-trigger:not([disabled])') ?? [])

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
    if (open) next.dispatchEvent(new CustomEvent('sb-open-menu'))
    else openId.value = undefined
  },
})

onMounted(() => {
  tabStop.value = triggers()[0]?.dataset.menu
})
</script>

<template>
  <div ref="root" role="menubar" class="sb-menubar" :aria-label="label">
    <slot />
  </div>
</template>

<style>
@layer components {
  .sb-menubar {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    max-width: 100%;
    padding: 0.25rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-background);
    box-shadow: var(--sb-shadow-xs);
  }

  .sb-menubar-trigger {
    display: inline-flex;
    align-items: center;
    height: 1.75rem;
    padding: 0 0.625rem;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: default;
    outline: none;
  }

  .sb-menubar-trigger:hover,
  .sb-menubar-trigger:focus-visible,
  .sb-menubar-trigger[data-state='open'] {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-menubar-trigger:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 1px;
  }

  .sb-menubar-trigger:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
