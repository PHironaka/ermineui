<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { playSound, useSound } from './sound'

withDefaults(
  defineProps<{
    /** Accessible name, and the tooltip. */
    label?: string
  }>(),
  { label: 'Sound' },
)

const { settings } = useSound()
// The saved choice is only known in the browser; until then the button shows the default, so server and browser agree.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

function toggle() {
  settings.enabled = !settings.enabled
  // Turning sound on demonstrates itself.
  if (settings.enabled) playSound('on')
}
</script>

<template>
  <!-- A pressed-state button: screen readers say "Sound, pressed" or "Sound, not pressed". -->
  <button type="button" class="er-sound-toggle" :aria-label="label" :title="label" :aria-pressed="mounted ? settings.enabled : true" @click="toggle">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <template v-if="!mounted || settings.enabled">
        <path d="M16.500 9a4 4 0 0 1 0 6" />
        <path d="M19 6.500a8 8 0 0 1 0 11" />
      </template>
      <path v-else d="m17 9.500 5 5m0-5-5 5" />
    </svg>
  </button>
</template>

<style>
@layer components {
  .er-sound-toggle {
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-sound-toggle:hover {
    background: var(--er-accent);
  }

  .er-sound-toggle[aria-pressed='false'] {
    color: var(--er-muted-foreground);
  }

  .er-sound-toggle:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-sound-toggle svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
