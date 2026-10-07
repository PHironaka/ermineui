<script setup lang="ts">
import { ref, useId } from 'vue'
import { providePopover } from './context'

const open = defineModel<boolean>('open', { default: false })

function setOpen(next: boolean) {
  open.value = next
}

providePopover({ open, setOpen, anchor: ref(null), contentId: useId() })
</script>

<template>
  <slot :open="open" :close="() => setOpen(false)" />
</template>
