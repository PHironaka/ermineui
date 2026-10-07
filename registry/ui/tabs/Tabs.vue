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
  <div class="sb-tabs" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer components {
  .sb-tabs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sb-tabs[data-orientation='vertical'] {
    flex-direction: row;
  }

  .sb-tabs-list {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 2px;
    max-width: 100%;
    padding: 3px;
    border-radius: var(--sb-radius-lg);
    background: var(--sb-muted);
    color: var(--sb-muted-foreground);
    overflow-x: auto;
  }

  .sb-tabs[data-orientation='vertical'] .sb-tabs-list {
    flex-direction: column;
    align-items: stretch;
  }

  .sb-tabs-trigger {
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

  .sb-tabs-trigger:hover {
    color: var(--sb-foreground);
  }

  .sb-tabs-trigger[data-state='active'] {
    border-color: light-dark(transparent, var(--sb-input));
    background: light-dark(var(--sb-background), oklch(1 0 0 / 8%));
    color: var(--sb-foreground);
    box-shadow: var(--sb-shadow-sm);
  }

  .sb-tabs-trigger:focus-visible,
  .sb-tabs-content:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-tabs-trigger:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-tabs-content {
    flex: 1;
    min-width: 0;
    border-radius: var(--sb-radius-md);
  }
}
</style>
