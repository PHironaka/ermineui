<script setup lang="ts">
import { computed } from 'vue'
import { Prose } from '../typography'
import { renderMarkdown } from './parse'

const props = withDefaults(
  defineProps<{
    /** The Markdown to show. */
    source: string
    /** Added to every heading's level, so "#" can come out as h2 or h3 on a page that already has an h1. */
    headingOffset?: number
    /** What the text sizes itself to: the screen, or this block's own width. */
    fluid?: 'viewport' | 'container'
    /** Turn the Markdown into HTML your own way, e.g. with a library. What it returns goes into the page as it is, so it must be safe. */
    render?: (source: string) => string
  }>(),
  { headingOffset: 0, fluid: 'container' },
)

const html = computed(() => (props.render ? props.render(props.source) : renderMarkdown(props.source, { headingOffset: props.headingOffset })))
</script>

<template>
  <Prose :fluid="fluid">
    <!-- The built-in renderer escapes everything in the source and writes only its own tags, which is what makes v-html safe here. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="er-markdown" v-html="html" />
  </Prose>
</template>

<style>
@layer components {
  /* Prose spaces out its own children; the rendered blocks are one level further in, so the same spacing is repeated for them. */
  .er-markdown > * {
    margin-block: 0;
  }

  .er-markdown > * + * {
    margin-block-start: 1.1em;
  }

  .er-markdown > * + :is(h2, h3, h4, h5, h6) {
    margin-block-start: 1.6em;
  }

  .er-markdown > :is(h1, h2, h3, h4, h5, h6) + * {
    margin-block-start: 0.6em;
  }

  .er-markdown :is(ul, ol) :is(ul, ol) {
    margin-block: 0.25em 0;
  }

  .er-markdown li > p {
    margin-block: 0;
  }

  .er-markdown li > p + * {
    margin-block-start: 0.5em;
  }

  /* A task list: the tick boxes stand in for the bullets. */
  .er-markdown li[data-task] {
    list-style: none;
    margin-inline-start: -1.25em;
  }

  .er-markdown li[data-task] input {
    margin: 0 0.25em 0 0;
    accent-color: var(--er-primary);
  }

  .er-markdown [data-table] {
    overflow-x: auto;
  }

  .er-markdown [data-table]:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-markdown table {
    border-collapse: collapse;
    font-size: 0.9em;
  }

  .er-markdown :is(th, td) {
    padding: 0.4em 0.8em;
    border: 1px solid var(--er-border);
    text-align: left;
  }

  .er-markdown th {
    background: var(--er-muted);
    font-weight: var(--er-weight-semibold);
  }

  .er-markdown [data-align='center'] {
    text-align: center;
  }

  .er-markdown [data-align='right'] {
    text-align: right;
  }

  .er-markdown del {
    color: var(--er-muted-foreground);
  }
}
</style>
