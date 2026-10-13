<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '../button'
import { formatMoney, Price } from '../price'
import { QuantityStepper } from '../quantity-stepper'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../sheet'
import type { MiniCartItem } from './types'

const props = withDefaults(
  defineProps<{
    title?: string
    currency?: string
    locale?: string
    /** The edge the panel slides in from. */
    side?: 'left' | 'right'
    /** A line under the subtotal, e.g. about shipping and tax. */
    note?: string
    /** Where "View cart" goes. Leave out to hide the link. */
    cartHref?: string
    /** Set while the checkout is being opened: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
  }>(),
  { title: 'Your cart', currency: 'USD', locale: 'en-US', side: 'right', note: 'Shipping and taxes are worked out at checkout.' },
)

const emit = defineEmits<{
  /** "Checkout" was pressed. */
  checkout: [items: MiniCartItem[]]
}>()

const open = defineModel<boolean>('open', { default: false })
/** What is in the cart. */
const items = defineModel<MiniCartItem[]>('items', { default: () => [] })

const pieces = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const money = (amount: number) => formatMoney(amount, props.currency, props.locale)

/** Said aloud after an item is removed: the row disappears, and nothing else would tell a screen reader user so. */
const message = ref('')

function setQuantity(id: string, quantity: number) {
  items.value = items.value.map((item) => (item.id === id ? { ...item, quantity } : item))
}

function remove(item: MiniCartItem) {
  items.value = items.value.filter((other) => other.id !== item.id)
  message.value = `${item.title} removed from your cart.`
}
</script>

<template>
  <Sheet v-model:open="open">
    <!-- The button that opens the cart. It is handed the number of pieces, to show as a count. -->
    <SheetTrigger v-if="$slots.trigger" as-child><slot name="trigger" :count="pieces" /></SheetTrigger>
    <SheetContent :side="side" class="er-mini-cart">
      <SheetHeader>
        <SheetTitle>{{ title }}</SheetTitle>
        <SheetDescription>{{ pieces === 0 ? 'Nothing in it yet.' : pieces === 1 ? '1 item' : `${pieces} items` }}</SheetDescription>
      </SheetHeader>
      <p class="er-mini-cart-status" role="status">{{ message }}</p>

      <!-- Shown when the cart is empty. -->
      <div v-if="!items.length" class="er-mini-cart-empty"><slot name="empty">Things you add will be listed here.</slot></div>

      <ul v-else class="er-mini-cart-items">
        <li v-for="item in items" :key="item.id" class="er-mini-cart-item">
          <div v-if="item.image" class="er-mini-cart-media"><img :src="item.image" alt="" loading="lazy" /></div>
          <div class="er-mini-cart-main">
            <div class="er-mini-cart-title">
              <a v-if="item.href" :href="item.href">{{ item.title }}</a>
              <template v-else>{{ item.title }}</template>
            </div>
            <p v-if="item.options" class="er-mini-cart-options">{{ item.options }}</p>
            <div class="er-mini-cart-row">
              <QuantityStepper
                :model-value="item.quantity"
                :max="item.max"
                size="sm"
                removable
                :label="`Quantity of ${item.title}`"
                :remove-label="`Remove ${item.title}`"
                @update:model-value="setQuantity(item.id, $event)"
                @remove="remove(item)"
              />
              <Price :amount="item.price * item.quantity" :compare-at="item.compareAt ? item.compareAt * item.quantity : undefined" :currency="currency" :locale="locale" size="sm" />
            </div>
          </div>
        </li>
      </ul>

      <SheetFooter v-if="items.length" class="er-mini-cart-footer">
        <div class="er-mini-cart-subtotal"><span>Subtotal</span><strong>{{ money(subtotal) }}</strong></div>
        <p v-if="note" class="er-mini-cart-options">{{ note }}</p>
        <Button size="lg" :loading="loading" @click="emit('checkout', items)">Checkout</Button>
        <Button v-if="cartHref" as="a" variant="outline" :href="cartHref">View cart</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style>
@layer components {
  .er-mini-cart-status {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-mini-cart-empty {
    display: grid;
    flex: 1;
    place-content: center;
    gap: 0.75rem;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  .er-mini-cart-items {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-mini-cart-item {
    display: flex;
    gap: 0.75rem;
    padding-block: 0.875rem;
    border-bottom: 1px solid var(--er-border);
  }

  .er-mini-cart-item:first-child {
    padding-top: 0;
  }

  .er-mini-cart-media {
    flex-shrink: 0;
    width: 4rem;
    height: 4rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-mini-cart-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .er-mini-cart-main {
    display: grid;
    flex: 1;
    gap: 0.125rem;
    min-width: 0;
  }

  .er-mini-cart-title {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .er-mini-cart-title a {
    color: inherit;
    text-decoration: none;
  }

  .er-mini-cart-title a:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-mini-cart-title a:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-mini-cart-options {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .er-mini-cart-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.375rem;
  }

  .er-mini-cart .er-mini-cart-footer {
    display: grid;
    gap: 0.5rem;
  }

  .er-mini-cart-subtotal {
    display: flex;
    justify-content: space-between;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
  }
}
</style>
