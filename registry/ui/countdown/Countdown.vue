<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { timeLeft, timeLeftInWords, type TimeLeft } from './time'

const props = withDefaults(
  defineProps<{
    /** The moment being counted down to: a Date, a timestamp, or text that Date understands (ISO 8601 is safest). */
    to: Date | number | string
    /** Accessible name: what is being counted down to. */
    label?: string
    /** Shown once the time has passed. */
    doneText?: string
  }>(),
  { label: 'Time left', doneText: 'Ended' },
)

const emit = defineEmits<{
  /** The moment arrived. Sent once. */
  done: []
}>()

defineSlots<{
  /** Draw the time left your own way. */
  default?: (props: TimeLeft) => unknown
}>()

// The clock is only read after mount: a server and a browser never agree on what time it is,
// and text that differs between them breaks hydration. Until then the digits are dashes.
const now = ref<number>()
const target = computed(() => new Date(props.to).getTime())
const left = computed(() => (now.value === undefined ? undefined : timeLeft(target.value - now.value)))
const two = (count: number) => String(count).padStart(2, '0')

let timer: ReturnType<typeof setTimeout> | undefined
let announced = false

function tick() {
  now.value = Date.now()
  if (target.value - now.value <= 0) {
    if (!announced) emit('done')
    announced = true
    return
  }
  // Wake just after the next whole second, so the digits change on the beat instead of drifting.
  timer = setTimeout(tick, 1000 - ((target.value - now.value) % 1000) + 5)
}

onMounted(tick)
watch(target, () => {
  clearTimeout(timer)
  announced = false
  tick()
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <!-- role="timer" is silent by design: a screen reader reads it when asked, and is not interrupted every second. -->
  <span class="er-countdown" role="timer" :aria-label="left ? `${label}: ${left.done ? doneText : timeLeftInWords(left)}` : label">
    <slot v-if="left" v-bind="left">
      <template v-if="left.done">{{ doneText }}</template>
      <span v-else class="er-countdown-parts" aria-hidden="true">
        <span v-if="left.days"><b>{{ left.days }}</b>d</span>
        <span><b>{{ two(left.hours) }}</b>h</span>
        <span><b>{{ two(left.minutes) }}</b>m</span>
        <span><b>{{ two(left.seconds) }}</b>s</span>
      </span>
    </slot>
    <span v-else class="er-countdown-parts" aria-hidden="true">
      <span><b>--</b>h</span>
      <span><b>--</b>m</span>
      <span><b>--</b>s</span>
    </span>
  </span>
</template>

<style>
@layer components {
  .er-countdown {
    display: inline-flex;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
  }

  .er-countdown-parts {
    display: inline-flex;
    gap: 0.375rem;
  }

  .er-countdown-parts span {
    color: var(--er-muted-foreground);
  }

  .er-countdown-parts b {
    margin-right: 0.0625rem;
    color: var(--er-foreground);
    font-weight: var(--er-weight-semibold);
  }
}
</style>
