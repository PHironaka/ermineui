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
  first.value = root.value?.querySelector<HTMLElement>('.er-toggle-group-item:not(:disabled)')?.dataset.value
})

provideToggleGroup({
  type: toRef(props, 'type'),
  isOn: (item) => on.value.includes(item),
  toggle,
  disabled: toRef(props, 'disabled'),
  tabStop: computed(() => on.value[0] ?? first.value),
})

function onKeydown(event: KeyboardEvent) {
  const items = Array.from(root.value?.querySelectorAll<HTMLElement>('.er-toggle-group-item:not(:disabled)') ?? [])
  const next = arrowTarget(event, items, 'horizontal')
  if (!next) return
  event.preventDefault()
  next.focus()
  // In single mode the arrow keys choose as they move, the same as native radio buttons.
  if (props.type === 'single') next.click()
}
</script>

<template>
  <div ref="root" class="er-toggle-group" :role="type === 'single' ? 'radiogroup' : 'group'" :data-size="size" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-toggle-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    max-width: 100%;
    padding: 3px;
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    color: var(--er-muted-foreground);
    overflow-x: auto;
  }

  .er-toggle-group-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    height: 1.875rem;
    padding: 0 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--er-radius-md);
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration),
      box-shadow var(--er-duration);
  }

  .er-toggle-group[data-size='sm'] .er-toggle-group-item {
    height: 1.5rem;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }

  .er-toggle-group-item:hover {
    color: var(--er-foreground);
  }

  .er-toggle-group-item[data-state='on'] {
    border-color: light-dark(transparent, var(--er-input));
    background: light-dark(var(--er-background), oklch(1 0 0 / 8%));
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-sm);
  }

  .er-toggle-group-item:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-toggle-group-item:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-toggle-group-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
