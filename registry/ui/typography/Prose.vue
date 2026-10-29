<script setup lang="ts">
import './fluid.css'

withDefaults(
  defineProps<{
    /** What the text sizes itself to: the screen, or this block's own width (for content in a column or panel). */
    fluid?: 'viewport' | 'container'
  }>(),
  { fluid: 'viewport' },
)
</script>

<template>
  <!-- For content you do not write tag by tag: rendered Markdown, an article from a CMS. Plain HTML goes in, styled text comes out. -->
  <div class="er-prose-root" :class="{ 'er-fluid-container': fluid === 'container' }">
    <div class="er-prose"><slot /></div>
  </div>
</template>

<style>
@layer components {
  .er-prose {
    /* Lines stay a comfortable length to read however wide the page is. */
    max-inline-size: 65ch;
    color: var(--er-foreground);
    font-family: var(--er-font-prose);
    line-height: 1.65;
    overflow-wrap: break-word;
  }

  /* Space between blocks is in em, so it grows and shrinks with the text. */
  .er-prose > * {
    margin-block: 0;
  }

  .er-prose > * + * {
    margin-block-start: 1.1em;
  }

  .er-prose :is(h1, h2, h3, h4, h5, h6) {
    font-family: var(--er-font-display);
    font-weight: var(--er-weight-heading);
    text-wrap: balance;
  }

  .er-prose h1 {
    --er-step: 5;
    font-weight: var(--er-weight-display);
    line-height: 1.1;
    letter-spacing: calc(-0.03em * var(--er-tracking-heading));
    text-transform: var(--er-display-case);
  }

  .er-prose h2 {
    --er-step: 3;
    line-height: 1.2;
    letter-spacing: calc(-0.02em * var(--er-tracking-heading));
  }

  .er-prose h3 {
    --er-step: 2;
    line-height: 1.3;
    letter-spacing: calc(-0.01em * var(--er-tracking-heading));
  }

  .er-prose :is(h4, h5, h6) {
    --er-step: 1;
    line-height: 1.35;
  }

  /* More room above a heading than below it, so it belongs to what follows. */
  .er-prose > * + :is(h2, h3, h4, h5, h6) {
    margin-block-start: 1.6em;
  }

  .er-prose > :is(h1, h2, h3, h4, h5, h6) + * {
    margin-block-start: 0.6em;
  }

  .er-prose :is(small, figcaption) {
    --er-step: -1;
    color: var(--er-muted-foreground);
  }

  .er-prose a {
    color: inherit;
    font-weight: var(--er-weight-medium);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  .er-prose a:hover {
    text-decoration-thickness: 2px;
  }

  .er-prose a:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-prose strong {
    font-weight: 650;
  }

  .er-prose :is(ul, ol) {
    padding-inline-start: 1.4em;
  }

  .er-prose li + li {
    margin-block-start: 0.35em;
  }

  .er-prose li::marker {
    color: var(--er-muted-foreground);
  }

  .er-prose blockquote {
    margin-inline: 0;
    padding-inline-start: 1em;
    border-inline-start: 2px solid var(--er-border);
    color: var(--er-muted-foreground);
  }

  .er-prose hr {
    height: 1px;
    margin-block: 2em;
    border: 0;
    background: var(--er-border);
  }

  .er-prose :is(code, pre) {
    --er-step: -1;
    font-family: var(--er-font-mono);
  }

  .er-prose :not(pre) > code {
    padding: 0.15em 0.35em;
    border-radius: var(--er-radius-sm);
    background: var(--er-muted);
  }

  .er-prose pre {
    padding: 1em;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-muted);
    line-height: 1.6;
    overflow-x: auto;
  }

  /* Code inside a block is already sized by the block. */
  .er-prose pre code {
    font-size: inherit;
  }

  .er-prose img {
    max-width: 100%;
    height: auto;
    border-radius: var(--er-radius-md);
  }
}
</style>
