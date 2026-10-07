<script setup lang="ts">
withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    /** Purely visual (default). Set to false when the line separates content for screen readers too. */
    decorative?: boolean
  }>(),
  { orientation: 'horizontal', decorative: true },
)
</script>

<template>
  <div
    class="er-separator"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="!decorative && orientation === 'vertical' ? 'vertical' : undefined"
    :data-orientation="orientation"
  />
</template>

<style>
@layer components {
  .er-separator {
    flex-shrink: 0;
    background: var(--er-border);
  }

  .er-separator[data-orientation='horizontal'] {
    width: 100%;
    height: 1px;
  }

  .er-separator[data-orientation='vertical'] {
    align-self: stretch;
    width: 1px;
  }
}
</style>
