<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { CartLineItem } from '../../ui/cart-line-item'
import { DescriptionItem, DescriptionList } from '../../ui/description-list'
import { OrderSummary } from '../../ui/order-summary'
import { OrderTracker } from '../../ui/order-tracker'
import { sampleOrder, type ConfirmedOrder } from './sample-data'

// Everything shown comes in through these props. The default is the made-up order from sample-data.ts.
const props = withDefaults(
  defineProps<{
    order?: ConfirmedOrder
    title?: string
    currency?: string
    locale?: string
    /** Where "Track your order" goes. Leave out to hide the button. */
    trackHref?: string
    /** Where "Continue shopping" goes. */
    shopHref?: string
    /** Heading level of the title. */
    titleAs?: string
  }>(),
  { order: () => sampleOrder, title: 'Thank you for your order', currency: 'USD', locale: 'en-US', shopHref: '/', titleAs: 'h2' },
)

const subtotal = computed(() => props.order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
</script>

<template>
  <section class="er-order-confirmation">
    <header class="er-order-confirmation-header">
      <span class="er-order-confirmation-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500" /></svg>
      </span>
      <component :is="titleAs" class="er-order-confirmation-title">{{ title }}</component>
      <p class="er-order-confirmation-lead">
        Order <strong>{{ order.number }}</strong> is confirmed. A receipt is on its way to <strong>{{ order.email }}</strong>.
      </p>
      <div class="er-order-confirmation-actions">
        <Button v-if="trackHref" as="a" :href="trackHref">Track your order</Button>
        <Button as="a" :variant="trackHref ? 'outline' : 'default'" :href="shopHref">Continue shopping</Button>
      </div>
    </header>

    <div class="er-order-confirmation-layout">
      <div class="er-order-confirmation-main">
        <Card>
          <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
          <CardContent class="er-order-confirmation-stack">
            <OrderTracker :current="1">
              <template v-if="order.arriving">Arriving {{ order.arriving }}.</template>
            </OrderTracker>
            <DescriptionList>
              <DescriptionItem label="Placed">{{ order.placed }}</DescriptionItem>
              <DescriptionItem label="Sending to">
                <address class="er-order-confirmation-address"><template v-for="(line, index) in order.address" :key="index">{{ line }}<br v-if="index < order.address.length - 1" /></template></address>
              </DescriptionItem>
              <DescriptionItem label="Delivery">{{ order.shippingMethod }}</DescriptionItem>
              <DescriptionItem label="Paid with">{{ order.payment }}</DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>
        <!-- Anything more under the delivery details: what happens next, how to get help. -->
        <slot />
      </div>

      <Card>
        <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
        <CardContent>
          <OrderSummary :subtotal="subtotal" :discount="order.discount" :discount-label="order.discountLabel" :shipping="order.shipping" :tax="order.tax" :currency="currency" :locale="locale">
            <ul class="er-order-confirmation-items">
              <li v-for="item in order.items" :key="item.id">
                <CartLineItem :title="item.title" :image="item.image" :options="item.options" :price="item.price" :quantity="item.quantity" :currency="currency" :locale="locale" readonly />
              </li>
            </ul>
          </OrderSummary>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<style>
@layer components {
  .er-order-confirmation {
    display: grid;
    gap: 2rem;
    width: 100%;
    min-width: 0;
    /* Side by side once there is room for both; the block measures itself, not the screen. */
    container-type: inline-size;
  }

  .er-order-confirmation-header {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    text-align: center;
  }

  .er-order-confirmation-mark {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: color-mix(in oklab, var(--er-success) 15%, transparent);
    color: var(--er-success);
  }

  .er-order-confirmation-mark svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .er-order-confirmation-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: var(--er-weight-heading);
    letter-spacing: -0.01em;
    line-height: 2rem;
    text-wrap: balance;
  }

  .er-order-confirmation-lead {
    max-width: 34rem;
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .er-order-confirmation-lead strong {
    color: var(--er-foreground);
    font-weight: var(--er-weight-semibold);
    overflow-wrap: anywhere;
  }

  .er-order-confirmation-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .er-order-confirmation-layout {
    display: grid;
    align-items: start;
    gap: 1.5rem;
  }

  @container (min-width: 46rem) {
    .er-order-confirmation-layout {
      grid-template-columns: minmax(0, 1fr) 21rem;
    }
  }

  .er-order-confirmation-main,
  .er-order-confirmation .er-order-confirmation-stack {
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  .er-order-confirmation-address {
    font-style: normal;
  }

  .er-order-confirmation-items {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}
</style>
