<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** How much is done, from 0 to max. Leave out (or pass null) when the amount is not known. */
    value?: number | null
    max?: number
  }>(),
  { max: 100 },
)

const known = computed(() => typeof props.value === 'number' && Number.isFinite(props.value))
const percent = computed(() => (known.value ? Math.max(0, Math.min((props.value! / props.max) * 100, 100)) : 0))
</script>

<template>
  <div
    role="progressbar"
    class="er-progress"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="known ? Math.max(0, Math.min(value!, max)) : undefined"
    :data-state="known ? (percent === 100 ? 'complete' : 'loading') : 'indeterminate'"
    :style="{ '--er-progress': `${percent}%` }"
  >
    <div class="er-progress-bar" />
  </div>
</template>

<style>
@layer components {
  .er-progress {
    width: 100%;
    height: 0.5rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--er-primary) 15%, transparent);
    overflow: hidden;
  }

  .er-progress-bar {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: var(--er-primary);
    transform: translateX(calc(var(--er-progress, 0%) - 100%));
    transition: transform 300ms var(--er-ease);
  }

  .er-progress[data-state='indeterminate'] .er-progress-bar {
    width: 40%;
    transform: none;
    transition: none;
    animation: er-progress-slide 1.4s ease-in-out infinite;
  }

  @keyframes er-progress-slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(250%);
    }
  }

  /* Without motion, a bar that fades in place still reads as "working". */
  @media (prefers-reduced-motion: reduce) {
    .er-progress-bar {
      transition: none;
    }

    .er-progress[data-state='indeterminate'] .er-progress-bar {
      width: 100%;
      animation: er-progress-fade 2s ease-in-out infinite;
    }
  }

  @keyframes er-progress-fade {
    50% {
      opacity: 0.35;
    }
  }
}
</style>
