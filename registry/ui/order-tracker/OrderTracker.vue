<script lang="ts">
export interface OrderTrackerStage {
  label: string
  /** When it happened, or is expected, already written out: "Oct 6", "Expected Friday". */
  date?: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The stages in order: a name, or a name with a date. */
    stages?: ReadonlyArray<string | OrderTrackerStage>
    /** The stage the order is at, starting at 1. One past the last shows every stage as done. */
    current: number
    /** Something has gone wrong at the current stage: late, held, returned. Say what in the default slot. */
    problem?: boolean
    orientation?: 'horizontal' | 'vertical'
    /** Accessible name of the list. */
    label?: string
  }>(),
  { stages: () => ['Ordered', 'Packed', 'Shipped', 'Delivered'], orientation: 'horizontal', label: 'Order progress' },
)

const items = computed(() =>
  props.stages.map((stage, index) => {
    const number = index + 1
    const state = number < props.current ? 'done' : number === props.current ? 'current' : 'upcoming'
    return { number, state, label: typeof stage === 'string' ? stage : stage.label, date: typeof stage === 'string' ? undefined : stage.date }
  }),
)
const stateWords = { done: 'Done', current: 'Now', upcoming: 'To come' }
</script>

<template>
  <div class="er-order-tracker" :data-orientation="orientation" :data-problem="problem ? '' : undefined">
    <ol :aria-label="label">
      <li v-for="item in items" :key="item.number" class="er-order-tracker-stage" :data-state="item.state" :aria-current="item.state === 'current' ? 'step' : undefined">
        <span class="er-order-tracker-marker" aria-hidden="true">
          <svg v-if="item.state === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          <svg v-else-if="item.state === 'current' && problem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v7M12 17.500v.01" /></svg>
        </span>
        <span class="er-order-tracker-text">
          <span class="er-order-tracker-label"><span class="er-order-tracker-hidden">{{ stateWords[item.state as keyof typeof stateWords] }}: </span>{{ item.label }}</span>
          <span v-if="item.date" class="er-order-tracker-date">{{ item.date }}</span>
        </span>
      </li>
    </ol>
    <!-- A line about where things stand: "Arriving Friday", "Held at customs". -->
    <p v-if="$slots.default" class="er-order-tracker-note"><slot /></p>
  </div>
</template>

<style>
@layer components {
  .er-order-tracker {
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
    container-type: inline-size;
  }

  .er-order-tracker ol {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-order-tracker-stage {
    position: relative;
    display: grid;
    flex: 1;
    justify-items: center;
    align-content: start;
    gap: 0.5rem;
    min-width: 0;
    font-size: 0.8125rem;
    line-height: 1.125rem;
    text-align: center;
  }

  /* The line to the next stage, drawn from the middle of this marker to the middle of the next. */
  .er-order-tracker-stage:not(:last-child)::after {
    content: '';
    position: absolute;
    top: calc(0.75rem - 1px);
    left: calc(50% + 0.75rem);
    width: calc(100% - 1.5rem);
    height: 2px;
    background: var(--er-border);
  }

  .er-order-tracker-stage[data-state='done']::after {
    background: var(--er-primary);
  }

  .er-order-tracker-marker {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--er-border);
    border-radius: 50%;
    background: var(--er-background);
  }

  .er-order-tracker-marker svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .er-order-tracker-stage[data-state='done'] .er-order-tracker-marker {
    border-color: var(--er-primary);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  .er-order-tracker-stage[data-state='current'] .er-order-tracker-marker {
    border-color: var(--er-primary);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--er-primary) 15%, transparent);
  }

  /* No problem: the current stage is a dot inside a ring. */
  .er-order-tracker:not([data-problem]) .er-order-tracker-stage[data-state='current'] .er-order-tracker-marker::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--er-primary);
  }

  .er-order-tracker[data-problem] .er-order-tracker-stage[data-state='current'] .er-order-tracker-marker {
    border-color: var(--er-destructive);
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--er-destructive) 15%, transparent);
  }

  .er-order-tracker-text {
    display: grid;
    min-width: 0;
    padding-inline: 0.25rem;
  }

  .er-order-tracker-label {
    color: var(--er-muted-foreground);
    font-weight: var(--er-weight-medium);
    overflow-wrap: anywhere;
  }

  .er-order-tracker-stage:not([data-state='upcoming']) .er-order-tracker-label {
    color: var(--er-foreground);
  }

  .er-order-tracker-date {
    color: var(--er-muted-foreground);
  }

  .er-order-tracker-note {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-order-tracker[data-problem] .er-order-tracker-note {
    color: var(--er-destructive);
  }

  /* Down the page: when asked for, and whenever there is no room to go across. */
  .er-order-tracker[data-orientation='vertical'] ol {
    flex-direction: column;
  }

  .er-order-tracker[data-orientation='vertical'] .er-order-tracker-stage {
    grid-template-columns: auto 1fr;
    justify-items: start;
    gap: 0.75rem;
    padding-bottom: 1.25rem;
    text-align: left;
  }

  .er-order-tracker[data-orientation='vertical'] .er-order-tracker-stage:last-child {
    padding-bottom: 0;
  }

  .er-order-tracker[data-orientation='vertical'] .er-order-tracker-stage:not(:last-child)::after {
    top: 1.5rem;
    left: calc(0.75rem - 1px);
    width: 2px;
    height: calc(100% - 1.5rem);
  }

  .er-order-tracker[data-orientation='vertical'] .er-order-tracker-text {
    padding-inline: 0;
    padding-top: 0.1875rem;
  }

  @container (max-width: 22rem) {
    .er-order-tracker ol {
      flex-direction: column;
    }

    .er-order-tracker-stage {
      grid-template-columns: auto 1fr;
      justify-items: start;
      gap: 0.75rem;
      padding-bottom: 1.25rem;
      text-align: left;
    }

    .er-order-tracker-stage:last-child {
      padding-bottom: 0;
    }

    .er-order-tracker-stage:not(:last-child)::after {
      top: 1.5rem;
      left: calc(0.75rem - 1px);
      width: 2px;
      height: calc(100% - 1.5rem);
    }

    .er-order-tracker-text {
      padding-inline: 0;
      padding-top: 0.1875rem;
    }
  }

  .er-order-tracker-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
