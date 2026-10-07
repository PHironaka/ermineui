<script setup lang="ts">
import { computed, type Component } from 'vue'
import './fluid.css'

/** What each variant looks like: which step of the size scale it sits on, and the tag it uses unless told otherwise. */
const VARIANTS = {
  display: { step: 6, tag: 'h1' },
  h1: { step: 5, tag: 'h1' },
  h2: { step: 4, tag: 'h2' },
  h3: { step: 3, tag: 'h3' },
  h4: { step: 2, tag: 'h4' },
  lead: { step: 1, tag: 'p' },
  body: { step: 0, tag: 'p' },
  small: { step: -1, tag: 'p' },
  caption: { step: -1.5, tag: 'p' },
  overline: { step: -1.5, tag: 'p' },
} as const

const props = withDefaults(
  defineProps<{
    /** How the text looks. Separate from `as`, so a heading can look smaller than its level suggests. */
    variant?: keyof typeof VARIANTS
    /** The tag or component to render. Pick it for meaning (the page's outline), not for size. */
    as?: string | Component
    /** Override the variant's size: a step on the scale. 0 is body text; halves are allowed. */
    step?: number
    tone?: 'default' | 'muted'
    /** Keep lines to a comfortable reading length (about 65 characters). */
    measure?: boolean
    /** Even out line lengths. On by default for headings; set false to turn off, true to force on. */
    balance?: boolean
    /** Cut the text off with "…" after this many lines. */
    lines?: number
  }>(),
  { variant: 'body', tone: 'default', balance: undefined },
)

const settings = computed(() => VARIANTS[props.variant])
const balanced = computed(() => props.balance ?? settings.value.step >= 2)
</script>

<template>
  <component
    :is="as ?? settings.tag"
    class="sb-fluid-type sb-typography"
    :data-variant="variant"
    :data-tone="tone"
    :data-measure="measure ? '' : undefined"
    :data-balance="balanced ? '' : undefined"
    :data-clamp="lines ? '' : undefined"
    :style="{ '--sb-step': step ?? settings.step, '--sb-lines': lines }"
  >
    <slot />
  </component>
</template>

<style>
@layer components {
  .sb-typography {
    margin: 0;
    color: var(--sb-foreground);
    font-family: var(--sb-font-sans);
    font-weight: 400;
    /* Line height and letter spacing have no units or use em, so they scale with the fluid size. */
    line-height: 1.6;
    overflow-wrap: break-word;
  }

  .sb-typography[data-tone='muted'] {
    color: var(--sb-muted-foreground);
  }

  /* The bigger the text, the tighter it is set. */
  .sb-typography[data-variant='display'] {
    font-weight: 700;
    line-height: 1.04;
    letter-spacing: -0.035em;
  }

  .sb-typography[data-variant='h1'] {
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .sb-typography[data-variant='h2'] {
    font-weight: 650;
    line-height: 1.15;
    letter-spacing: -0.025em;
  }

  .sb-typography[data-variant='h3'] {
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .sb-typography[data-variant='h4'] {
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .sb-typography[data-variant='lead'] {
    color: var(--sb-muted-foreground);
    line-height: 1.5;
  }

  .sb-typography[data-variant='small'],
  .sb-typography[data-variant='caption'] {
    line-height: 1.5;
  }

  .sb-typography[data-variant='caption'] {
    color: var(--sb-muted-foreground);
  }

  .sb-typography[data-variant='overline'] {
    color: var(--sb-muted-foreground);
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .sb-typography[data-measure] {
    max-inline-size: 65ch;
  }

  .sb-typography[data-balance] {
    text-wrap: balance;
  }

  .sb-typography[data-clamp] {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--sb-lines);
    line-clamp: var(--sb-lines);
  }
}
</style>
