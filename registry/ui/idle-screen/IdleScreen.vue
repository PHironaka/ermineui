<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { lockScroll } from '../../lib/scroll-lock'
import { Button } from '../button'
import { useIdle } from './use-idle'

const props = withDefaults(
  defineProps<{
    /** How long with no activity before the screen shows, in ms. Five minutes unless set. */
    timeout?: number
    /** Stop watching for idleness, for pages where it does not matter or while something plays. */
    disabled?: boolean
    /** Hide the screen on any mouse movement, key or touch, like a screensaver. Otherwise it waits for the button or Escape. */
    resumeOnActivity?: boolean
    title?: string
    description?: string
    resumeLabel?: string
    /** The line that says when the reader left. */
    formatSince?: (since: Date) => string
    /** Heading level of the title. */
    titleAs?: string
  }>(),
  {
    timeout: 5 * 60_000,
    title: 'Welcome back',
    description: 'Everything is where you left it.',
    resumeLabel: 'Continue',
    formatSince: (since: Date) => `Away since ${since.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}.`,
    titleAs: 'h2',
  },
)

/** Whether the screen is showing. Set it to show the screen yourself, or to hide it. */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** The screen came up. `since` is when the reader was last active. */
  idle: [since: Date]
  /** The reader came back, after `away` ms. Refresh anything that may have gone stale. */
  resume: [away: number]
}>()

defineSlots<{
  /** More under the description: what changed while they were away, a sign-out notice. */
  default?: (props: { since: Date }) => unknown
  /** Buttons of your own in place of the one that resumes. Call `resume` from them. */
  actions?: (props: { resume: () => void }) => unknown
}>()

const id = useId()
const content = ref<HTMLElement | null>(null)
const { idle, lastActive, reset } = useIdle(() => props.timeout, { enabled: () => !props.disabled })

const since = ref(new Date())
const now = ref(new Date())
const clock = computed(() => now.value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }))

watch(idle, (isIdle) => {
  if (isIdle) open.value = true
  else if (props.resumeOnActivity) open.value = false
})

watch(open, (isOpen, _previous, onCleanup) => {
  if (!isOpen) return
  // Shown by the timer, the reader left when they were last active; shown by you, they leave now.
  since.value = new Date(idle.value ? lastActive.value : Date.now())
  emit('idle', since.value)

  now.value = new Date()
  const tick = setInterval(() => (now.value = new Date()), 1000)
  const unlock = lockScroll()
  onCleanup(() => {
    clearInterval(tick)
    unlock()
    emit('resume', Date.now() - since.value.getTime())
    reset()
  })
})

function resume() {
  open.value = false
}

useLayer(content, open, {
  modal: true,
  loopFocus: true,
  onDismiss: (reason) => {
    if (reason === 'escape') resume()
  },
})
</script>

<template>
  <Portal>
    <Transition name="er-idle-screen">
      <div v-if="open" class="er-idle-screen">
        <div
          ref="content"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="er-idle-screen-content"
          :aria-labelledby="`${id}-title`"
          :aria-describedby="`${id}-description`"
        >
          <!-- The clock is for a glance from across the room; read aloud it would only repeat itself. -->
          <p class="er-idle-screen-clock" aria-hidden="true">{{ clock }}</p>
          <component :is="titleAs" :id="`${id}-title`" class="er-idle-screen-title">{{ title }}</component>
          <p :id="`${id}-description`" class="er-idle-screen-description">{{ formatSince(since) }} {{ description }}</p>
          <slot :since="since" />
          <div class="er-idle-screen-actions">
            <slot name="actions" :resume="resume">
              <Button size="lg" @click="resume">{{ resumeLabel }}</Button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .er-idle-screen {
    position: fixed;
    inset: 0;
    z-index: var(--er-z-overlay);
    display: grid;
    place-items: center;
    padding: 1.5rem;
    overflow-y: auto;
    background: color-mix(in oklab, var(--er-background) 80%, transparent);
    color: var(--er-foreground);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    backdrop-filter: blur(20px) saturate(1.2);
  }

  .er-idle-screen-content {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    max-width: 28rem;
    text-align: center;
    outline: none;
  }

  .er-idle-screen-clock {
    margin: 0 0 0.5rem;
    font-size: clamp(3.5rem, 16vw, 6.5rem);
    font-weight: 250;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .er-idle-screen-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .er-idle-screen-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.9375rem;
    line-height: 1.5;
    text-wrap: pretty;
  }

  .er-idle-screen-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .er-idle-screen-enter-active,
  .er-idle-screen-leave-active,
  .er-idle-screen-enter-active .er-idle-screen-content {
    transition:
      opacity calc(var(--er-duration) * 3) var(--er-ease),
      transform calc(var(--er-duration) * 3) var(--er-ease);
  }

  .er-idle-screen-enter-from,
  .er-idle-screen-leave-to {
    opacity: 0;
  }

  .er-idle-screen-enter-from .er-idle-screen-content {
    transform: translateY(0.5rem);
  }
}
</style>
