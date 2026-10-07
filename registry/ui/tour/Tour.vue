<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useFloating } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { Button } from '../button'
import type { TourStep } from './types'

const props = withDefaults(
  defineProps<{
    steps: readonly TourStep[]
    backLabel?: string
    nextLabel?: string
    doneLabel?: string
    closeLabel?: string
    /** Space left around the highlighted element, in px. */
    padding?: number
  }>(),
  { backLabel: 'Back', nextLabel: 'Next', doneLabel: 'Done', closeLabel: 'End tour', padding: 6 },
)

const emit = defineEmits<{
  /** The reader pressed Done on the last step. */
  finish: []
}>()

const open = defineModel<boolean>('open', { default: false })
/** The step on screen, starting at 1. */
const step = defineModel<number>('step', { default: 1 })

/** A see-through box laid over the target. Everything around it is dimmed, and the card points at it. */
const spotlight = ref<HTMLElement | null>(null)
const card = ref<HTMLElement | null>(null)
const titleId = useId()

const index = computed(() => Math.max(0, Math.min(step.value - 1, props.steps.length - 1)))
const current = computed(() => props.steps[index.value])
const isLast = computed(() => index.value === props.steps.length - 1)

function target(): HTMLElement | null {
  const source = current.value?.target
  if (!source) return null
  return (typeof source === 'string' ? document.querySelector<HTMLElement>(source) : source()) ?? null
}

/** Lays the spotlight over the target. With no target on the page, it shrinks to the middle of the window. */
function place() {
  const el = spotlight.value
  if (!el) return
  const box = target()?.getBoundingClientRect()
  const pad = props.padding
  const rect = box
    ? { left: box.left - pad, top: box.top - pad, width: box.width + pad * 2, height: box.height + pad * 2 }
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }
  Object.assign(el.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` })
}

const floatingOptions = computed(() => ({ side: current.value?.side ?? ('bottom' as const), align: 'center' as const, sideOffset: 12 }))
// The options object is read on every update, so a getter keeps the side in step with the current step.
const floating = useFloating(spotlight, card, open, {
  get side() {
    return floatingOptions.value.side
  },
  align: 'center',
  sideOffset: 12,
})

async function show() {
  await nextTick()
  // Brought into view first, then measured — otherwise the card would point at where it used to be.
  target()?.scrollIntoView({ block: 'center', inline: 'nearest' })
  place()
  floating.update()
  card.value?.focus({ preventScroll: true })
}

watch(
  [open, index],
  ([isOpen], _previous, onCleanup) => {
    if (!isOpen) return
    show()
    const follow = () => {
      place()
      floating.update()
    }
    window.addEventListener('scroll', follow, { capture: true, passive: true })
    window.addEventListener('resize', follow)
    onCleanup(() => {
      window.removeEventListener('scroll', follow, { capture: true })
      window.removeEventListener('resize', follow)
    })
  },
  { immediate: true, flush: 'post' },
)

function close() {
  open.value = false
}

function next() {
  if (!isLast.value) {
    step.value = index.value + 2
    return
  }
  emit('finish')
  close()
}

useLayer(card, open, {
  modal: true,
  loopFocus: true,
  // A press on the dimmed page does not end the tour by accident; Escape and the close button do.
  onDismiss: (reason) => reason === 'escape' && close(),
  initialFocus: () => card.value,
})
</script>

<template>
  <Portal>
    <template v-if="open && current">
      <div ref="spotlight" class="sb-tour-spotlight" aria-hidden="true" />
      <div ref="card" role="dialog" aria-modal="true" tabindex="-1" class="sb-floating sb-tour" :aria-labelledby="titleId">
        <button type="button" class="sb-tour-close" :aria-label="closeLabel" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <!-- Announced on every step, since the card stays put while its words change. -->
        <div aria-live="polite">
          <p :id="titleId" class="sb-tour-title">{{ current.title }}</p>
          <p v-if="current.description" class="sb-tour-description">{{ current.description }}</p>
        </div>
        <div class="sb-tour-footer">
          <span class="sb-tour-count">{{ index + 1 }} of {{ steps.length }}</span>
          <Button v-if="index > 0" size="sm" variant="outline" @click="step = index">{{ backLabel }}</Button>
          <Button size="sm" @click="next">{{ isLast ? doneLabel : nextLabel }}</Button>
        </div>
      </div>
    </template>
  </Portal>
</template>

<style>
@layer components {
  /* One element does both jobs: its huge shadow dims the page, and the element itself is the hole. */
  .sb-tour-spotlight {
    position: fixed;
    z-index: var(--sb-z-overlay);
    border-radius: var(--sb-radius-md);
    box-shadow: 0 0 0 100vmax var(--sb-overlay);
    pointer-events: none;
    transition:
      left var(--sb-duration) var(--sb-ease),
      top var(--sb-duration) var(--sb-ease),
      width var(--sb-duration) var(--sb-ease),
      height var(--sb-duration) var(--sb-ease);
  }

  .sb-tour {
    display: grid;
    gap: 0.75rem;
    width: 20rem;
    padding: 1rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--sb-shadow-lg);
  }

  .sb-tour-title {
    margin: 0;
    padding-right: 1.5rem;
    font-weight: 600;
  }

  .sb-tour-description {
    margin: 0.25rem 0 0;
    color: var(--sb-muted-foreground);
    line-height: 1.5;
  }

  .sb-tour-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sb-tour-count {
    margin-right: auto;
    color: var(--sb-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .sb-tour-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: grid;
    place-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-muted-foreground);
    cursor: pointer;
  }

  .sb-tour-close:hover {
    color: var(--sb-foreground);
  }

  .sb-tour-close:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-tour-close svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
