<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { Calendar, parseDate } from '../calendar'
import { defaultPresets, type DateRange, type DateRangePreset } from './types'

// Attributes such as id and aria-invalid go to the button, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Submit the two dates with a form under these names, as 'YYYY-MM-DD'. */
    startName?: string
    endName?: string
    disabled?: boolean
    /** Shown while no range is chosen. */
    placeholder?: string
    /** Quick choices listed beside the calendar. Pass an empty array to show the calendar alone. */
    presets?: readonly DateRangePreset[]
    /** Earliest date that can be chosen, as 'YYYY-MM-DD'. */
    min?: string
    /** Latest date that can be chosen, as 'YYYY-MM-DD'. */
    max?: string
    /** Return true for dates that cannot be chosen as either end. */
    isDateDisabled?: (date: string) => boolean
    /** Language for the button text and the calendar. Fixed by default so server and browser render the same text. */
    locale?: string
    /** First column of the calendar: 0 for Sunday, 1 for Monday, and so on. */
    weekStartsOn?: number
    /** How the dates are written on the button. */
    format?: Intl.DateTimeFormatOptions
    side?: Side
    align?: Align
    /** Gap between button and calendar, in px. */
    sideOffset?: number
  }>(),
  {
    placeholder: 'Pick a date range',
    presets: () => defaultPresets,
    locale: 'en-US',
    weekStartsOn: 0,
    format: () => ({ dateStyle: 'medium' }),
    side: 'bottom',
    align: 'start',
    sideOffset: 4,
  },
)

const value = defineModel<DateRange>()
const open = defineModel<boolean>('open', { default: false })

const anchor = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const contentId = useId()
const valueId = useId()
// A label pointing at this button becomes its whole name, which would leave the chosen date unspoken.
// Describing the button by its own text makes screen readers say the label first and the date after it.
const attrs = useAttrs()
const describedBy = computed(() => [attrs['aria-describedby'], valueId].filter(Boolean).join(' '))

/** The first date pressed, while the second is still to come. */
const pending = ref<string>()
/** The day under the pointer or keyboard focus, to preview the span before the second press. */
const hovered = ref<string>()

const ordered = (a: string, b: string): DateRange => (a <= b ? { start: a, end: b } : { start: b, end: a })
/** What the calendar highlights: the span being built, or else the chosen range. */
const shown = computed(() => (pending.value ? ordered(pending.value, hovered.value ?? pending.value) : value.value))

const label = computed(() => {
  const start = parseDate(value.value?.start)
  const end = parseDate(value.value?.end)
  if (!start || !end) return ''
  return new Intl.DateTimeFormat(props.locale, { ...props.format, timeZone: 'UTC' }).formatRange(start, end)
})

const presetRows = computed(() =>
  // Read `open` so "last 7 days" is counted afresh each time the picker opens.
  (open.value ? props.presets : []).map((preset) => {
    const range = preset.range()
    return { label: preset.label, range, chosen: !pending.value && range.start === value.value?.start && range.end === value.value?.end }
  }),
)

function setOpen(next: boolean) {
  open.value = next && !props.disabled
}

watch(open, () => {
  pending.value = undefined
  hovered.value = undefined
})

function onSelect(date: string) {
  if (!pending.value) {
    pending.value = date
    hovered.value = date
    return
  }
  value.value = ordered(pending.value, date)
  setOpen(false)
}

function choosePreset(range: DateRange) {
  value.value = range
  setOpen(false)
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
  // Start on the first day of the range (or today), not on a preset or the "previous month" button.
  initialFocus: () => content.value?.querySelector<HTMLElement>('.sb-calendar-day[tabindex="0"]'),
})
</script>

<template>
  <button
    ref="anchor"
    v-bind="$attrs"
    type="button"
    class="sb-date-range-picker"
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
    <span :id="valueId" class="sb-date-range-picker-value">
      <slot :value="value" :label="label">{{ label || placeholder }}</slot>
    </span>
  </button>

  <Portal>
    <Transition name="sb-pop">
      <div
        v-if="open"
        :id="contentId"
        ref="content"
        role="dialog"
        aria-label="Choose a date range"
        tabindex="-1"
        class="sb-floating sb-date-range-picker-content"
      >
        <ul v-if="presetRows.length" class="sb-date-range-picker-presets">
          <li v-for="preset in presetRows" :key="preset.label">
            <button type="button" :aria-pressed="preset.chosen" @click="choosePreset(preset.range)">
              {{ preset.label }}
              <svg v-if="preset.chosen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </li>
        </ul>
        <div class="sb-date-range-picker-calendar">
          <Calendar
            :model-value="pending ?? value?.start"
            :range-start="shown?.start"
            :range-end="shown?.end"
            :min="min"
            :max="max"
            :is-date-disabled="isDateDisabled"
            :locale="locale"
            :week-starts-on="weekStartsOn"
            @select="onSelect"
            @preview="hovered = $event"
          />
          <p class="sb-date-range-picker-hint" aria-live="polite">{{ pending ? 'Now choose the last day.' : 'Choose the first day.' }}</p>
        </div>
      </div>
    </Transition>
  </Portal>

  <input v-if="startName" type="hidden" :name="startName" :value="value?.start ?? ''" :disabled="disabled" />
  <input v-if="endName" type="hidden" :name="endName" :value="value?.end ?? ''" :disabled="disabled" />
</template>

<style>
@layer components {
  .sb-date-range-picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: left;
    box-shadow: var(--sb-shadow-xs);
    cursor: pointer;
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  .sb-date-range-picker:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-date-range-picker:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-date-range-picker[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }

  .sb-date-range-picker[data-placeholder] .sb-date-range-picker-value {
    color: var(--sb-muted-foreground);
  }

  .sb-date-range-picker-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sb-date-range-picker > svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: var(--sb-muted-foreground);
  }

  .sb-date-range-picker-content {
    display: flex;
    flex-wrap: wrap;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-md);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    box-shadow: var(--sb-shadow-md);
  }

  .sb-date-range-picker-presets {
    display: grid;
    flex: 1;
    align-content: start;
    gap: 2px;
    min-width: 9.5rem;
    margin: 0;
    padding: 0.5rem;
    border-right: 1px solid var(--sb-border);
    font-size: 0.875rem;
    list-style: none;
  }

  .sb-date-range-picker-presets button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
  }

  .sb-date-range-picker-presets button:hover {
    background: var(--sb-accent);
    color: var(--sb-accent-foreground);
  }

  .sb-date-range-picker-presets button[aria-pressed='true'] {
    font-weight: 600;
  }

  .sb-date-range-picker-presets button:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 1px;
  }

  .sb-date-range-picker-presets svg {
    width: 1rem;
    height: 1rem;
  }

  .sb-date-range-picker-calendar {
    padding: 0.75rem;
  }

  .sb-date-range-picker-hint {
    margin: 0.5rem 0 0;
    color: var(--sb-muted-foreground);
    font-size: 0.75rem;
    text-align: center;
  }
}
</style>
