<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '../button'

const props = withDefaults(
  defineProps<{
    /** Your service worker's registration. Found with navigator.serviceWorker.getRegistration() when left out. */
    registration?: ServiceWorkerRegistration
    /** Sent to the waiting service worker to tell it to take over. It must call skipWaiting() when it gets this. */
    message?: unknown
    /** Reload the page once the new version is in charge. Turn off to do it yourself on `update`. */
    reload?: boolean
    updateLabel?: string
    dismissLabel?: string
  }>(),
  { message: () => ({ type: 'SKIP_WAITING' }), reload: true, updateLabel: 'Reload', dismissLabel: 'Later' },
)

const emit = defineEmits<{
  /** "Reload" was pressed. */
  update: []
  dismiss: []
}>()

/** Whether a new version is waiting. Set it yourself when you find out some other way, such as polling a version number. */
const available = defineModel<boolean>('available', { default: false })

const updating = ref(false)
let registration: ServiceWorkerRegistration | undefined
let installing: ServiceWorker | null = null

/** A worker that has installed while another is still in charge is an update; the very first install is not. */
function check() {
  if (registration?.waiting && navigator.serviceWorker.controller) available.value = true
}

function onStateChange() {
  if (installing?.state === 'installed') check()
}

function onUpdateFound() {
  installing?.removeEventListener('statechange', onStateChange)
  installing = registration?.installing ?? null
  installing?.addEventListener('statechange', onStateChange)
}

function onControllerChange() {
  if (updating.value && props.reload) window.location.reload()
}

onMounted(async () => {
  if (!('serviceWorker' in navigator)) return
  registration = props.registration ?? (await navigator.serviceWorker.getRegistration())
  if (!registration) return
  check()
  registration.addEventListener('updatefound', onUpdateFound)
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
})

onBeforeUnmount(() => {
  registration?.removeEventListener('updatefound', onUpdateFound)
  installing?.removeEventListener('statechange', onStateChange)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
})

function update() {
  emit('update')
  const waiting = registration?.waiting
  if (!waiting) {
    // No service worker involved: the flag was set by hand, so a plain reload fetches the new version.
    if (props.reload) window.location.reload()
    return
  }
  updating.value = true
  waiting.postMessage(props.message)
}

function dismiss() {
  available.value = false
  emit('dismiss')
}
</script>

<template>
  <!-- Always in the page, empty until there is an update, so its arrival is announced. -->
  <div class="er-update-prompt" role="status" :data-state="available ? 'open' : 'closed'">
    <template v-if="available">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 5v5h-5M4 19v-5h5M19.400 10A8 8 0 0 0 5.200 8M4.600 14a8 8 0 0 0 14.200 2" />
      </svg>
      <span class="er-update-prompt-text"><slot>A new version is available.</slot></span>
      <span class="er-update-prompt-actions">
        <Button size="sm" variant="ghost" @click="dismiss">{{ dismissLabel }}</Button>
        <Button size="sm" :loading="updating" @click="update">{{ updateLabel }}</Button>
      </span>
    </template>
  </div>
</template>

<style>
@layer components {
  .er-update-prompt[data-state='open'] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    width: 100%;
    padding: 0.625rem 0.75rem 0.625rem 1rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-card);
    color: var(--er-card-foreground);
    box-shadow: var(--er-shadow-md);
    font-size: 0.875rem;
  }

  .er-update-prompt > svg {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    color: var(--er-muted-foreground);
  }

  .er-update-prompt-text {
    flex: 1;
    min-width: 10rem;
  }

  .er-update-prompt-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
}
</style>
