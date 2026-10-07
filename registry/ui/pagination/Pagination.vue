<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** How many pages there are. */
    pageCount: number
    /** Page numbers shown on each side of the current one before the rest is shortened to "…". */
    siblings?: number
    /** Accessible name of the whole control. */
    label?: string
  }>(),
  { siblings: 1, label: 'Pagination' },
)

/** The current page, starting at 1. */
const page = defineModel<number>({ default: 1 })

const last = computed(() => Math.max(1, Math.floor(props.pageCount)))
const current = computed(() => Math.max(1, Math.min(page.value, last.value)))

/** Page numbers to show; null stands for a "…" gap. The count stays the same on every page, so the buttons never jump. */
const items = computed<Array<number | null>>(() => {
  const slots = props.siblings * 2 + 5
  if (last.value <= slots) return Array.from({ length: last.value }, (_item, index) => index + 1)

  let from = Math.max(2, Math.min(current.value - props.siblings, last.value - slots + 3))
  let to = Math.min(last.value - 1, Math.max(current.value + props.siblings, slots - 2))
  // A "…" that would hide a single page number shows that number instead.
  if (from === 3) [from, to] = [2, Math.max(to, slots - 2)]
  if (to === last.value - 2) [from, to] = [Math.min(from, last.value - slots + 3), last.value - 1]
  const middle = Array.from({ length: to - from + 1 }, (_item, index) => from + index)
  return [1, ...(from > 2 ? [null] : []), ...middle, ...(to < last.value - 1 ? [null] : []), last.value]
})

function go(next: number) {
  page.value = Math.max(1, Math.min(next, last.value))
}
</script>

<template>
  <nav class="er-pagination" :aria-label="label">
    <button type="button" class="er-pagination-button" aria-label="Previous page" :disabled="current <= 1" @click="go(current - 1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
    <template v-for="(item, index) in items" :key="index">
      <span v-if="item === null" class="er-pagination-gap" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        class="er-pagination-button"
        :aria-label="`Page ${item}`"
        :aria-current="item === current ? 'page' : undefined"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>
    <button type="button" class="er-pagination-button" aria-label="Next page" :disabled="current >= last" @click="go(current + 1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  </nav>
</template>

<style>
@layer components {
  .er-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }

  .er-pagination-button,
  .er-pagination-gap {
    display: inline-grid;
    place-items: center;
    min-width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  .er-pagination-gap {
    color: var(--er-muted-foreground);
  }

  .er-pagination-button {
    padding: 0 0.375rem;
    border: 1px solid transparent;
    border-radius: var(--er-radius-md);
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      border-color var(--er-duration);
  }

  .er-pagination-button:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-pagination-button[aria-current='page'] {
    border-color: var(--er-input);
    background: var(--er-input-background);
    font-weight: 500;
    box-shadow: var(--er-shadow-xs);
  }

  .er-pagination-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-pagination-button:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-pagination-button svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
