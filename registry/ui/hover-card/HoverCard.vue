<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { provideHoverCard } from './context'

const props = withDefaults(
  defineProps<{
    /** Time the pointer must rest on the trigger before the card appears, in ms. */
    openDelay?: number
    /** Time the card stays after the pointer leaves, in ms — long enough to move into it. */
    closeDelay?: number
  }>(),
  { openDelay: 400, closeDelay: 200 },
)

const open = defineModel<boolean>('open', { default: false })
let timer: ReturnType<typeof setTimeout> | undefined

function show() {
  clearTimeout(timer)
  if (!open.value) timer = setTimeout(() => (open.value = true), props.openDelay)
}

function hide(immediate = false) {
  clearTimeout(timer)
  if (immediate) open.value = false
  else timer = setTimeout(() => (open.value = false), props.closeDelay)
}

onBeforeUnmount(() => clearTimeout(timer))

provideHoverCard({ open, show, hide, anchor: ref(null) })
</script>

<template>
  <slot :open="open" />
</template>
