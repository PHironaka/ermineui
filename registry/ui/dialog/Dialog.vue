<script setup lang="ts">
import { ref, useId } from 'vue'
import { provideDialog } from './context'

const open = defineModel<boolean>('open', { default: false })

function setOpen(next: boolean) {
  open.value = next
}

provideDialog({
  open,
  setOpen,
  titleId: useId(),
  descriptionId: useId(),
  hasDescription: ref(false),
})
</script>

<template>
  <slot :open="open" :close="() => setOpen(false)" />
</template>
