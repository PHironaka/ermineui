<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** How long the "back online" message stays, in ms. 0 skips it. */
    backOnlineFor?: number
  }>(),
  { backOnlineFor: 3000 },
)

const emit = defineEmits<{
  offline: []
  online: []
}>()

// Assumed online until the browser says otherwise: the server cannot know, and most visits are.
const state = ref<'online' | 'offline' | 'back'>('online')
let timer: ReturnType<typeof setTimeout> | undefined

function goOffline() {
  clearTimeout(timer)
  state.value = 'offline'
  emit('offline')
}

function goOnline() {
  if (state.value !== 'offline') return
  emit('online')
  if (props.backOnlineFor <= 0) {
    state.value = 'online'
    return
  }
  state.value = 'back'
  timer = setTimeout(() => (state.value = 'online'), props.backOnlineFor)
}

onMounted(() => {
  // "Offline" here means no network at all. A connection that is up but cannot reach your server still counts as online.
  if (!navigator.onLine) goOffline()
  window.addEventListener('offline', goOffline)
  window.addEventListener('online', goOnline)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  window.removeEventListener('offline', goOffline)
  window.removeEventListener('online', goOnline)
})
</script>

<template>
  <!-- Always in the page, empty while online, so the change is announced when it happens. -->
  <div class="sb-offline-banner" role="status" :data-state="state">
    <template v-if="state === 'offline'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 3l18 18M8.500 16.500a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.500M19 13a10 10 0 0 0-4.500-2.700M2 9a15 15 0 0 1 4.500-3M22 9a15 15 0 0 0-9-3.900M12 20h.01" />
      </svg>
      <span><slot>You are offline. Changes will be saved when you reconnect.</slot></span>
    </template>
    <span v-else-if="state === 'back'"><slot name="online">Back online.</slot></span>
  </div>
</template>

<style>
@layer components {
  .sb-offline-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    background: color-mix(in oklab, var(--sb-warning) 14%, var(--sb-background));
    color: var(--sb-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  .sb-offline-banner[data-state='back'] {
    background: color-mix(in oklab, var(--sb-success) 14%, var(--sb-background));
  }

  /* Takes no room while there is nothing to say. */
  .sb-offline-banner[data-state='online'] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .sb-offline-banner svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
