<script setup lang="ts">
import { useId } from 'vue'
import { Button } from '../../ui/button'
import { sampleMediaImage, sampleMediaText, type MediaTextAction, type MediaTextImage } from './sample-data'

withDefaults(
  defineProps<{
    /**
     * How the parts are laid out on a wide screen. `split`: text beside the picture. `stacked`: the
     * picture above, the text centred below. `columns`: text, picture, then the call to action in a
     * column of its own. Every layout stacks on a narrow screen, picture first.
     */
    layout?: 'split' | 'stacked' | 'columns'
    /** Put the picture first: on the left in `split` and `columns`. */
    reverse?: boolean
    /** A short line above the title. */
    eyebrow?: string
    title?: string
    /** The body copy. Use the default slot instead for more than one paragraph, or for links. */
    body?: string
    /** `null` for no picture, when the media slot is not used either. */
    image?: MediaTextImage | null
    /** The picture's shape, as a CSS aspect-ratio: "4 / 3", "1", "16 / 9". */
    ratio?: string
    /** A line beside the buttons: an offer, a price, a reassurance. An empty string leaves it out. */
    note?: string
    /** `null` leaves the button out. */
    primaryAction?: MediaTextAction | null
    secondaryAction?: MediaTextAction | null
    /** Heading level of the title. The first section of a page may want h1. */
    titleAs?: string
  }>(),
  {
    layout: 'split',
    eyebrow: sampleMediaText.eyebrow,
    title: sampleMediaText.title,
    body: sampleMediaText.body,
    image: () => sampleMediaImage,
    ratio: '4 / 3',
    note: sampleMediaText.note,
    primaryAction: () => sampleMediaText.primaryAction,
    secondaryAction: () => sampleMediaText.secondaryAction,
    titleAs: 'h2',
  },
)

defineSlots<{
  /** The body copy, in place of `body`. */
  default?: () => unknown
  /** Something other than a picture: a video, a chart, a product card. */
  media?: () => unknown
  /** Buttons or links of your own, in place of the two actions. */
  actions?: () => unknown
}>()

const id = useId()
</script>

<template>
  <section class="er-media-text" :data-layout="layout" :data-reverse="reverse || undefined" :aria-labelledby="`${id}-title`">
    <div class="er-media-text-grid">
      <div class="er-media-text-copy">
        <p v-if="eyebrow" class="er-media-text-eyebrow">{{ eyebrow }}</p>
        <component :is="titleAs" :id="`${id}-title`" class="er-media-text-title">{{ title }}</component>
        <div class="er-media-text-body">
          <slot>
            <p v-if="body">{{ body }}</p>
          </slot>
        </div>
      </div>

      <div class="er-media-text-media" :style="{ '--er-media-text-ratio': ratio }">
        <slot name="media">
          <img v-if="image" :src="image.src" :alt="image.alt" loading="lazy" decoding="async" />
        </slot>
      </div>

      <div v-if="note || primaryAction || secondaryAction || $slots.actions" class="er-media-text-cta">
        <p v-if="note" class="er-media-text-note">{{ note }}</p>
        <div class="er-media-text-actions">
          <slot name="actions">
            <Button v-if="primaryAction" as="a" :href="primaryAction.href">{{ primaryAction.label }}</Button>
            <Button v-if="secondaryAction" as="a" :href="secondaryAction.href" variant="outline">{{ secondaryAction.label }}</Button>
          </slot>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
@layer components {
  .er-media-text {
    container-type: inline-size;
    width: 100%;
  }

  /* Narrow: one column, picture first. The source order (copy, picture, call to action) is the reading order. */
  .er-media-text-grid {
    display: grid;
    grid-template-areas: 'media' 'copy' 'cta';
    gap: 1.25rem;
  }

  .er-media-text-copy {
    grid-area: copy;
    display: grid;
    gap: 0.75rem;
    align-content: start;
  }

  .er-media-text-eyebrow {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-weight: var(--er-weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .er-media-text-title {
    margin: 0;
    font-family: var(--er-font-display);
    font-size: clamp(1.5rem, 5cqi, 2.25rem);
    font-weight: var(--er-weight-heading);
    letter-spacing: calc(-0.02em * var(--er-tracking-heading));
    line-height: 1.15;
    text-wrap: balance;
  }

  .er-media-text-body {
    display: grid;
    gap: 0.75rem;
    color: var(--er-muted-foreground);
    font-family: var(--er-font-prose);
    font-size: 1rem;
    line-height: 1.6;
    text-wrap: pretty;
  }

  .er-media-text-body > * {
    margin: 0;
  }

  .er-media-text-media {
    grid-area: media;
    overflow: hidden;
    border-radius: var(--er-radius-xl);
    background: var(--er-muted);
    aspect-ratio: var(--er-media-text-ratio, 4 / 3);
  }

  .er-media-text-media > :is(img, video, picture, iframe) {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
  }

  .er-media-text-cta {
    grid-area: cta;
    display: grid;
    gap: 0.75rem;
    align-content: start;
  }

  .er-media-text-note {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: var(--er-weight-medium);
  }

  .er-media-text-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Stacked: centred text under a wide picture. */
  .er-media-text[data-layout='stacked'] :is(.er-media-text-copy, .er-media-text-cta) {
    justify-items: center;
    max-width: 40rem;
    margin-inline: auto;
    text-align: center;
  }

  .er-media-text[data-layout='stacked'] .er-media-text-actions {
    justify-content: center;
  }

  @container (min-width: 40rem) {
    .er-media-text-grid {
      column-gap: clamp(2rem, 6cqi, 4rem);
    }

    /* Split: copy and call to action together, centred against the picture. */
    .er-media-text[data-layout='split'] .er-media-text-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr auto auto 1fr;
      grid-template-areas: '. media' 'copy media' 'cta media' '. media';
      row-gap: 0;
    }

    .er-media-text[data-layout='split'][data-reverse] .er-media-text-grid {
      grid-template-areas: 'media .' 'media copy' 'media cta' 'media .';
    }

    .er-media-text[data-layout='split'] .er-media-text-cta {
      margin-top: 1.5rem;
    }

    .er-media-text[data-layout='stacked'] .er-media-text-media {
      aspect-ratio: var(--er-media-text-ratio-wide, 21 / 9);
    }

    /* Columns, middle width: copy beside the picture, the call to action across the bottom. */
    .er-media-text[data-layout='columns'] .er-media-text-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-areas: 'copy media' 'cta cta';
      align-items: center;
      row-gap: 2rem;
    }

    .er-media-text[data-layout='columns'][data-reverse] .er-media-text-grid {
      grid-template-areas: 'media copy' 'cta cta';
    }
  }

  @container (min-width: 56rem) {
    .er-media-text[data-layout='columns'] .er-media-text-grid {
      grid-template-columns: 1fr 1.2fr 1fr;
      grid-template-areas: 'copy media cta';
    }

    .er-media-text[data-layout='columns'][data-reverse] .er-media-text-grid {
      grid-template-areas: 'media copy cta';
    }

    .er-media-text[data-layout='columns'] .er-media-text-cta {
      align-self: center;
      padding-left: clamp(1.5rem, 3cqi, 2.5rem);
      border-left: 1px solid var(--er-border);
    }
  }
}
</style>
