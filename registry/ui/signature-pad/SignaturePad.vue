<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Height of the signing area in px. The width follows its container. */
    height?: number
    /** Thickness of the line in px. */
    lineWidth?: number
    /** Ink colour of the exported image. Dark by default, so it reads on a white document whatever the theme. */
    exportColor?: string
    /** What is being signed, for screen readers. */
    label?: string
    clearLabel?: string
    disabled?: boolean
  }>(),
  { height: 160, lineWidth: 2, exportColor: '#111111', label: 'Signature', clearLabel: 'Clear' },
)

/**
 * The signature as a PNG data URL with a transparent background, or '' while the pad is empty.
 * It is the picture only: who signed and when is for your form to record.
 */
const model = defineModel<string>({ default: '' })

type Point = { x: number; y: number }
const canvas = ref<HTMLCanvasElement | null>(null)
/** Every stroke drawn, as points measured as a share of the pad (0 to 1), so it survives a resize. */
const strokes = ref<Point[][]>([])
let drawing: Point[] | undefined
let observer: ResizeObserver | undefined

function paint(target: HTMLCanvasElement, width: number, height: number, color: string, scale: number) {
  const context = target.getContext('2d')
  if (!context) return
  target.width = Math.round(width * scale)
  target.height = Math.round(height * scale)
  context.scale(scale, scale)
  context.lineWidth = props.lineWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = color
  context.fillStyle = color

  for (const stroke of strokes.value) {
    const points = stroke.map((point) => ({ x: point.x * width, y: point.y * height }))
    if (points.length === 1) {
      // A single tap is a dot (the dot of an i, a full stop).
      context.beginPath()
      context.arc(points[0]!.x, points[0]!.y, props.lineWidth / 2, 0, Math.PI * 2)
      context.fill()
      continue
    }
    // Curves through the midpoints between samples: smoother than joining the samples with straight lines.
    context.beginPath()
    context.moveTo(points[0]!.x, points[0]!.y)
    for (let i = 1; i < points.length - 1; i++) {
      const middle = { x: (points[i]!.x + points[i + 1]!.x) / 2, y: (points[i]!.y + points[i + 1]!.y) / 2 }
      context.quadraticCurveTo(points[i]!.x, points[i]!.y, middle.x, middle.y)
    }
    const last = points[points.length - 1]!
    context.lineTo(last.x, last.y)
    context.stroke()
  }
}

function redraw() {
  const el = canvas.value
  if (!el) return
  // On screen the ink follows the theme's text colour; the exported image uses exportColor.
  paint(el, el.clientWidth, el.clientHeight, getComputedStyle(el).color, window.devicePixelRatio || 1)
}

/** The signature as a PNG data URL, or '' if nothing has been drawn. */
function toDataURL(): string {
  const el = canvas.value
  if (!el || !strokes.value.length) return ''
  const copy = document.createElement('canvas')
  paint(copy, el.clientWidth, el.clientHeight, props.exportColor, 2)
  return copy.toDataURL('image/png')
}

function clear() {
  strokes.value = []
  redraw()
  model.value = ''
}

function point(event: PointerEvent): Point {
  const box = canvas.value!.getBoundingClientRect()
  return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height }
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  canvas.value!.setPointerCapture(event.pointerId)
  drawing = [point(event)]
  strokes.value = [...strokes.value, drawing]
  redraw()
}

function onPointerMove(event: PointerEvent) {
  if (!drawing) return
  // A fast pen reports several positions between frames; using them all keeps quick strokes smooth.
  for (const sample of event.getCoalescedEvents?.() ?? [event]) drawing.push(point(sample))
  redraw()
}

function onPointerUp() {
  if (!drawing) return
  drawing = undefined
  model.value = toDataURL()
}

watch(
  () => [props.lineWidth, props.exportColor],
  () => {
    redraw()
    if (strokes.value.length) model.value = toDataURL()
  },
)

onMounted(() => {
  redraw()
  if (!canvas.value) return
  observer = new ResizeObserver(redraw)
  observer.observe(canvas.value)
})
onBeforeUnmount(() => observer?.disconnect())

defineExpose({ clear, toDataURL })
</script>

<template>
  <div class="er-signature-pad" :data-disabled="disabled ? '' : undefined">
    <!-- A drawn signature cannot be made by keyboard or screen reader. Always offer another way to sign
         beside it, such as typing a name: the default slot is the place for that. -->
    <canvas
      ref="canvas"
      class="er-signature-pad-canvas"
      role="img"
      :aria-label="`${label}: ${strokes.length ? 'signed' : 'empty'}`"
      :style="{ height: `${height}px` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <div class="er-signature-pad-footer">
      <span class="er-signature-pad-hint"><slot>Sign above</slot></span>
      <button type="button" class="er-signature-pad-clear" :disabled="disabled || !strokes.length" @click="clear">{{ clearLabel }}</button>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-signature-pad {
    display: grid;
    gap: 0.375rem;
    width: 100%;
    min-width: 0;
  }

  .er-signature-pad-canvas {
    display: block;
    width: 100%;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    /* A baseline to sign on, drawn in CSS so it is never part of the exported image. */
    background:
      linear-gradient(var(--er-border), var(--er-border)) left 1rem bottom 2.25rem / calc(100% - 2rem) 1px no-repeat,
      var(--er-input-background);
    /* The ink colour on screen. */
    color: var(--er-foreground);
    cursor: crosshair;
    /* Without this a finger drawing a stroke would scroll the page instead. */
    touch-action: none;
  }

  .er-signature-pad[data-disabled] .er-signature-pad-canvas {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-signature-pad-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-signature-pad-clear {
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-weight: var(--er-weight-medium);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .er-signature-pad-clear:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .er-signature-pad-clear:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }
}
</style>
