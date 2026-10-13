<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../price'

const props = withDefaults(
  defineProps<{
    /** The items added up, before anything else. Amounts are in whole units of the currency. */
    subtotal: number
    /** Money taken off, as a positive number. */
    discount?: number
    /** What the discount is, e.g. the code that was used. */
    discountLabel?: string
    /** 0 is written as "Free". Leave out until it is known. */
    shipping?: number
    /** Shown in place of the shipping cost while it is not known. */
    shippingPending?: string
    tax?: number
    /** Worked out from the lines above when left out. */
    total?: number
    currency?: string
    locale?: string
  }>(),
  { discountLabel: 'Discount', shippingPending: 'Calculated at checkout', currency: 'USD', locale: 'en-US' },
)

const money = (amount: number) => formatMoney(amount, props.currency, props.locale)
const sum = computed(() => props.total ?? Math.max(0, props.subtotal - (props.discount ?? 0) + (props.shipping ?? 0) + (props.tax ?? 0)))
</script>

<template>
  <div class="er-order-summary">
    <!-- The items themselves, a discount code field, or anything else that belongs above the sums. -->
    <slot />
    <dl>
      <div>
        <dt>Subtotal</dt>
        <dd>{{ money(subtotal) }}</dd>
      </div>
      <div v-if="discount" data-tone="discount">
        <dt>{{ discountLabel }}</dt>
        <dd>−{{ money(discount) }}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd :data-pending="shipping === undefined ? '' : undefined">{{ shipping === undefined ? shippingPending : shipping === 0 ? 'Free' : money(shipping) }}</dd>
      </div>
      <div v-if="tax !== undefined">
        <dt>Tax</dt>
        <dd>{{ money(tax) }}</dd>
      </div>
      <div class="er-order-summary-total">
        <dt>Total</dt>
        <dd>{{ money(sum) }}</dd>
      </div>
    </dl>
    <!-- The button that moves on, and any small print. -->
    <slot name="footer" />
  </div>
</template>

<style>
@layer components {
  .er-order-summary {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .er-order-summary dl {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.875rem;
  }

  .er-order-summary dl > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .er-order-summary dt {
    color: var(--er-muted-foreground);
  }

  .er-order-summary dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .er-order-summary dd[data-pending] {
    color: var(--er-muted-foreground);
  }

  .er-order-summary [data-tone='discount'] dd {
    color: var(--er-success);
  }

  .er-order-summary .er-order-summary-total {
    margin-top: 0.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--er-border);
    font-size: 1rem;
    font-weight: 600;
  }

  .er-order-summary-total dt {
    color: var(--er-foreground);
  }
}
</style>
