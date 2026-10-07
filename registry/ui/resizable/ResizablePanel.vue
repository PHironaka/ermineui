<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRef, useId } from 'vue'
import { useResizable } from './context'

const props = withDefaults(
  defineProps<{
    /** Starting share of the space, in percent. Panels without one split what is left. */
    defaultSize?: number
    /** Smallest share it can be dragged down to, in percent. */
    minSize?: number
  }>(),
  { minSize: 10 },
)

const group = useResizable()
const id = useId()
const root = ref<HTMLElement | null>(null)
/** True while the content is bigger than the panel, which is when the panel scrolls. */
const scrollable = ref(false)

const unregister = group.registerPanel({ id, defaultSize: toRef(props, 'defaultSize'), minSize: toRef(props, 'minSize') })

const size = computed(() => group.sizes.value[group.panels.value.findIndex((panel) => panel.id === id)] ?? 0)

let observer: ResizeObserver | undefined
onMounted(() => {
  const el = root.value
  if (!el) return
  const measure = () => {
    scrollable.value = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1
  }
  // Watches the panel and what is in it: either changing size can start or stop the scrolling.
  observer = new ResizeObserver(measure)
  observer.observe(el)
  for (const child of Array.from(el.children)) observer.observe(child)
  measure()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  unregister()
})
</script>

<template>
  <!-- A panel that scrolls can be focused, so its content can be scrolled from the keyboard too. -->
  <div :id="id" ref="root" class="sb-resizable-panel" :tabindex="scrollable ? 0 : undefined" :style="{ '--sb-panel-size': size }">
    <slot :size="size" />
  </div>
</template>
