<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Use "right" for numbers, so the digits line up. */
    align?: 'left' | 'center' | 'right'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <td class="er-table-cell" :data-align="align"><slot /></td>
</template>
