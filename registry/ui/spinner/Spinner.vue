<script setup lang="ts">
withDefaults(
  defineProps<{
    /** What screen readers announce. Pass an empty string when text beside the spinner already says it. */
    label?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { label: 'Loading', size: 'md' },
)
</script>

<template>
  <svg
    class="sb-spinner"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
    :data-size="size"
  >
    <circle cx="12" cy="12" r="9" opacity="0.2" />
    <path d="M21 12a9 9 0 0 0-9-9" />
  </svg>
</template>

<style>
@layer components {
  .sb-spinner {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    animation: sb-spinner-turn 0.7s linear infinite;
  }

  .sb-spinner[data-size='sm'] {
    width: 0.75rem;
    height: 0.75rem;
  }

  .sb-spinner[data-size='lg'] {
    width: 1.5rem;
    height: 1.5rem;
  }

  @keyframes sb-spinner-turn {
    to {
      transform: rotate(360deg);
    }
  }

  /* The turning is the whole message, so reduced motion slows it rather than stopping it. */
  @media (prefers-reduced-motion: reduce) {
    .sb-spinner {
      animation-duration: 2.5s;
    }
  }
}
</style>
