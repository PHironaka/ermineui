<script setup lang="ts">
import { computed } from 'vue'
import { diffHunks, diffLines, diffStats, type DiffLine } from './diff'

const props = withDefaults(
  defineProps<{
    /** The text as it was. */
    before: string
    /** The text as it is now. */
    after: string
    /** One column with removals above additions, or the old text on the left and the new on the right. */
    view?: 'unified' | 'split'
    /** How many unchanged lines to keep around each change. */
    context?: number
    /** A name for what is being compared, shown in the header: usually a file name. */
    title?: string
    /** Accessible name of the table, when there is no title. */
    label?: string
  }>(),
  { view: 'unified', context: 3, label: 'Changes' },
)

const lines = computed(() => diffLines(props.before, props.after))
const hunks = computed(() => diffHunks(lines.value, props.context))
const stats = computed(() => diffStats(lines.value))

const sign = { same: ' ', added: '+', removed: '-' }
const words = { same: '', added: 'Added: ', removed: 'Removed: ' }

interface SplitRow {
  left?: DiffLine
  right?: DiffLine
}

/** For side by side: a run of removals is paired off, line for line, with the additions that follow it. */
function splitRows(hunk: readonly DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = []
  let removed: DiffLine[] = []
  let added: DiffLine[] = []
  const flush = () => {
    for (let index = 0; index < Math.max(removed.length, added.length); index++) rows.push({ left: removed[index], right: added[index] })
    removed = []
    added = []
  }
  for (const line of hunk) {
    if (line.type === 'removed') removed.push(line)
    else if (line.type === 'added') added.push(line)
    else {
      flush()
      rows.push({ left: line, right: line })
    }
  }
  flush()
  return rows
}
</script>

<template>
  <div class="er-diff-viewer" :data-view="view">
    <div class="er-diff-viewer-header">
      <span class="er-diff-viewer-title">{{ title }}</span>
      <span class="er-diff-viewer-stats">
        <span data-type="added">+{{ stats.added }}<span class="er-diff-viewer-hidden"> {{ stats.added === 1 ? 'line' : 'lines' }} added</span></span>
        <span data-type="removed">−{{ stats.removed }}<span class="er-diff-viewer-hidden"> {{ stats.removed === 1 ? 'line' : 'lines' }} removed</span></span>
      </span>
    </div>

    <p v-if="!hunks.length" class="er-diff-viewer-empty"><slot name="empty">No changes.</slot></p>

    <!-- Long lines scroll here rather than wrapping, so the columns stay lined up. -->
    <div v-else class="er-diff-viewer-scroll" role="region" :aria-label="title ?? label" tabindex="0">
      <table v-if="view === 'unified'">
        <caption class="er-diff-viewer-hidden">{{ title ?? label }}</caption>
        <thead class="er-diff-viewer-hidden">
          <tr><th scope="col">Old line</th><th scope="col">New line</th><th scope="col">Text</th></tr>
        </thead>
        <tbody v-for="(hunk, index) in hunks" :key="index">
          <tr class="er-diff-viewer-hunk">
            <td colspan="3">@@ −{{ hunk.beforeStart }} +{{ hunk.afterStart }} @@</td>
          </tr>
          <tr v-for="(line, row) in hunk.lines" :key="row" :data-type="line.type">
            <td class="er-diff-viewer-number">{{ line.before }}</td>
            <td class="er-diff-viewer-number">{{ line.after }}</td>
            <td class="er-diff-viewer-text"><span class="er-diff-viewer-sign" aria-hidden="true">{{ sign[line.type] }}</span><span class="er-diff-viewer-hidden">{{ words[line.type] }}</span>{{ line.text }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else>
        <caption class="er-diff-viewer-hidden">{{ title ?? label }}</caption>
        <thead class="er-diff-viewer-hidden">
          <tr><th scope="col">Old line</th><th scope="col">Old text</th><th scope="col">New line</th><th scope="col">New text</th></tr>
        </thead>
        <tbody v-for="(hunk, index) in hunks" :key="index">
          <tr class="er-diff-viewer-hunk">
            <td colspan="4">@@ −{{ hunk.beforeStart }} +{{ hunk.afterStart }} @@</td>
          </tr>
          <tr v-for="(row, number) in splitRows(hunk.lines)" :key="number">
            <td class="er-diff-viewer-number" :data-type="row.left?.type ?? 'blank'">{{ row.left?.before }}</td>
            <td class="er-diff-viewer-text" :data-type="row.left?.type ?? 'blank'">
              <template v-if="row.left"><span class="er-diff-viewer-sign" aria-hidden="true">{{ sign[row.left.type] }}</span><span class="er-diff-viewer-hidden">{{ words[row.left.type] }}</span>{{ row.left.text }}</template>
            </td>
            <td class="er-diff-viewer-number" :data-type="row.right?.type ?? 'blank'">{{ row.right?.after }}</td>
            <td class="er-diff-viewer-text" :data-type="row.right?.type ?? 'blank'">
              <template v-if="row.right"><span class="er-diff-viewer-sign" aria-hidden="true">{{ sign[row.right.type] }}</span><span class="er-diff-viewer-hidden">{{ words[row.right.type] }}</span>{{ row.right.text }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-diff-viewer {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-card);
    color: var(--er-card-foreground);
    overflow: hidden;
  }

  .er-diff-viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.875rem;
    border-bottom: 1px solid var(--er-border);
    background: var(--er-muted);
    font-family: var(--er-font-mono);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .er-diff-viewer-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-diff-viewer-stats {
    display: flex;
    flex-shrink: 0;
    gap: 0.5rem;
    font-weight: var(--er-weight-semibold);
    font-variant-numeric: tabular-nums;
  }

  /* Darkened towards the text colour: on the grey of the header the plain green is too pale to read. */
  .er-diff-viewer-stats [data-type='added'] {
    color: color-mix(in oklab, var(--er-success) 65%, var(--er-foreground));
  }

  .er-diff-viewer-stats [data-type='removed'] {
    color: var(--er-destructive);
  }

  .er-diff-viewer-empty {
    margin: 0;
    padding: 1rem;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  .er-diff-viewer-scroll {
    overflow-x: auto;
    /* Positioned, so the text hidden for screen readers inside is clipped with the rest; otherwise it would widen the page from cells scrolled out of view. */
    position: relative;
  }

  .er-diff-viewer-scroll:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-diff-viewer table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--er-font-mono);
    font-size: 0.8125rem;
    line-height: 1.375rem;
  }

  .er-diff-viewer[data-view='split'] table {
    table-layout: fixed;
    min-width: 36rem;
  }

  .er-diff-viewer td {
    padding: 0 0.5rem;
    vertical-align: top;
  }

  .er-diff-viewer-number {
    width: 1%;
    min-width: 2.5rem;
    color: var(--er-muted-foreground);
    font-variant-numeric: tabular-nums;
    text-align: right;
    user-select: none;
  }

  .er-diff-viewer[data-view='split'] .er-diff-viewer-number {
    width: 3rem;
  }

  .er-diff-viewer-text {
    white-space: pre;
  }

  .er-diff-viewer[data-view='split'] .er-diff-viewer-text {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  /* The sign, + or -, says what happened to the line; the tint only makes it quicker to see. */
  .er-diff-viewer-sign {
    display: inline-block;
    width: 1.25rem;
    color: var(--er-muted-foreground);
    user-select: none;
  }

  .er-diff-viewer [data-type='added'] {
    background: color-mix(in oklab, var(--er-success) 13%, transparent);
  }

  .er-diff-viewer [data-type='removed'] {
    background: color-mix(in oklab, var(--er-destructive) 11%, transparent);
  }

  .er-diff-viewer [data-type='blank'] {
    background: var(--er-muted);
  }

  .er-diff-viewer-stats [data-type] {
    background: none;
  }

  .er-diff-viewer-hunk td {
    padding-block: 0.125rem;
    background: var(--er-muted);
    color: var(--er-muted-foreground);
  }

  .er-diff-viewer-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
