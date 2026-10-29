<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Portal } from '../../lib/primitive'
import { dismissToast, toasts, type ToastItem } from './toast'

const props = withDefaults(
  defineProps<{
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    /** Accessible name of the notification region. */
    label?: string
    /** Accessible name of each toast's dismiss button. */
    dismissLabel?: string
  }>(),
  { position: 'bottom-right', label: 'Notifications', dismissLabel: 'Dismiss' },
)

// The newest toast sits nearest the screen edge.
const ordered = computed(() => (props.position.startsWith('top') ? [...toasts].reverse() : toasts))

// Timers pause while the pointer or keyboard focus is on the toasts, so nothing vanishes mid-read.
const hovered = ref(false)
const focused = ref(false)
const paused = computed(() => hovered.value || focused.value)

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  focused.value = next instanceof Node && (event.currentTarget as HTMLElement).contains(next)
}

const timers = new Map<string | number, ReturnType<typeof setTimeout>>()

function sync() {
  for (const [id, timer] of timers) {
    if (paused.value || !toasts.some((toast) => toast.id === id)) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }
  if (paused.value) return
  for (const toast of toasts) {
    if (timers.has(toast.id) || !Number.isFinite(toast.duration) || toast.duration <= 0) continue
    timers.set(
      toast.id,
      setTimeout(() => dismissToast(toast.id), toast.duration),
    )
  }
}

watch([() => toasts.map((toast) => toast.id).join(), paused], sync, { immediate: true })
onBeforeUnmount(() => timers.forEach((timer) => clearTimeout(timer)))

function runAction(toast: ToastItem) {
  toast.action?.onClick()
  dismissToast(toast.id)
}
</script>

<template>
  <Portal>
    <section
      class="er-toaster"
      :aria-label="label"
      :data-position="position"
      data-er-layer-ignore
      @pointerenter="hovered = true"
      @pointerleave="hovered = false"
      @focusin="focused = true"
      @focusout="onFocusOut"
    >
      <TransitionGroup name="er-toast" tag="ol" class="er-toast-list" aria-live="polite" aria-relevant="additions text">
        <li v-for="toast in ordered" :key="toast.id" class="er-toast" :data-variant="toast.variant">
          <svg
            v-if="toast.variant !== 'default'"
            class="er-toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <template v-if="toast.variant === 'success'">
              <circle cx="12" cy="12" r="9" />
              <path d="m8.5 12.5 2.5 2.5 4.5-5.5" />
            </template>
            <template v-else-if="toast.variant === 'warning'">
              <path d="M12 4 2.8 19.5h18.4L12 4Z" />
              <path d="M12 10v4M12 17h.01" />
            </template>
            <template v-else-if="toast.variant === 'error'">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5M12 16h.01" />
            </template>
            <template v-else>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5.5M12 7.5h.01" />
            </template>
          </svg>
          <div class="er-toast-body">
            <p class="er-toast-title">{{ toast.title }}</p>
            <p v-if="toast.description" class="er-toast-description">{{ toast.description }}</p>
          </div>
          <button v-if="toast.action" type="button" class="er-toast-action" @click="runAction(toast)">
            {{ toast.action.label }}
          </button>
          <button type="button" class="er-toast-close" :aria-label="dismissLabel" @click="dismissToast(toast.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </li>
      </TransitionGroup>
    </section>
  </Portal>
</template>

<style>
@layer components {
  .er-toaster {
    position: fixed;
    inset: 0;
    z-index: var(--er-z-toast);
    display: flex;
    padding: 1rem;
    pointer-events: none;
  }

  .er-toaster[data-position^='top'] {
    align-items: flex-start;
  }

  .er-toaster[data-position^='bottom'] {
    align-items: flex-end;
  }

  .er-toaster[data-position$='left'] {
    justify-content: flex-start;
  }

  .er-toaster[data-position$='center'] {
    justify-content: center;
  }

  .er-toaster[data-position$='right'] {
    justify-content: flex-end;
  }

  .er-toast-list {
    position: relative;
    width: min(22rem, 100%);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-toast + .er-toast {
    margin-top: 0.5rem;
  }

  .er-toast {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--er-shadow-lg);
    pointer-events: auto;
  }

  .er-toast-icon {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    margin-top: 0.0625rem;
  }

  .er-toast[data-variant='success'] .er-toast-icon {
    color: var(--er-success);
  }

  .er-toast[data-variant='error'] .er-toast-icon {
    color: var(--er-destructive);
  }

  .er-toast[data-variant='warning'] .er-toast-icon {
    color: var(--er-warning);
  }

  .er-toast[data-variant='info'] .er-toast-icon {
    color: var(--er-info);
  }

  .er-toast-body {
    flex: 1;
    min-width: 0;
  }

  .er-toast-title,
  .er-toast-description {
    margin: 0;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .er-toast-title {
    font-weight: var(--er-weight-medium);
  }

  .er-toast-description {
    margin-top: 0.125rem;
    color: var(--er-muted-foreground);
  }

  .er-toast-action {
    flex-shrink: 0;
    align-self: center;
    height: 1.75rem;
    padding: 0 0.625rem;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: var(--er-weight-medium);
    cursor: pointer;
  }

  .er-toast-close {
    flex-shrink: 0;
    display: grid;
    place-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-toast-close:hover {
    color: var(--er-foreground);
  }

  .er-toast-close svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-toast-action:focus-visible,
  .er-toast-close:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-toast-enter-active,
  .er-toast-leave-active,
  .er-toast-move {
    transition:
      opacity calc(var(--er-duration) * 1.5) var(--er-ease),
      transform calc(var(--er-duration) * 1.5) var(--er-ease);
  }

  /* Leaving toasts step out of the flow so the rest can slide into place. */
  .er-toast-leave-active {
    position: absolute;
  }

  .er-toast-enter-from,
  .er-toast-leave-to {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  .er-toaster[data-position^='top'] .er-toast-enter-from,
  .er-toaster[data-position^='top'] .er-toast-leave-to {
    transform: translateY(-0.75rem);
  }
}
</style>
