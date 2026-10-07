<script setup lang="ts">
import { computed, ref, shallowRef, toRef } from 'vue'
import { provideResizable, type ResizablePanelEntry } from './context'

const props = withDefaults(
  defineProps<{
    direction?: 'horizontal' | 'vertical'
  }>(),
  { direction: 'horizontal' },
)

/** Each panel's share in percent, in order. Bind it to remember a layout; leave it out to start from the defaults. */
const model = defineModel<number[]>('sizes')

const root = ref<HTMLElement | null>(null)
const panels = shallowRef<ResizablePanelEntry[]>([])
const handles = shallowRef<string[]>([])

const sizes = computed(() => {
  const count = panels.value.length
  if (model.value?.length === count) return model.value
  // Panels with a default keep it; the rest share whatever is left equally.
  const given = panels.value.map((panel) => panel.defaultSize.value)
  const used = given.reduce<number>((sum, size) => sum + (size ?? 0), 0)
  const open = given.filter((size) => size === undefined).length
  return given.map((size) => size ?? Math.max(0, 100 - used) / Math.max(1, open))
})

function resize(index: number, size: number) {
  const before = panels.value[index]
  const after = panels.value[index + 1]
  if (!before || !after) return
  const current = sizes.value
  const pair = current[index]! + current[index + 1]!
  // Neither neighbour may go below its minimum, so the handle stops there.
  const next = Math.max(before.minSize.value, Math.min(size, pair - after.minSize.value))
  const result = current.slice()
  result[index] = next
  result[index + 1] = pair - next
  model.value = result
}

provideResizable({
  direction: toRef(props, 'direction'),
  sizes,
  panels,
  registerPanel: (panel) => {
    panels.value = [...panels.value, panel]
    return () => {
      panels.value = panels.value.filter((other) => other !== panel)
    }
  },
  registerHandle: (id) => {
    handles.value = [...handles.value, id]
    return {
      index: computed(() => handles.value.indexOf(id)),
      unregister: () => {
        handles.value = handles.value.filter((other) => other !== id)
      },
    }
  },
  resize,
  extent: () => (props.direction === 'horizontal' ? (root.value?.clientWidth ?? 0) : (root.value?.clientHeight ?? 0)),
})
</script>

<template>
  <div ref="root" class="sb-resizable" :data-direction="direction">
    <slot :sizes="sizes" />
  </div>
</template>

<style>
@layer components {
  .sb-resizable {
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .sb-resizable[data-direction='vertical'] {
    flex-direction: column;
  }

  /* Sizes are flex-grow shares of the space left after the handles, so they always add up exactly. */
  .sb-resizable-panel {
    flex: var(--sb-panel-size, 1) 1 0px;
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  .sb-resizable-panel:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: -2px;
  }

  .sb-resizable-handle {
    position: relative;
    flex: none;
    width: 1px;
    background: var(--sb-border);
    cursor: col-resize;
    touch-action: none;
    outline: none;
    transition: background-color var(--sb-duration);
  }

  .sb-resizable[data-direction='vertical'] > .sb-resizable-handle {
    width: auto;
    height: 1px;
    cursor: row-resize;
  }

  /* The line is 1px, but the area that can be grabbed is much wider. */
  .sb-resizable-handle::before {
    content: '';
    position: absolute;
    inset: 0 -0.375rem;
    z-index: 1;
  }

  .sb-resizable[data-direction='vertical'] > .sb-resizable-handle::before {
    inset: -0.375rem 0;
  }

  .sb-resizable-handle:hover,
  .sb-resizable-handle[data-dragging],
  .sb-resizable-handle:focus-visible {
    background: var(--sb-ring);
    box-shadow: 0 0 0 1px var(--sb-ring);
  }

  .sb-resizable-grip {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 0.75rem;
    height: 1.25rem;
    border: 1px solid var(--sb-border);
    border-radius: 3px;
    background: var(--sb-background);
    color: var(--sb-muted-foreground);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .sb-resizable[data-direction='vertical'] > .sb-resizable-handle > .sb-resizable-grip {
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .sb-resizable-grip svg {
    width: 0.625rem;
    height: 0.625rem;
  }
}
</style>
