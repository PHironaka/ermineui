<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  /** Heading above the group's links. */
  label?: string
}>()

const id = useId()
</script>

<template>
  <div class="sb-sidebar-group" role="group" :aria-labelledby="label ? id : undefined">
    <div v-if="label" :id="id" class="sb-sidebar-group-label">{{ label }}</div>
    <ul><slot /></ul>
  </div>
</template>
