<script setup lang="ts">
import type { Component } from 'vue'
import { Badge } from '../badge'
import { Price } from '../price'
import { Rating } from '../rating'

withDefaults(
  defineProps<{
    title: string
    /** Where the product's own page is. The whole card becomes the link. */
    href?: string
    image: string
    /** Leave empty when the picture shows nothing the title does not already say. */
    imageAlt?: string
    /** Maker or collection, shown small above the title. */
    brand?: string
    price: number
    /** The price before a reduction. */
    compareAt?: number
    currency?: string
    locale?: string
    /** Average score out of five. Leave out to hide the stars. */
    rating?: number
    /** How many reviews the score is from. */
    reviews?: number
    /** A short label over the corner of the picture, e.g. "New" or "Sale". */
    badge?: string
    /** Shape of the picture, as a CSS aspect-ratio. */
    aspect?: string
    /** Heading level of the title. */
    titleAs?: string
    /** Tag or component for the link, e.g. NuxtLink. */
    linkAs?: string | Component
  }>(),
  { imageAlt: '', aspect: '1 / 1', titleAs: 'h3', linkAs: 'a' },
)
</script>

<template>
  <article class="er-product-card">
    <div class="er-product-card-media" :style="{ aspectRatio: aspect }">
      <img :src="image" :alt="imageAlt" loading="lazy" />
      <div v-if="badge || $slots.badge" class="er-product-card-badge">
        <slot name="badge"><Badge>{{ badge }}</Badge></slot>
      </div>
      <!-- Something to press on top of the picture, such as a wishlist heart. -->
      <div v-if="$slots.action" class="er-product-card-action"><slot name="action" /></div>
    </div>
    <div class="er-product-card-body">
      <p v-if="brand" class="er-product-card-brand">{{ brand }}</p>
      <component :is="titleAs" class="er-product-card-title">
        <!-- The link's own text is the title; its press area is stretched over the whole card. -->
        <component :is="linkAs" v-if="href" :href="href" class="er-product-card-link">{{ title }}</component>
        <template v-else>{{ title }}</template>
      </component>
      <div v-if="rating !== undefined" class="er-product-card-rating">
        <Rating :model-value="rating" readonly size="sm" label="Rated" />
        <span v-if="reviews !== undefined">({{ reviews }}<span class="er-product-card-hidden"> reviews</span>)</span>
      </div>
      <Price :amount="price" :compare-at="compareAt" :currency="currency" :locale="locale" />
      <!-- Anything more: swatches, an "Add to cart" button. -->
      <div v-if="$slots.default" class="er-product-card-extra"><slot /></div>
    </div>
  </article>
</template>

<style>
@layer components {
  .er-product-card {
    position: relative;
    display: grid;
    align-content: start;
    gap: 0.75rem;
    min-width: 0;
    border-radius: var(--er-radius-lg);
  }

  .er-product-card:has(.er-product-card-link:focus-visible) {
    outline: 2px solid var(--er-ring);
    outline-offset: 4px;
  }

  .er-product-card-media {
    position: relative;
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-product-card-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: scale calc(var(--er-duration) * 2) var(--er-ease);
  }

  .er-product-card:has(.er-product-card-link:hover) .er-product-card-media img {
    scale: 1.04;
  }

  .er-product-card-badge,
  .er-product-card-action {
    position: absolute;
    top: 0.5rem;
    z-index: 1;
    display: flex;
    gap: 0.25rem;
  }

  .er-product-card-badge {
    left: 0.5rem;
    pointer-events: none;
  }

  .er-product-card-action {
    right: 0.5rem;
  }

  .er-product-card-body {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }

  .er-product-card-brand {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
  }

  .er-product-card-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1.25rem;
  }

  .er-product-card-link {
    color: inherit;
    text-decoration: none;
    outline: none;
  }

  .er-product-card-link::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--er-radius-lg);
  }

  .er-product-card-link:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-product-card-rating {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  /* Above the stretched link, so what is inside can still be pressed. */
  .er-product-card-extra {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.5rem;
    margin-top: 0.375rem;
  }

  .er-product-card-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
