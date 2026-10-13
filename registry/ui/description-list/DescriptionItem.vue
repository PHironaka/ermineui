<script setup lang="ts">
defineProps<{
  /** What the value is. */
  label: string
}>()
</script>

<template>
  <div class="er-description-item">
    <dt>{{ label }}</dt>
    <dd><slot /></dd>
  </div>
</template>
