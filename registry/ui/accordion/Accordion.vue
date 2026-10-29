<script setup lang="ts">
import { computed, toRef } from 'vue'
import { arrowTarget } from '../../lib/collection'
import { provideAccordion } from './context'

const props = withDefaults(
  defineProps<{
    /** "single" keeps one section open at a time; "multiple" lets any number be open. */
    type?: 'single' | 'multiple'
    /** In single mode, let the open section be closed again. */
    collapsible?: boolean
    /** The section (or sections) open at the start when you are not using v-model. */
    defaultValue?: string | string[]
    disabled?: boolean
  }>(),
  { type: 'single', collapsible: true },
)

/** The open section's value, or an array of values in multiple mode. */
const value = defineModel<string | string[]>()
if (value.value === undefined && props.defaultValue !== undefined) value.value = props.defaultValue

const openValues = computed(() => {
  const current = value.value
  if (Array.isArray(current)) return current
  return current === undefined || current === '' ? [] : [current]
})

function toggle(item: string) {
  const isOpen = openValues.value.includes(item)
  if (props.type === 'multiple') {
    value.value = isOpen ? openValues.value.filter((open) => open !== item) : [...openValues.value, item]
  } else if (!isOpen) {
    value.value = item
  } else if (props.collapsible) {
    value.value = undefined
  }
}

provideAccordion({
  isOpen: (item) => openValues.value.includes(item),
  toggle,
  disabled: toRef(props, 'disabled'),
})

function onKeydown(event: KeyboardEvent) {
  if (!(event.target instanceof HTMLElement) || !event.target.matches('.er-accordion-trigger')) return
  const root = event.currentTarget as HTMLElement
  const triggers = Array.from(root.querySelectorAll<HTMLElement>('.er-accordion-trigger:not(:disabled)'))
  const next = arrowTarget(event, triggers, 'vertical')
  if (!next) return
  event.preventDefault()
  next.focus()
}
</script>

<template>
  <div class="er-accordion" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-accordion {
    width: 100%;
  }

  .er-accordion-item {
    border-bottom: 1px solid var(--er-border);
  }

  .er-accordion-heading {
    margin: 0;
    font: inherit;
  }

  .er-accordion-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    padding: 1rem 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1.25rem;
    text-align: left;
    cursor: pointer;
  }

  .er-accordion-trigger:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .er-accordion-trigger:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-accordion-trigger:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-accordion-trigger svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--er-muted-foreground);
    transition: transform var(--er-duration) var(--er-ease);
  }

  .er-accordion-trigger[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }

  /* Animates to the content's own height: a grid row going from 0fr to 1fr needs no measuring. */
  .er-accordion-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--er-duration) var(--er-ease);
  }

  .er-accordion-content[data-state='open'] {
    grid-template-rows: 1fr;
  }

  .er-accordion-content > div {
    min-height: 0;
    overflow: hidden;
    /* Hidden outright once it has closed, so its text cannot be selected or found while out of sight. */
    visibility: hidden;
    transition: visibility 0s linear var(--er-duration);
  }

  .er-accordion-content[data-state='open'] > div {
    visibility: visible;
    transition-delay: 0s;
  }

  .er-accordion-body {
    padding-bottom: 1rem;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
  }
}
</style>
