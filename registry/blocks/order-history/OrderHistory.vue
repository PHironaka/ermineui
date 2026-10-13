<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '../../ui/button'
import { EmptyState } from '../../ui/empty-state'
import { OrderTracker } from '../../ui/order-tracker'
import { formatMoney } from '../../ui/price'
import { SegmentedControl, SegmentedControlItem } from '../../ui/segmented-control'
import { Status } from '../../ui/status'
import { sampleOrders, type OrderStatus, type PastOrder } from './sample-data'

// Everything shown comes in through these props. The defaults are made-up orders from sample-data.ts.
const props = withDefaults(
  defineProps<{
    orders?: readonly PastOrder[]
    title?: string
    currency?: string
    locale?: string
    /** Where "Start shopping" goes when there are no orders at all. */
    shopHref?: string
    /** Heading level of the title. Order numbers are one level below it. */
    titleAs?: 'h1' | 'h2' | 'h3'
  }>(),
  { orders: () => sampleOrders, title: 'Your orders', currency: 'USD', locale: 'en-US', shopHref: '/', titleAs: 'h2' },
)

const emit = defineEmits<{
  /** "View order" was pressed. */
  view: [order: PastOrder]
  /** "Buy again" was pressed. Put the order's items back in the cart. */
  reorder: [order: PastOrder]
}>()

/** Which orders are listed: all of them, the ones still on their way, or the ones that are finished. */
const filter = defineModel<'all' | 'open' | 'done'>('filter', { default: 'all' })

const open = (status: OrderStatus) => status === 'processing' || status === 'shipped'
const shown = computed(() => props.orders.filter((order) => filter.value === 'all' || open(order.status) === (filter.value === 'open')))
const orderHeading = computed(() => `h${Number(props.titleAs[1]) + 1}`)

const statuses: Record<OrderStatus, { label: string; tone: 'info' | 'success' | 'neutral'; stage: number }> = {
  processing: { label: 'Processing', tone: 'info', stage: 2 },
  shipped: { label: 'Shipped', tone: 'info', stage: 3 },
  delivered: { label: 'Delivered', tone: 'success', stage: 5 },
  cancelled: { label: 'Cancelled', tone: 'neutral', stage: 0 },
}

// Read as UTC, so the day shown does not depend on where the server or the reader is.
function placed(date: string) {
  const day = new Date(date.length === 10 ? `${date}T00:00:00Z` : date)
  return Number.isNaN(day.getTime()) ? date : new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(day)
}

const pieces = (order: PastOrder) => order.items.reduce((sum, item) => sum + item.quantity, 0)
</script>

<template>
  <section class="er-order-history">
    <div class="er-order-history-header">
      <component :is="titleAs" class="er-order-history-title">{{ title }}</component>
      <SegmentedControl v-if="orders.length" v-model="filter" label="Show orders" size="sm">
        <SegmentedControlItem value="all">All</SegmentedControlItem>
        <SegmentedControlItem value="open">On the way</SegmentedControlItem>
        <SegmentedControlItem value="done">Finished</SegmentedControlItem>
      </SegmentedControl>
    </div>

    <EmptyState v-if="!orders.length" title="No orders yet" description="When you buy something, it will be listed here.">
      <Button as="a" :href="shopHref">Start shopping</Button>
    </EmptyState>
    <EmptyState v-else-if="!shown.length" :title="filter === 'open' ? 'Nothing on the way' : 'No finished orders'" description="Orders that match will be listed here.">
      <Button variant="outline" @click="filter = 'all'">Show all orders</Button>
    </EmptyState>

    <ul v-else class="er-order-history-list">
      <li v-for="order in shown" :key="order.number" class="er-order-history-order">
        <div class="er-order-history-top">
          <div>
            <component :is="orderHeading" class="er-order-history-number">Order {{ order.number }}</component>
            <p class="er-order-history-meta">
              <time :datetime="order.date">{{ placed(order.date) }}</time> · {{ pieces(order) }} {{ pieces(order) === 1 ? 'item' : 'items' }} · {{ formatMoney(order.total, currency, locale) }}
            </p>
          </div>
          <Status :tone="statuses[order.status].tone" :pulse="order.status === 'shipped'">{{ statuses[order.status].label }}</Status>
        </div>

        <!-- An order still on its way shows how far it has got; a finished one only needs its status. -->
        <OrderTracker v-if="open(order.status)" :current="statuses[order.status].stage" :label="`Progress of order ${order.number}`">
          <template v-if="order.note">{{ order.note }}</template>
        </OrderTracker>
        <p v-else-if="order.note" class="er-order-history-meta">{{ order.note }}</p>

        <ul class="er-order-history-items">
          <li v-for="item in order.items" :key="item.id">
            <span v-if="item.image" class="er-order-history-thumb"><img :src="item.image" alt="" loading="lazy" /></span>
            <span>{{ item.title }}<template v-if="item.quantity > 1"> × {{ item.quantity }}</template></span>
          </li>
        </ul>

        <div class="er-order-history-actions">
          <Button v-if="order.trackHref && open(order.status)" as="a" size="sm" :href="order.trackHref">Track<span class="er-order-history-hidden"> order {{ order.number }}</span></Button>
          <Button variant="outline" size="sm" @click="emit('view', order)">View order<span class="er-order-history-hidden"> {{ order.number }}</span></Button>
          <Button v-if="!open(order.status)" variant="ghost" size="sm" @click="emit('reorder', order)">Buy<span class="er-order-history-hidden"> order {{ order.number }}</span> again</Button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style>
@layer components {
  .er-order-history {
    display: grid;
    gap: 1.25rem;
    width: 100%;
    min-width: 0;
  }

  .er-order-history-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .er-order-history-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
  }

  .er-order-history-list {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-order-history-order {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-xl);
    background: var(--er-card);
    color: var(--er-card-foreground);
  }

  .er-order-history-top {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem 1rem;
  }

  .er-order-history-number {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.375rem;
  }

  .er-order-history-meta {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
  }

  .er-order-history-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin: 0;
    padding: 0;
    font-size: 0.875rem;
    list-style: none;
  }

  .er-order-history-items li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .er-order-history-thumb {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-sm);
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-order-history-thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .er-order-history-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .er-order-history-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
