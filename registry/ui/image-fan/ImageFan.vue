<script lang="ts">
export interface ImageFanImage {
  src: string
  /** What the picture shows. For a link, say where it goes. */
  alt: string
  /** Make the picture a link. */
  href?: string
}
</script>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The pictures, left to right. An odd number, three to seven, looks best. */
    images: readonly ImageFanImage[]
    /** Width of one picture in px when there is room. The whole fan shrinks to fit a narrower space. */
    width?: number
    /** How far each picture sits from the next, in px. Less than the width, so they overlap. */
    spread?: number
    /** How much more each picture is tilted than the one before it, in degrees. */
    rotate?: number
    /** How far the outer pictures drop below the middle one, in px per step, for a curved fan. */
    arc?: number
    /** Shape of each picture, as width / height. */
    aspectRatio?: number | string
    /** Tag or component for pictures that are links, e.g. RouterLink or NuxtLink. */
    linkAs?: string | Component
  }>(),
  { width: 210, spread: 75, rotate: 4.5, arc: 0, aspectRatio: '16 / 10', linkAs: 'a' },
)

/** Each picture's place counted from the middle: -2, -1, 0, 1, 2 for five. */
const middle = computed(() => (props.images.length - 1) / 2)
const items = computed(() =>
  props.images.map((image, index) => ({
    image,
    offset: index - middle.value,
    // The middle picture is on top, and each one further out sits under the one before it.
    layer: Math.round(props.images.length - Math.abs(index - middle.value)),
  })),
)

// Router links take "to"; a plain link takes "href".
const linkTo = (href: string) => (props.linkAs === 'a' ? { href } : { to: href })
</script>

<template>
  <div class="er-image-fan">
    <ul
      class="er-image-fan-list"
      role="list"
      :style="{
        '--er-fan-width': width,
        '--er-fan-spread': spread,
        '--er-fan-rotate': rotate,
        '--er-fan-arc': arc,
        '--er-fan-total': width + spread * Math.max(images.length - 1, 0),
        '--er-fan-ratio': aspectRatio,
      }"
    >
      <li v-for="(item, index) in items" :key="index" class="er-image-fan-item" :style="{ '--er-fan-offset': item.offset, zIndex: item.layer }">
        <component :is="item.image.href ? linkAs : 'div'" class="er-image-fan-card" v-bind="item.image.href ? linkTo(item.image.href) : {}">
          <slot name="image" :image="item.image" :index="index">
            <img :src="item.image.src" :alt="item.image.alt" loading="lazy" decoding="async" />
          </slot>
        </component>
      </li>
    </ul>
  </div>
</template>

<style>
@layer components {
  /* Sizes are worked out from the room there is, so the fan keeps its shape as it shrinks. */
  .er-image-fan {
    container-type: inline-size;
    width: 100%;
  }

  .er-image-fan-list {
    /* One picture's width: the width asked for, or its share of the space when the whole fan would not fit. */
    --er-fan-card: min(calc(var(--er-fan-width) * 1px), calc(100cqi * var(--er-fan-width) / var(--er-fan-total)));
    /* Every other distance is a fraction of that width. */
    --er-fan-unit: calc(var(--er-fan-card) / var(--er-fan-width));
    display: grid;
    justify-items: center;
    margin: 0;
    /* Room above and below for the tilted corners and the lift on hover. */
    padding: calc(var(--er-fan-card) * 0.14) 0;
    list-style: none;
  }

  /* Every picture starts in the same spot, then moves and tilts by its place from the middle. */
  .er-image-fan-item {
    grid-area: 1 / 1;
    width: var(--er-fan-card);
    transform: translate(
        calc(var(--er-fan-unit) * var(--er-fan-spread) * var(--er-fan-offset)),
        calc(var(--er-fan-unit) * var(--er-fan-arc) * var(--er-fan-offset) * var(--er-fan-offset))
      )
      rotate(calc(var(--er-fan-rotate) * var(--er-fan-offset) * 1deg));
  }

  .er-image-fan-card {
    display: block;
    padding: calc(var(--er-fan-unit) * 5);
    border: 1px solid var(--er-border);
    border-radius: calc(var(--er-fan-unit) * 14);
    background: var(--er-card);
    box-shadow: var(--er-shadow-lg);
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .er-image-fan-card img {
    display: block;
    width: 100%;
    aspect-ratio: var(--er-fan-ratio);
    border-radius: calc(var(--er-fan-unit) * 10);
    object-fit: cover;
    object-position: top;
  }

  /* Pointed at, or focused with the keyboard, a picture comes to the front, straightens and lifts. */
  .er-image-fan-item:hover,
  .er-image-fan-item:focus-within {
    z-index: 99 !important;
  }

  .er-image-fan-item:hover .er-image-fan-card,
  .er-image-fan-item:focus-within .er-image-fan-card {
    transform: rotate(calc(var(--er-fan-rotate) * var(--er-fan-offset) * -1deg)) translateY(-6%) scale(1.06);
  }

  .er-image-fan-card:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .er-image-fan-card {
      transition: none;
    }
  }
}
</style>
