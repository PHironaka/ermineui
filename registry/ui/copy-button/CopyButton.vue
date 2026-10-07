<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button } from '../button'

const props = withDefaults(
  defineProps<{
    /** The text to copy. */
    value: string
    /** Accessible name, and the visible text when you give the button a label via the slot. */
    label?: string
    /** Announced, and shown, for a moment after copying. */
    copiedLabel?: string
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'icon'
  }>(),
  { label: 'Copy', copiedLabel: 'Copied', variant: 'ghost', size: 'icon' },
)

const emit = defineEmits<{
  copy: [value: string]
  /** The browser refused: no permission, or the page is not served over https. */
  error: [error: unknown]
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    emit('copy', props.value)
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 2000)
  } catch (error) {
    emit('error', error)
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Button class="er-copy-button" :variant="variant" :size="size" :aria-label="size === 'icon' ? label : undefined" :data-copied="copied ? '' : undefined" @click="copy">
    <svg v-if="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
    <template v-if="size !== 'icon'">{{ copied ? copiedLabel : label }}</template>
    <!-- The icon swap is silent, so the confirmation is also said aloud. -->
    <span class="er-copy-button-status" role="status">{{ copied ? copiedLabel : '' }}</span>
  </Button>
</template>

<style>
@layer components {
  .er-copy-button[data-size='icon'] {
    width: 2rem;
    height: 2rem;
  }

  .er-copy-button-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
