<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Button } from '../../ui/button'
import { sampleHero, sampleHeroImage, type HeroAction, type HeroImage, type HeroVideo } from './sample-data'

const props = withDefaults(
  defineProps<{
    /**
     * `rule`: small type sitting on a thin line across the middle, the picture left to speak.
     * `center`: a large headline in the middle. `bottom`: a large headline low on the left.
     */
    layout?: 'rule' | 'center' | 'bottom'
    /** The background picture. With `video` too, it is the poster unless the video has its own. */
    image?: HeroImage | null
    /** A background video: muted, looping, with a pause button. It does not play for readers who ask for less motion. */
    video?: HeroVideo | null
    eyebrow?: string
    title?: string
    description?: string
    /** `null` leaves the action out. */
    primaryAction?: HeroAction | null
    secondaryAction?: HeroAction | null
    /** `screen` fills the window, `large` three quarters of it, `auto` fits the content. Or set `--er-hero-height`. */
    height?: 'screen' | 'large' | 'auto'
    /** How much the picture is darkened under the text, from 0 to 1. Each layout has its own default. */
    overlay?: number
    /** Fade the picture towards the page colour as the hero scrolls away, where the browser supports scroll-driven animation. */
    washOnScroll?: boolean
    /** Heading level of the title. The hero usually holds the page's h1. */
    titleAs?: string
    pauseLabel?: string
    playLabel?: string
  }>(),
  {
    layout: 'rule',
    image: () => sampleHeroImage,
    eyebrow: sampleHero.eyebrow,
    title: sampleHero.title,
    description: sampleHero.description,
    primaryAction: () => sampleHero.primaryAction,
    secondaryAction: () => sampleHero.secondaryAction,
    height: 'screen',
    washOnScroll: true,
    titleAs: 'h1',
    pauseLabel: 'Pause background video',
    playLabel: 'Play background video',
  },
)

defineSlots<{
  /** Along the top, over the picture: your logo and navigation. */
  header?: () => unknown
  /** More under the description. */
  default?: () => unknown
  /** A background of your own in place of the picture or video. */
  media?: () => unknown
  /** Links or buttons of your own in place of the two actions. */
  actions?: () => unknown
}>()

const id = useId()
const videoEl = ref<HTMLVideoElement | null>(null)
const playing = ref(false)

const sources = computed(() => {
  const src = props.video?.src
  return typeof src === 'string' ? [{ src, type: undefined }] : (src ?? [])
})
const poster = computed(() => props.video?.poster ?? props.image?.src)

function toggle() {
  const video = videoEl.value
  if (!video) return
  if (video.paused) video.play().catch(() => {})
  else video.pause()
}

// Started here rather than with `autoplay`, so a reader who asked for less motion sees the poster instead.
watch(videoEl, (video) => {
  if (!video || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // A browser that blocks autoplay rejects this; the button then offers to play.
  video.play().catch(() => {})
})
</script>

<template>
  <section
    class="er-hero"
    :data-layout="layout"
    :data-height="height"
    :data-wash="washOnScroll || undefined"
    :style="overlay === undefined ? undefined : { '--er-hero-overlay': overlay }"
    :aria-labelledby="`${id}-title`"
  >
    <div class="er-hero-media">
      <slot name="media">
        <!-- The background is atmosphere: the words say what matters, so the video is hidden from screen readers. -->
        <video
          v-if="video"
          ref="videoEl"
          :key="sources.map((s) => s.src).join()"
          :poster="poster"
          muted
          loop
          playsinline
          preload="metadata"
          aria-hidden="true"
          @play="playing = true"
          @pause="playing = false"
        >
          <source v-for="source in sources" :key="source.src" :src="source.src" :type="source.type" />
        </video>
        <img v-else-if="image" :src="image.src" :srcset="image.srcset" :sizes="image.sizes" :alt="image.alt ?? ''" fetchpriority="high" />
      </slot>
    </div>
    <div class="er-hero-scrim" />
    <div class="er-hero-wash" />

    <div class="er-hero-content">
      <div v-if="$slots.header" class="er-hero-header"><slot name="header" /></div>

      <div class="er-hero-body">
        <div class="er-hero-heading">
          <p v-if="eyebrow" class="er-hero-eyebrow">{{ eyebrow }}</p>
          <component :is="titleAs" :id="`${id}-title`" class="er-hero-title">{{ title }}</component>
        </div>
        <div v-if="description || $slots.default" class="er-hero-description">
          <p v-if="description">{{ description }}</p>
          <slot />
        </div>
        <div v-if="primaryAction || secondaryAction || $slots.actions" class="er-hero-actions">
          <slot name="actions">
            <!-- On the rule the actions are quiet links, like the rest of its type; elsewhere they are buttons. -->
            <template v-if="layout === 'rule'">
              <a v-if="primaryAction" class="er-hero-link" :href="primaryAction.href">{{ primaryAction.label }}</a>
              <a v-if="secondaryAction" class="er-hero-link" :href="secondaryAction.href">{{ secondaryAction.label }}</a>
            </template>
            <template v-else>
              <Button v-if="primaryAction" as="a" size="lg" :href="primaryAction.href">{{ primaryAction.label }}</Button>
              <Button v-if="secondaryAction" as="a" size="lg" variant="outline" :href="secondaryAction.href">{{ secondaryAction.label }}</Button>
            </template>
          </slot>
        </div>
      </div>

      <button
        v-if="video && !$slots.media"
        type="button"
        class="er-hero-toggle"
        :aria-label="playing ? pauseLabel : playLabel"
        @click="toggle"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path v-if="playing" d="M7 5h3.500v14H7zm6.500 0H17v14h-3.500z" />
          <path v-else d="M8 5.500v13l10.500-6.500z" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style>
@layer components {
  .er-hero {
    --er-hero-overlay: 0.15;
    position: relative;
    isolation: isolate;
    display: grid;
    min-height: var(--er-hero-height, 100svh);
    overflow: clip;
    container-type: inline-size;
    background: var(--er-muted);
  }

  .er-hero[data-height='large'] {
    --er-hero-height: 75svh;
  }

  .er-hero[data-height='auto'] {
    --er-hero-height: auto;
  }

  .er-hero-media,
  .er-hero-scrim,
  .er-hero-wash {
    position: absolute;
    inset: 0;
    z-index: -1;
  }

  .er-hero-media > :is(img, video, picture, iframe) {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
  }

  .er-hero-scrim {
    background: color-mix(in oklab, var(--er-scrim) calc(var(--er-hero-overlay) * 100%), transparent);
  }

  .er-hero-wash {
    background: var(--er-background);
    opacity: 0;
  }

  /* Over a picture the text is always light, whatever the page's theme: buttons and focus rings follow. */
  .er-hero-content {
    color-scheme: dark;
    display: grid;
    grid-template-rows: auto 1fr auto;
    --er-hero-gutter: 1.25rem;
    min-height: inherit;
    padding: var(--er-hero-gutter);
    color: var(--er-foreground);
  }

  .er-hero-header {
    grid-row: 1;
  }

  .er-hero-body {
    grid-row: 2;
    display: grid;
    gap: 1rem;
    align-content: center;
  }

  .er-hero-heading {
    display: grid;
    gap: 0.5rem;
  }

  .er-hero-eyebrow {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: var(--er-weight-medium);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .er-hero-title {
    margin: 0;
    font-family: var(--er-font-display);
    font-size: clamp(2.5rem, 8cqi, 6rem);
    font-weight: var(--er-weight-semibold);
    letter-spacing: calc(-0.035em * var(--er-tracking-heading));
    text-transform: var(--er-display-case);
    line-height: 1;
    text-wrap: balance;
  }

  .er-hero-description {
    display: grid;
    gap: 0.75rem;
    max-width: 36rem;
    font-family: var(--er-font-prose);
    font-size: clamp(1rem, 1.6cqi, 1.25rem);
    line-height: 1.5;
    text-wrap: pretty;
  }

  .er-hero-description > * {
    margin: 0;
  }

  .er-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .er-hero-toggle {
    grid-row: 3;
    justify-self: end;
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    margin-top: 1rem;
    border: 1px solid color-mix(in oklab, var(--er-foreground) 40%, transparent);
    border-radius: 999px;
    background: color-mix(in oklab, var(--er-scrim) 25%, transparent);
    color: var(--er-foreground);
    cursor: pointer;
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }

  .er-hero-toggle:hover {
    background: color-mix(in oklab, var(--er-scrim) 45%, transparent);
  }

  .er-hero-toggle:focus-visible,
  .er-hero-link:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-hero-toggle svg {
    width: 1rem;
    height: 1rem;
  }

  /* Centre: one large statement in the middle of the picture. */
  .er-hero[data-layout='center'] {
    --er-hero-overlay: 0.35;
  }

  .er-hero[data-layout='center'] .er-hero-body {
    justify-items: center;
    text-align: center;
  }

  .er-hero[data-layout='center'] .er-hero-heading {
    justify-items: center;
  }

  .er-hero[data-layout='center'] .er-hero-actions {
    justify-content: center;
  }

  /* Bottom: the headline low on the left, over a shade that darkens towards the foot. */
  .er-hero[data-layout='bottom'] {
    --er-hero-overlay: 0.6;
  }

  .er-hero[data-layout='bottom'] .er-hero-scrim {
    background: linear-gradient(
      to top,
      color-mix(in oklab, var(--er-scrim) calc(var(--er-hero-overlay) * 100%), transparent),
      color-mix(in oklab, var(--er-scrim) calc(var(--er-hero-overlay) * 30%), transparent) 45%,
      transparent 75%
    );
  }

  .er-hero[data-layout='bottom'] .er-hero-body {
    align-content: end;
    max-width: 50rem;
    padding-top: 6rem;
  }

  /*
   * Rule: a hairline across the middle with small type on it, in columns on a wide screen.
   * The picture is barely darkened, so a soft shadow keeps the text off the brightest parts.
   */
  .er-hero[data-layout='rule'] .er-hero-content {
    padding-inline: 0;
    text-shadow: 0 1px 12px color-mix(in oklab, var(--er-scrim) 35%, transparent);
  }

  .er-hero[data-layout='rule'] :is(.er-hero-header, .er-hero-body) {
    padding-inline: var(--er-hero-gutter);
  }

  .er-hero[data-layout='rule'] .er-hero-toggle {
    margin-right: var(--er-hero-gutter);
  }

  .er-hero[data-layout='rule'] .er-hero-body {
    align-self: center;
    align-items: start;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in oklab, var(--er-foreground) 85%, transparent);
    font-size: 0.9375rem;
  }

  .er-hero[data-layout='rule'] .er-hero-heading {
    gap: 0.25rem;
  }

  .er-hero[data-layout='rule'] .er-hero-eyebrow {
    font-size: 0.75rem;
  }

  .er-hero[data-layout='rule'] .er-hero-title {
    font-size: clamp(1.125rem, 2cqi, 1.5rem);
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .er-hero[data-layout='rule'] .er-hero-description {
    font-size: inherit;
  }

  .er-hero[data-layout='rule'] .er-hero-actions {
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0;
  }

  .er-hero-link {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.25em;
    transition: text-decoration-color var(--er-duration) var(--er-ease);
  }

  .er-hero-link:hover {
    text-decoration-color: currentColor;
  }

  @container (min-width: 48rem) {
    .er-hero-content {
      --er-hero-gutter: 2rem;
    }

    .er-hero[data-layout='rule'] .er-hero-body {
      grid-template-columns: 2fr 1fr 1fr;
      gap: 2rem;
    }

    .er-hero[data-layout='rule'] .er-hero-actions {
      grid-column: 3;
    }

    .er-hero[data-layout='bottom'] .er-hero-content {
      padding-block: 2rem 2.5rem;
    }
  }

  /* As the hero leaves the top of the window, the picture fades towards the page. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .er-hero[data-wash] .er-hero-wash {
        animation: er-hero-wash linear both;
        animation-timeline: view();
        animation-range: exit 0% exit 80%;
      }
    }
  }

  @keyframes er-hero-wash {
    to {
      opacity: 0.75;
    }
  }
}
</style>
