<script setup lang="ts">
import { computed, onMounted, ref, toRef } from 'vue'
import { arrowTarget } from '../../lib/collection'
import { provideToggleGroup } from './context'

const props = withDefaults(
  defineProps<{
    /** "single" works like radio buttons: exactly one is on. "multiple" lets each be switched on its own. */
    type?: 'single' | 'multiple'
    disabled?: boolean
    size?: 'sm' | 'md'
  }>(),
  { type: 'single', size: 'md' },
)

/** The value that is on, or an array of values in multiple mode. */
const value = defineModel<string | string[]>()

const root = ref<HTMLElement | null>(null)
const first = ref<string>()
const on = computed(() => {
  const current = value.value
  if (Array.isArray(current)) return current
  return current === undefined || current === '' ? [] : [current]
})

function toggle(item: string) {
  if (props.type === 'multiple') {
    value.value = on.value.includes(item) ? on.value.filter((other) => other !== item) : [...on.value, item]
  } else {
    // Like a radio button, pressing the one that is on leaves it on.
    value.value = item
  }
}

onMounted(() => {
  first.value = root.value?.querySelector<HTMLElement>('.sb-toggle-group-item:not(:disabled)')?.dataset.value
})

provideToggleGroup({
  type: toRef(props, 'type'),
  isOn: (item) => on.value.includes(item),
  toggle,
  disabled: toRef(props, 'disabled'),
  tabStop: computed(() => on.value[0] ?? first.value),
})

function onKeydown(event: KeyboardEvent) {
  const items = Array.from(root.value?.querySelectorAll<HTMLElement>('.sb-toggle-group-item:not(:disabled)') ?? [])
  const next = arrowTarget(event, items, 'horizontal')
  if (!next) return
  event.preventDefault()
  next.focus()
  // In single mode the arrow keys choose as they move, the same as native radio buttons.
  if (props.type === 'single') next.click()
}
</script>

<template>
  <div ref="root" class="sb-toggle-group" :role="type === 'single' ? 'radiogroup' : 'group'" :data-size="size" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
@layer components {
  .sb-toggle-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    max-width: 100%;
    padding: 3px;
    border-radius: var(--sb-radius-lg);
    background: var(--sb-muted);
    color: var(--sb-muted-foreground);
    overflow-x: auto;
  }

  .sb-toggle-group-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    height: 1.875rem;
    padding: 0 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--sb-radius-md);
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--sb-duration),
      color var(--sb-duration),
      box-shadow var(--sb-duration);
  }

  .sb-toggle-group[data-size='sm'] .sb-toggle-group-item {
    height: 1.5rem;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }

  .sb-toggle-group-item:hover {
    color: var(--sb-foreground);
  }

  .sb-toggle-group-item[data-state='on'] {
    border-color: light-dark(transparent, var(--sb-input));
    background: light-dark(var(--sb-background), oklch(1 0 0 / 8%));
    color: var(--sb-foreground);
    box-shadow: var(--sb-shadow-sm);
  }

  .sb-toggle-group-item:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-toggle-group-item:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-toggle-group-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
