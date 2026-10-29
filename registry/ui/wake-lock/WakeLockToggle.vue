<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{
  /** The browser refused: usually low battery or a power-saving mode. */
  error: [error: unknown]
}>()

/** Whether the screen should be kept awake. */
const active = defineModel<boolean>({ default: false })

const supported = ref(false)
let lock: { release: () => Promise<void>; addEventListener: (type: 'release', listener: () => void) => void } | undefined

type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<NonNullable<typeof lock>> } }

async function acquire() {
  try {
    lock = await (navigator as WakeLockNavigator).wakeLock!.request('screen')
    // The system can take the lock away at any time (the tab is hidden, the battery runs low).
    lock.addEventListener('release', () => {
      lock = undefined
    })
  } catch (error) {
    active.value = false
    emit('error', error)
  }
}

async function toggle() {
  // Worked out first and used directly: when bound with v-model, `active` only changes once the parent has re-rendered.
  const next = !active.value
  active.value = next
  if (next) await acquire()
  else await lock?.release()
}

// Browsers drop the lock whenever the tab is hidden; take it again when the reader comes back.
function onVisibility() {
  if (active.value && !lock && document.visibilityState === 'visible') void acquire()
}

onMounted(() => {
  supported.value = 'wakeLock' in navigator
  document.addEventListener('visibilitychange', onVisibility)
  if (supported.value && active.value) void acquire()
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  void lock?.release()
})
</script>

<template>
  <!-- Rendered only where it can work: a switch that does nothing is worse than no switch. -->
  <button v-if="supported" type="button" class="er-wake-lock" :aria-pressed="active" :data-state="active ? 'on' : 'off'" @click="toggle">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" />
    </svg>
    <slot :active="active">Keep screen on</slot>
  </button>
</template>

<style>
@layer components {
  .er-wake-lock {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: var(--er-control-md);
    padding: 0 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-control);
    background: var(--er-input-background);
    color: var(--er-muted-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-wake-lock:hover {
    color: var(--er-foreground);
  }

  .er-wake-lock[data-state='on'] {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-wake-lock:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-wake-lock svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
