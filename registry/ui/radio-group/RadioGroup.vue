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
  <div role="radiogroup" class="er-radio-group" :aria-orientation="orientation" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-radio-group {
    display: grid;
    gap: 0.75rem;
  }

  .er-radio-group[data-orientation='horizontal'] {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
  }

  /* A real radio button, restyled — so forms, labels and the arrow keys all work as usual. */
  .er-radio {
    appearance: none;
    display: inline-grid;
    place-content: center;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    margin: 0;
    border: 1px solid var(--er-input);
    border-radius: 50%;
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition: border-color var(--er-duration);
  }

  .er-radio::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--er-primary);
    transform: scale(0);
    transition: transform var(--er-duration) var(--er-ease);
  }

  .er-radio:checked {
    border-color: var(--er-primary);
  }

  .er-radio:checked::before {
    transform: scale(1);
  }

  .er-radio:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-radio:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-radio[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }
}
</style>
