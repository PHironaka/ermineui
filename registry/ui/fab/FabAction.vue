<script setup lang="ts">
import { useFab } from './context'

const emit = defineEmits<{
  /** The action was chosen. The stack closes by itself. */
  select: []
}>()

const fab = useFab()

function choose() {
  fab.close()
  emit('select')
}
</script>

<template>
  <button type="button" class="er-fab-action" @click="choose">
    <slot />
  </button>
</template>
