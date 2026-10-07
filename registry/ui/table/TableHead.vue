<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Use "right" for columns of numbers, so the digits line up. */
    align?: 'left' | 'center' | 'right'
    /** "col" for a column heading (the default), "row" for a heading at the start of a row. */
    scope?: 'col' | 'row'
  }>(),
  { align: 'left', scope: 'col' },
)
</script>

<template>
  <th class="er-table-head" :scope="scope" :data-align="align"><slot /></th>
</template>
