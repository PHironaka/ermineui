<script setup lang="ts">
import { computed, toRef, useId } from 'vue'
import { provideSegmentedControl } from './context'

const props = withDefaults(
  defineProps<{
    /** Accessible name: what is being chosen, e.g. "Billing period". */
    label: string
    /** Submit the choice with a form under this name. One is made up when you leave it out. */
    name?: string
    disabled?: boolean
    size?: 'sm' | 'md'
    /** Stretch across the space available, with every segment the same width. */
    block?: boolean
  }>(),
  { size: 'md' },
)

const value = defineModel<string>()

const fallbackName = useId()

provideSegmentedControl({
  value,
  select: (next) => {
    value.value = next
  },
  name: computed(() => props.name ?? fallbackName),
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <div class="er-segmented-control" role="radiogroup" :aria-label="label" :data-size="size" :data-block="block ? '' : undefined" :data-disabled="disabled ? '' : undefined">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-segmented-control {
    display: inline-flex;
    gap: 0.125rem;
    max-width: 100%;
    padding: 0.1875rem;
    border-radius: var(--er-radius-control);
    background: var(--er-muted);
  }

  .er-segmented-control[data-block] {
    display: flex;
  }

  .er-segmented-control[data-block] .er-segmented-control-item {
    flex: 1;
  }

  .er-segmented-control[data-disabled] {
    opacity: 0.5;
  }

  .er-segmented-control-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: 0;
    height: 1.875rem;
    padding: 0 0.75rem;
    border-radius: calc(var(--er-radius-control) - 2px);
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--er-duration),
      color var(--er-duration),
      box-shadow var(--er-duration);
  }

  .er-segmented-control[data-size='sm'] .er-segmented-control-item {
    height: 1.5rem;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }

  .er-segmented-control-item:hover {
    color: var(--er-foreground);
  }

  .er-segmented-control-item[data-state='on'] {
    background: var(--er-background);
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-sm);
  }

  /* A real radio button covers the whole segment, so forms, labels and the arrow keys work as usual. */
  .er-segmented-control-item input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .er-segmented-control-item:has(input:focus-visible) {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-segmented-control-item:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-segmented-control-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
