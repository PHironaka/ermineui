<script setup lang="ts">
import { computed, ref, useAttrs, useId } from 'vue'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { Calendar, formatDate } from '../calendar'

// Attributes such as id and aria-invalid go to the button, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Submit the value with a form under this name, as 'YYYY-MM-DD'. */
    name?: string
    disabled?: boolean
    /** Shown while no date is chosen. */
    placeholder?: string
    /** Earliest date that can be chosen, as 'YYYY-MM-DD'. */
    min?: string
    /** Latest date that can be chosen, as 'YYYY-MM-DD'. */
    max?: string
    /** Return true for dates that cannot be chosen, such as weekends. */
    isDateDisabled?: (date: string) => boolean
    /** Language for the button text and the calendar. Fixed by default so server and browser render the same text. */
    locale?: string
    /** First column of the calendar: 0 for Sunday, 1 for Monday, and so on. */
    weekStartsOn?: number
    /** How the chosen date is written on the button. */
    format?: Intl.DateTimeFormatOptions
    side?: Side
    align?: Align
    /** Gap between button and calendar, in px. */
    sideOffset?: number
  }>(),
  {
    placeholder: 'Pick a date',
    locale: 'en-US',
    weekStartsOn: 0,
    format: () => ({ dateStyle: 'medium' }),
    side: 'bottom',
    align: 'start',
    sideOffset: 4,
  },
)

/** The chosen date as 'YYYY-MM-DD'. */
const value = defineModel<string>()
const open = defineModel<boolean>('open', { default: false })

const anchor = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const contentId = useId()
const valueId = useId()
// A label pointing at this button becomes its whole name, which would leave the chosen date unspoken.
// Describing the button by its own text makes screen readers say the label first and the date after it.
const attrs = useAttrs()
const describedBy = computed(() => [attrs['aria-describedby'], valueId].filter(Boolean).join(' '))

const label = computed(() => formatDate(value.value, props.locale, props.format))

function setOpen(next: boolean) {
  open.value = next && !props.disabled
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  setOpen(true)
}

useFloating(anchor, content, open, props)
useLayer(content, open, {
  loopFocus: true,
  ignore: () => [anchor.value],
  onDismiss: () => setOpen(false),
  // Start on the chosen day (or today), not on the "previous month" button.
  initialFocus: () => content.value?.querySelector<HTMLElement>('.er-calendar-day[tabindex="0"]'),
})
</script>

<template>
  <button
    ref="anchor"
    v-bind="$attrs"
    type="button"
    class="er-date-picker"
    aria-haspopup="dialog"
    :aria-expanded="open"
    :aria-controls="open ? contentId : undefined"
    :aria-describedby="describedBy"
    :disabled="disabled"
    :data-state="open ? 'open' : 'closed'"
    :data-placeholder="label ? undefined : ''"
    @click="setOpen(!open)"
    @keydown="onKeydown"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
    <span :id="valueId" class="er-date-picker-value">
      <slot :value="value" :label="label">{{ label || placeholder }}</slot>
    </span>
  </button>

  <Portal>
    <Transition name="er-pop">
      <div
        v-if="open"
        :id="contentId"
        ref="content"
        role="dialog"
        aria-label="Choose a date"
        tabindex="-1"
        class="er-floating er-date-picker-content"
      >
        <Calendar
          v-model="value"
          :min="min"
          :max="max"
          :is-date-disabled="isDateDisabled"
          :locale="locale"
          :week-starts-on="weekStartsOn"
          @select="setOpen(false)"
        />
      </div>
    </Transition>
  </Portal>

  <input v-if="name" type="hidden" :name="name" :value="value ?? ''" :disabled="disabled" />
</template>

<style>
@layer components {
  .er-date-picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: left;
    box-shadow: var(--er-shadow-xs);
    cursor: pointer;
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-date-picker:focus-visible {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-date-picker:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .er-date-picker[aria-invalid='true'] {
    border-color: var(--er-destructive);
  }

  .er-date-picker[data-placeholder] .er-date-picker-value {
    color: var(--er-muted-foreground);
  }

  .er-date-picker-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-date-picker svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--er-muted-foreground);
  }

  .er-date-picker-content {
    padding: 0.75rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    box-shadow: var(--er-shadow-md);
  }
}
</style>
