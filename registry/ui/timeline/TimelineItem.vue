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
  <li class="sb-timeline-item" :data-tone="tone">
    <span class="sb-timeline-marker" aria-hidden="true">
      <slot name="icon"><span class="sb-timeline-dot" /></slot>
    </span>
    <div class="sb-timeline-body">
      <div class="sb-timeline-heading">
        <span class="sb-timeline-title">{{ title }}</span>
        <time v-if="time" class="sb-timeline-time" :datetime="datetime">{{ time }}</time>
      </div>
      <div v-if="$slots.default" class="sb-timeline-content"><slot /></div>
    </div>
  </li>
</template>
