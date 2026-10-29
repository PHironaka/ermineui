<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney, percentOff } from './money'

const props = withDefaults(
  defineProps<{
    /** What it costs now, in whole units of the currency: 24.5 for $24.50. */
    amount: number
    /** What it cost before. When higher than the amount, it is shown struck through beside it. */
    compareAt?: number
    /** Three-letter currency code. */
    currency?: string
    locale?: string
    /** What the price is for, e.g. "/ month" or "each". */
    unit?: string
    /** Add "Save 20%" after a reduced price. */
    showSaving?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { currency: 'USD', locale: 'en-US', size: 'md' },
)

const saving = computed(() => percentOff(props.amount, props.compareAt))
</script>

<template>
  <span class="er-price" :data-size="size" :data-sale="saving ? '' : undefined">
    <!-- "Now" and "Was" are read aloud only: a struck-through number says nothing to a screen reader. -->
    <span class="er-price-now"><span v-if="saving" class="er-price-hidden">Now </span>{{ formatMoney(amount, currency, locale) }}</span>
    <span v-if="unit" class="er-price-unit">{{ unit }}</span>
    <s v-if="saving && compareAt !== undefined" class="er-price-was"><span class="er-price-hidden">Was </span>{{ formatMoney(compareAt, currency, locale) }}</s>
    <span v-if="saving && showSaving" class="er-price-saving">Save {{ saving }}%</span>
  </span>
</template>

<style>
@layer components {
  .er-price {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.375rem;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
  }

  .er-price[data-size='sm'] {
    font-size: 0.8125rem;
  }

  .er-price[data-size='lg'] {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .er-price-now {
    font-weight: var(--er-weight-semibold);
  }

  .er-price[data-sale] .er-price-now {
    color: var(--er-destructive);
  }

  .er-price-unit,
  .er-price-was {
    color: var(--er-muted-foreground);
    font-size: max(0.75em, 0.8125rem);
  }

  .er-price-saving {
    padding: 0 0.375rem;
    border-radius: var(--er-radius-sm);
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
    font-size: 0.75rem;
    font-weight: var(--er-weight-medium);
  }

  .er-price-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
