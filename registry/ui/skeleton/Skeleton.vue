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
  <div class="sb-skeleton" aria-hidden="true" :data-animation="animation" :data-circle="circle ? '' : undefined" />
</template>

<style>
@layer components {
  /* One line of text by default. Size it with width / height, in a style attribute or your own class. */
  .sb-skeleton {
    display: block;
    width: 100%;
    height: 1rem;
    border-radius: var(--sb-radius-sm);
    background-color: var(--sb-skeleton, color-mix(in oklab, var(--sb-foreground) 10%, transparent));
  }

  .sb-skeleton[data-circle] {
    flex-shrink: 0;
    width: auto;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  .sb-skeleton[data-animation='pulse'] {
    animation: sb-skeleton-pulse 1.6s ease-in-out infinite;
  }

  .sb-skeleton[data-animation='shimmer'] {
    background-image: linear-gradient(
      100deg,
      transparent 30%,
      var(--sb-skeleton-highlight, light-dark(oklch(1 0 0 / 65%), oklch(1 0 0 / 9%))) 50%,
      transparent 70%
    );
    background-size: 250% 100%;
    background-repeat: no-repeat;
    animation: sb-skeleton-shimmer 1.6s linear infinite;
  }

  @keyframes sb-skeleton-pulse {
    50% {
      opacity: 0.45;
    }
  }

  @keyframes sb-skeleton-shimmer {
    from {
      background-position: 150% 0;
    }
    to {
      background-position: -50% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sb-skeleton {
      animation: none !important;
      background-image: none !important;
    }
  }
}
</style>
