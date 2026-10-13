<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Accessible name: what is going past, e.g. "Customers". */
    label: string
    /** How fast it moves, in px per second. */
    speed?: number
    direction?: 'left' | 'right'
    /** Space between items, and between the end of the row and its start, as a CSS length. */
    gap?: string
    /** Stop while the pointer is over it or something inside has focus. */
    pauseOnHover?: boolean
    /** Fade the two ends out, so items appear and leave rather than being cut off. */
    fade?: boolean
    pauseLabel?: string
    playLabel?: string
  }>(),
  { speed: 40, direction: 'left', gap: '2rem', pauseOnHover: true, fade: true, pauseLabel: 'Pause', playLabel: 'Play' },
)

/** Whether it is standing still because the button was pressed. */
const paused = defineModel<boolean>('paused', { default: false })

const group = ref<HTMLElement | null>(null)
/** One trip takes as long as the row is wide, so the speed is the same whatever is in it. */
const duration = ref(20)
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!group.value || !('ResizeObserver' in window)) return
  observer = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width > 0) duration.value = entry.contentRect.width / Math.max(1, props.speed)
  })
  observer.observe(group.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    class="er-marquee"
    role="group"
    :aria-label="label"
    :data-direction="direction"
    :data-paused="paused ? '' : undefined"
    :data-pause-on-hover="pauseOnHover ? '' : undefined"
    :data-fade="fade ? '' : undefined"
    :style="{ '--er-marquee-duration': `${duration}s`, '--er-marquee-gap': gap }"
  >
    <div class="er-marquee-track">
      <div ref="group" class="er-marquee-group"><slot /></div>
      <!-- A second copy follows the first so the loop has no gap. It is for the eye only, and cannot be tabbed into. -->
      <div class="er-marquee-group" aria-hidden="true" inert><slot /></div>
    </div>
    <!-- Anything that moves for more than five seconds has to be stoppable. -->
    <button type="button" class="er-marquee-toggle" :aria-label="paused ? playLabel : pauseLabel" :aria-pressed="paused" @click="paused = !paused">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path v-if="paused" d="M8 5.500v13l11-6.500Z" />
        <path v-else d="M7 5h3.500v14H7ZM13.500 5H17v14h-3.500Z" />
      </svg>
    </button>
  </div>
</template>

<style>
@layer components {
  .er-marquee {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .er-marquee[data-fade] {
    mask-image: linear-gradient(to right, transparent, #000 3rem, #000 calc(100% - 3rem), transparent);
  }

  .er-marquee-track {
    display: flex;
    gap: var(--er-marquee-gap);
    width: max-content;
    animation: er-marquee var(--er-marquee-duration) linear infinite;
  }

  .er-marquee[data-direction='right'] .er-marquee-track {
    animation-direction: reverse;
  }

  .er-marquee[data-paused] .er-marquee-track,
  .er-marquee[data-pause-on-hover]:hover .er-marquee-track,
  .er-marquee[data-pause-on-hover]:focus-within .er-marquee-track {
    animation-play-state: paused;
  }

  .er-marquee-group {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--er-marquee-gap);
  }

  /* One group and one gap: exactly where the copy takes the place of the original. */
  @keyframes er-marquee {
    to {
      transform: translateX(calc(-50% - var(--er-marquee-gap) / 2));
    }
  }

  .er-marquee-toggle {
    position: absolute;
    right: 0.5rem;
    bottom: 0.25rem;
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 1px solid var(--er-border);
    border-radius: 50%;
    background: var(--er-background);
    color: var(--er-muted-foreground);
    opacity: 0;
    cursor: pointer;
    transition: opacity var(--er-duration);
  }

  /* Out of the way until the marquee is pointed at or tabbed into; always there for a finger, which cannot hover. */
  .er-marquee:hover .er-marquee-toggle,
  .er-marquee-toggle:focus-visible,
  .er-marquee[data-paused] .er-marquee-toggle {
    opacity: 1;
  }

  @media (hover: none) {
    .er-marquee-toggle {
      opacity: 1;
    }
  }

  .er-marquee-toggle:hover {
    color: var(--er-foreground);
  }

  .er-marquee-toggle:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-marquee-toggle svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  /* Reduced motion: nothing moves. The items wrap onto as many lines as they need, and the copy and the button are not needed. */
  @media (prefers-reduced-motion: reduce) {
    .er-marquee {
      mask-image: none;
    }

    .er-marquee-track {
      width: auto;
      animation: none;
    }

    .er-marquee-group {
      flex-shrink: 1;
      flex-wrap: wrap;
      justify-content: center;
    }

    .er-marquee-group[aria-hidden],
    .er-marquee-toggle {
      display: none;
    }
  }
}
</style>
