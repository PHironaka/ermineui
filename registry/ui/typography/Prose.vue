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
  <div class="sb-prose-root" :class="{ 'sb-fluid-container': fluid === 'container' }">
    <div class="sb-prose"><slot /></div>
  </div>
</template>

<style>
@layer components {
  .sb-prose {
    /* Lines stay a comfortable length to read however wide the page is. */
    max-inline-size: 65ch;
    color: var(--sb-foreground);
    font-family: var(--sb-font-sans);
    line-height: 1.65;
    overflow-wrap: break-word;
  }

  /* Space between blocks is in em, so it grows and shrinks with the text. */
  .sb-prose > * {
    margin-block: 0;
  }

  .sb-prose > * + * {
    margin-block-start: 1.1em;
  }

  .sb-prose :is(h1, h2, h3, h4, h5, h6) {
    font-weight: 650;
    text-wrap: balance;
  }

  .sb-prose h1 {
    --sb-step: 5;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .sb-prose h2 {
    --sb-step: 3;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .sb-prose h3 {
    --sb-step: 2;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .sb-prose :is(h4, h5, h6) {
    --sb-step: 1;
    line-height: 1.35;
  }

  /* More room above a heading than below it, so it belongs to what follows. */
  .sb-prose > * + :is(h2, h3, h4, h5, h6) {
    margin-block-start: 1.6em;
  }

  .sb-prose > :is(h1, h2, h3, h4, h5, h6) + * {
    margin-block-start: 0.6em;
  }

  .sb-prose :is(small, figcaption) {
    --sb-step: -1;
    color: var(--sb-muted-foreground);
  }

  .sb-prose a {
    color: inherit;
    font-weight: 500;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  .sb-prose a:hover {
    text-decoration-thickness: 2px;
  }

  .sb-prose a:focus-visible {
    border-radius: var(--sb-radius-sm);
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-prose strong {
    font-weight: 650;
  }

  .sb-prose :is(ul, ol) {
    padding-inline-start: 1.4em;
  }

  .sb-prose li + li {
    margin-block-start: 0.35em;
  }

  .sb-prose li::marker {
    color: var(--sb-muted-foreground);
  }

  .sb-prose blockquote {
    margin-inline: 0;
    padding-inline-start: 1em;
    border-inline-start: 2px solid var(--sb-border);
    color: var(--sb-muted-foreground);
  }

  .sb-prose hr {
    height: 1px;
    margin-block: 2em;
    border: 0;
    background: var(--sb-border);
  }

  .sb-prose :is(code, pre) {
    --sb-step: -1;
    font-family: var(--sb-font-mono);
  }

  .sb-prose :not(pre) > code {
    padding: 0.15em 0.35em;
    border-radius: var(--sb-radius-sm);
    background: var(--sb-muted);
  }

  .sb-prose pre {
    padding: 1em;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-md);
    background: var(--sb-muted);
    line-height: 1.6;
    overflow-x: auto;
  }

  /* Code inside a block is already sized by the block. */
  .sb-prose pre code {
    font-size: inherit;
  }

  .sb-prose img {
    max-width: 100%;
    height: auto;
    border-radius: var(--sb-radius-md);
  }
}
</style>
