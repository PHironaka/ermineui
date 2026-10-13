<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import type { LightboxImage } from './types'

const props = withDefaults(
  defineProps<{
    images: readonly LightboxImage[]
    /** Accessible name of the viewer: what the pictures are of. */
    label?: string
  }>(),
  { label: 'Pictures' },
)

const open = defineModel<boolean>('open', { default: false })
/** The picture on show, starting at 1. */
const index = defineModel<number>({ default: 1 })

const count = computed(() => props.images.length)
const image = computed(() => props.images[Math.max(1, Math.min(index.value, count.value)) - 1])

function go(next: number) {
  index.value = Math.max(1, Math.min(next, count.value))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') go(index.value + 1)
  else if (event.key === 'ArrowLeft') go(index.value - 1)
  else if (event.key === 'Home') go(1)
  else if (event.key === 'End') go(count.value)
  else return
  event.preventDefault()
}
</script>

<template>
  <!-- A dialog underneath, so focus is held inside, the page behind cannot scroll, and Escape closes it. -->
  <Dialog v-model:open="open">
    <DialogContent class="er-lightbox" close-label="Close pictures" @keydown="onKeydown">
      <DialogTitle class="er-lightbox-hidden">{{ label }}</DialogTitle>
      <figure v-if="image" class="er-lightbox-figure">
        <img :src="image.src" :alt="image.alt" />
        <!-- Announced when it changes: the buttons swap the picture without moving focus. -->
        <figcaption role="status">
          {{ image.alt }}<span v-if="count > 1" class="er-lightbox-count"> · {{ index }} of {{ count }}</span>
        </figcaption>
      </figure>
      <template v-if="count > 1">
        <button type="button" class="er-lightbox-button" data-side="previous" aria-label="Previous picture" :disabled="index <= 1" @click="go(index - 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button type="button" class="er-lightbox-button" data-side="next" aria-label="Next picture" :disabled="index >= count" @click="go(index + 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </template>
    </DialogContent>
  </Dialog>
</template>

<style>
@layer components {
  .er-dialog-content.er-lightbox {
    max-width: min(64rem, 100%);
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .er-lightbox-figure {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    margin: 0;
  }

  .er-lightbox-figure img {
    display: block;
    max-width: 100%;
    max-height: calc(100dvh - 7rem);
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    object-fit: contain;
  }

  /* Always on the dark overlay, whichever theme the page is in. */
  .er-lightbox-figure figcaption {
    color: oklch(0.985 0 0);
    font-size: 0.875rem;
    text-align: center;
  }

  .er-lightbox-count {
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
  }

  .er-lightbox .er-dialog-x,
  .er-lightbox-button {
    display: grid;
    place-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: oklch(0.2 0 0 / 70%);
    color: oklch(0.985 0 0);
    cursor: pointer;
  }

  .er-lightbox .er-dialog-x {
    top: 0.5rem;
    right: 0.5rem;
  }

  .er-lightbox .er-dialog-x:hover,
  .er-lightbox-button:hover {
    background: oklch(0.2 0 0 / 90%);
    color: oklch(1 0 0);
  }

  .er-lightbox .er-dialog-x:focus-visible,
  .er-lightbox-button:focus-visible {
    outline: 2px solid oklch(1 0 0);
    outline-offset: 2px;
  }

  .er-lightbox-button {
    position: absolute;
    top: calc(50% - 2.5rem);
  }

  .er-lightbox-button[data-side='previous'] {
    left: 0.5rem;
  }

  .er-lightbox-button[data-side='next'] {
    right: 0.5rem;
  }

  .er-lightbox-button:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .er-lightbox-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-lightbox-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
