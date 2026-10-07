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
  <ol class="sb-stepper" :aria-label="label" :data-orientation="orientation">
    <li v-for="item in items" :key="item.number" class="sb-stepper-step" :data-state="item.state" :aria-current="item.state === 'current' ? 'step' : undefined">
      <component
        :is="clickable && item.state === 'complete' ? 'button' : 'div'"
        class="sb-stepper-item"
        :type="clickable && item.state === 'complete' ? 'button' : undefined"
        @click="clickable && item.state === 'complete' && (step = item.number)"
      >
        <span class="sb-stepper-marker" aria-hidden="true">
          <svg v-if="item.state === 'complete'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <template v-else>{{ item.number }}</template>
        </span>
        <span class="sb-stepper-text">
          <span class="sb-stepper-label">
            <span v-if="item.state === 'complete'" class="sb-stepper-sr">Completed: </span>{{ item.label }}
          </span>
          <span v-if="item.description" class="sb-stepper-description">{{ item.description }}</span>
        </span>
      </component>
    </li>
  </ol>
</template>

<style>
@layer components {
  .sb-stepper {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 0.875rem;
    list-style: none;
  }

  .sb-stepper[data-orientation='vertical'] {
    flex-direction: column;
    gap: 0;
  }

  .sb-stepper-step {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .sb-stepper-step:last-child {
    flex: none;
  }

  /* The connector to the next step: filled once this step is done. */
  .sb-stepper-step:not(:last-child)::after {
    content: '';
    flex: 1;
    min-width: 1rem;
    height: 2px;
    border-radius: 1px;
    background: var(--sb-border);
  }

  .sb-stepper-step[data-state='complete']::after {
    background: var(--sb-primary);
  }

  .sb-stepper[data-orientation='vertical'] .sb-stepper-step {
    flex: none;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .sb-stepper[data-orientation='vertical'] .sb-stepper-step:not(:last-child)::after {
    flex: none;
    width: 2px;
    min-width: 0;
    height: 1.25rem;
    margin: 0 0 0.25rem 0.8125rem;
  }

  .sb-stepper-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-muted-foreground);
    font: inherit;
    text-align: left;
  }

  button.sb-stepper-item {
    cursor: pointer;
  }

  button.sb-stepper-item:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-stepper-marker {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid var(--sb-input);
    border-radius: 50%;
    font-size: 0.8125rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    transition:
      background-color var(--sb-duration),
      border-color var(--sb-duration);
  }

  .sb-stepper-marker svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .sb-stepper-step[data-state='complete'] .sb-stepper-marker {
    border-color: var(--sb-primary);
    background: var(--sb-primary);
    color: var(--sb-primary-foreground);
  }

  .sb-stepper-step[data-state='current'] .sb-stepper-marker {
    border-color: var(--sb-primary);
    color: var(--sb-foreground);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--sb-primary) 15%, transparent);
  }

  .sb-stepper-step:not([data-state='upcoming']) .sb-stepper-label {
    color: var(--sb-foreground);
  }

  .sb-stepper-text {
    display: grid;
    min-width: 0;
  }

  .sb-stepper-label {
    font-weight: 500;
    white-space: nowrap;
  }

  .sb-stepper-description {
    font-size: 0.8125rem;
  }

  .sb-stepper-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /* On a narrow screen only the current step keeps its name; the rest shrink to their numbers. */
  @media (max-width: 40rem) {
    .sb-stepper[data-orientation='horizontal'] .sb-stepper-step:not([data-state='current']) .sb-stepper-text {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  }
}
</style>
