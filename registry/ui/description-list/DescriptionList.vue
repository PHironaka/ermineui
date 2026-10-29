<script setup lang="ts">
withDefaults(
  defineProps<{
    /** "rows" puts each label beside its value with a line between rows; "stacked" puts the label above the value. */
    layout?: 'rows' | 'stacked'
    /** With "stacked": how many items sit side by side when there is room. */
    columns?: number
  }>(),
  { layout: 'rows', columns: 1 },
)
</script>

<template>
  <dl class="er-description-list" :data-layout="layout" :style="{ '--er-description-columns': columns }">
    <slot />
  </dl>
</template>

<style>
@layer components {
  .er-description-list {
    display: grid;
    width: 100%;
    min-width: 0;
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-description-item {
    min-width: 0;
  }

  .er-description-item dt {
    color: var(--er-muted-foreground);
  }

  .er-description-item dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
  }

  /* Rows: labels in one column, values in the next. On a narrow list each label moves above its value. */
  .er-description-list[data-layout='rows'] {
    container-type: inline-size;
  }

  .er-description-list[data-layout='rows'] .er-description-item {
    display: grid;
    gap: 0.125rem 1rem;
    padding-block: 0.625rem;
    border-bottom: 1px solid var(--er-border);
  }

  .er-description-list[data-layout='rows'] .er-description-item:first-child {
    padding-top: 0;
  }

  .er-description-list[data-layout='rows'] .er-description-item:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  @container (min-width: 24rem) {
    .er-description-list[data-layout='rows'] .er-description-item {
      grid-template-columns: minmax(8rem, 1fr) 2fr;
    }
  }

  .er-description-list[data-layout='stacked'] {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, max(9rem, calc((100% - (var(--er-description-columns) - 1) * 1.5rem) / var(--er-description-columns)))), 1fr));
    gap: 1rem 1.5rem;
  }

  .er-description-list[data-layout='stacked'] .er-description-item {
    display: grid;
    align-content: start;
    gap: 0.125rem;
  }

  .er-description-list[data-layout='stacked'] dt {
    font-size: 0.8125rem;
  }

  .er-description-list[data-layout='stacked'] dd {
    font-weight: var(--er-weight-medium);
  }
}
</style>
