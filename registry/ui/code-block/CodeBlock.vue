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
  <figure class="sb-code-block" :data-wrap="wrap ? '' : undefined">
    <figcaption v-if="filename" class="sb-code-block-header">{{ filename }}</figcaption>
    <CopyButton class="sb-code-block-copy" :value="code" label="Copy code" />
    <!-- Focusable so a long line can be scrolled with the keyboard; the role is what lets it carry a name. -->
    <pre tabindex="0" role="group" :aria-label="filename ?? 'Code'"><code><template v-if="lineNumbers"><span v-for="(line, index) in lines" :key="index" class="sb-code-block-line">{{ line }}{{ '\n' }}</span></template><slot v-else>{{ code }}</slot></code></pre>
  </figure>
</template>

<style>
@layer components {
  .sb-code-block {
    position: relative;
    width: 100%;
    min-width: 0;
    margin: 0;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-muted);
    overflow: hidden;
  }

  .sb-code-block-header {
    padding: 0.5rem 3rem 0.5rem 1rem;
    border-bottom: 1px solid var(--sb-border);
    color: var(--sb-muted-foreground);
    font-family: var(--sb-font-mono);
    font-size: 0.75rem;
  }

  .sb-code-block-copy {
    position: absolute;
    top: 0.25rem;
    right: 0.375rem;
  }

  .sb-code-block pre {
    margin: 0;
    padding: 0.875rem 1rem;
    color: var(--sb-foreground);
    font-family: var(--sb-font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    tab-size: 2;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  /* Without a header, the first line keeps clear of the copy button. */
  .sb-code-block:not(:has(.sb-code-block-header)) pre {
    padding-right: 3rem;
  }

  .sb-code-block pre:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: -2px;
  }

  .sb-code-block[data-wrap] pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .sb-code-block code {
    font: inherit;
    counter-reset: sb-line;
  }

  /* Numbers are drawn in CSS, so selecting and copying the code never picks them up. */
  .sb-code-block-line::before {
    content: counter(sb-line);
    counter-increment: sb-line;
    display: inline-block;
    width: 1.75rem;
    margin-right: 1rem;
    color: var(--sb-muted-foreground);
    opacity: 0.7;
    text-align: right;
    user-select: none;
  }
}
</style>
