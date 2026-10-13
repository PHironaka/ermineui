<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { CartLineItem } from '../../ui/cart-line-item'
import { EmptyState } from '../../ui/empty-state'
import { Field } from '../../ui/field'
import { Input } from '../../ui/input'
import { OrderSummary } from '../../ui/order-summary'
import { sampleCart, type CartItem } from './sample-data'

withDefaults(
  defineProps<{
    title?: string
    currency?: string
    locale?: string
    /** Money taken off, as a positive number. */
    discount?: number
    /** What the discount is, e.g. the code that was used. */
    discountLabel?: string
    /** Leave out until it is known; the summary then says it comes later. */
    shipping?: number
    tax?: number
    /** Show a field for a discount code. */
    codes?: boolean
    /** Why the last code was turned down, e.g. "That code has expired." */
    codeError?: string
    /** Set while the checkout is being opened: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    /** Where "Continue shopping" goes. */
    shopHref?: string
    /** Heading level of the title. */
    titleAs?: string
  }>(),
  { title: 'Your cart', currency: 'USD', locale: 'en-US', codes: true, shopHref: '/', titleAs: 'h2' },
)

const emit = defineEmits<{
  /** "Checkout" was pressed. */
  checkout: [items: CartItem[]]
  /** A discount code was entered. Check it on your server, then set `discount` or `codeError`. */
  applyCode: [code: string]
}>()

/** What is in the cart. The made-up products from sample-data.ts are shown until you pass your own. */
const items = defineModel<CartItem[]>('items', { default: () => sampleCart })

const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const pieces = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

const heading = ref<HTMLElement | null>(null)
/** Said aloud after an item is removed: the row disappears, and nothing else would tell a screen reader user so. */
const message = ref('')
const code = ref('')

function setQuantity(id: string, quantity: number) {
  items.value = items.value.map((item) => (item.id === id ? { ...item, quantity } : item))
}

async function remove(item: CartItem) {
  items.value = items.value.filter((other) => other.id !== item.id)
  message.value = `${item.title} removed from your cart.`
  // The button that was pressed is gone, so focus would be lost; it goes to the heading instead.
  await nextTick()
  heading.value?.focus()
}
</script>

<template>
  <section class="er-cart">
    <component :is="titleAs" ref="heading" class="er-cart-title" tabindex="-1">
      {{ title }}
      <span v-if="items.length" class="er-cart-count">{{ pieces }} {{ pieces === 1 ? 'item' : 'items' }}</span>
    </component>
    <p class="er-cart-status" role="status">{{ message }}</p>

    <EmptyState v-if="!items.length" title="Your cart is empty" description="Things you add will be listed here.">
      <Button as="a" :href="shopHref">Continue shopping</Button>
    </EmptyState>

    <div v-else class="er-cart-layout">
      <ul class="er-cart-items">
        <li v-for="item in items" :key="item.id">
          <CartLineItem
            :title="item.title"
            :href="item.href"
            :image="item.image"
            :options="item.options"
            :price="item.price"
            :compare-at="item.compareAt"
            :max="item.max"
            :currency="currency"
            :locale="locale"
            :quantity="item.quantity"
            @update:quantity="setQuantity(item.id, $event)"
            @remove="remove(item)"
          />
        </li>
      </ul>

      <Card class="er-cart-summary">
        <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
        <CardContent>
          <OrderSummary :subtotal="subtotal" :discount="discount" :discount-label="discountLabel" :shipping="shipping" :tax="tax" :currency="currency" :locale="locale">
            <form v-if="codes" class="er-cart-code" novalidate @submit.prevent="code.trim() && emit('applyCode', code.trim())">
              <Field v-slot="{ control }" label="Discount code" :error="codeError">
                <div class="er-cart-code-row">
                  <Input v-bind="control" v-model="code" name="code" autocomplete="off" />
                  <Button type="submit" variant="outline">Apply</Button>
                </div>
              </Field>
            </form>
            <template #footer>
              <Button size="lg" :loading="loading" @click="emit('checkout', items)">Checkout</Button>
              <a class="er-cart-link" :href="shopHref">Continue shopping</a>
            </template>
          </OrderSummary>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<style>
@layer components {
  .er-cart {
    display: grid;
    gap: 1.25rem;
    width: 100%;
    min-width: 0;
  }

  .er-cart-title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    outline: none;
  }

  .er-cart-count {
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    font-weight: 400;
  }

  .er-cart-status {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-cart-layout {
    display: grid;
    align-items: start;
    gap: 1.5rem;
  }

  /* Side by side once there is room for both; the block measures itself, not the screen. */
  .er-cart {
    container-type: inline-size;
  }

  @container (min-width: 44rem) {
    .er-cart-layout {
      grid-template-columns: minmax(0, 1fr) 20rem;
      gap: 2rem;
    }
  }

  .er-cart-items {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-cart-items li {
    padding-block: 1rem;
    border-bottom: 1px solid var(--er-border);
  }

  .er-cart-items li:first-child {
    padding-top: 0;
  }

  .er-cart-code-row {
    display: flex;
    gap: 0.5rem;
  }

  .er-cart-link {
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-cart-link:hover {
    color: var(--er-foreground);
  }

  .er-cart-link:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }
}
</style>
