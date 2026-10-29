<script setup lang="ts">
import { toRef, useId } from 'vue'
import { provideTabs } from './context'

const props = withDefaults(
  defineProps<{
    /** The tab that starts selected when you are not using v-model. */
    defaultValue?: string
    orientation?: 'horizontal' | 'vertical'
  }>(),
  { orientation: 'horizontal' },
)

const value = defineModel<string>()
if (value.value === undefined && props.defaultValue !== undefined) value.value = props.defaultValue

provideTabs({
  value,
  orientation: toRef(props, 'orientation'),
  baseId: useId(),
  select: (next) => {
    value.value = next
  },
})
</script>

<template>
  <div class="er-tabs" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer components {
  .er-tabs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .er-tabs[data-orientation='vertical'] {
    flex-direction: row;
  }

  .er-tabs-list {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 2px;
    max-width: 100%;
    padding: 3px;
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    color: var(--er-muted-foreground);
    overflow-x: auto;
  }

  .er-tabs[data-orientation='vertical'] .er-tabs-list {
    flex-direction: column;
    align-items: stretch;
  }

  .er-tabs-trigger {
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
    font-weight: var(--er-weight-medium);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration),
      box-shadow var(--er-duration);
  }

  .er-tabs-trigger:hover {
    color: var(--er-foreground);
  }

  .er-tabs-trigger[data-state='active'] {
    border-color: light-dark(transparent, var(--er-input));
    background: light-dark(var(--er-background), oklch(1 0 0 / 8%));
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-sm);
  }

  .er-tabs-trigger:focus-visible,
  .er-tabs-content:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-tabs-trigger:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-tabs-content {
    flex: 1;
    min-width: 0;
    border-radius: var(--er-radius-md);
  }
}
</style>
