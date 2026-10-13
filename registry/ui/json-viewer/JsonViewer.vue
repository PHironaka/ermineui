<script setup lang="ts">
import JsonNode from './JsonNode.vue'

withDefaults(
  defineProps<{
    /** Anything JSON can hold: an object, an array, text, a number, true, false or null. */
    value: unknown
    /** How many levels start open. 0 shows only the outermost brackets. */
    expandDepth?: number
    /** Accessible name of the tree. */
    label?: string
    /** What the outermost value is called. Leave out to show no name for it. */
    rootName?: string
  }>(),
  { expandDepth: 1, label: 'JSON' },
)
</script>

<template>
  <div class="er-json-viewer" role="group" :aria-label="label">
    <ul>
      <JsonNode :value="value" :name="rootName" :depth="0" :expand-depth="expandDepth" last />
    </ul>
  </div>
</template>

<style>
@layer components {
  .er-json-viewer {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-card);
    color: var(--er-card-foreground);
    font-family: var(--er-font-mono);
    font-size: 0.8125rem;
    line-height: 1.5rem;
    overflow-x: auto;
  }

  .er-json-viewer ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-json-viewer ul ul {
    margin-left: 0.4375rem;
    padding-left: 1rem;
    border-left: 1px solid var(--er-border);
  }

  .er-json-viewer li {
    white-space: nowrap;
  }

  .er-json-node-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: -1.125rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  /* The outermost value has nothing to its left to hang the arrow in. */
  .er-json-viewer > ul > li > .er-json-node-toggle {
    margin-left: 0;
  }

  .er-json-node-toggle:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-json-node-toggle svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--er-muted-foreground);
    transition: transform var(--er-duration);
  }

  .er-json-node-toggle[aria-expanded='true'] svg {
    transform: rotate(90deg);
  }

  .er-json-node-key {
    color: var(--er-foreground);
  }

  .er-json-node-punctuation,
  .er-json-node-count {
    color: var(--er-muted-foreground);
  }

  .er-json-node-count {
    font-style: italic;
  }

  /* Each kind of value has its own colour, and its own shape as text: quotes, digits, words. */
  .er-json-node-value[data-type='string'] {
    color: var(--er-success);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .er-json-node-value[data-type='number'] {
    color: var(--er-info);
  }

  /* The warning colour alone is too pale to read as text, so it is darkened towards the text colour. */
  .er-json-node-value[data-type='boolean'] {
    color: color-mix(in oklab, var(--er-warning) 65%, var(--er-foreground));
  }

  .er-json-node-value[data-type='null'] {
    color: var(--er-muted-foreground);
  }
}
</style>
