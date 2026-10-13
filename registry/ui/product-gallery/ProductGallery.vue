<script setup lang="ts">
import { Carousel, CarouselSlide } from '../carousel'
import type { ProductGalleryImage } from './types'

withDefaults(
  defineProps<{
    images: readonly ProductGalleryImage[]
    /** Accessible name: what the pictures are of. */
    label?: string
    /** Where the thumbnails go. On a narrow screen they are always underneath. */
    thumbnails?: 'bottom' | 'left'
    /** Magnify the picture under a mouse pointer. */
    zoom?: boolean
    /** Shape of the pictures, as a CSS aspect-ratio. */
    aspect?: string
  }>(),
  { label: 'Product pictures', thumbnails: 'bottom', aspect: '1 / 1' },
)

/** The picture in view, starting at 1. */
const index = defineModel<number>({ default: 1 })

/** The magnified picture is anchored where the pointer is, so moving the pointer pans across it. */
function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  const slide = event.currentTarget as HTMLElement
  const box = slide.getBoundingClientRect()
  slide.style.setProperty('--er-gallery-x', `${((event.clientX - box.left) / box.width) * 100}%`)
  slide.style.setProperty('--er-gallery-y', `${((event.clientY - box.top) / box.height) * 100}%`)
}
</script>

<template>
  <div class="er-product-gallery" :data-thumbnails="thumbnails" :data-zoom="zoom ? '' : undefined" :style="{ '--er-gallery-aspect': aspect }">
    <!-- The carousel brings swiping and the arrow keys; the thumbnails stand in for its buttons and dots. -->
    <Carousel v-model="index" :label="label" :dots="false">
      <CarouselSlide v-for="image in images" :key="image.src" @pointermove="onPointerMove">
        <img :src="image.src" :alt="image.alt" />
      </CarouselSlide>
    </Carousel>
    <div v-if="images.length > 1" class="er-product-gallery-thumbs" role="group" aria-label="Choose a picture">
      <button
        v-for="(image, position) in images"
        :key="image.src"
        type="button"
        :aria-label="`Picture ${position + 1} of ${images.length}: ${image.alt}`"
        :aria-current="position + 1 === index ? 'true' : undefined"
        @click="index = position + 1"
      >
        <img :src="image.thumb ?? image.src" alt="" loading="lazy" />
      </button>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-product-gallery {
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
  }

  .er-product-gallery .er-carousel-controls {
    display: none;
  }

  .er-product-gallery .er-carousel-slide {
    aspect-ratio: var(--er-gallery-aspect);
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-product-gallery .er-carousel-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform-origin: var(--er-gallery-x, 50%) var(--er-gallery-y, 50%);
    transition: scale var(--er-duration);
  }

  @media (hover: hover) {
    .er-product-gallery[data-zoom] .er-carousel-slide {
      cursor: zoom-in;
    }

    .er-product-gallery[data-zoom] .er-carousel-slide:hover img {
      scale: 2;
    }
  }

  .er-product-gallery-thumbs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .er-product-gallery-thumbs button {
    width: 3.5rem;
    aspect-ratio: var(--er-gallery-aspect);
    padding: 0;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-muted);
    overflow: hidden;
    cursor: pointer;
    opacity: 0.7;
    transition:
      opacity var(--er-duration),
      border-color var(--er-duration);
  }

  .er-product-gallery-thumbs button:hover,
  .er-product-gallery-thumbs button[aria-current] {
    opacity: 1;
  }

  /* The picture on show is marked by a ring, not by brightness alone. */
  .er-product-gallery-thumbs button[aria-current] {
    border-color: var(--er-primary);
    box-shadow: 0 0 0 1px var(--er-primary);
  }

  .er-product-gallery-thumbs button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-product-gallery-thumbs img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 40rem) {
    .er-product-gallery[data-thumbnails='left'] {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .er-product-gallery[data-thumbnails='left'] .er-product-gallery-thumbs {
      flex-direction: column;
      flex-wrap: nowrap;
      order: -1;
    }
  }
}
</style>
