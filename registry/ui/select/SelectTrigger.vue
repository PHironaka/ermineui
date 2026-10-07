<script setup lang="ts">
import { computed } from 'vue'
import { toElement } from '../../lib/primitive'
import { useSelect } from './context'

defineProps<{
  /** Shown while nothing is selected. */
  placeholder?: string
}>()

const select = useSelect()

const hasValue = computed(() => select.value.value !== undefined && select.value.value !== '')
const label = computed(() =>
  hasValue.value ? (select.labels.get(select.value.value!) ?? select.value.value) : undefined,
)

function setAnchor(target: unknown) {
  select.anchor.value = toElement(target)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  select.setOpen(true)
}
</script>

<template>
  <button
    :ref="setAnchor"
    type="button"
    role="combobox"
    class="sb-select-trigger"
    aria-haspopup="listbox"
    :aria-expanded="select.open.value"
    :aria-controls="select.contentId"
    :disabled="select.disabled.value"
    :data-state="select.open.value ? 'open' : 'closed'"
    :data-placeholder="hasValue ? undefined : ''"
    @click="select.setOpen(!select.open.value)"
    @keydown="onKeydown"
  >
    <span class="sb-select-value">
      <slot :value="select.value.value" :label="label">{{ label ?? placeholder }}</slot>
    </span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</template>

<style>
@layer components {
  .sb-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: left;
    box-shadow: var(--sb-shadow-xs);
    cursor: pointer;
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  .sb-select-trigger:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-select-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-select-trigger[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }

  .sb-select-trigger[data-placeholder] .sb-select-value {
    color: var(--sb-muted-foreground);
  }

  .sb-select-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sb-select-trigger svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--sb-muted-foreground);
  }
}
</style>
