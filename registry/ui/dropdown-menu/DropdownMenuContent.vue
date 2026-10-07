<script setup lang="ts">
import { ref } from 'vue'
import { arrowTarget, createTypeahead } from '../../lib/collection'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { useDropdownMenu } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    side?: Side
    align?: Align
    /** Gap between trigger and menu, in px. */
    sideOffset?: number
    alignOffset?: number
  }>(),
  { side: 'bottom', align: 'start', sideOffset: 4, alignOffset: 0 },
)

const menu = useDropdownMenu()
const content = ref<HTMLElement | null>(null)
const typeahead = createTypeahead()

function items(): HTMLElement[] {
  return Array.from(content.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([data-disabled])') ?? [])
}

useFloating(menu.anchor, content, menu.open, props)
useLayer(content, menu.open, {
  ignore: () => [menu.anchor.value],
  onDismiss: () => menu.setOpen(false),
  initialFocus: () => (menu.focusFirst.value ? items()[0] : null) ?? content.value,
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault()
    return
  }
  const list = items()
  const target = arrowTarget(event, list, 'vertical') ?? typeahead(event, list)
  if (!target) return
  event.preventDefault()
  target.focus()
}
</script>

<template>
  <Portal>
    <Transition name="sb-pop">
      <div
        v-if="menu.open.value"
        :id="menu.contentId"
        ref="content"
        v-bind="$attrs"
        role="menu"
        tabindex="-1"
        class="sb-floating sb-menu"
        :aria-labelledby="menu.anchor.value?.id || undefined"
        @keydown="onKeydown"
      >
        <slot />
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .sb-menu {
    min-width: 10rem;
    max-height: min(24rem, var(--sb-available-size, 24rem));
    padding: 0.25rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-md);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--sb-shadow-md);
    overflow-y: auto;
  }

  .sb-menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    border-radius: var(--sb-radius-sm);
    color: inherit;
    line-height: 1.25rem;
    text-decoration: none;
    cursor: default;
    user-select: none;
    outline: none;
  }

  .sb-menu-item:focus {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-menu-item[data-variant='destructive'] {
    color: var(--sb-destructive);
  }

  .sb-menu-item[data-variant='destructive']:focus {
    background: color-mix(in oklab, var(--sb-destructive) 12%, transparent);
    color: var(--sb-destructive);
  }

  .sb-menu-item[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-menu-item svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--sb-muted-foreground);
  }

  .sb-menu-item[data-variant='destructive'] svg {
    color: inherit;
  }

  /* Checkbox and radio items keep a fixed slot for their mark, so labels line up whether or not it shows. */
  .sb-menu-indicator {
    display: inline-grid;
    flex-shrink: 0;
    place-items: center;
    width: 1rem;
    height: 1rem;
  }

  .sb-menu-indicator svg {
    color: currentColor;
  }

  .sb-menu-item[aria-checked='false'] .sb-menu-indicator svg {
    visibility: hidden;
  }

  .sb-menu-item[aria-haspopup='menu'][data-state='open'] {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-menu-chevron {
    margin-left: auto;
  }

  .sb-menu-shortcut {
    margin-left: auto;
    padding-left: 1.5rem;
    color: var(--sb-muted-foreground);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
  }

  .sb-menu-label {
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .sb-menu-separator {
    height: 1px;
    margin: 0.25rem -0.25rem;
    background: var(--sb-border);
  }
}
</style>
