<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import type { KanbanCard, KanbanColumn } from './types'

defineProps<{
  /** Accessible name of the board. */
  label?: string
}>()

const emit = defineEmits<{
  /** A card ended up somewhere new. */
  move: [detail: { card: KanbanCard; from: string; to: string; index: number }]
}>()

defineSlots<{
  /** Replaces the contents of a card. */
  card?: (props: { card: KanbanCard; column: KanbanColumn }) => unknown
}>()

const columns = defineModel<KanbanColumn[]>({ required: true })

const root = ref<HTMLElement | null>(null)
// Prefix for ids, so two boards on one page never share one.
const uid = useId()
/** The card being dragged, and where it would land if dropped now. */
const dragging = ref<string>()
const target = ref<{ column: string; index: number }>()
/** Read out by screen readers after a move, since nothing else tells them the card went anywhere. */
const announcement = ref('')

function locate(cardId: string) {
  for (const column of columns.value) {
    const index = column.cards.findIndex((card) => card.id === cardId)
    if (index !== -1) return { column, index }
  }
  return undefined
}

/** Moves a card to `index` in the column `to`. The index counts positions before the card is taken out. */
function move(cardId: string, to: string, index: number) {
  const from = locate(cardId)
  const destination = columns.value.find((column) => column.id === to)
  if (!from || !destination) return
  const card = from.column.cards[from.index]!
  // Taking the card out shifts everything after it up by one, when it stays in the same column.
  const insertAt = from.column === destination && from.index < index ? index - 1 : index
  if (from.column === destination && from.index === insertAt) return

  columns.value = columns.value.map((column) => {
    let cards = column.cards
    if (column === from.column) cards = cards.filter((other) => other.id !== cardId)
    if (column === destination) cards = [...cards.slice(0, insertAt), card, ...cards.slice(insertAt)]
    return cards === column.cards ? column : { ...column, cards }
  })
  emit('move', { card, from: from.column.id, to, index: insertAt })
  announcement.value = `${card.title} moved to ${destination.title}, position ${insertAt + 1} of ${destination.cards.length + (from.column === destination ? 0 : 1)}.`
}

function onDragStart(event: DragEvent, card: KanbanCard) {
  dragging.value = card.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', card.title)
  }
}

/** Over a card, the drop lands above or below it depending on which half the pointer is in. */
function onDragOverCard(event: DragEvent, column: KanbanColumn, index: number) {
  if (!dragging.value) return
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  target.value = { column: column.id, index: event.clientY < box.top + box.height / 2 ? index : index + 1 }
}

function onDragOverColumn(column: KanbanColumn) {
  // Over the column but not over a card: the empty space under the last one.
  if (dragging.value && target.value?.column !== column.id) target.value = { column: column.id, index: column.cards.length }
}

function onDrop() {
  if (dragging.value && target.value) move(dragging.value, target.value.column, target.value.index)
  onDragEnd()
}

function onDragEnd() {
  dragging.value = undefined
  target.value = undefined
}

/** Keyboard: with a card focused, Alt plus an arrow key moves it one place in that direction. */
async function onKeydown(event: KeyboardEvent, card: KanbanCard) {
  if (!event.altKey || !event.key.startsWith('Arrow')) return
  const from = locate(card.id)
  if (!from) return
  event.preventDefault()
  const columnIndex = columns.value.indexOf(from.column)
  if (event.key === 'ArrowUp' && from.index > 0) move(card.id, from.column.id, from.index - 1)
  else if (event.key === 'ArrowDown' && from.index < from.column.cards.length - 1) move(card.id, from.column.id, from.index + 2)
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const next = columns.value[columnIndex + (event.key === 'ArrowRight' ? 1 : -1)]
    if (next) move(card.id, next.id, Math.min(from.index, next.cards.length))
  }
  await nextTick()
  Array.from(root.value?.querySelectorAll<HTMLElement>('.er-kanban-card') ?? [])
    .find((el) => el.dataset.card === card.id)
    ?.focus()
}
</script>

<template>
  <!-- How to move a card is said once, for the board, not again on every card. -->
  <div ref="root" class="er-kanban" role="group" :aria-label="label" :aria-describedby="`${uid}-help`">
    <section
      v-for="column in columns"
      :key="column.id"
      class="er-kanban-column"
      :aria-labelledby="`${uid}-${column.id}`"
      :data-target="target?.column === column.id ? '' : undefined"
      @dragover.prevent="onDragOverColumn(column)"
      @drop.prevent="onDrop"
    >
      <h3 class="er-kanban-title">
        <span :id="`${uid}-${column.id}`">{{ column.title }}</span>
        <span class="er-kanban-count">{{ column.cards.length }}<span class="er-kanban-sr"> {{ column.cards.length === 1 ? 'card' : 'cards' }}</span></span>
      </h3>
      <ul class="er-kanban-cards">
        <template v-for="(card, index) in column.cards" :key="card.id">
          <li v-if="target?.column === column.id && target.index === index" class="er-kanban-drop" aria-hidden="true" />
          <li
            class="er-kanban-card"
            tabindex="0"
            draggable="true"
            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
            :data-card="card.id"
            :data-dragging="dragging === card.id ? '' : undefined"
            @dragstart="onDragStart($event, card)"
            @dragover.prevent.stop="onDragOverCard($event, column, index)"
            @dragend="onDragEnd"
            @keydown="onKeydown($event, card)"
          >
            <slot name="card" :card="card" :column="column">{{ card.title }}</slot>
          </li>
        </template>
        <li v-if="target?.column === column.id && target.index === column.cards.length" class="er-kanban-drop" aria-hidden="true" />
      </ul>
    </section>
    <p :id="`${uid}-help`" class="er-kanban-sr">To move a card, focus it, hold Alt and press an arrow key.</p>
    <p class="er-kanban-sr" role="status">{{ announcement }}</p>
  </div>
</template>

<style>
@layer components {
  .er-kanban {
    /* Positioned, so the visually hidden text inside scrolls with the board instead of widening the page. */
    position: relative;
    display: grid;
    grid-auto-columns: minmax(14rem, 1fr);
    grid-auto-flow: column;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
    padding-bottom: 0.25rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .er-kanban-column {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 0.5rem;
    min-width: 0;
    padding: 0.625rem;
    border: 1px solid transparent;
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    transition: border-color var(--er-duration);
  }

  .er-kanban-column[data-target] {
    border-color: var(--er-ring);
  }

  .er-kanban-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 0 0.25rem;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .er-kanban-count {
    color: var(--er-muted-foreground);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .er-kanban-cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 3rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-kanban-card {
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-card);
    color: var(--er-card-foreground);
    font-size: 0.875rem;
    box-shadow: var(--er-shadow-xs);
    cursor: grab;
    transition: opacity var(--er-duration);
  }

  .er-kanban-card:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-kanban-card[data-dragging] {
    opacity: 0.4;
  }

  /* The line that shows where the card will land. */
  .er-kanban-drop {
    height: 2px;
    margin: -0.3125rem 0;
    border-radius: 1px;
    background: var(--er-ring);
  }

  .er-kanban-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
