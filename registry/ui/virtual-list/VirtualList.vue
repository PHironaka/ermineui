<script setup lang="ts" generic="T">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    items: readonly T[]
    /** Height of every row, in px. All rows must be the same height. */
    itemHeight: number
    /** Extra rows drawn above and below what is in view, so fast scrolling does not show gaps. */
    overscan?: number
    /** What the list holds, for screen readers. */
    label?: string
  }>(),
  { overscan: 4 },
)

defineSlots<{
  default: (props: { item: T; index: number }) => unknown
}>()

const root = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewport = ref(0)

let observer: ResizeObserver | undefined
onMounted(() => {
  if (!root.value) return
  viewport.value = root.value.clientHeight
  observer = new ResizeObserver(() => {
    viewport.value = root.value?.clientHeight ?? 0
  })
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

const range = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
  const end = Math.min(props.items.length, Math.ceil((scrollTop.value + viewport.value) / props.itemHeight) + props.overscan)
  return { start, end }
})
const rows = computed(() => props.items.slice(range.value.start, range.value.end).map((item, offset) => ({ item, index: range.value.start + offset })))

function onScroll() {
  scrollTop.value = root.value?.scrollTop ?? 0
}

/** Scroll so that the row at `index` is in view. */
function scrollToIndex(index: number) {
  root.value?.scrollTo({ top: Math.max(0, Math.min(index, props.items.length - 1)) * props.itemHeight })
}

defineExpose({ scrollToIndex })
</script>

<template>
  <!-- Give it a height (in CSS or a style attribute); it scrolls inside that. -->
  <div ref="root" class="sb-virtual-list" role="list" tabindex="0" :aria-label="label" @scroll.passive="onScroll">
    <!-- One tall spacer holds the full scroll height; the few real rows are shifted into place inside it. -->
    <div class="sb-virtual-list-spacer" :style="{ height: `${items.length * itemHeight}px` }">
      <div :style="{ transform: `translateY(${range.start * itemHeight}px)` }">
        <!-- Each row says where it sits in the whole list, since most of the list is not in the page. -->
        <div
          v-for="row in rows"
          :key="row.index"
          role="listitem"
          class="sb-virtual-list-item"
          :aria-setsize="items.length"
          :aria-posinset="row.index + 1"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="row.item" :index="row.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer components {
  .sb-virtual-list {
    position: relative;
    height: 20rem;
    max-height: 100%;
    border-radius: var(--sb-radius-md);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--sb-input) transparent;
  }

  .sb-virtual-list:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-virtual-list-spacer {
    overflow: hidden;
  }

  .sb-virtual-list-item {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
  }
}
</style>
