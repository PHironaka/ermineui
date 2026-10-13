<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '../button'
import { Spinner } from '../spinner'

const props = withDefaults(
  defineProps<{
    /** Set while a page is on its way. Nothing more is asked for until it is false again. */
    loading?: boolean
    /** There is nothing left to load. */
    done?: boolean
    /** What went wrong with the last load. Loading stops until "Try again" is pressed. */
    error?: string
    /** Ask only when the button is pressed, never by scrolling: for pages with a footer people need to reach. */
    manual?: boolean
    /** How far before the end to start loading, as a CSS margin. */
    margin?: string
    loadLabel?: string
    loadingLabel?: string
    retryLabel?: string
    doneLabel?: string
  }>(),
  { margin: '300px', loadLabel: 'Load more', loadingLabel: 'Loading more…', retryLabel: 'Try again', doneLabel: 'You have reached the end.' },
)

const emit = defineEmits<{
  /** The end is in view, or the button was pressed. Fetch the next page and add it to your list. */
  load: []
}>()

const sentinel = ref<HTMLElement | null>(null)
const inView = ref(false)
let observer: IntersectionObserver | undefined

const idle = () => !props.loading && !props.done && !props.error

function load() {
  if (!props.loading && !props.done) emit('load')
}

onMounted(() => {
  // Without an observer (a very old browser) the button is still there, so the list can always be continued.
  if (!sentinel.value || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return
      inView.value = entry.isIntersecting
      if (entry.isIntersecting && !props.manual && idle()) emit('load')
    },
    { rootMargin: props.margin },
  )
  observer.observe(sentinel.value)
})

onBeforeUnmount(() => observer?.disconnect())

// A short page can leave the end in view after it loads: ask again rather than wait for a scroll that cannot happen.
watch(
  () => props.loading,
  (loading) => {
    if (!loading && inView.value && !props.manual && idle()) emit('load')
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="er-infinite-scroll">
    <slot />
    <div ref="sentinel" class="er-infinite-scroll-end">
      <!-- Always in the page, so each change of state is announced. -->
      <p class="er-infinite-scroll-status" role="status">
        <template v-if="loading"><Spinner label="" /> {{ loadingLabel }}</template>
        <template v-else-if="error">{{ error }}</template>
        <!-- What to say when there is no more. -->
        <slot v-else-if="done" name="done">{{ doneLabel }}</slot>
      </p>
      <Button v-if="!loading && !done && (error || manual)" variant="outline" size="sm" @click="load">{{ error ? retryLabel : loadLabel }}</Button>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-infinite-scroll-end {
    display: grid;
    justify-items: center;
    gap: 0.5rem;
    min-height: 1px;
    padding-block: 1rem;
  }

  .er-infinite-scroll-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
  }

  .er-infinite-scroll-status:empty {
    display: none;
  }
}
</style>
