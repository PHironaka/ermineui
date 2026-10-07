<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'
import { provideTooltip } from './context'

const props = withDefaults(
  defineProps<{
    /** Hover time before the tooltip appears, in ms. Keyboard focus shows it immediately. */
    delay?: number
    disabled?: boolean
  }>(),
  { delay: 300 },
)

const open = defineModel<boolean>('open', { default: false })
let timer: ReturnType<typeof setTimeout> | undefined

function show(immediate = false) {
  clearTimeout(timer)
  if (props.disabled) return
  if (immediate || open.value) open.value = true
  else timer = setTimeout(() => (open.value = true), props.delay)
}

function hide(immediate = false) {
  clearTimeout(timer)
  if (immediate) open.value = false
  // The grace period lets the pointer travel from the trigger onto the tooltip.
  else timer = setTimeout(() => (open.value = false), 100)
}

onBeforeUnmount(() => clearTimeout(timer))

provideTooltip({ open, show, hide, anchor: ref(null), contentId: useId() })
</script>

<template>
  <slot :open="open" />
</template>
