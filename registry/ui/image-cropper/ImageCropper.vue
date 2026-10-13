<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Slider } from '../slider'
import { clampOffset, coverScale, sourceRect, type CropState } from './crop'

const props = withDefaults(
  defineProps<{
    /** The picture to crop: an address, or an object URL made from a chosen file. */
    src: string
    /** Shape of the frame, width over height: 1 for a square, 16 / 9 for a cover. */
    aspect?: number
    /** Show the frame as a circle, for avatars. The file that comes out is still a square. */
    round?: boolean
    /** How far in the picture can be zoomed. */
    maxZoom?: number
    /** Accessible name of the area that moves the picture. */
    label?: string
    zoomLabel?: string
    /** Needed to crop a picture from another site: set to "anonymous", and that site must allow it. */
    crossorigin?: 'anonymous' | 'use-credentials'
  }>(),
  { aspect: 1, maxZoom: 4, label: 'Position the picture', zoomLabel: 'Zoom' },
)

/** Where the picture sits and how far it is zoomed. Bind it to put a saved crop back. */
const state = defineModel<CropState>({ default: () => ({ x: 0, y: 0, zoom: 1 }) })

const frame = ref<HTMLElement | null>(null)
const image = ref<HTMLImageElement | null>(null)
const frameSize = reactive({ width: 0, height: 0 })
const natural = reactive({ width: 0, height: 0 })
const ready = computed(() => natural.width > 0 && frameSize.width > 0)
const scale = computed(() => (ready.value ? coverScale(natural, frameSize) * state.value.zoom : 1))

function set(next: Partial<CropState>) {
  if (!ready.value) return
  const zoom = Math.max(1, Math.min(next.zoom ?? state.value.zoom, props.maxZoom))
  state.value = clampOffset({ x: next.x ?? state.value.x, y: next.y ?? state.value.y, zoom }, natural, frameSize)
}

function onLoad() {
  natural.width = image.value?.naturalWidth ?? 0
  natural.height = image.value?.naturalHeight ?? 0
  set({})
}

// A different picture starts from the middle again.
watch(
  () => props.src,
  () => {
    natural.width = natural.height = 0
    state.value = { x: 0, y: 0, zoom: 1 }
  },
)

let observer: ResizeObserver | undefined
onMounted(() => {
  if (!frame.value) return
  observer = new ResizeObserver(([entry]) => {
    if (!entry) return
    // The offset is in px of the frame, so it is scaled along with the frame when the layout changes.
    const ratio = frameSize.width ? entry.contentRect.width / frameSize.width : 1
    frameSize.width = entry.contentRect.width
    frameSize.height = entry.contentRect.height
    set({ x: state.value.x * ratio, y: state.value.y * ratio })
  })
  observer.observe(frame.value)
  // A picture from the cache can be loaded before Vue is listening for it.
  if (image.value?.complete) onLoad()
})
onBeforeUnmount(() => observer?.disconnect())

// Dragging, and pinching with two fingers.
const pointers = new Map<number, { x: number; y: number }>()
let pinchStart: { distance: number; zoom: number } | undefined

const spread = () => {
  const [a, b] = [...pointers.values()]
  return Math.hypot(a!.x - b!.x, a!.y - b!.y)
}

function onPointerDown(event: PointerEvent) {
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  pinchStart = pointers.size === 2 ? { distance: spread(), zoom: state.value.zoom } : undefined
}

function onPointerMove(event: PointerEvent) {
  const previous = pointers.get(event.pointerId)
  if (!previous) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size === 2 && pinchStart) set({ zoom: pinchStart.zoom * (spread() / (pinchStart.distance || 1)) })
  else if (pointers.size === 1) set({ x: state.value.x + event.clientX - previous.x, y: state.value.y + event.clientY - previous.y })
}

function onPointerUp(event: PointerEvent) {
  pointers.delete(event.pointerId)
  pinchStart = undefined
}

function onWheel(event: WheelEvent) {
  set({ zoom: state.value.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08) })
}

function onKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 32 : 8
  const moves: Record<string, Partial<CropState>> = {
    ArrowLeft: { x: state.value.x - step },
    ArrowRight: { x: state.value.x + step },
    ArrowUp: { y: state.value.y - step },
    ArrowDown: { y: state.value.y + step },
    '+': { zoom: state.value.zoom * 1.1 },
    '=': { zoom: state.value.zoom * 1.1 },
    '-': { zoom: state.value.zoom / 1.1 },
  }
  if (!moves[event.key]) return
  event.preventDefault()
  set(moves[event.key]!)
}

/**
 * Cuts out what is inside the frame. `width` is how wide the result is in px; the height follows from the shape
 * of the frame. Resolves to nothing if the picture has not loaded, or comes from a site that does not allow it.
 */
function crop(options: { width?: number; type?: string; quality?: number } = {}): Promise<Blob | null> {
  if (!ready.value || !image.value) return Promise.resolve(null)
  const source = sourceRect(state.value, natural, frameSize)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(options.width ?? Math.min(1024, source.width))
  canvas.height = Math.round(canvas.width / props.aspect)
  canvas.getContext('2d')?.drawImage(image.value, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, options.type ?? 'image/jpeg', options.quality ?? 0.9)
    } catch {
      // A picture from another site, loaded without permission, cannot be read back out of a canvas.
      resolve(null)
    }
  })
}

function reset() {
  set({ x: 0, y: 0, zoom: 1 })
}

defineExpose({ crop, reset })
</script>

<template>
  <div class="er-image-cropper" :data-round="round ? '' : undefined">
    <!-- A named, focusable area: the arrow keys move the picture, and plus and minus zoom it. -->
    <div
      ref="frame"
      class="er-image-cropper-frame"
      role="application"
      tabindex="0"
      :aria-label="label"
      aria-description="Drag, or use the arrow keys, to move the picture. Plus and minus zoom."
      :style="{ aspectRatio: String(aspect) }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.prevent="onWheel"
      @keydown="onKeydown"
    >
      <img
        ref="image"
        :src="src"
        alt=""
        draggable="false"
        :crossorigin="crossorigin"
        :style="{ width: `${natural.width}px`, height: `${natural.height}px`, transform: `translate(-50%, -50%) translate(${state.x}px, ${state.y}px) scale(${scale})`, visibility: ready ? 'visible' : 'hidden' }"
        @load="onLoad"
      />
      <div class="er-image-cropper-mask" aria-hidden="true" />
    </div>
    <label class="er-image-cropper-zoom">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14ZM20 20l-4-4M8 11h6" /></svg>
      <Slider :model-value="state.zoom" :min="1" :max="maxZoom" :step="0.01" :aria-label="zoomLabel" :aria-valuetext="`${Math.round(state.zoom * 100)}%`" @update:model-value="set({ zoom: $event })" />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14ZM20 20l-4-4M8 11h6M11 8v6" /></svg>
    </label>
  </div>
</template>

<style>
@layer components {
  .er-image-cropper {
    display: grid;
    gap: 0.75rem;
    width: 100%;
  }

  .er-image-cropper-frame {
    position: relative;
    width: 100%;
    border-radius: var(--er-radius-lg);
    background: var(--er-muted);
    overflow: hidden;
    cursor: grab;
    /* The picture is moved by dragging, so the page must not scroll or zoom under the same fingers. */
    touch-action: none;
    user-select: none;
  }

  .er-image-cropper-frame:active {
    cursor: grabbing;
  }

  .er-image-cropper-frame:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-image-cropper-frame img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    pointer-events: none;
  }

  /* Thirds, to line things up by; and for a round crop, everything outside the circle dimmed. */
  .er-image-cropper-mask {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(to right, transparent calc(100% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(100% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(100% / 3 + 0.500px), transparent calc(100% / 3 + 0.500px), transparent calc(200% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(200% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(200% / 3 + 0.500px), transparent calc(200% / 3 + 0.500px)),
      linear-gradient(to bottom, transparent calc(100% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(100% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(100% / 3 + 0.500px), transparent calc(100% / 3 + 0.500px), transparent calc(200% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(200% / 3 - 0.500px), oklch(1 0 0 / 35%) calc(200% / 3 + 0.500px), transparent calc(200% / 3 + 0.500px));
    box-shadow: inset 0 0 0 1px oklch(1 0 0 / 40%);
    pointer-events: none;
  }

  .er-image-cropper[data-round] .er-image-cropper-mask {
    background: none;
    border-radius: 50%;
    box-shadow:
      0 0 0 100vmax oklch(0 0 0 / 55%),
      inset 0 0 0 2px oklch(1 0 0 / 70%);
  }

  .er-image-cropper-zoom {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    color: var(--er-muted-foreground);
  }

  .er-image-cropper-zoom svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}
</style>
