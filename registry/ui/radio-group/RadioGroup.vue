<script setup lang="ts">
import { computed, toRef, useId } from 'vue'
import { provideRadioGroup } from './context'

const props = withDefaults(
  defineProps<{
    /** Submit the value with a form under this name. One is made up when you leave it out. */
    name?: string
    disabled?: boolean
    orientation?: 'horizontal' | 'vertical'
  }>(),
  { orientation: 'vertical' },
)

const value = defineModel<string>()
const fallbackName = useId()

provideRadioGroup({
  value,
  select: (next) => {
    value.value = next
  },
  name: computed(() => props.name ?? fallbackName),
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <div role="radiogroup" class="sb-radio-group" :aria-orientation="orientation" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer components {
  .sb-radio-group {
    display: grid;
    gap: 0.75rem;
  }

  .sb-radio-group[data-orientation='horizontal'] {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
  }

  /* A real radio button, restyled — so forms, labels and the arrow keys all work as usual. */
  .sb-radio {
    appearance: none;
    display: inline-grid;
    place-content: center;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    margin: 0;
    border: 1px solid var(--sb-input);
    border-radius: 50%;
    background: var(--sb-input-background);
    box-shadow: var(--sb-shadow-xs);
    cursor: pointer;
    transition: border-color var(--sb-duration);
  }

  .sb-radio::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--sb-primary);
    transform: scale(0);
    transition: transform var(--sb-duration) var(--sb-ease);
  }

  .sb-radio:checked {
    border-color: var(--sb-primary);
  }

  .sb-radio:checked::before {
    transform: scale(1);
  }

  .sb-radio:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-radio:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-radio[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }
}
</style>
