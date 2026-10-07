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
    class="sb-separator"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="!decorative && orientation === 'vertical' ? 'vertical' : undefined"
    :data-orientation="orientation"
  />
</template>

<style>
@layer components {
  .sb-separator {
    flex-shrink: 0;
    background: var(--sb-border);
  }

  .sb-separator[data-orientation='horizontal'] {
    width: 100%;
    height: 1px;
  }

  .sb-separator[data-orientation='vertical'] {
    align-self: stretch;
    width: 1px;
  }
}
</style>
