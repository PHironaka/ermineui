<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  label?: string
  /** Help shown under the control. */
  hint?: string
  /** The problem to show. Anything non-empty marks the control invalid. */
  error?: string | null | false
  /** Mark the label with an asterisk and tell screen readers an answer is needed. */
  required?: boolean
}>()

const id = useId()
const hintId = `${id}-hint`
const errorId = `${id}-error`

/** Bind this to the control inside: `<Input v-bind="control" />`. */
const control = computed(() => ({
  id,
  'aria-describedby': [props.error ? errorId : undefined, props.hint ? hintId : undefined].filter(Boolean).join(' ') || undefined,
  'aria-invalid': props.error ? ('true' as const) : undefined,
  'aria-required': props.required ? ('true' as const) : undefined,
}))
</script>

<template>
  <div class="sb-field" :data-invalid="error ? '' : undefined">
    <label v-if="label" class="sb-field-label" :for="id">
      {{ label }}
      <span v-if="required" class="sb-field-required" aria-hidden="true">*</span>
    </label>
    <slot :control="control" :id="id" :invalid="!!error" />
    <p v-if="hint" :id="hintId" class="sb-field-hint">{{ hint }}</p>
    <!-- Always in the page, empty until there is a problem: screen readers reliably announce text that
         arrives in an alert they already know about, and often miss an alert that is added later. -->
    <p :id="errorId" class="sb-field-error" role="alert">{{ error || '' }}</p>
  </div>
</template>

<style>
@layer components {
  .sb-field {
    position: relative;
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }

  .sb-field-label {
    color: var(--sb-foreground);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25;
  }

  .sb-field-required {
    color: var(--sb-destructive);
  }

  .sb-field-hint,
  .sb-field-error {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .sb-field-hint {
    color: var(--sb-muted-foreground);
  }

  .sb-field-error {
    color: var(--sb-destructive);
  }

  /* While empty it takes no room in the layout. */
  .sb-field-error:empty {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
}
</style>
