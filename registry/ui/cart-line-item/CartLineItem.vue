<script setup lang="ts">
import type { Component } from 'vue'
import { NumberInput } from '../number-input'
import { formatMoney, Price } from '../price'

withDefaults(
  defineProps<{
    title: string
    /** Where the product's own page is. */
    href?: string
    image?: string
    /** Leave empty when the picture shows nothing the title does not already say. */
    imageAlt?: string
    /** The variant that was chosen, e.g. "Sand / Large". */
    options?: string
    /** Price of one. Amounts are in whole units of the currency. */
    price: number
    /** The price of one before a reduction. */
    compareAt?: number
    currency?: string
    locale?: string
    /** The most that can be bought, e.g. what is left in stock. */
    max?: number
    /** Show the quantity as text with nothing to change: for an order that is being paid for, or already placed. */
    readonly?: boolean
    /** Tag or component for the link, e.g. NuxtLink. */
    linkAs?: string | Component
  }>(),
  { imageAlt: '', currency: 'USD', locale: 'en-US', linkAs: 'a' },
)

defineEmits<{
  /** The "Remove" button was pressed. Take the item out of your cart. */
  remove: []
}>()

/** How many of this item. */
const quantity = defineModel<number>('quantity', { default: 1 })

/** An emptied field counts as one until a number is typed, rather than as nothing. */
function setQuantity(next: number | undefined) {
  quantity.value = next === undefined ? 1 : Math.max(1, Math.round(next))
}
</script>

<template>
  <div class="er-cart-line-item" :data-readonly="readonly ? '' : undefined">
    <div v-if="image" class="er-cart-line-item-media"><img :src="image" :alt="imageAlt" loading="lazy" /></div>
    <div class="er-cart-line-item-main">
      <div class="er-cart-line-item-title">
        <component :is="linkAs" v-if="href" :href="href">{{ title }}</component>
        <template v-else>{{ title }}</template>
      </div>
      <p v-if="options" class="er-cart-line-item-options">{{ options }}</p>
      <Price :amount="price" :compare-at="compareAt" :currency="currency" :locale="locale" size="sm" :unit="quantity > 1 ? 'each' : undefined" />
      <!-- A note about this item: "Only 2 left", "Arrives Friday". -->
      <slot />
    </div>
    <div class="er-cart-line-item-end">
      <strong class="er-cart-line-item-total">{{ formatMoney(price * quantity, currency, locale) }}</strong>
      <p v-if="readonly" class="er-cart-line-item-options">Qty {{ quantity }}</p>
      <template v-else>
        <NumberInput :model-value="quantity" :min="1" :max="max" :aria-label="`Quantity of ${title}`" @update:model-value="setQuantity" />
        <button type="button" class="er-cart-line-item-remove" @click="$emit('remove')">Remove<span class="er-cart-line-item-hidden"> {{ title }}</span></button>
      </template>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-cart-line-item {
    display: flex;
    gap: 0.75rem 1rem;
    min-width: 0;
  }

  .er-cart-line-item-media {
    flex-shrink: 0;
    width: 4.5rem;
    height: 4.5rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-cart-line-item[data-readonly] .er-cart-line-item-media {
    width: 3.5rem;
    height: 3.5rem;
  }

  .er-cart-line-item-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .er-cart-line-item-main {
    display: grid;
    flex: 1;
    align-content: start;
    gap: 0.125rem;
    min-width: 0;
  }

  .er-cart-line-item-title {
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1.25rem;
  }

  .er-cart-line-item-title a {
    color: inherit;
    text-decoration: none;
  }

  .er-cart-line-item-title a:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-cart-line-item-title a:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-cart-line-item-options {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .er-cart-line-item-end {
    display: grid;
    flex-shrink: 0;
    align-content: start;
    justify-items: end;
    gap: 0.375rem;
  }

  .er-cart-line-item-total {
    font-size: 0.875rem;
    font-weight: var(--er-weight-semibold);
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
  }

  .er-cart-line-item-end .er-number-input {
    width: 6.5rem;
    height: var(--er-control-sm);
  }

  .er-cart-line-item-end .er-number-input button {
    width: var(--er-control-sm);
  }

  .er-cart-line-item-remove {
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    font-size: 0.8125rem;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }

  .er-cart-line-item-remove:hover {
    color: var(--er-foreground);
  }

  .er-cart-line-item-remove:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-cart-line-item-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
