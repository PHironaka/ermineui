<script setup lang="ts">
import { computed } from 'vue'
import { CopyButton } from '../copy-button'

const props = defineProps<{
  /** The code, as plain text. This is also what the copy button copies. */
  code: string
  /** Shown in a bar above the code. */
  filename?: string
  /** Number the lines. */
  lineNumbers?: boolean
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean
}>()

const lines = computed(() => props.code.replace(/\n$/, '').split('\n'))
</script>

<template>
  <figure class="er-code-block" :data-wrap="wrap ? '' : undefined">
    <figcaption v-if="filename" class="er-code-block-header">{{ filename }}</figcaption>
    <CopyButton class="er-code-block-copy" :value="code" label="Copy code" />
    <!-- Focusable so a long line can be scrolled with the keyboard; the role is what lets it carry a name. -->
    <pre tabindex="0" role="group" :aria-label="filename ?? 'Code'"><code><template v-if="lineNumbers"><span v-for="(line, index) in lines" :key="index" class="er-code-block-line">{{ line }}{{ '\n' }}</span></template><slot v-else>{{ code }}</slot></code></pre>
  </figure>
</template>

<style>
@layer components {
  .er-code-block {
    position: relative;
    width: 100%;
    min-width: 0;
    margin: 0;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    overflow: hidden;
  }

  .er-code-block-header {
    padding: 0.5rem 3rem 0.5rem 1rem;
    border-bottom: 1px solid var(--er-border);
    color: var(--er-muted-foreground);
    font-family: var(--er-font-mono);
    font-size: 0.75rem;
  }

  .er-code-block-copy {
    position: absolute;
    top: 0.25rem;
    right: 0.375rem;
  }

  .er-code-block pre {
    margin: 0;
    padding: 0.875rem 1rem;
    color: var(--er-foreground);
    font-family: var(--er-font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    tab-size: 2;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  /* Without a header, the first line keeps clear of the copy button. */
  .er-code-block:not(:has(.er-code-block-header)) pre {
    padding-right: 3rem;
  }

  .er-code-block pre:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-code-block[data-wrap] pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .er-code-block code {
    font: inherit;
    counter-reset: er-line;
  }

  /* Numbers are drawn in CSS, so selecting and copying the code never picks them up. */
  .er-code-block-line::before {
    content: counter(er-line);
    counter-increment: er-line;
    display: inline-block;
    width: 1.75rem;
    margin-right: 1rem;
    color: var(--er-muted-foreground);
    opacity: 0.7;
    text-align: right;
    user-select: none;
  }
}
</style>
