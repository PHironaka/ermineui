<script setup lang="ts">
import { computed, ref } from 'vue'
import { Spinner } from '../spinner'

const props = withDefaults(
  defineProps<{
    /** Loads the new content. The spinner stays until the promise it returns settles. */
    onRefresh: () => unknown
    /** How far the finger has to pull, in px, before letting go refreshes. */
    threshold?: number
    disabled?: boolean
    pullLabel?: string
    releaseLabel?: string
    refreshingLabel?: string
    /** Said aloud when the new content is in. */
    doneLabel?: string
  }>(),
  { threshold: 64, pullLabel: 'Pull to refresh', releaseLabel: 'Release to refresh', refreshingLabel: 'Refreshing…', doneLabel: 'Updated.' },
)

const root = ref<HTMLElement | null>(null)
/** How far the content is pulled down, in px. */
const distance = ref(0)
const refreshing = ref(false)
const pulling = ref(false)
const message = ref('')

const ready = computed(() => distance.value >= props.threshold)
const state = computed(() => (refreshing.value ? 'refreshing' : ready.value ? 'ready' : pulling.value ? 'pulling' : 'idle'))

let startY = 0

/** Whatever scrolls the content: this element when it has a height of its own, otherwise the page. */
function scrolledToTop() {
  let el: HTMLElement | null = root.value
  for (; el; el = el.parentElement) {
    if (el.scrollTop > 0) return false
  }
  return window.scrollY <= 0
}

function onTouchStart(event: TouchEvent) {
  if (props.disabled || refreshing.value || !scrolledToTop()) return
  startY = event.touches[0].clientY
  pulling.value = true
}

function onTouchMove(event: TouchEvent) {
  if (!pulling.value) return
  const dy = event.touches[0].clientY - startY
  if (dy <= 0) {
    distance.value = 0
    return
  }
  // The content follows at half speed and slows further, so it feels held back rather than dragged.
  distance.value = Math.min(props.threshold * 1.75, dy * 0.5)
  // Stops the browser's own pull-to-refresh, and the page's rubber-band, from running as well.
  if (event.cancelable) event.preventDefault()
}

function onTouchEnd() {
  if (!pulling.value) return
  pulling.value = false
  if (ready.value) void refresh()
  else distance.value = 0
}

/** Runs the refresh without a pull: what the button does, and what you can call yourself. */
async function refresh() {
  if (refreshing.value || props.disabled) return
  refreshing.value = true
  distance.value = props.threshold
  message.value = props.refreshingLabel
  try {
    await props.onRefresh()
    message.value = props.doneLabel
  } catch {
    // What went wrong is for the caller to show; the spinner still has to go away.
    message.value = ''
  } finally {
    refreshing.value = false
    distance.value = 0
  }
}

defineExpose({ refresh })
</script>

<template>
  <div
    ref="root"
    class="er-pull-to-refresh"
    :data-state="state"
    :style="{ '--er-pull-distance': `${distance}px` }"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div class="er-pull-to-refresh-indicator" aria-hidden="true">
      <Spinner v-if="refreshing" label="" />
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
      <span>{{ refreshing ? refreshingLabel : ready ? releaseLabel : pullLabel }}</span>
    </div>
    <p class="er-pull-to-refresh-status" role="status">{{ message }}</p>
    <div class="er-pull-to-refresh-content">
      <!-- A pull cannot be done with a keyboard, a mouse or a switch: `refresh` is here for a button of your own. -->
      <slot :refresh="refresh" :refreshing="refreshing" />
    </div>
  </div>
</template>

<style>
@layer components {
  .er-pull-to-refresh {
    position: relative;
    /* The browser's own pull-to-refresh would otherwise fire on top of this one. */
    overscroll-behavior-y: contain;
  }

  .er-pull-to-refresh-indicator {
    position: absolute;
    inset: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: var(--er-pull-distance);
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    overflow: hidden;
  }

  .er-pull-to-refresh-indicator svg {
    width: 1rem;
    height: 1rem;
    transition: transform var(--er-duration);
  }

  .er-pull-to-refresh[data-state='ready'] .er-pull-to-refresh-indicator svg {
    transform: rotate(180deg);
  }

  .er-pull-to-refresh-content {
    transform: translateY(var(--er-pull-distance));
  }

  /* While the finger is down the content follows it exactly; let go and it eases back. */
  .er-pull-to-refresh:not([data-state='pulling'], [data-state='ready']) .er-pull-to-refresh-content,
  .er-pull-to-refresh:not([data-state='pulling'], [data-state='ready']) .er-pull-to-refresh-indicator {
    transition:
      transform 200ms var(--er-ease),
      height 200ms var(--er-ease);
  }

  .er-pull-to-refresh-status {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .er-pull-to-refresh-content,
    .er-pull-to-refresh-indicator,
    .er-pull-to-refresh-indicator svg {
      transition: none !important;
    }
  }
}
</style>
