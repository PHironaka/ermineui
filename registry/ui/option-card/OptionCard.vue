<script setup lang="ts">
import { RadioGroupItem } from '../radio-group'

defineProps<{
  value: string
  title: string
  /** A line of detail under the title. */
  description?: string
  disabled?: boolean
}>()
</script>

<template>
  <!-- Goes inside a RadioGroup. The whole card is the radio button's label, so pressing anywhere on it chooses it. -->
  <label class="er-option-card" :data-disabled="disabled ? '' : undefined">
    <RadioGroupItem :value="value" :disabled="disabled" />
    <span class="er-option-card-text">
      <span class="er-option-card-title">{{ title }}</span>
      <span v-if="description || $slots.default" class="er-option-card-description"><slot>{{ description }}</slot></span>
    </span>
    <!-- What it costs, or a logo. -->
    <span v-if="$slots.end" class="er-option-card-end"><slot name="end" /></span>
  </label>
</template>

<style>
@layer components {
  .er-option-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      border-color var(--er-duration),
      box-shadow var(--er-duration);
  }

  .er-option-card:hover {
    background: color-mix(in oklab, var(--er-accent) 60%, transparent);
  }

  /* The border thickens without moving anything: the extra pixel is drawn as a shadow. */
  .er-option-card:has(.er-radio:checked) {
    border-color: var(--er-primary);
    box-shadow: 0 0 0 1px var(--er-primary);
  }

  .er-option-card:has(.er-radio:focus-visible) {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-option-card .er-radio {
    margin-top: 0.125rem;
  }

  .er-option-card .er-radio:focus-visible {
    outline: none;
  }

  .er-option-card-text {
    display: grid;
    flex: 1;
    gap: 0.125rem;
    min-width: 0;
  }

  .er-option-card-title {
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1.25rem;
  }

  .er-option-card-description {
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .er-option-card-end {
    flex-shrink: 0;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    font-variant-numeric: tabular-nums;
    line-height: 1.25rem;
  }

  .er-option-card[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-option-card[data-disabled]:hover {
    background: var(--er-input-background);
  }
}
</style>
