<script setup lang="ts">
defineProps<{
  /** Highlight the row, e.g. while its checkbox is ticked. */
  selected?: boolean
}>()
</script>

<template>
  <tr class="sb-table-row" :data-state="selected ? 'selected' : undefined" :aria-selected="selected || undefined"><slot /></tr>
</template>
