<script setup lang="ts">
import { computed } from 'vue'
import { Rating } from '../rating'

const props = withDefaults(
  defineProps<{
    /** How many reviews gave each score, lowest first: [1 star, 2 stars, 3 stars, 4 stars, 5 stars]. */
    counts: readonly number[]
    /** Make each row a button that picks that score, to list only those reviews. */
    selectable?: boolean
    /** Accessible name of the whole summary. */
    label?: string
  }>(),
  { label: 'Customer reviews' },
)

/** The score whose reviews are being shown, when rows can be picked. Unset shows them all. */
const selected = defineModel<number | undefined>()

const total = computed(() => props.counts.reduce((sum, count) => sum + count, 0))
const average = computed(() => (total.value ? props.counts.reduce((sum, count, index) => sum + count * (index + 1), 0) / total.value : 0))
/** Highest score first, as readers expect. */
const rows = computed(() =>
  props.counts
    .map((count, index) => ({ stars: index + 1, count, percent: total.value ? Math.round((count / total.value) * 100) : 0 }))
    .reverse(),
)

// Fixed locale, so server and browser write the same text.
const oneDecimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('en-US')
</script>

<template>
  <section class="er-rating-breakdown" :aria-label="label">
    <div class="er-rating-breakdown-score">
      <strong>{{ oneDecimal.format(average) }}</strong>
      <div>
        <Rating :model-value="average" :max="counts.length" readonly label="Average score" />
        <p>{{ whole.format(total) }} {{ total === 1 ? 'review' : 'reviews' }}</p>
      </div>
    </div>
    <ul class="er-rating-breakdown-rows">
      <li v-for="row in rows" :key="row.stars">
        <component
          :is="selectable ? 'button' : 'div'"
          class="er-rating-breakdown-row"
          :type="selectable ? 'button' : undefined"
          :aria-pressed="selectable ? selected === row.stars : undefined"
          :disabled="selectable && !row.count ? true : undefined"
          @click="selectable && (selected = selected === row.stars ? undefined : row.stars)"
        >
          <span class="er-rating-breakdown-stars">{{ row.stars }} {{ row.stars === 1 ? 'star' : 'stars' }}</span>
          <span class="er-rating-breakdown-bar" aria-hidden="true"><span :style="{ width: `${row.percent}%` }" /></span>
          <span class="er-rating-breakdown-share">{{ row.percent }}%</span>
        </component>
      </li>
    </ul>
  </section>
</template>

<style>
@layer components {
  .er-rating-breakdown {
    display: grid;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .er-rating-breakdown-score {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .er-rating-breakdown-score strong {
    font-size: 2.25rem;
    font-weight: var(--er-weight-semibold);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .er-rating-breakdown-score p {
    margin: 0.125rem 0 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-rating-breakdown-rows {
    display: grid;
    gap: 0.125rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-rating-breakdown-row {
    display: grid;
    grid-template-columns: 3.75rem minmax(0, 1fr) 2.5rem;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.25rem 0.375rem;
    margin-inline: -0.375rem;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
    text-align: left;
  }

  button.er-rating-breakdown-row {
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  button.er-rating-breakdown-row:hover,
  button.er-rating-breakdown-row[aria-pressed='true'] {
    background: var(--er-accent);
  }

  button.er-rating-breakdown-row[aria-pressed='true'] {
    font-weight: var(--er-weight-semibold);
  }

  button.er-rating-breakdown-row:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  button.er-rating-breakdown-row:disabled {
    color: var(--er-muted-foreground);
    cursor: default;
    pointer-events: none;
  }

  .er-rating-breakdown-bar {
    height: 0.5rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--er-foreground) 10%, transparent);
    overflow: hidden;
  }

  .er-rating-breakdown-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--er-warning);
  }

  .er-rating-breakdown-share {
    color: var(--er-muted-foreground);
    text-align: right;
  }
}
</style>
