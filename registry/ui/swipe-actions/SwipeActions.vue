<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** How far the row has to be dragged, as a share of the buttons' width, before it stays open. */
    threshold?: number
    disabled?: boolean
  }>(),
  { threshold: 0.4 },
)

/** Whether the buttons are uncovered. */
const open = defineModel<boolean>('open', { default: false })

const root = ref<HTMLElement | null>(null)
const actions = ref<HTMLElement | null>(null)
/** How far the row is pulled aside, in px, while a finger is on it. Undefined when nothing is being dragged. */
const dragged = ref<number>()

let startX = 0
let startY = 0
let startOffset = 0
let tracking = false
let decided: 'swipe' | 'scroll' | undefined

const width = () => actions.value?.offsetWidth ?? 0

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.pointerType === 'mouse') return
  startX = event.clientX
  startY = event.clientY
  startOffset = open.value ? width() : 0
  tracking = true
  decided = undefined
}

function onPointerMove(event: PointerEvent) {
  if (!tracking || decided === 'scroll') return
  const dx = event.clientX - startX
  const dy = event.clientY - startY
  if (!decided) {
    // Wait for the finger to show which way it is going: up and down belongs to the page.
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    decided = Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'scroll'
    if (decided === 'scroll') return
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  dragged.value = Math.max(0, Math.min(width(), startOffset - dx))
}

function onPointerUp() {
  if (dragged.value !== undefined) {
    const share = dragged.value / (width() || 1)
    // Opening needs a pull past the threshold; closing only needs the same pull back.
    open.value = open.value ? share > 1 - props.threshold : share > props.threshold
  }
  dragged.value = undefined
  tracking = false
  decided = undefined
}

/** A press anywhere else puts the row back, as it does in a phone's own lists. */
function onOutside(event: Event) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  document[isOpen ? 'addEventListener' : 'removeEventListener']('pointerdown', onOutside, true)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside, true))

/** Tabbing onto a button uncovers it; tabbing away covers it again. */
function onFocusOut(event: FocusEvent) {
  if (!actions.value?.contains(event.relatedTarget as Node)) open.value = false
}
</script>

<template>
  <div ref="root" class="er-swipe-actions" :data-state="open ? 'open' : 'closed'" :data-dragging="dragged !== undefined ? '' : undefined" @keydown.esc="open = false">
    <!-- The buttons. They sit under the row, so they are in the tab order whether or not it has been swiped. -->
    <div ref="actions" class="er-swipe-actions-buttons" @focusin="open = true" @focusout="onFocusOut">
      <slot name="actions" />
    </div>
    <div
      class="er-swipe-actions-content"
      :style="{ transform: `translateX(${dragged !== undefined ? `${-dragged}px` : open ? `${-width()}px` : '0'})` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <slot />
    </div>
  </div>
</template>

<style>
@layer components {
  .er-swipe-actions {
    position: relative;
    overflow: hidden;
  }

  .er-swipe-actions-buttons {
    position: absolute;
    inset: 0 0 0 auto;
    display: flex;
  }

  /* Each button: give it a background so it reads as a block of colour. */
  .er-swipe-actions-buttons > * {
    display: grid;
    place-items: center;
    min-width: 4.5rem;
    padding: 0 1rem;
    border: 0;
    background: var(--er-secondary);
    color: var(--er-secondary-foreground);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .er-swipe-actions-buttons > [data-destructive] {
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
  }

  .er-swipe-actions-buttons > :focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -3px;
  }

  .er-swipe-actions-content {
    position: relative;
    background: var(--er-background);
    /* Sideways drags are ours; up and down still scrolls the page. */
    touch-action: pan-y;
    transition: transform 200ms var(--er-ease);
  }

  .er-swipe-actions[data-dragging] .er-swipe-actions-content {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .er-swipe-actions-content {
      transition: none;
    }
  }
}
</style>
