<script lang="ts">
export interface ImageFanImage {
  src: string
  /** What the picture shows. For a link, say where it goes. */
  alt: string
  /** Make the picture a link. */
  href?: string
  /** A short name shown under the fan while the picture is pointed at or focused, e.g. the site's name. */
  label?: string
}
</script>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'

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

// How the rest of the fan makes way for the picture pointed at, in px at full size.
const LIFT = 16 // the picture rises this far as it straightens
const CLEAR = 8 // the gap left beside it on the side the others slide to
const STACK = 22 // how far apart the pictures that slid aside sit
const NUDGE = 20 // how far the few on the other side shift outward
const SPREAD = 1.18 // with the middle picture pointed at, both sides fan out by this much

/** The picture pointed at or focused, if any. */
const active = ref<number | null>(null)

interface Place {
  x: number
  y: number
  turn: number
}

/** Where each picture sits, by its distance from the middle, with `lifted` (if any) brought forward. */
function placesFor(lifted: number | null): Place[] {
  const count = props.images.length
  const middle = (count - 1) / 2
  const rest = (index: number): Place => {
    const offset = index - middle
    return { x: props.spread * offset, y: props.arc * offset * offset, turn: props.rotate * offset }
  }
  if (lifted === null || lifted >= count) return props.images.map((_, index) => rest(index))

  const before = lifted
  const after = count - 1 - lifted
  const anchor = rest(lifted)
  return props.images.map((_, index) => {
    const place = rest(index)
    if (index === lifted) return { x: anchor.x, y: anchor.y - LIFT, turn: 0 }
    const side = Math.sign(index - lifted)
    const steps = Math.abs(index - lifted)
    // The middle picture: both sides open out evenly.
    if (before === after) return { ...place, x: anchor.x + (index - lifted) * props.spread * SPREAD }
    // The side with more pictures slides clear of it and stacks up close; the other side only shifts a little.
    const isLongSide = side > 0 ? after > before : before > after
    if (isLongSide) return { ...place, x: anchor.x + side * (props.width + CLEAR + STACK * (steps - 1)) }
    return { ...place, x: place.x + side * NUDGE }
  })
}

const places = computed(() => placesFor(active.value))

/** The furthest any picture's centre gets from the middle, at rest or making way, so the fan is sized to hold it. */
const reach = computed(() => {
  const all = [null, ...props.images.map((_, index) => index)].flatMap((lifted) => placesFor(lifted))
  return Math.max(0, ...all.map((place) => Math.abs(place.x)))
})

const items = computed(() => {
  const middle = (props.images.length - 1) / 2
  return props.images.map((image, index) => ({
    image,
    place: places.value[index]!,
    // The middle picture is on top, and each one further out sits under the one before it.
    layer: index === active.value ? 99 : Math.round(props.images.length - Math.abs(index - middle)),
  }))
})

const caption = computed(() => (active.value === null ? undefined : props.images[active.value]?.label))
const hasCaptions = computed(() => props.images.some((image) => image.label))

// Router links take "to"; a plain link takes "href".
const linkTo = (href: string) => (props.linkAs === 'a' ? { href } : { to: href })

function leave(event: FocusEvent | PointerEvent) {
  // Focus or the pointer moving to another picture in the fan is handled by that picture.
  if (event.relatedTarget instanceof Node && (event.currentTarget as HTMLElement).contains(event.relatedTarget)) return
  active.value = null
}
</script>

<template>
  <div class="er-image-fan">
    <ul
      class="er-image-fan-list"
      role="list"
      :data-state="active === null ? 'rest' : 'open'"
      :style="{
        '--er-fan-width': width,
        '--er-fan-total': width + reach * 2,
        '--er-fan-ratio': aspectRatio,
      }"
      @pointerleave="leave"
      @focusout="leave"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        class="er-image-fan-item"
        :data-state="index === active ? 'active' : undefined"
        :style="{ '--er-fan-x': item.place.x, '--er-fan-y': item.place.y, '--er-fan-turn': item.place.turn, zIndex: item.layer }"
        @pointerenter="active = index"
        @focusin="active = index"
      >
        <component :is="item.image.href ? linkAs : 'div'" class="er-image-fan-card" v-bind="item.image.href ? linkTo(item.image.href) : {}">
          <slot name="image" :image="item.image" :index="index">
            <img :src="item.image.src" :alt="item.image.alt" loading="lazy" decoding="async" />
          </slot>
        </component>
      </li>
    </ul>
    <!-- Hidden from screen readers: each picture's alt text, or its link, already names it. -->
    <p v-if="hasCaptions" class="er-image-fan-caption" aria-hidden="true">
      <Transition name="er-image-fan-caption" mode="out-in">
        <span v-if="caption" :key="caption">{{ caption }}</span>
      </Transition>
    </p>
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
    /* Room above and below for the tilted corners and the lift. */
    padding: calc(var(--er-fan-card) * 0.14) 0;
    list-style: none;
  }

  /* Every picture starts in the same spot, then moves and tilts to its place. */
  .er-image-fan-item {
    grid-area: 1 / 1;
    width: var(--er-fan-card);
    transform: translate(calc(var(--er-fan-unit) * var(--er-fan-x)), calc(var(--er-fan-unit) * var(--er-fan-y))) rotate(calc(var(--er-fan-turn) * 1deg));
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .er-image-fan-card {
    display: block;
    padding: calc(var(--er-fan-unit) * 5);
    border: 1px solid var(--er-border);
    border-radius: calc(var(--er-fan-unit) * 14);
    background: var(--er-card);
    box-shadow: var(--er-shadow-lg);
  }

  .er-image-fan-card img {
    display: block;
    width: 100%;
    aspect-ratio: var(--er-fan-ratio);
    border-radius: calc(var(--er-fan-unit) * 10);
    object-fit: cover;
    object-position: top;
  }

  .er-image-fan-card:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-image-fan-caption {
    display: flex;
    justify-content: center;
    /* One line tall even when empty, so nothing below jumps as names come and go. */
    min-height: 1.5em;
    margin: 0;
    color: var(--er-muted-foreground);
    pointer-events: none;
  }

  .er-image-fan-caption-enter-active,
  .er-image-fan-caption-leave-active {
    transition:
      opacity 0.2s ease,
      filter 0.2s ease,
      transform 0.2s ease;
  }

  .er-image-fan-caption-enter-from,
  .er-image-fan-caption-leave-to {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(4px);
  }

  @media (prefers-reduced-motion: reduce) {
    .er-image-fan-item,
    .er-image-fan-caption-enter-active,
    .er-image-fan-caption-leave-active {
      transition: none;
    }
  }
}
</style>
