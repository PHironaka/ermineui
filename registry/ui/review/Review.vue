<script setup lang="ts">
import { computed } from 'vue'
import { Rating } from '../rating'

const props = withDefaults(
  defineProps<{
    author: string
    /** The score given, out of five. */
    rating: number
    /** A headline for the review. */
    title?: string
    /** When it was written, as a date in ISO form: 2026-09-14. */
    date?: string
    locale?: string
    /** The reviewer is known to have bought the product. */
    verified?: boolean
    /** Heading level of the title. */
    titleAs?: string
  }>(),
  { locale: 'en-US', titleAs: 'h4' },
)

// Read as UTC, so the day shown does not depend on where the server or the reader is.
const written = computed(() => {
  if (!props.date) return undefined
  const day = new Date(props.date.length === 10 ? `${props.date}T00:00:00Z` : props.date)
  return Number.isNaN(day.getTime()) ? props.date : new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(day)
})
</script>

<template>
  <article class="er-review">
    <header class="er-review-header">
      <Rating :model-value="rating" readonly size="sm" label="Rated" />
      <component :is="titleAs" v-if="title" class="er-review-title">{{ title }}</component>
    </header>
    <div class="er-review-body"><slot /></div>
    <footer class="er-review-meta">
      <span class="er-review-author">{{ author }}</span>
      <span v-if="verified" class="er-review-verified">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        Verified buyer
      </span>
      <time v-if="written" :datetime="date">{{ written }}</time>
      <!-- "Was this helpful?" buttons, a reply from the shop, and so on. -->
      <slot name="footer" />
    </footer>
  </article>
</template>

<style>
@layer components {
  .er-review {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .er-review-header {
    display: grid;
    justify-items: start;
    gap: 0.375rem;
  }

  .er-review-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.375rem;
  }

  .er-review-body > :first-child {
    margin-top: 0;
  }

  .er-review-body > :last-child {
    margin-bottom: 0;
  }

  .er-review-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.75rem;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-review-author {
    color: var(--er-foreground);
    font-weight: 500;
  }

  .er-review-verified {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .er-review-verified svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--er-success);
  }
}
</style>
