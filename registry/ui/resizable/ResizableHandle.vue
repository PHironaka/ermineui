<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { useResizable } from './context'

const props = withDefaults(
  defineProps<{
    /** Show a small grip in the middle of the line. */
    grip?: boolean
    /** How far one press of an arrow key moves it, in percent. */
    step?: number
    /** Accessible name. */
    label?: string
  }>(),
  { step: 5, label: 'Resize' },
)

const group = useResizable()
const { index, unregister } = group.registerHandle(useId())
onBeforeUnmount(unregister)

const dragging = ref(false)
const before = computed(() => group.panels.value[index.value])
const after = computed(() => group.panels.value[index.value + 1])
const size = computed(() => group.sizes.value[index.value] ?? 0)
const pair = computed(() => size.value + (group.sizes.value[index.value + 1] ?? 0))
const min = computed(() => before.value?.minSize.value ?? 0)
const max = computed(() => pair.value - (after.value?.minSize.value ?? 0))

let start = { position: 0, size: 0 }
const along = (event: PointerEvent) => (group.direction.value === 'horizontal' ? event.clientX : event.clientY)

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  dragging.value = true
  start = { position: along(event), size: size.value }
  // Stops text being selected across the panels while dragging.
  event.preventDefault()
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  const extent = group.extent()
  if (extent > 0) group.resize(index.value, start.size + ((along(event) - start.position) / extent) * 100)
}

function onKeydown(event: KeyboardEvent) {
  const horizontal = group.direction.value === 'horizontal'
  if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) group.resize(index.value, size.value - props.step)
  else if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) group.resize(index.value, size.value + props.step)
  else if (event.key === 'Home') group.resize(index.value, min.value)
  else if (event.key === 'End') group.resize(index.value, max.value)
  else return
  event.preventDefault()
}
</script>

<template>
  <!-- A focusable separator with a value is how a splitter is announced; the value is the size of the panel before it. -->
  <div
    role="separator"
    tabindex="0"
    class="sb-resizable-handle"
    :aria-orientation="group.direction.value === 'horizontal' ? 'vertical' : 'horizontal'"
    :aria-label="label"
    :aria-controls="before?.id"
    :aria-valuenow="Math.round(size)"
    :aria-valuemin="Math.round(min)"
    :aria-valuemax="Math.round(max)"
    :data-dragging="dragging ? '' : undefined"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="dragging = false"
    @pointercancel="dragging = false"
    @keydown="onKeydown"
  >
    <span v-if="grip" class="sb-resizable-grip" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
    </span>
  </div>
</template>
