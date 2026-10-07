<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    /** When it happened, already written out the way it should read ("2 hours ago", "Oct 6, 14:20"). */
    time?: string
    /** For machines: the same moment as an ISO date, e.g. "2026-10-06T14:20". */
    datetime?: string
    /** Colours the marker. Say what happened in the title too — colour alone is not enough. */
    tone?: 'default' | 'success' | 'warning' | 'destructive'
  }>(),
  { tone: 'default' },
)
</script>

<template>
  <li class="er-timeline-item" :data-tone="tone">
    <span class="er-timeline-marker" aria-hidden="true">
      <slot name="icon"><span class="er-timeline-dot" /></slot>
    </span>
    <div class="er-timeline-body">
      <div class="er-timeline-heading">
        <span class="er-timeline-title">{{ title }}</span>
        <time v-if="time" class="er-timeline-time" :datetime="datetime">{{ time }}</time>
      </div>
      <div v-if="$slots.default" class="er-timeline-content"><slot /></div>
    </div>
  </li>
</template>
