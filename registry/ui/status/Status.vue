<script setup lang="ts">
withDefaults(
  defineProps<{
    /** What the dot's colour stands for. The words beside it carry the meaning; the colour only backs them up. */
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
    /** A slow ripple around the dot, for something happening right now. Still when motion is reduced. */
    pulse?: boolean
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span class="er-status" :data-tone="tone" :data-pulse="pulse ? '' : undefined">
    <span class="er-status-dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style>
@layer components {
  .er-status {
    --er-status-color: var(--er-muted-foreground);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-status[data-tone='success'] {
    --er-status-color: var(--er-success);
  }

  .er-status[data-tone='warning'] {
    --er-status-color: var(--er-warning);
  }

  .er-status[data-tone='danger'] {
    --er-status-color: var(--er-destructive);
  }

  .er-status[data-tone='info'] {
    --er-status-color: var(--er-info);
  }

  .er-status-dot {
    position: relative;
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--er-status-color);
  }

  .er-status[data-pulse] .er-status-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--er-status-color);
    animation: er-status-pulse 1.8s ease-out infinite;
  }

  @keyframes er-status-pulse {
    from {
      opacity: 0.6;
      scale: 1;
    }

    to {
      opacity: 0;
      scale: 2.75;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .er-status[data-pulse] .er-status-dot::after {
      animation: none;
      opacity: 0;
    }
  }
}
</style>
