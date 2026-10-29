<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The steps in order: a name, or a name with a line of description. */
    steps: ReadonlyArray<string | { label: string; description?: string }>
    orientation?: 'horizontal' | 'vertical'
    /** Let the reader go back by pressing a step that is already done. */
    clickable?: boolean
    /** Accessible name of the list. */
    label?: string
  }>(),
  { orientation: 'horizontal', clickable: true, label: 'Progress' },
)

/** The current step, starting at 1. One past the last step shows every step as done. */
const step = defineModel<number>({ default: 1 })

const items = computed(() =>
  props.steps.map((item, index) => {
    const number = index + 1
    const state = number < step.value ? 'complete' : number === step.value ? 'current' : 'upcoming'
    return { number, state, label: typeof item === 'string' ? item : item.label, description: typeof item === 'string' ? undefined : item.description }
  }),
)
</script>

<template>
  <ol class="er-stepper" :aria-label="label" :data-orientation="orientation">
    <li v-for="item in items" :key="item.number" class="er-stepper-step" :data-state="item.state" :aria-current="item.state === 'current' ? 'step' : undefined">
      <component
        :is="clickable && item.state === 'complete' ? 'button' : 'div'"
        class="er-stepper-item"
        :type="clickable && item.state === 'complete' ? 'button' : undefined"
        @click="clickable && item.state === 'complete' && (step = item.number)"
      >
        <span class="er-stepper-marker" aria-hidden="true">
          <svg v-if="item.state === 'complete'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <template v-else>{{ item.number }}</template>
        </span>
        <span class="er-stepper-text">
          <span class="er-stepper-label">
            <span v-if="item.state === 'complete'" class="er-stepper-sr">Completed: </span>{{ item.label }}
          </span>
          <span v-if="item.description" class="er-stepper-description">{{ item.description }}</span>
        </span>
      </component>
    </li>
  </ol>
</template>

<style>
@layer components {
  .er-stepper {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 0.875rem;
    list-style: none;
  }

  .er-stepper[data-orientation='vertical'] {
    flex-direction: column;
    gap: 0;
  }

  .er-stepper-step {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .er-stepper-step:last-child {
    flex: none;
  }

  /* The connector to the next step: filled once this step is done. */
  .er-stepper-step:not(:last-child)::after {
    content: '';
    flex: 1;
    min-width: 1rem;
    height: 2px;
    border-radius: 1px;
    background: var(--er-border);
  }

  .er-stepper-step[data-state='complete']::after {
    background: var(--er-primary);
  }

  .er-stepper[data-orientation='vertical'] .er-stepper-step {
    flex: none;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .er-stepper[data-orientation='vertical'] .er-stepper-step:not(:last-child)::after {
    flex: none;
    width: 2px;
    min-width: 0;
    height: 1.25rem;
    margin: 0 0 0.25rem 0.8125rem;
  }

  .er-stepper-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    text-align: left;
  }

  button.er-stepper-item {
    cursor: pointer;
  }

  button.er-stepper-item:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-stepper-marker {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid var(--er-input);
    border-radius: 50%;
    font-size: 0.8125rem;
    font-weight: var(--er-weight-medium);
    font-variant-numeric: tabular-nums;
    transition:
      background-color var(--er-duration),
      border-color var(--er-duration);
  }

  .er-stepper-marker svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-stepper-step[data-state='complete'] .er-stepper-marker {
    border-color: var(--er-primary);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  .er-stepper-step[data-state='current'] .er-stepper-marker {
    border-color: var(--er-primary);
    color: var(--er-foreground);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--er-primary) 15%, transparent);
  }

  .er-stepper-step:not([data-state='upcoming']) .er-stepper-label {
    color: var(--er-foreground);
  }

  .er-stepper-text {
    display: grid;
    min-width: 0;
  }

  .er-stepper-label {
    font-weight: var(--er-weight-medium);
    white-space: nowrap;
  }

  .er-stepper-description {
    font-size: 0.8125rem;
  }

  .er-stepper-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /* On a narrow screen only the current step keeps its name; the rest shrink to their numbers. */
  @media (max-width: 40rem) {
    .er-stepper[data-orientation='horizontal'] .er-stepper-step:not([data-state='current']) .er-stepper-text {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  }
}
</style>
