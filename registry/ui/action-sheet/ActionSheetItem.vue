<script setup lang="ts">
import { useDialog } from '../dialog/context'

defineProps<{
  /** Something that cannot be undone, such as deleting: shown in the warning colour. */
  destructive?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  /** The action was chosen. The sheet closes by itself. */
  select: []
}>()

const sheet = useDialog()

function choose() {
  sheet.setOpen(false)
  emit('select')
}
</script>

<template>
  <button type="button" class="er-action-sheet-item" :data-destructive="destructive ? '' : undefined" :disabled="disabled" @click="choose">
    <slot />
  </button>
</template>
