<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '../badge'
import { Button } from '../button'
import { formatMoney, percentOff } from '../price'
import { SegmentedControl, SegmentedControlItem } from '../segmented-control'
import type { PricingBilling, PricingPlan } from './types'

const props = withDefaults(
  defineProps<{
    plans: readonly PricingPlan[]
    currency?: string
    locale?: string
    /** Heading level of each plan's name. */
    titleAs?: string
    /** The id of the plan the reader is on now. Its button says so and cannot be pressed. */
    current?: string
    currentLabel?: string
  }>(),
  { currency: 'USD', locale: 'en-US', titleAs: 'h3', currentLabel: 'Current plan' },
)

const emit = defineEmits<{
  /** A plan's button was pressed. */
  select: [plan: PricingPlan, billing: PricingBilling]
}>()

/** How the reader wants to pay. The switch only appears when some plan has a yearly price. */
const billing = defineModel<PricingBilling>('billing', { default: 'monthly' })

const hasYearly = computed(() => props.plans.some((plan) => typeof plan.price === 'object'))
/** The largest saving from paying yearly, to tempt the reader with on the switch. */
const bestSaving = computed(() => Math.max(0, ...props.plans.map((plan) => (typeof plan.price === 'object' ? percentOff(plan.price.yearly, plan.price.monthly) : 0))))

function amount(plan: PricingPlan) {
  if (plan.price === undefined) return undefined
  return typeof plan.price === 'number' ? plan.price : plan.price[billing.value]
}

// Whole amounts are written without ".00", which reads better at this size.
const money = (value: number) => formatMoney(value, props.currency, props.locale).replace(/[.,]00(?=\D*$)/, '')
</script>

<template>
  <div class="er-pricing-table">
    <div v-if="hasYearly" class="er-pricing-table-billing">
      <SegmentedControl v-model="billing" label="Billing period">
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly<span v-if="bestSaving" class="er-pricing-table-saving">Save {{ bestSaving }}%</span></SegmentedControlItem>
      </SegmentedControl>
    </div>

    <ul class="er-pricing-table-plans">
      <li v-for="plan in plans" :key="plan.id" class="er-pricing-table-plan" :data-featured="plan.featured ? '' : undefined">
        <div class="er-pricing-table-head">
          <component :is="titleAs" class="er-pricing-table-name">{{ plan.name }}</component>
          <Badge v-if="plan.badge">{{ plan.badge }}</Badge>
        </div>
        <p v-if="plan.description" class="er-pricing-table-description">{{ plan.description }}</p>

        <p class="er-pricing-table-price">
          <template v-if="amount(plan) !== undefined">
            <strong>{{ money(amount(plan)!) }}</strong>
            <span>/ month<template v-if="typeof plan.price === 'object' && billing === 'yearly'">, billed yearly</template></span>
          </template>
          <strong v-else>{{ plan.priceLabel ?? 'Contact us' }}</strong>
        </p>

        <Button
          :as="plan.href && plan.id !== current ? 'a' : 'button'"
          :href="plan.id !== current ? plan.href : undefined"
          :variant="plan.featured ? 'default' : 'outline'"
          :disabled="plan.id === current"
          @click="!plan.href && emit('select', plan, billing)"
        >
          {{ plan.id === current ? currentLabel : (plan.cta ?? 'Choose') }}<span v-if="plan.id !== current" class="er-pricing-table-hidden"> {{ plan.name }}</span>
        </Button>

        <ul class="er-pricing-table-features" :aria-label="`${plan.name} includes`">
          <li v-for="feature in plan.features" :key="feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            {{ feature }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style>
@layer components {
  .er-pricing-table {
    display: grid;
    gap: 1.5rem;
    width: 100%;
    container-type: inline-size;
  }

  .er-pricing-table-billing {
    display: flex;
    justify-content: center;
  }

  .er-pricing-table-saving {
    padding: 0.125rem 0.375rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--er-success) 15%, transparent);
    color: var(--er-foreground);
    font-size: 0.6875rem;
    font-weight: var(--er-weight-semibold);
  }

  /* As many plans in a row as fit; the table measures itself, not the screen. */
  .er-pricing-table-plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-pricing-table-plan {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-xl);
    background: var(--er-card);
    color: var(--er-card-foreground);
  }

  .er-pricing-table-plan[data-featured] {
    border-color: var(--er-primary);
    box-shadow:
      0 0 0 1px var(--er-primary),
      var(--er-shadow-md);
  }

  .er-pricing-table-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .er-pricing-table-name {
    margin: 0;
    font-size: 1rem;
    font-weight: var(--er-weight-semibold);
    line-height: 1.5rem;
  }

  .er-pricing-table-description {
    margin: -0.5rem 0 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-pricing-table-price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.125rem 0.375rem;
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
  }

  .er-pricing-table-price strong {
    color: var(--er-foreground);
    font-size: 2rem;
    font-weight: var(--er-weight-semibold);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    line-height: 2.25rem;
  }

  .er-pricing-table-features {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    list-style: none;
  }

  .er-pricing-table-features li {
    display: flex;
    gap: 0.5rem;
  }

  .er-pricing-table-features svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1.25rem;
    color: var(--er-success);
  }

  .er-pricing-table-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
