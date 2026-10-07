<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Button } from '../button'

const props = withDefaults(
  defineProps<{
    /** The link to share. Defaults to the page's own address. */
    url?: string
    /** A title for the thing being shared. Apps use it as a subject line or heading. */
    title?: string
    /** A sentence to go with the link. */
    text?: string
    /** Shown for a moment after the link is copied, on devices with no share sheet. */
    copiedLabel?: string
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { copiedLabel: 'Link copied', variant: 'outline', size: 'md' },
)

const emit = defineEmits<{
  /** The share sheet was used and something was chosen. */
  share: []
  /** There was no share sheet, so the link went to the clipboard. */
  copy: [url: string]
  /** Neither worked: no permission, or an insecure page. */
  error: [error: unknown]
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

async function share() {
  const url = props.url ?? window.location.href
  const data = { url, title: props.title, text: props.text }
  try {
    // Phones, and some desktop browsers, have a native sheet listing the apps that can take a link.
    if (typeof navigator.share === 'function' && (navigator.canShare?.(data) ?? true)) {
      await navigator.share(data)
      emit('share')
      return
    }
    await navigator.clipboard.writeText(url)
    copied.value = true
    emit('copy', url)
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 2000)
  } catch (error) {
    // Closing the share sheet without choosing is not an error, just a change of mind.
    if (error instanceof DOMException && error.name === 'AbortError') return
    emit('error', error)
  }
}
</script>

<template>
  <Button class="sb-share-button" :variant="variant" :size="size" :data-copied="copied ? '' : undefined" @click="share">
    <svg v-if="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
    <template v-if="copied">{{ copiedLabel }}</template>
    <slot v-else>Share</slot>
    <!-- The label swap is silent to a screen reader, so the confirmation is also announced. -->
    <span class="sb-share-button-status" role="status">{{ copied ? copiedLabel : '' }}</span>
  </Button>
</template>

<style>
@layer components {
  .sb-share-button-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
