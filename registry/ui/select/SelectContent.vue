<script setup lang="ts">
import { ref } from 'vue'
import { arrowTarget, createTypeahead } from '../../lib/collection'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { useSelect } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    side?: Side
    align?: Align
    /** Gap between trigger and list, in px. */
    sideOffset?: number
  }>(),
  { side: 'bottom', align: 'start', sideOffset: 4 },
)

const select = useSelect()
const content = ref<HTMLElement | null>(null)
const typeahead = createTypeahead()

function items(): HTMLElement[] {
  return Array.from(content.value?.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled])') ?? [])
}

useFloating(select.anchor, content, select.open, props)
useLayer(content, select.open, {
  ignore: () => [select.anchor.value],
  onDismiss: () => select.setOpen(false),
  initialFocus: () => {
    const list = items()
    const target = list.find((item) => item.getAttribute('aria-selected') === 'true') ?? list[0]
    target?.scrollIntoView({ block: 'nearest' })
    return target ?? content.value
  },
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault()
    return
  }
  const list = items()
  const target = arrowTarget(event, list, 'vertical', false) ?? typeahead(event, list)
  if (!target) return
  event.preventDefault()
  target.focus()
}
</script>

<template>
  <Portal>
    <!-- Stays mounted while closed so each item can tell the trigger its label. -->
    <div
      :id="select.contentId"
      ref="content"
      v-bind="$attrs"
      role="listbox"
      tabindex="-1"
      class="er-floating er-select-content"
      :data-state="select.open.value ? 'open' : 'closed'"
      @keydown="onKeydown"
    >
      <slot />
    </div>
  </Portal>
</template>

<style>
@layer components {
  .er-select-content {
    min-width: max(8rem, var(--er-anchor-width, 8rem));
    max-height: min(20rem, var(--er-available-size, 20rem));
    padding: 0.25rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--er-shadow-md);
    overflow-y: auto;
    /* Open/close animation in plain CSS: browsers without @starting-style simply skip it. */
    transition:
      opacity var(--er-duration) var(--er-ease),
      transform var(--er-duration) var(--er-ease),
      display var(--er-duration) allow-discrete;
  }

  .er-select-content[data-state='closed'] {
    display: none;
    opacity: 0;
    transform: scale(0.96);
  }

  @starting-style {
    .er-select-content[data-state='open'] {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  .er-select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.375rem 0.5rem;
    border-radius: var(--er-radius-sm);
    line-height: 1.25rem;
    cursor: default;
    user-select: none;
    outline: none;
  }

  .er-select-item:focus {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-select-item[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-select-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    visibility: hidden;
  }

  .er-select-item[aria-selected='true'] svg {
    visibility: visible;
  }

  .er-select-label {
    padding: 0.375rem 0.5rem;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
  }

  .er-select-separator {
    height: 1px;
    margin: 0.25rem -0.25rem;
    background: var(--er-border);
  }
}
</style>
