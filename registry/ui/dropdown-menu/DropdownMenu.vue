<script setup lang="ts">
import { ref, useId } from 'vue'
import { provideDropdownMenu } from './context'

const open = defineModel<boolean>('open', { default: false })

function setOpen(next: boolean) {
  open.value = next
}

provideDropdownMenu({
  open,
  setOpen,
  anchor: ref(null),
  focusFirst: ref(false),
  triggerId: useId(),
  contentId: useId(),
})
</script>

<template>
  <slot :open="open" :close="() => setOpen(false)" />
</template>
