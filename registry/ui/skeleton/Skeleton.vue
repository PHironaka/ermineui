<script setup lang="ts">
withDefaults(
  defineProps<{
    animation?: 'pulse' | 'shimmer' | 'none'
    /** A round placeholder, for avatars and icons. Set one of width or height; the other follows. */
    circle?: boolean
  }>(),
  { animation: 'pulse' },
)
</script>

<template>
  <!-- Hidden from screen readers: mark the region that is loading with aria-busy="true" instead. -->
  <div class="er-skeleton" aria-hidden="true" :data-animation="animation" :data-circle="circle ? '' : undefined" />
</template>

<style>
@layer components {
  /* One line of text by default. Size it with width / height, in a style attribute or your own class. */
  .er-skeleton {
    display: block;
    width: 100%;
    height: 1rem;
    border-radius: var(--er-radius-sm);
    background-color: var(--er-skeleton, color-mix(in oklab, var(--er-foreground) 10%, transparent));
  }

  .er-skeleton[data-circle] {
    flex-shrink: 0;
    width: auto;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  .er-skeleton[data-animation='pulse'] {
    animation: er-skeleton-pulse 1.6s ease-in-out infinite;
  }

  .er-skeleton[data-animation='shimmer'] {
    background-image: linear-gradient(
      100deg,
      transparent 30%,
      var(--er-skeleton-highlight, light-dark(oklch(1 0 0 / 65%), oklch(1 0 0 / 9%))) 50%,
      transparent 70%
    );
    background-size: 250% 100%;
    background-repeat: no-repeat;
    animation: er-skeleton-shimmer 1.6s linear infinite;
  }

  @keyframes er-skeleton-pulse {
    50% {
      opacity: 0.45;
    }
  }

  @keyframes er-skeleton-shimmer {
    from {
      background-position: 150% 0;
    }
    to {
      background-position: -50% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .er-skeleton {
      animation: none !important;
      background-image: none !important;
    }
  }
}
</style>
