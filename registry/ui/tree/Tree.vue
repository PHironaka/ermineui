<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { createTypeahead } from '../../lib/collection'
import type { TreeNode } from './types'

const props = defineProps<{
  nodes: readonly TreeNode[]
  /** Accessible name of the tree. */
  label?: string
}>()

defineSlots<{
  /** Replaces the contents of a row — for icons, badges or counts beside the label. */
  item?: (props: { node: TreeNode; level: number; expanded: boolean; selected: boolean }) => unknown
}>()

/** ids of the open folders. */
const expanded = defineModel<string[]>('expanded', { default: () => [] })
/** id of the chosen node. */
const selected = defineModel<string | undefined>('selected')

const root = ref<HTMLElement | null>(null)
/** The row Tab lands on and the arrow keys move from. */
const focused = ref<string>()
const typeahead = createTypeahead()

interface Row {
  node: TreeNode
  level: number
  parent?: string
  /** Position among its siblings and how many siblings there are, for screen readers. */
  position: number
  size: number
  folder: boolean
  open: boolean
}

/** Every row currently on screen, top to bottom. Children of a closed folder are not in it. */
const rows = computed(() => {
  const result: Row[] = []
  const walk = (nodes: readonly TreeNode[], level: number, parent?: string) => {
    nodes.forEach((node, index) => {
      const folder = node.children !== undefined
      const open = folder && expanded.value.includes(node.id)
      result.push({ node, level, parent, position: index + 1, size: nodes.length, folder, open })
      if (open) walk(node.children!, level + 1, node.id)
    })
  }
  walk(props.nodes, 1)
  return result
})

const tabStop = computed(() => {
  const ids = rows.value.map((row) => row.node.id)
  return [focused.value, selected.value].find((id) => id !== undefined && ids.includes(id)) ?? ids[0]
})

function setOpen(id: string, open: boolean) {
  if (open === expanded.value.includes(id)) return
  expanded.value = open ? [...expanded.value, id] : expanded.value.filter((other) => other !== id)
}

async function focusRow(id: string | undefined) {
  if (id === undefined) return
  focused.value = id
  await nextTick()
  const row = Array.from(root.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []).find((el) => el.dataset.id === id)
  row?.focus()
  row?.scrollIntoView({ block: 'nearest' })
}

function activate(row: Row) {
  if (row.node.disabled) return
  focused.value = row.node.id
  selected.value = row.node.id
  if (row.folder) setOpen(row.node.id, !row.open)
}

function onKeydown(event: KeyboardEvent) {
  const list = rows.value
  const index = list.findIndex((row) => row.node.id === tabStop.value)
  const row = list[index]
  if (!row) return
  const enabled = (candidate: Row | undefined) => candidate && !candidate.node.disabled
  const step = (direction: 1 | -1) => {
    for (let next = index + direction; next >= 0 && next < list.length; next += direction) if (enabled(list[next])) return list[next]
    return undefined
  }
  let target: Row | undefined

  switch (event.key) {
    case 'ArrowDown':
      target = step(1)
      break
    case 'ArrowUp':
      target = step(-1)
      break
    case 'Home':
      target = list.find(enabled)
      break
    case 'End':
      target = [...list].reverse().find(enabled)
      break
    case 'ArrowRight':
      // Opens a closed folder; on an open one, steps into it.
      if (row.folder && !row.open) setOpen(row.node.id, true)
      else if (row.open) target = step(1)
      break
    case 'ArrowLeft':
      // Closes an open folder; otherwise goes up to the folder this row is in.
      if (row.open) setOpen(row.node.id, false)
      else target = list.find((candidate) => candidate.node.id === row.parent)
      break
    case 'Enter':
    case ' ':
      activate(row)
      break
    default: {
      const items = Array.from(root.value?.querySelectorAll<HTMLElement>('[role="treeitem"]:not([aria-disabled])') ?? [])
      const match = typeahead(event, items)
      if (!match) return
      focusRow(match.dataset.id)
    }
  }

  event.preventDefault()
  if (target) focusRow(target.node.id)
}
</script>

<template>
  <div ref="root" role="tree" class="sb-tree" :aria-label="label" @keydown="onKeydown">
    <!-- A flat list of rows: each one says how deep it is, so screen readers still hear the nesting. -->
    <div
      v-for="row in rows"
      :key="row.node.id"
      role="treeitem"
      class="sb-tree-item"
      :tabindex="row.node.id === tabStop ? 0 : -1"
      :aria-level="row.level"
      :aria-posinset="row.position"
      :aria-setsize="row.size"
      :aria-expanded="row.folder ? row.open : undefined"
      :aria-selected="selected === row.node.id"
      :aria-disabled="row.node.disabled || undefined"
      :data-id="row.node.id"
      :style="{ '--sb-tree-level': row.level - 1 }"
      @click="activate(row)"
      @focus="focused = row.node.id"
    >
      <svg v-if="row.folder" class="sb-tree-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
      <span v-else class="sb-tree-chevron" />
      <slot name="item" :node="row.node" :level="row.level" :expanded="row.open" :selected="selected === row.node.id">
        <span class="sb-tree-label">{{ row.node.label }}</span>
      </slot>
    </div>
  </div>
</template>

<style>
@layer components {
  .sb-tree {
    display: grid;
    gap: 1px;
    width: 100%;
    min-width: 0;
    font-size: 0.875rem;
  }

  .sb-tree-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
    height: 1.875rem;
    padding: 0 0.5rem 0 calc(0.375rem + var(--sb-tree-level, 0) * 1rem);
    border-radius: var(--sb-radius-sm);
    cursor: default;
    user-select: none;
    outline: none;
  }

  .sb-tree-item:hover {
    background: color-mix(in oklab, var(--sb-accent) 60%, transparent);
  }

  .sb-tree-item[aria-selected='true'] {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
    font-weight: 500;
  }

  .sb-tree-item:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: -2px;
  }

  .sb-tree-item[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }

  .sb-tree-chevron {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--sb-muted-foreground);
    transition: transform var(--sb-duration) var(--sb-ease);
  }

  .sb-tree-item[aria-expanded='true'] > .sb-tree-chevron {
    transform: rotate(90deg);
  }

  .sb-tree-item svg:not(.sb-tree-chevron) {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--sb-muted-foreground);
  }

  .sb-tree-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
